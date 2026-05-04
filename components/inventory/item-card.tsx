"use client"

import { useEffect, useState } from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export type ItemCardProps = {
  item_id: string
  name: string
  status: number
  category?: { category_name: string }
  location?: { location_name: string }
  stockItems?: Array<{ current_qty: number }>
  image?: string
}

type RetrivalCardProps = {
  item: ItemCardProps
  defaultName: string
  defaultDepartment: string
  onSubmit?: (payload: {
    item: ItemCardProps
    personName: string
    department: string
    quantity: number
  }) => void
}

const statusLabels: Record<number, string> = {
  1: "Available",
  2: "Low Stock",
  3: "Not Available",
  4: "Archived",
}



type StoreCardProps = {
  item: ItemCardProps
  defaultName: string
  defaultDepartment: string
  onSubmit?: (payload: {
    item: ItemCardProps
    personName: string
    department: string
    quantity: number
  }) => void
}

export function RetrivalCard({ item, defaultName, defaultDepartment, onSubmit }: RetrivalCardProps) {
  const [open, setOpen] = useState(false)
  const [personName, setPersonName] = useState(defaultName)
  const [department, setDepartment] = useState(defaultDepartment)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setPersonName(defaultName)
    setDepartment(defaultDepartment)
  }, [defaultName, defaultDepartment])

  const currentQty = item.stockItems?.[0]?.current_qty ?? 0
  const statusText = statusLabels[item.status] ?? "Unknown"
  const imageSrc = item.image ?? "/placeholder.svg"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: item.item_id,
          person_name: personName || defaultName,
          department: department || defaultDepartment,
          qty: quantity,
          action: false, // retrieval
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setOpen(false)
        onSubmit?.({
          item,
          personName: personName || defaultName,
          department: department || defaultDepartment,
          quantity,
        })
      } else {
        if (data.alert) {
          toast.error(data.error)
        } else {
          toast.error(data.error || 'Transaction failed')
        }
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      <img
        src={imageSrc}
        alt={item.name}
        className="relative z-20 aspect-video w-full object-cover brightness-60"
      />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-3">
          <CardAction>
            <Badge variant="secondary">{statusText}</Badge>
          </CardAction>
          <span className="text-xs text-muted-foreground">ID {item.item_id}</span>
        </div>

        <CardHeader className="px-0 py-0">
          <CardTitle>{item.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {item.category?.category_name ?? "Kategori tidak tersedia"}
          </CardDescription>
        </CardHeader>
        <CardDescription className="text-sm text-muted-foreground">
          Lokasi: {item.location?.location_name ?? "-"}
        </CardDescription>
        <CardDescription className="text-sm text-muted-foreground">
          Stok tersedia: <span className="font-semibold text-foreground">{currentQty}</span>
        </CardDescription>
      </div>

      <CardFooter className="flex flex-col gap-2 p-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full cursor-pointer">Retrival</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retrieval Item</DialogTitle>
              <DialogDescription>
                Isi nama dan departemen untuk memproses transaksi.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="personName">Nama</FieldLabel>
                <FieldGroup>
                  <Input
                    id="personName"
                    value={personName}
                    onChange={(event) => setPersonName(event.target.value)}
                    placeholder="Masukkan nama"
                  />
                </FieldGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="department">Departemen</FieldLabel>
                <FieldGroup>
                  <Input
                    id="department"
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    placeholder="Masukkan departemen"
                  />
                </FieldGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="quantity">Jumlah</FieldLabel>
                <FieldGroup>
                  <div className="flex items-center gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <MinusIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>
                </FieldGroup>
              </Field>

              <DialogFooter>
                <Button type="submit" className="w-full cursor-pointer">
                  Submit Retrival
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

export function StoreCard({ item, defaultName, defaultDepartment, onSubmit }: StoreCardProps) {
  const [open, setOpen] = useState(false)
  const [personName, setPersonName] = useState(defaultName)
  const [department, setDepartment] = useState(defaultDepartment)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setPersonName(defaultName)
    setDepartment(defaultDepartment)
  }, [defaultName, defaultDepartment])

  const currentQty = item.stockItems?.[0]?.current_qty ?? 0
  const imageSrc = item.image ?? "/placeholder.svg"
  const statusText = statusLabels[item.status] ?? "Unknown"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: item.item_id,
          person_name: personName || defaultName,
          department: department || defaultDepartment,
          qty: quantity,
          action: true, // store
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setOpen(false)
        onSubmit?.({
          item,
          personName: personName || defaultName,
          department: department || defaultDepartment,
          quantity,
        })
      } else {
        toast.error(data.error || 'Transaction failed')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      <img
        src={imageSrc}
        alt={item.name}
        className="relative z-20 aspect-video w-full object-cover brightness-60"
      />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-3">
          <CardAction>
            <Badge variant="secondary">{statusText}</Badge>
          </CardAction>
          <span className="text-xs text-muted-foreground">ID {item.item_id}</span>
        </div>

        <CardHeader className="px-0 py-0">
          <CardTitle>{item.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {item.category?.category_name ?? "Kategori tidak tersedia"}
          </CardDescription>
        </CardHeader>

        <CardDescription className="text-sm text-muted-foreground">
          Lokasi: {item.location?.location_name ?? "-"}
        </CardDescription>
        <CardDescription className="text-sm text-muted-foreground">
          Stok tersedia: <span className="font-semibold text-foreground">{currentQty}</span>
        </CardDescription>
      </div>

      <CardFooter className="flex flex-col gap-2 p-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full cursor-pointer">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Store Item</DialogTitle>
              <DialogDescription>
                Isi nama dan departemen untuk memproses transaksi.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="personName">Nama</FieldLabel>
                <FieldGroup>
                  <Input
                    id="personName"
                    value={personName}
                    onChange={(event) => setPersonName(event.target.value)}
                    placeholder="Masukkan nama"
                  />
                </FieldGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="department">Departemen</FieldLabel>
                <FieldGroup>
                  <Input
                    id="department"
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    placeholder="Masukkan departemen"
                  />
                </FieldGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="quantity">Jumlah</FieldLabel>
                <FieldGroup>
                  <div className="flex items-center gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <MinusIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>
                </FieldGroup>
              </Field>

              <DialogFooter>
                <Button type="submit" className="w-full cursoer-pointer">
                  Submit Store
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
