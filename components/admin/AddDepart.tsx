"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { handleInsert, type InsertFormData } from "./ActionDepart"

type FormData = InsertFormData;

const formSchema = z.object({
  depart_name: z.string().min(1, "Department name is required"),
}) satisfies z.ZodType<FormData>;

export function AddDepartForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      depart_name: "",
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
          <FieldLabel>Department Name</FieldLabel>
          <FieldGroup>
            <Controller
              name="depart_name"
              control={form.control}
              render={({ field }) => (
                <Input placeholder="Enter department name" {...field} />
              )}
            />
          </FieldGroup>
          <FieldError>
            {form.formState.errors.depart_name?.message}
          </FieldError>
        </Field>
      </div>
      <DrawerFooter>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : "Add Department"}
        </Button>
      </DrawerFooter>
    </form>
  )
}
