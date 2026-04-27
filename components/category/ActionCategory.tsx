import { toast } from "sonner"
import { z } from "zod"

const schema = z.object({
  category_id: z.string(),
  category_name: z.string(),
})

type Category = z.infer<typeof schema>

export type InsertFormData = {
  category_name: string;
};

export function handleInsert(formData: InsertFormData) {
  return async () => {
    try {
      const response = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_name: formData.category_name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to add category")
        return
      }

      const created = await response.json()
      toast.success("Category added successfully", {
        description: (
          <div className="flex flex-col gap-2">
            <p>ID: {created.data.category_id}</p>
            <p>Name: {created.data.category_name}</p>
          </div>
        ),
      })

      return created
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("An error occurred while adding the category")
      throw error
    }
  }
}

export function handleEdit(category: Category) {
  return async (formData: FormData) => {
    try {
      const updateData = {
        category_id: category.category_id,
        category_name: formData.get("category_name") || category.category_name,
      }

      const response = await fetch("/api/category", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to update category")
        return
      }

      const result = await response.json()
      toast.success("Category updated successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("An error occurred while updating the category")
    }
  }
}

export function handleDelete(categoryId: string) {
  return async () => {
    try {
      // Confirm sebelum delete
      if (!confirm("Are you sure you want to delete this category?")) {
        return
      }

      const response = await fetch("/api/category", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: categoryId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to delete category")
        return
      }

      toast.success("Category deleted successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("An error occurred while deleting the category")
    }
  }
}