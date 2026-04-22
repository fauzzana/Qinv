import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const asset_serial = formData.get("asset_serial") as string;
    const condition = formData.get("condition") as string;
    const note = formData.get("note") as string;
    const date_end = formData.get("date_end") as string;
    const status_maintain = formData.get("status_maintain") as string;
    const file = formData.get("attachment") as File | null;

    if (!asset_serial || !condition || !note) {
      return NextResponse.json(
        { error: "asset_serial, condition, and note are required" },
        { status: 400 }
      );
    }

    // Check if asset exists and not already in maintenance
    const asset = await prisma.asset.findUnique({
      where: { asset_serial },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (asset.status === 3) {
      return NextResponse.json(
        { error: "Asset is already in maintenance" },
        { status: 400 }
      );
    }

    let attachmentPath = null;

    // Handle file upload
    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads", "maintenance");
        await mkdir(uploadsDir, { recursive: true });

        // Create unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        const filename = `${timestamp}-${randomStr}-${file.name}`;
        const filepath = join(uploadsDir, filename);

        // Write file to disk
        await writeFile(filepath, buffer);

        // Store relative path for database
        attachmentPath = `/uploads/maintenance/${filename}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 400 }
        );
      }
    }

    // Insert maintenance record
    const maintenance = await prisma.assetMaintenance.create({
      data: {
        maintenance_id: `MAINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        asset_serial,
        condition: parseInt(condition),
        note,
        create_at: new Date(),
        date_end: date_end ? new Date(date_end) : null,
        status_maintain: parseInt(status_maintain) || 0,
        attachment: attachmentPath,
      },
    });

    // Update asset status to 3 (maintenance)
    await prisma.asset.update({
      where: { asset_serial },
      data: { status: 3 },
    });

    return NextResponse.json({
      success: true,
      data: maintenance,
      message: "Maintenance record created successfully",
    });
  } catch (error) {
    console.error("Error creating maintenance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Auto-update maintenance status when date_end has passed
export async function PUT(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all maintenance records with date_end before today and status_maintain = 1
    const expiredMaintenances = await prisma.assetMaintenance.findMany({
      where: {
        date_end: {
          lt: today,
        },
        status_maintain: 1,
      },
    });

    // Update each expired maintenance record
    for (const maintenance of expiredMaintenances) {
      // Update maintenance status to 2 (Done)
      await prisma.assetMaintenance.update({
        where: { maintenance_id: maintenance.maintenance_id },
        data: { status_maintain: 2 },
      });

      // Update asset status to 1 (Available)
      await prisma.asset.update({
        where: { asset_serial: maintenance.asset_serial },
        data: { status: 1},
      });
    }

    return NextResponse.json({
      success: true,
      updated: expiredMaintenances.length,
      message: `Updated ${expiredMaintenances.length} maintenance record(s)`,
    });
  } catch (error) {
    console.error("Error updating maintenance statuses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Manual update maintenance status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { maintenance_id, status_maintain } = body;

    if (!maintenance_id) {
      return NextResponse.json(
        { error: "maintenance_id is required" },
        { status: 400 }
      );
    }

    // Get the maintenance record
    const maintenance = await prisma.assetMaintenance.findUnique({
      where: { maintenance_id },
    });

    if (!maintenance) {
      return NextResponse.json(
        { error: "Maintenance record not found" },
        { status: 404 }
      );
    }

    // Update maintenance status
    const updatedMaintenance = await prisma.assetMaintenance.update({
      where: { maintenance_id },
      data: { status_maintain },
    });

    // If status_maintain is 2 (Done), update asset status to 1 (Available)
    if (status_maintain === 2) {
      await prisma.asset.update({
        where: { asset_serial: maintenance.asset_serial },
        data: { status: 1 },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedMaintenance,
      message: "Maintenance status updated successfully",
    });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete maintenance record
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { maintenance_id, asset_serial } = body;

    if (!maintenance_id || !asset_serial) {
      return NextResponse.json(
        { error: "maintenance_id and asset_serial are required" },
        { status: 400 }
      );
    }

    // Get the maintenance record
    const maintenance = await prisma.assetMaintenance.findUnique({
      where: { maintenance_id },
    });

    if (!maintenance) {
      return NextResponse.json(
        { error: "Maintenance record not found" },
        { status: 404 }
      );
    }

    // Delete maintenance record
    await prisma.assetMaintenance.delete({
      where: { maintenance_id },
    });

    // Update asset status back to available (1) if it was in maintenance (3)
    const asset = await prisma.asset.findUnique({
      where: { asset_serial },
    });

    if (asset && asset.status === 3) {
      await prisma.asset.update({
        where: { asset_serial },
        data: { status: 1 },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting maintenance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}