"use client"

import { useEffect, useState } from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Toast } from "radix-ui"
import { ToastAction } from "@base-ui/react"

type Props = {
  label: string
  action: boolean // false = retrieval, true = store
  itemId: string
  defaultName: string
  defaultDepartment: string
}

export function TransactionButton({
  label,
  action,
  itemId,
  defaultName,
  defaultDepartment,
}: Props) {
  const [open, setOpen] = useState(false)
  const [personName, setPersonName] = useState(defaultName)
  const [department, setDepartment] = useState(defaultDepartment)
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    setPersonName(defaultName)
    setDepartment(defaultDepartment)
  }, [defaultName, defaultDepartment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // validasi basic (biar gak kirim data kosong/ngaco)
    if (!personName || !department || quantity < 1) {
      toast.error("Data tidak valid", {
        description: "Nama, departemen, dan jumlah minimal 1 wajib diisi.",
      })
      return
    }

    try {
      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: itemId,
          person_name: personName,
          department: department,
          qty: quantity,
          action,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Transaksi berhasil", {
          description: `${label} ${quantity} item oleh ${personName}`,
        })

        setOpen(false)
      } else {
        toast.error("Transaksi gagal", {
          description: data?.error || "Terjadi kesalahan pada server",
        })
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Tidak dapat terhubung ke server",
      })
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">{label}</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label} Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field>
            <FieldLabel>Nama</FieldLabel>
            <FieldGroup>
              <Input value={personName} onChange={(e) => setPersonName(e.target.value)} />
            </FieldGroup>
          </Field>

          <Field>
            <FieldLabel>Departemen</FieldLabel>
            <FieldGroup>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </FieldGroup>
          </Field>

          <Field>
            <FieldLabel>Jumlah</FieldLabel>
            <FieldGroup>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <Button type="button" onClick={() => setQuantity(quantity - 1)}>
                  <MinusIcon />
                </Button>
                <Button type="button" onClick={() => setQuantity(quantity + 1)}>
                  <PlusIcon />
                </Button>
              </div>
            </FieldGroup>
          </Field>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}