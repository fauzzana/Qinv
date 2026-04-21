"use client"

import { useState } from "react"
import { toast } from "sonner"
import { handleEdit, handleDelete, handleQr } from "@/components/asset/ActionAsset"

export function useAssetActions(asset: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const editAsset = handleEdit(asset)
  const deleteAsset = handleDelete(asset.asset_serial)
  const qrAsset = handleQr(asset.qr_code_path)

  const performEdit = async (formData: FormData) => {
    setIsEditing(true)
    try {
      await editAsset(formData)
      toast.success("Asset updated successfully")
    } catch (error) {
      toast.error("Failed to update asset")
    } finally {
      setIsEditing(false)
    }
  }

  const performDelete = async () => {
    if (confirm("Are you sure you want to delete this asset?")) {
      setIsDeleting(true)
      try {
        await deleteAsset()
        toast.success("Asset deleted successfully")
      } catch (error) {
        toast.error("Failed to delete asset")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const performQr = () => {
    qrAsset()
  }

  return {
    isEditing,
    isDeleting,
    performEdit,
    performDelete,
    performQr,
  }
}