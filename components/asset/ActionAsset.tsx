
import { toast } from "sonner"
import { z } from "zod"
import { ms } from "zod/v4/locales"

const schema = z.object({
  asset_serial: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  qty: z.number(),
  purcase_date: z.date(),
  purcase_price: z.number().nullable(),
  status: z.number(),
  image: z.string().nullable(),
})

type Asset = z.infer<typeof schema> & {
  category: { category_name: string }
  location: { location_name: string }
  qr_code_path: string | null
}

export type InsertFormData = {
  serial: string;
  name?: string;
  description?: string;
  category_id: string;
  location_id: string;
  qty: number;
  purcase_date: string;
  purcase_price: number;
  status: "1" | "2" | "3" | "4";
  image?: string;
};

export function handleInsert(formData: InsertFormData) {
  return async () => {
    try {
      const response = await fetch("/api/asset/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_serial: formData.serial,
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id,
          location_id: formData.location_id,
          qty: formData.qty,
          purcase_date: formData.purcase_date,
          purcase_price: formData.purcase_price,
          status: Number(formData.status),
          image: formData.image,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Gagal menambah asset")
        return
      }

      const created = await response.json()
      toast.success("Asset berhasil ditambahkan", {
        description: (
          <div className="flex flex-col gap-2">
            <p>Serial: {created.data.asset_serial}</p>
            <p>QR sudah di-generate dan tersimpan.</p>
          </div>
        ),
      })

      return created
    } catch (error) {
      console.error("Error creating asset:", error)
      toast.error("Terjadi kesalahan saat menambah asset")
      throw error
    }
  }
}

export function handleEdit(asset: Asset) {
  return async (formData?: FormData) => {
    try {
      // Jika formData diberikan, gunakan itu. Jika tidak, gunakan data asset original
      let updateData: Record<string, any> = {
        asset_serial: asset.asset_serial,
        name: asset.name,
        description: asset.description,
        qty: asset.qty,
        purcase_date: asset.purcase_date,
        purcase_price: asset.purcase_price,
        status: asset.status,
      }

      if (formData) {
        updateData = {
          asset_serial: asset.asset_serial,
          name: formData.get("name") || asset.name,
          description: formData.get("description") || asset.description,
          qty: Number(formData.get("qty")) || asset.qty,
          purcase_date: asset.purcase_date,
          purcase_price: asset.purcase_price,
          status: Number(formData.get("status")) || asset.status,
        }

        // Add category_id if provided
        if (formData.get("category_id")) {
          updateData.category_id = formData.get("category_id")
        }

        // Add location_id if provided
        if (formData.get("location_id")) {
          updateData.location_id = formData.get("location_id")
        }
      }

      const response = await fetch("/api/asset/detail", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to update asset")
        return
      }

      const result = await response.json()
      toast.success("Asset updated successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error updating asset:", error)
      toast.error("An error occurred while updating the asset")
    }
  }
}

export function handleQr(qrCodePath: string | null) {
  return async () => {
    try {
      if (!qrCodePath) {
        toast.error("QR Code not available for this asset")
        return
      }

      // Buka QR code dalam jendela baru atau tampilkan dalam modal
      // QR code path adalah URL yang dapat diakses
      const qrUrl = qrCodePath.startsWith("http") ? qrCodePath : `/${qrCodePath}`
      window.open(qrUrl, "QR Code", "width=600,height=600")
    } catch (error) {
      console.error("Error displaying QR code:", error)
      toast.error("An error occurred while displaying the QR code")
    }
  }
}

export function handleDelete(assetSerial: string) {
  return async () => {
    try {
      // Confirm sebelum delete
      if (!confirm("Are you sure you want to delete this asset?")) {
        return
      }

      const response = await fetch("/api/asset/detail", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset_serial: assetSerial,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to delete asset")
        return
      }

      toast.success("Asset deleted successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error deleting asset:", error)
      toast.error("An error occurred while deleting the asset")
    }
  }
}