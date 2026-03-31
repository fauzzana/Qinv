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

    const locations = await prisma.location.findMany({
      select: {
        location_id: true,
        location_name: true,
      },
      orderBy: { location_name: "asc" },
    })

    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { location_id, location_name } = data

    if (!location_id || !location_name) {
      return NextResponse.json(
        { error: "location_id and location_name are required" },
        { status: 400 }
      )
    }

    const newLocation = await prisma.location.create({
      data: {
        location_id,
        location_name,
      },
    })

    return NextResponse.json({ success: true, data: newLocation })
  } catch (error) {
    console.error("Error creating location:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { location_id, location_name } = data

    if (!location_id) {
      return NextResponse.json(
        { error: "location_id is required" },
        { status: 400 }
      )
    }

    const updatedLocation = await prisma.location.update({
      where: { location_id },
      data: { location_name },
    })

    return NextResponse.json({ success: true, data: updatedLocation })
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { location_id } = data

    if (!location_id) {
      return NextResponse.json(
        { error: "location_id is required" },
        { status: 400 }
      )
    }

    await prisma.location.delete({
      where: { location_id },
    })

    return NextResponse.json({ success: true, message: "Location deleted successfully" })
  } catch (error) {
    console.error("Error deleting location:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
