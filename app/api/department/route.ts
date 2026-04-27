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

    const departments = await prisma.department.findMany({
      select: {
        depart_id: true,
        depart_name: true,
      },
      orderBy: { depart_name: "asc" },
    })

    return NextResponse.json({ success: true, data: departments })
  } catch (error) {
    console.error("Error fetching departments:", error)
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

    const body = await request.json()
    const { depart_name } = body

    if (!depart_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const newDepartment = await prisma.department.create({
      data: {
        depart_name,
      },
    })

    return NextResponse.json({ success: true, data: newDepartment })
  } catch (error) {
    console.error("Error creating department:", error)
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
    const { depart_id, depart_name } = data

    if (!depart_id) {
      return NextResponse.json(
        { error: "depart_id is required" },
        { status: 400 }
      )
    }

    const updatedDepartment = await prisma.department.update({
      where: { depart_id },
      data: { depart_name },
    })

    return NextResponse.json({ success: true, data: updatedDepartment })
  } catch (error) {
    console.error("Error updating department:", error)
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
    const { depart_id } = data

    if (!depart_id) {
      return NextResponse.json(
        { error: "depart_id is required" },
        { status: 400 }
      )
    }

    await prisma.department.delete({
      where: { depart_id },
    })

    return NextResponse.json({ success: true, message: "Department deleted successfully" })
  } catch (error) {
    console.error("Error deleting department:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}