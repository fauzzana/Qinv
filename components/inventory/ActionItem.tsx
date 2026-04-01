"use client"

import { toast } from "sonner"
import { z } from "zod"

const schema = z.object({
  item_id: z.string(),
  name: z.string().nullable(),
  category: z.object({ category_name: z.string() }).optional(),
  location: z.object({ location_name: z.string() }).optional(),
  status: z.number(),
  stockItems: z.array(z.object({ current_qty: z.number() })).optional(),
  qr_code_path: z.string().nullable(),
})

type Item = z.infer<typeof schema>

export type InsertFormData = {
  item_id: string
  name?: string
  category_id: string
  location_id: string
  status: "1" | "2" | "3" | "4"
  current_qty?: number
  min_qty?: number
}

export function handleInsert(formData: InsertFormData) {
  return async () => {
    try {
      const response = await fetch("/api/inventory/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: formData.item_id,
          name: formData.name || "",
          category_id: formData.category_id,
          location_id: formData.location_id,
          status: Number(formData.status),
          current_qty: formData.current_qty ?? 0,
          min_qty: formData.min_qty ?? 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Gagal menambah item")
        return
      }

      const created = await response.json()
      toast.success("Item berhasil ditambahkan", {
        description: (
          <div className="flex flex-col gap-2">
            <p>ID: {created.data.item_id}</p>
            <p>QR sudah di-generate dan tersimpan.</p>
          </div>
        ),
      })

      return created
    } catch (error) {
      console.error("Error creating item:", error)
      toast.error("Terjadi kesalahan saat menambah item")
      throw error
    }
  }
}

export function handleEdit(item: Item) {
  return async (formData?: FormData) => {
    try {
      let updateData: Record<string, any> = {
        item_id: item.item_id,
        name: item.name,
        status: item.status,
      }

      if (formData) {
        updateData = {
          ...updateData,
          name: (formData.get("name") as string) || item.name,
          status: Number(formData.get("status") || item.status),
        }
      }

      const response = await fetch("/api/inventory/item", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to update item")
        return
      }

      toast.success("Item updated successfully")
      window.location.reload()
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("An error occurred while updating the item")
    }
  }
}

export function handleQr(qrCodePath: string | null) {
  return async () => {
    try {
      if (!qrCodePath) {
        toast.error("QR Code not available for this item")
        return
      }

      const qrUrl = qrCodePath.startsWith("http") ? qrCodePath : `/${qrCodePath}`
      window.open(qrUrl, "QR Code", "width=600,height=600")
    } catch (error) {
      console.error("Error displaying QR code:", error)
      toast.error("An error occurred while displaying the QR code")
    }
  }
}

export function handleDelete(itemId: string) {
  return async () => {
    try {
      if (!confirm("Are you sure you want to delete this item?")) {
        return
      }

      const response = await fetch("/api/inventory/item", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: itemId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to delete item")
        return
      }

      toast.success("Item deleted successfully")
      window.location.reload()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("An error occurred while deleting the item")
    }
  }
}
