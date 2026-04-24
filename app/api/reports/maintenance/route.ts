import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {}

    // Date filter
    if (fromDate && toDate) {
      where.create_at = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { asset_serial: { contains: search, mode: "insensitive" } },
        { note: { contains: search, mode: "insensitive" } },
      ]
    }

    const maintenanceData = await prisma.assetMaintenance.findMany({
      where,
      include: {
        asset: {
          select: {
            name: true,
            category: {
              select: {
                category_name: true,
              }
            },
            location: {
              select: {
                location_name: true,
              }
            },
          }
        }
      },
      orderBy: {
        create_at: "desc",
      },
    })

    // Transform data to match table columns
    const transformedData = maintenanceData.map((item) => ({
      status: item.status_maintain === 1 ? "Completed" : item.status_maintain === 2 ? "In Progress" : "Pending",
      assetSerial: item.asset_serial,
      condition: item.condition === 1 ? "Good" : item.condition === 2 ? "Fair" : "Poor",
      note: item.note,
      createdAt: item.create_at.toISOString().split('T')[0],
      completedAt: item.date_end ? item.date_end.toISOString().split('T')[0] : null,
      assetName: item.asset.name,
      category: item.asset.category.category_name,
      location: item.asset.location.location_name,
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
    })

  } catch (error) {
    console.error("Error fetching maintenance report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}