"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionButton } from "@/components/inventory/button-transaction"

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

export function RetrievalCard({ item, defaultName, defaultDepartment, onSubmit }: RetrivalCardProps) {
  const [personName, setPersonName] = useState(defaultName)
  const [department, setDepartment] = useState(defaultDepartment)

  useEffect(() => {
    setPersonName(defaultName)
    setDepartment(defaultDepartment)
  }, [defaultName, defaultDepartment])

  const currentQty = item.stockItems?.[0]?.current_qty ?? 0
  const statusText = statusLabels[item.status] ?? "Unknown"
  const imageSrc = item.image ?? "/placeholder.svg"

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
        <TransactionButton
          label="Retrieval"
          action={false}
          itemId={item.item_id}
          defaultName={defaultName}
          defaultDepartment={defaultDepartment}
        />
      </CardFooter>
    </Card>
  )
}

export function StoreCard({ item, defaultName, defaultDepartment, onSubmit }: StoreCardProps) {
  const [personName, setPersonName] = useState(defaultName)
  const [department, setDepartment] = useState(defaultDepartment)

  useEffect(() => {
    setPersonName(defaultName)
    setDepartment(defaultDepartment)
  }, [defaultName, defaultDepartment])

  const currentQty = item.stockItems?.[0]?.current_qty ?? 0
  const imageSrc = item.image ?? "/placeholder.svg"
  const statusText = statusLabels[item.status] ?? "Unknown"

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
        <TransactionButton
          label="Store"
          action={true}
          itemId={item.item_id}
          defaultName={defaultName}
          defaultDepartment={defaultDepartment}
        />
      </CardFooter>
    </Card>
  )
}
