"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { handleInsert, type InsertFormData } from "./ActionCategory"
import { DrawerFooter } from "@/components/ui/drawer"

type FormData = InsertFormData;

const formSchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
}) satisfies z.ZodType<FormData>;

export function AddCategoryForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: "",
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
          <FieldLabel>Category Name</FieldLabel>
          <FieldGroup>
            <Controller
              name="category_name"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter category name"
                  className="w-full"
                />
              )}
            />
          </FieldGroup>
          <FieldError>
            {form.formState.errors.category_name?.message}
          </FieldError>
        </Field>
      </div>
      <DrawerFooter>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : "Add Category"}
        </Button>
      </DrawerFooter>
    </form>
  )
}