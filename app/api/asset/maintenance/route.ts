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