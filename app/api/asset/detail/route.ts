import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const asset = await prisma.asset.findMany({
      select: {
        asset_serial: true,
        name: true,
        description: true,
        category: {
          select: {
            category_name: true,
          }
        },
        qty: true,
        purcase_date: true,
        purcase_price: true,
        status: true,
        location: {
          select: {
            location_name: true,
          }
        },
        qr_code_path: true,
      },
      orderBy: {
        purcase_date: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: asset,
      total: asset.length,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}