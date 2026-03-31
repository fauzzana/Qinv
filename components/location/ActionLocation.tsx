import { toast } from "sonner"
import { z } from "zod"

const schema = z.object({
  location_id: z.string(),
  location_name: z.string(),
})

type Location = z.infer<typeof schema>

export type InsertFormData = {
  location_id: string;
  location_name: string;
};

export function handleInsert(formData: InsertFormData) {
  return async () => {
    try {
      const response = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: formData.location_id,
          location_name: formData.location_name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to add location")
        return
      }

      const created = await response.json()
      toast.success("Location added successfully", {
        description: (
          <div className="flex flex-col gap-2">
            <p>ID: {created.data.location_id}</p>
            <p>Name: {created.data.location_name}</p>
          </div>
        ),
      })

      return created
    } catch (error) {
      console.error("Error creating location:", error)
      toast.error("An error occurred while adding the location")
      throw error
    }
  }
}

export function handleEdit(location: Location) {
  return async (formData: FormData) => {
    try {
      const updateData = {
        location_id: location.location_id,
        location_name: formData.get("location_name") || location.location_name,
      }

      const response = await fetch("/api/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to update location")
        return
      }

      const result = await response.json()
      toast.success("Location updated successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error updating location:", error)
      toast.error("An error occurred while updating the location")
    }
  }
}

export function handleDelete(locationId: string) {
  return async () => {
    try {
      // Confirm sebelum delete
      if (!confirm("Are you sure you want to delete this location?")) {
        return
      }

      const response = await fetch("/api/location", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location_id: locationId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to delete location")
        return
      }

      toast.success("Location deleted successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error deleting location:", error)
      toast.error("An error occurred while deleting the location")
    }
  }
}