"use client"

import { useState } from "react"
import { toast } from "sonner"
import { handleEdit, handleDelete, handleQr } from "@/components/inventory/ActionItem"

export function useItemActions(item: any) {
  const [isEditing, setEditing] = useState(false)
  const [isDeleting, setDeleting] = useState(false)

  const editItem = handleEdit(item)
  const deleteItem = handleDelete(item.item_id)
  const qrItem = handleQr(item.qr_code_path)

  const performEdit = async (formData: FormData) => {
    setEditing(true)
    try {
      await editItem(formData)
      toast.success("Item updated successfully")
    } catch (error) {
      toast.error("Failed to update item")
    } finally {
      setEditing(false)
    }
  }

  const performDelete = async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      setDeleting(true)
      try {
        await deleteItem()
        toast.success("Item deleted successfully")
      } catch (error) {
        toast.error("Failed to delete item")
      } finally {
        setDeleting(false)
      }
    }
  }

  const performQr = () => {
    qrItem()
  }

  return {
    isEditing,
    isDeleting,
    performEdit,
    performDelete,
    performQr,
  }
}