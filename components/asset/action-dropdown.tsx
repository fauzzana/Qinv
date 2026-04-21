import React from "react"
import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useAssetActions } from "@/hooks/useAssetActions"
import { EditDialog, EditDrawer } from "@/components/asset/edit-form"
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  QrCode,
  GripVertical,
  Wrench,
  Eye,
} from "lucide-react"


export default function AssetEditForm({ asset }: any) {
  const { performDelete, performQr, isDeleting } = useAssetActions(asset)
  const [openQr, setOpenQr] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {/* tombol Detail */}
          <DropdownMenuItem asChild>
            <Link href={`/admin/assetManagement/${asset.asset_serial}`} className="flex items-center gap-2">
              <Eye className="mr-2 h-4 w-4" />Detail
            </Link>
          </DropdownMenuItem>
          < EditDialog asset={asset} />
          <Dialog open={openQr} onOpenChange={setOpenQr}>
            {/* tombol qr */}
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <QrCode className="mr-2 h-4 w-4" />QR Code</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="text-left">
                <DialogTitle>Asset QR Code</DialogTitle>
                <DialogDescription>
                  QR code for {asset.name}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center p-4">
                {asset.qr_code_path ? (
                  <img
                    src={asset.qr_code_path}
                    alt="QR Code"
                    className="w-64 h-64"
                    onClick={() => performQr()}
                  />
                ) : (
                  <p className="text-gray-500">QR Code not available</p>
                )}
              </div>
              <Button variant="outline" onClick={() => setOpenQr(false)}>Close</Button>
            </DialogContent>
          </Dialog>
          <DropdownMenuSeparator />
          {/* tombol request maintenance */}
          <DropdownMenuItem onClick={() => alert("Request maintenance feature coming soon!")} onSelect={(event) => event.preventDefault()}>
            <Wrench className="mr-2 h-4 w-4" />Maintain</DropdownMenuItem>
          {/* tombol delete */}
          <DropdownMenuItem
            variant="destructive"
            onClick={performDelete}
            onSelect={(event) => event.preventDefault()}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {/* tombol Detail */}
        <DropdownMenuItem asChild>
          <Link href={`/admin/assetManagement/${asset.asset_serial}`} className="flex items-center gap-2">
            <Eye className="mr-2 h-4 w-4" />Detail
          </Link>
        </DropdownMenuItem>
        <EditDrawer asset={asset} />
        <Drawer open={openQr} onOpenChange={setOpenQr}>
          {/* tombol qr */}
          <DrawerTrigger asChild>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <QrCode className="mr-2 h-4 w-4" />QR Code</DropdownMenuItem>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Asset QR Code</DrawerTitle>
              <DrawerDescription>
                QR code for asset {asset.name}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex items-center justify-center p-4">
              {asset.qr_code_path ? (
                <img
                  src={asset.qr_code_path}
                  alt="QR Code"
                  className="w-48 h-48"
                  onClick={() => performQr()}
                />
              ) : (
                <p className="text-gray-500">QR Code not available</p>
              )}
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <DropdownMenuSeparator />
        {/* tombol request maintenance */}
        <DropdownMenuItem onClick={() => alert("Request maintenance feature coming soon!")} onSelect={(event) => event.preventDefault()}>
          <Wrench className="mr-2 h-4 w-4" />Maintain</DropdownMenuItem>
        {/* tombol delete */}
        <DropdownMenuItem
          variant="destructive"
          onClick={performDelete}
          onSelect={(event) => event.preventDefault()}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}