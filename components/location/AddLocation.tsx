"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { handleInsert, type InsertFormData } from "./ActionLocation"
import { DrawerFooter } from "@/components/ui/drawer"

type FormData = InsertFormData;

const formSchema = z.object({
  location_id: z.string().min(1, "Location ID is required"),
  location_name: z.string().min(1, "Location name is required"),
}) satisfies z.ZodType<FormData>;

export function AddLocationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location_id: "",
      location_name: "",
    },
  })

  async function onSubmit(data: FormData) {
    const insertFn = handleInsert(data)
    const result = await insertFn()
    if (result) {
      form.reset()
      window.location.reload()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Field>
          <FieldLabel>Location ID</FieldLabel>
          <FieldGroup>
            <Controller
              name="location_id"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter location ID"
                  className="w-full"
                />
              )}
            />
          </FieldGroup>
          <FieldError>
            {form.formState.errors.location_id?.message}
          </FieldError>
        </Field>

        <Field>
          <FieldLabel>Location Name</FieldLabel>
          <FieldGroup>
            <Controller
              name="location_name"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter location name"
                  className="w-full"
                />
              )}
            />
          </FieldGroup>
          <FieldError>
            {form.formState.errors.location_name?.message}
          </FieldError>
        </Field>
      </div>
      <DrawerFooter>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : "Add Location"}
        </Button>
      </DrawerFooter>
    </form>
  )
}