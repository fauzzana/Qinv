import React from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { useAssetActions } from "@/hooks/useAssetActions"


export function EditDialog({ asset }: any) {
  const { performEdit, isEditing } = useAssetActions(asset)
  const [openEdit, setOpenEdit] = React.useState(false)

  return (
    <Dialog open={openEdit} onOpenChange={setOpenEdit}>
      {/* tombol edit */}
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Make changes to asset information. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Serial Number</Label>
            <Input disabled value={asset.asset_serial} className="mt-1" />
          </div>
          <div>
            <Label>Name</Label>
            <Input name="name" defaultValue={asset.name || ""} className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Input name="description" defaultValue={asset.description || ""} className="mt-1" />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" name="qty" defaultValue={asset.qty} className="mt-1" />
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue={asset.status.toString()}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Available</SelectItem>
                <SelectItem value="2">In Use</SelectItem>
                <SelectItem value="3">Maintenance</SelectItem>
                <SelectItem value="4">Unused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button
            onClick={async (e) => {
              const dialogContent = (e.currentTarget as HTMLElement).closest('[role="dialog"]');
              if (dialogContent) {
                const nameInput = dialogContent.querySelector('input[name="name"]') as HTMLInputElement;
                const descInput = dialogContent.querySelector('input[name="description"]') as HTMLInputElement;
                const qtyInput = dialogContent.querySelector('input[name="qty"]') as HTMLInputElement;
                const statusSelect = dialogContent.querySelector('[name="status"]') as HTMLElement;

                const formData = new FormData();
                formData.set("name", nameInput?.value || "");
                formData.set("description", descInput?.value || "");
                formData.set("qty", qtyInput?.value || "0");

                const statusValue = statusSelect?.getAttribute("data-state") || asset.status.toString();
                formData.set("status", statusValue);

                await performEdit(formData);
                setOpenEdit(false);
              }
            }}
            disabled={isEditing}
          >
            {isEditing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EditDrawer({ asset }: any) {
  const { performEdit, isEditing } = useAssetActions(asset)
  const [openEdit, setOpenEdit] = React.useState(false)
  return (
    <Drawer open={openEdit} onOpenChange={setOpenEdit}>
      {/* tombol edit */}
      <DrawerTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Asset</DrawerTitle>
          <DrawerDescription>
            Make changes to asset information. Tap save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 p-4">
          <div>
            <Label>Serial Number</Label>
            <Input disabled value={asset.asset_serial} className="mt-1" />
          </div>
          <div>
            <Label>Name</Label>
            <Input name="name" defaultValue={asset.name || ""} className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Input name="description" defaultValue={asset.description || ""} className="mt-1" />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" name="qty" defaultValue={asset.qty} className="mt-1" />
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue={asset.status.toString()}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Available</SelectItem>
                <SelectItem value="2">In Use</SelectItem>
                <SelectItem value="3">Maintenance</SelectItem>
                <SelectItem value="4">Unused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter className="pt-2">
          <Button
            onClick={async (e) => {
              const drawerContent = (e.currentTarget as HTMLElement).closest('[role="dialog"]');
              if (drawerContent) {
                const nameInput = drawerContent.querySelector('input[name="name"]') as HTMLInputElement;
                const descInput = drawerContent.querySelector('input[name="description"]') as HTMLInputElement;
                const qtyInput = drawerContent.querySelector('input[name="qty"]') as HTMLInputElement;
                const statusSelect = drawerContent.querySelector('[name="status"]') as HTMLElement;

                const formData = new FormData();
                formData.set("name", nameInput?.value || "");
                formData.set("description", descInput?.value || "");
                formData.set("qty", qtyInput?.value || "0");

                const statusValue = statusSelect?.getAttribute("data-state") || asset.status.toString();
                formData.set("status", statusValue);

                await performEdit(formData);
                setOpenEdit(false);
              }
            }}
            disabled={isEditing}
          >
            {isEditing ? "Saving..." : "Save Changes"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}