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
        image: true,
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
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import QRCode from "qrcode"

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
      asset_serial,
      name,
      description,
      category_id,
      qty,
      purcase_date,
      purcase_price,
      status,
      location_id,
      image,
    } = body

    if (!asset_serial) {
      return NextResponse.json(
        { error: "asset_serial is required" },
        { status: 400 }
      )
    }

    const category =
      category_id || ""
        ? await prisma.category.findUnique({ where: { category_id: category_id } })
        : await prisma.category.findFirst()

    if (!category) {
      return NextResponse.json(
        { error: "Category not found. Please create a category first." },
        { status: 400 }
      )
    }

    const location =
      location_id || ""
        ? await prisma.location.findUnique({ where: { location_id: location_id } })
        : await prisma.location.findFirst()

    if (!location) {
      return NextResponse.json(
        { error: "Location not found. Please create a location first." },
        { status: 400 }
      )
    }

    const now = new Date()
    const purcaseDateValue = purcase_date ? new Date(purcase_date) : now

    const newAsset = await prisma.asset.create({
      data: {
        asset_serial,
        name: name || "",
        description: description || "",
        category_id: category.category_id,
        qty: Number(qty ?? 1),
        purcase_date: purcaseDateValue,
        purcase_price: purcase_price === null || purcase_price === undefined ? null : Number(purcase_price),
        status: Number(status ?? 1),
        location_id: location.location_id,
        qr_code_path: "",
        image: image || "",
      },
    })

    // QR Code hanya berisi asset_serial (data kecil)
    const qrText = newAsset.asset_serial
    const qrCodeDataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 300,
    })

    const updatedAsset = await prisma.asset.update({
      where: { asset_serial: newAsset.asset_serial },
      data: { qr_code_path: qrCodeDataUrl },
      include: {
        category: {
          select: { category_name: true },
        },
        location: {
          select: { location_name: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: updatedAsset })
  } catch (error) {
    console.error("Error creating asset:", error)
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
    const {
      asset_serial,
      name,
      description,
      qty,
      purcase_date,
      purcase_price,
      status,
      category_id,
      location_id,
      image,
    } = body

    if (!asset_serial) {
      return NextResponse.json(
        { error: "asset_serial is required" },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, any> = {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(qty !== undefined ? { qty: Number(qty) } : {}),
      ...(purcase_date !== undefined
        ? { purcase_date: new Date(purcase_date) }
        : {}),
      ...(purcase_price !== undefined
        ? { purcase_price: purcase_price === null ? null : Number(purcase_price) }
        : {}),
      ...(status !== undefined ? { status: Number(status) } : {}),
      ...(image !== undefined ? { image } : {}),
      ...(category_id !== undefined ? { category_id } : {}),
      ...(location_id !== undefined ? { location_id } : {}),
    }

    const updatedAsset = await prisma.asset.update({
      where: { asset_serial },
      data: updatePayload,
    })

    return NextResponse.json({ success: true, data: updatedAsset })
  } catch (error) {
    console.error("Error updating asset:", error)
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
    const { asset_serial } = body

    if (!asset_serial) {
      return NextResponse.json(
        { error: "asset_serial is required" },
        { status: 400 }
      )
    }

    await prisma.asset.delete({ where: { asset_serial } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}