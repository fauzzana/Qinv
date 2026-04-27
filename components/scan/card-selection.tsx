"use client"

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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconAsset, IconPackages } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { QRScannerAsset, QRScannerItem } from "./Scanner"

export function CardImage() {
  const router = useRouter()
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)

  const handleAssetScan = (result: string | null) => {
    if (result && result !== "undefined") {
      setIsAssetDialogOpen(false)
      router.push(`/admin/assetManagement/${encodeURIComponent(result)}`)
      return
    }

    console.warn("Invalid asset scan result", result)
  }

  const handleItemScan = (result: string | null) => {
    if (result && result !== "undefined") {
      setIsItemDialogOpen(false)
      router.push(`/admin/inventoryManagement/${encodeURIComponent(result)}`)
      return
    }

    console.warn("Invalid item scan result", result)
  }

  return (
    <div className="flex flex-row items-center gap-4 px-4 py-6">
      <Card className="relative mx-auto w-full max-w-sm pt-0">
        <div className="absolute inset-0 z-30 aspect-video" />
        <div className="flex h-48 items-center justify-center bg-muted">
          <IconAsset className="size-24 text-muted-foreground" />
        </div>
        <CardHeader >
          <CardTitle className="justify-self-center align-middle" >Scan Asset</CardTitle>
          <CardDescription>
            Scan the QR code of the asset to view details and manage inventory, like computer, printer, etc.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full cursor-pointer">SCAN QR</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Scan Asset QR Code</DialogTitle>
                <DialogDescription>
                  Point your camera at the asset's QR code to scan.
                </DialogDescription>
              </DialogHeader>
              <div id="reader-asset" className="w-full min-h-96"></div>
              <QRScannerAsset onScan={handleAssetScan} elementId="reader-asset" />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      <Card className="relative mx-auto w-full max-w-sm pt-0">
        <div className="absolute inset-0 z-30 aspect-video" />
        <div className="flex h-48 items-center justify-center bg-muted">
          <IconPackages className="size-24 text-muted-foreground" />
        </div>
        <CardHeader>
          <CardTitle className="justify-self-center align-middle">Scan Item</CardTitle>
          <CardDescription>
            Scan the QR code of the item to view details and manage inventory, like chair, table, etc.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full cursor-pointer">SCAN QR</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Scan Item QR Code</DialogTitle>
                <DialogDescription>
                  Point your camera at the item's QR code to scan.
                </DialogDescription>
              </DialogHeader>
              <div id="reader-item" className="w-full min-h-96"></div>
              <QRScannerItem onScan={handleItemScan} elementId="reader-item" />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
