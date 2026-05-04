"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { RetrievalCard, StoreCard, ItemCardProps } from "@/components/inventory/item-card"

type Profile = {
  name?: string | null
  department?: { depart_name: string } | null
}

export function Tab() {
  const [items, setItems] = useState<ItemCardProps[]>([])
  const [profile, setProfile] = useState<Profile>({})

  useEffect(() => {
    async function load() {
      try {
        const [itemsRes, profileRes] = await Promise.all([
          fetch("/api/inventory/item"),
          fetch("/api/user/profile"),
        ])

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json()
          setItems(itemsData.data ?? [])
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Gagal memuat data transaksi", error)
      }
    }

    load()
  }, [])

  const defaultName = profile.name ?? ""
  const defaultDepartment = profile.department?.depart_name ?? "Umum"

  const handleSubmission = (payload: {
    item: ItemCardProps
    personName: string
    department: string
    quantity: number
  }) => {
    toast.success("Retrival berhasil dikirim", {
      description: (
        <div className="space-y-1 text-sm">
          <p>{payload.item.name}</p>
          <p>Nama: {payload.personName}</p>
          <p>Departemen: {payload.department}</p>
          <p>Jumlah: {payload.quantity}</p>
        </div>
      ),
    })
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="grid gap-3 sm:grid-cols-[1fr,280px]">
        <div>
          <h1 className="text-2xl font-bold">Transaksi POS</h1>
          <p className="text-muted-foreground">
            Pilih item dan buka dialog retrieval untuk mengisi nama serta departemen dengan default dari profil saat ini.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Informasi default</p>
          <div className="mt-3 space-y-2">
            <p className="text-sm">Nama: <span className="font-medium text-foreground">{defaultName || "-"}</span></p>
            <p className="text-sm">Departemen: <span className="font-medium text-foreground">{defaultDepartment}</span></p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="retrival" className="w-full">
        <TabsList>
          <TabsTrigger value="retrival">Retrival</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>

        <TabsContent value="retrival">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Belum ada item tersedia.
              </div>
            ) : (
              items.map((item) => (
                <RetrievalCard
                  key={item.item_id}
                  item={item}
                  defaultName={defaultName}
                  defaultDepartment={defaultDepartment}
                  onSubmit={handleSubmission}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="store">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Belum ada item tersedia.
              </div>
            ) : (
              items.map((item) => (
                <StoreCard key={item.item_id} item={item} defaultName={defaultName} defaultDepartment={defaultDepartment} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
