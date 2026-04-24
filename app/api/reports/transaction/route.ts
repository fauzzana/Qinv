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
      where.created_at = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      }
    }

    // Search filter - search in transaction details
    if (search) {
      where.details = {
        some: {
          OR: [
            { person_name: { contains: search, mode: "insensitive" } },
            { asset: { name: { contains: search, mode: "insensitive" } } },
            { item: { name: { contains: search, mode: "insensitive" } } },
          ]
        }
      }
    }

    const transactionData = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        details: {
          include: {
            asset: {
              select: {
                name: true,
                asset_serial: true,
              }
            },
            item: {
              select: {
                name: true,
                item_id: true,
              }
            }
          }
        }
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Transform data to match table columns
    const transformedData = transactionData.flatMap((transaction) =>
      transaction.details.map((detail) => ({
        transactionId: transaction.id,
        user: transaction.user.name || transaction.user.email,
        action: transaction.action ? "Check Out" : "Check In",
        personName: detail.person_name,
        assetItem: detail.asset
          ? `${detail.asset.name} (${detail.asset.asset_serial})`
          : detail.item
          ? `${detail.item.name} (${detail.item.item_id})`
          : "Unknown",
        quantity: detail.qty,
        createdAt: transaction.created_at.toISOString().split('T')[0],
      }))
    )

    return NextResponse.json({
      success: true,
      data: transformedData,
    })

  } catch (error) {
    console.error("Error fetching transaction report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}