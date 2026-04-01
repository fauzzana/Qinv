"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { handleInsert, type InsertFormData } from "./ActionItem"

type FormData = InsertFormData

type Category = { category_id: string; category_name: string }
type Location = { location_id: string; location_name: string }

const formSchema = z.object({
  item_id: z.string().min(1, "Item ID wajib diisi"),
  name: z.string().optional(),
  category_id: z.string().min(1, "Category harus dipilih"),
  location_id: z.string().min(1, "Location harus dipilih"),
  status: z.enum(["1", "2"]),
  current_qty: z.number().min(0, "Qty tidak boleh negatif"),
  min_qty: z.number().min(0, "Min qty tidak boleh negatif"),
})

export function AddItemForm() {
  const form = useForm<FormData>({
    defaultValues: {
      item_id: "",
      name: "",
      category_id: "",
      location_id: "",
      status: "1",
      current_qty: 0,
      min_qty: 0,
    },
  })

  const [categories, setCategories] = React.useState<Category[]>([])
  const [locations, setLocations] = React.useState<Location[]>([])

  React.useEffect(() => {
    async function loadOptions() {
      try {
        const [catRes, locRes] = await Promise.all([
          fetch("/api/category"),
          fetch("/api/location"),
        ])

        if (!catRes.ok || !locRes.ok) {
          throw new Error("Failed fetch category/location")
        }

        const catData = await catRes.json()
        const locData = await locRes.json()

        setCategories(catData.data || [])
        setLocations(locData.data || [])
      } catch (error) {
        console.error("Error loading category/location", error)
        toast.error("Gagal memuat kategori/lokasi")
      }
    }

    loadOptions()
  }, [])

  async function onSubmit(data: FormData) {
    const insertFn = handleInsert(data)
    const result = await insertFn()
    if (result) {
      form.reset()
      window.location.reload()
    }
  }

  return (
    <div>
      <form id="form-rhf-item" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 mb-2">
              <Controller
                name="item_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Item ID</FieldLabel>
                    <Input {...field} placeholder="Item ID" autoComplete="off" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="p-2 mb-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Name</FieldLabel>
                    <Input {...field} placeholder="Nama item" autoComplete="off" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="p-2 mb-2">
              <Controller
                name="category_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Category</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.category_id} value={c.category_id}>
                            {c.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="p-2 mb-2">
              <Controller
                name="location_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Location</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.location_id} value={loc.location_id}>
                            {loc.location_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="p-2 mb-2">
              <Controller
                name="current_qty"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Qty</FieldLabel>
                    <Input {...field} type="number" min={0} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="p-2 mb-2">
              <Controller
                name="min_qty"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Min Qty</FieldLabel>
                    <Input {...field} type="number" min={0} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="p-2 mb-2">
              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Available</SelectItem>
                        <SelectItem value="2">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        </FieldGroup>
      </form>

      <Separator />

      <div className="p-3 mt-2">
        <Field className="flex justify-end" orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-item">
            Submit
          </Button>
        </Field>
      </div>
    </div>
  )
}
