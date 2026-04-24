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
      where.purcase_date = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { asset_serial: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { category: { category_name: { contains: search, mode: "insensitive" } } },
        { location: { location_name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const assetData = await prisma.asset.findMany({
      where,
      include: {
        category: {
          select: {
            category_name: true,
          }
        },
        location: {
          select: {
            location_name: true,
          }
        }
      },
      orderBy: {
        purcase_date: "desc",
      },
    })

    // Transform data to match table columns
    const transformedData = assetData.map((item) => ({
      assetSerial: item.asset_serial,
      name: item.name,
      category: item.category.category_name,
      location: item.location.location_name,
      quantity: item.qty,
      purchaseDate: item.purcase_date.toISOString().split('T')[0],
      purchasePrice: item.purcase_price ? `Rp ${item.purcase_price.toLocaleString('id-ID')}` : null,
      status: item.status === 1 ? "Active" : item.status === 2 ? "Inactive" : "Maintenance",
      description: item.description,
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
    })

  } catch (error) {
    console.error("Error fetching asset report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}