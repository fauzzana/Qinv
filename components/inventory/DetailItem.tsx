"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useItemActions } from "@/hooks/useItemActions"
import { useReactToPrint } from "react-to-print";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { TransactionButton } from "@/components/inventory/button-transaction"

interface Item {
  item_id: string;
  name: string;
  category: {
    category_name: string;
  };
  location: {
    location_name: string;
  };
  status: number;
  image: string | null;
  qr_code_path: string;
  stockItems: {
    current_qty: number;
    min_qty: number;
  }[];
}

export type ItemCardProps = {
  item_id: string
  name: string
  status: number
  category?: { category_name: string }
  location?: { location_name: string }
  stockItems?: Array<{ current_qty: number }>
  image?: string
}

interface DetailItemProps {
  item: Item;
}


type Profile = {
  name?: string | null
  department?: { depart_name: string } | null
}


export function DetailItem({ item }: DetailItemProps) {
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


  const { performQr } = useItemActions(item)
  const [openQr, setOpenQr] = React.useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: qrRef,
    documentTitle: `QR Code - ${item.name || item.item_id}`,
  })

  // Get stock information
  const stockItem = item.stockItems?.[0] || { current_qty: 0, min_qty: 0 }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      <Card className="md:col-span-2 h-min">
        <CardHeader>
          <CardTitle>
            <h1 className="scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance">{item.name}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="font-semibold">Item ID:</label>
            <p className="text-muted-foreground">{item.item_id}</p>
          </div>
          <div>
            <label className="font-semibold">Category:</label>
            <p className="text-muted-foreground">{item.category.category_name}</p>
          </div>
          <div>
            <label className="font-semibold">Location:</label>
            <p className="text-muted-foreground">{item.location.location_name}</p>
          </div>
          <div>
            <label className="font-semibold">Current Quantity:</label>
            <p className="text-muted-foreground">{stockItem.current_qty}</p>
          </div>
          <div>
            <label className="font-semibold">Minimum Quantity:</label>
            <p className="text-muted-foreground">{stockItem.min_qty}</p>
          </div>
          <div>
            <label className="font-semibold">Status:</label>
            <Badge variant={item.status === 1 ? "default" : "secondary"}>
              {item.status === 1 ? "Available" : "Out of Stock"}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="bg-white flex">
          <div className="flex gap-2">
            <TransactionButton
              label="Retrieval"
              action={false}
              itemId={item.item_id}
              defaultName={profile.name ?? ""}
              defaultDepartment={profile.department?.depart_name ?? "Umum"}
            />
            <TransactionButton
              label="Store"
              action={true}
              itemId={item.item_id}
              defaultName={profile.name ?? ""}
              defaultDepartment={profile.department?.depart_name ?? "Umum"}
            />
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Image Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Image</CardTitle>
        </CardHeader>
        <CardContent>
          {item.image ? (
            <div className="relative w-full aspect-square">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-muted flex items-center justify-center rounded">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
        </CardContent>

        {/* QR Code Card */}
        <CardHeader>
          <CardTitle className="text-base">QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Drawer open={openQr} onOpenChange={setOpenQr}>
            {/* tombol qr */}
            <DrawerTrigger asChild className="cursor-pointer">
              {item.qr_code_path ? (
                <div className="relative w-full aspect-square">
                  <Image
                    src={item.qr_code_path}
                    alt="QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center rounded">
                  <span className="text-muted-foreground">No QR code available</span>
                </div>
              )}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Item QR Code</DrawerTitle>
                <div ref={qrRef}>
                  <div className="flex items-center justify-center p-4">
                    QR code for item {item.name}
                  </div>
                  <div className="flex items-center justify-center p-4">
                    {item.qr_code_path ? (
                      <img
                        src={item.qr_code_path}
                        alt="QR Code"
                        className="w-48 h-48"
                        onClick={() => performQr()}
                      />
                    ) : (
                      <p className="text-gray-500">QR Code not available</p>
                    )}
                  </div>
                </div>
              </DrawerHeader>
              <DrawerFooter className="pt-2">
                <Button variant="default" onClick={handlePrint}>
                  Print
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

        </CardContent>
      </Card>
    </div >
  );
}