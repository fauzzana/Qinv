import React, { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useItemActions } from "@/hooks/useItemActions"
import { EditDialog, EditDrawer } from "@/components/inventory/edit-form"
import {
  MoreHorizontal,
  Trash2,
  QrCode,
  Eye,
  Edit,

} from "lucide-react"

export default function ItemActionDropdown({ item }: any) {
  const { performDelete, performQr, isDeleting } = useItemActions(item)
  const [openQr, setOpenQr] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const qrRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: qrRef,
    documentTitle: `QR Code - ${item.name || item.item_id}`,
  });

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
          <EditDialog item={item} />
          <Dialog open={openQr} onOpenChange={setOpenQr}>
            {/* tombol qr */}
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <QrCode className="mr-2 h-4 w-4" />QR Code</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="text-left">
                <DialogTitle>Item QR Code</DialogTitle>
                <div ref={qrRef}>
                  <div className="flex items-center justify-center p-4">
                    <DialogDescription>{item.name} <br /> {item.item_id}</DialogDescription>
                  </div>
                  <div className="flex items-center justify-center p-4">
                    {item.qr_code_path ? (
                      <img
                        src={item.qr_code_path}
                        alt="QR Code"
                        className="w-64 h-64"
                        onClick={() => performQr()}
                      />
                    ) : (
                      <p className="text-gray-500">QR Code not available</p>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <Button variant="default" onClick={handlePrint}>Print</Button>
              <Button variant="destructive" onClick={() => setOpenQr(false)}>Close</Button>
            </DialogContent>
          </Dialog>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => performDelete}
            onSelect={(event) => event.preventDefault()}
            disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />{isDeleting ? "Deleting..." : "Delete"}</DropdownMenuItem>
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
        <EditDrawer item={item} />
        <Drawer open={openQr} onOpenChange={setOpenQr}>
          {/* tombol qr */}
          <DrawerTrigger asChild>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <QrCode className="mr-2 h-4 w-4" />QR Code</DropdownMenuItem>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Item QR Code</DrawerTitle>
              <div ref={qrRef}>
                <div className="flex items-center justify-center p-4">
                  <DrawerDescription>{item.name} <br /> {item.item_id}</DrawerDescription>
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
              <Button variant="default" onClick={handlePrint}>Print</Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <DropdownMenuSeparator />
        {/* tombol delete */}
        <DropdownMenuItem
          variant="destructive"
          onClick={() => performDelete()}
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
