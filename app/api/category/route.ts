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

    const categories = await prisma.category.findMany({
      select: {
        category_id: true,
        category_name: true,
      },
      orderBy: { category_name: "asc" },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
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
    const { category_name } = data

    if (!category_name) {
      return NextResponse.json(
        { error: "category_name is required" },
        { status: 400 }
      )
    }

    const categories = await prisma.category.findMany({
      select: { category_id: true },
    })

    const nextNumber = categories.reduce((max, category) => {
      const match = category.category_id.match(/^cat(\d+)$/i)
      if (!match) return max
      return Math.max(max, parseInt(match[1], 10))
    }, 0) + 1

    const category_id = `cat${String(nextNumber).padStart(3, "0")}`

    const newCategory = await prisma.category.create({
      data: {
        category_id,
        category_name,
      },
    })

    return NextResponse.json({ success: true, data: newCategory })
  } catch (error) {
    console.error("Error creating category:", error)
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
    const { category_id, category_name } = data

    if (!category_id) {
      return NextResponse.json(
        { error: "category_id is required" },
        { status: 400 }
      )
    }

    const updatedCategory = await prisma.category.update({
      where: { category_id },
      data: { category_name },
    })

    return NextResponse.json({ success: true, data: updatedCategory })
  } catch (error) {
    console.error("Error updating category:", error)
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
    const { category_id } = data

    if (!category_id) {
      return NextResponse.json(
        { error: "category_id is required" },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { category_id },
    })

    return NextResponse.json({ success: true, message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
