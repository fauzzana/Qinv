import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import QRCode from "qrcode"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const items = await prisma.item.findMany({
      select: {
        item_id: true,
        name: true,
        status: true,
        category: {
          select: {
            category_name: true,
          },
        },
        stockItems: {
          select: {
            current_qty: true,
          },
        },
        location: {
          select: {
            location_name: true,
          },
        },
        qr_code_path: true,
        image: true,
      },
      orderBy: {
        category_id: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    })
  } catch (error) {
    console.error("Error fetching items:", error)
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
    const { 
      item_id,
      name,
      category_id,
      location_id,
      status,
      current_qty,
      min_qty,
      image } = body

    if (!item_id) {
      return NextResponse.json(
        { error: "item_id is required" },
        { status: 400 }
      )
    }

    const category =
      category_id || ""
        ? await prisma.category.findUnique({ where: { category_id } })
        : await prisma.category.findFirst()

    if (!category) {
      return NextResponse.json(
        { error: "Category not found. Please create a category first." },
        { status: 400 }
      )
    }

    const location =
      location_id || ""
        ? await prisma.location.findUnique({ where: { location_id } })
        : await prisma.location.findFirst()

    if (!location) {
      return NextResponse.json(
        { error: "Location not found. Please create a location first." },
        { status: 400 }
      )
    }

    const newItem = await prisma.item.create({
      data: {
        item_id,
        name: name || "",
        category_id: category.category_id,
        location_id: location.location_id,
        status: Number(status ?? 1),
        image: image || null,
        qr_code_path: "",
      },
    })

    const quantity = Number(current_qty ?? 0)
    if (!Number.isNaN(quantity)) {
      await prisma.stockItem.create({
        data: {
          stock_id: `${newItem.item_id}-${Date.now()}`,
          current_qty: quantity,
          min_qty: Number(min_qty ?? 0),
          item: {
            connect: {
              item_id: newItem.item_id,
            },
          },
        },
      })
    }

    const qrText = newItem.item_id
    const qrCodeDataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 300,
    })

    const updatedItem = await prisma.item.update({
      where: { item_id: newItem.item_id },
      data: { qr_code_path: qrCodeDataUrl },
      include: {
        category: { select: { category_name: true } },
        location: { select: { location_name: true } },
        stockItems: { select: { current_qty: true } },
      },
    })

    return NextResponse.json({ success: true, data: updatedItem })
  } catch (error) {
    console.error("Error creating item:", error)
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

    const body = await request.json()
    const { item_id, name, status, current_qty, min_qty } = body

    if (!item_id) {
      return NextResponse.json(
        { error: "item_id is required" },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.item.update({
      where: { item_id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(status !== undefined ? { status: Number(status) } : {}),
      },
    })

    if (current_qty !== undefined && !Number.isNaN(Number(current_qty))) {
      const existingStock = await prisma.stockItem.findFirst({ where: { item_id } })
      const stockData = {
        current_qty: Number(current_qty),
        min_qty: Number(min_qty ?? 0),
      }

      if (existingStock) {
        await prisma.stockItem.update({ where: { stock_id: existingStock.stock_id }, data: stockData })
      } else {
        await prisma.stockItem.create({
          data: {
            stock_id: `${item_id}-${Date.now()}`,
            ...stockData,
            item: {
              connect: {
                item_id,
              },
            },
          },
        })
      }
    }

    return NextResponse.json({ success: true, data: updatedItem })
  } catch (error) {
    console.error("Error updating item:", error)
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

    const body = await request.json()
    const { item_id } = body

    if (!item_id) {
      return NextResponse.json(
        { error: "item_id is required" },
        { status: 400 }
      )
    }

    await prisma.stockItem.deleteMany({ where: { item_id } })
    await prisma.item.delete({ where: { item_id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
