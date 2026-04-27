import { toast } from "sonner"
import { z } from "zod"

const schema = z.object({
  depart_id: z.number(),
  depart_name: z.string(),
})

type Department = z.infer<typeof schema>

export type InsertFormData = {
  depart_name: string;
};

export function handleInsert(formData: InsertFormData) {
  return async () => {
    try {
      const response = await fetch("/api/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depart_name: formData.depart_name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to add department")
        return
      }

      const created = await response.json()
      toast.success("Department added successfully", {
        description: (
          <div className="flex flex-col gap-2">
            <p>ID: {created.data.depart_id}</p>
            <p>Name: {created.data.depart_name}</p>
          </div>
        ),
      })

      return created
    } catch (error) {
      console.error("Error creating department:", error)
      toast.error("An error occurred while adding the department")
      throw error
    }
  }
}

export function handleEdit(department: Department) {
  return async (formData: FormData) => {
    try {
      const updateData = {
        depart_id: department.depart_id,
        depart_name: formData.get("depart_name") || department.depart_name,
      }

      const response = await fetch("/api/department", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to update department")
        return
      }

      const result = await response.json()
      toast.success("Department updated successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error updating department:", error)
      toast.error("An error occurred while updating the department")
    }
  }
}

export function handleDelete(departmentId: number) {
  return async () => {
    try {
      if (!confirm("Are you sure you want to delete this department?")) {
        return
      }

      const response = await fetch(`/api/department?depart_id=${departmentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ depart_id: departmentId }),
      })
      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to delete department")
        return
      }
      toast.success("Department deleted successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error deleting department:", error)
      toast.error("An error occurred while deleting the department")
    }
  }
}