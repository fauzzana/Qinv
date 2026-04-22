import React from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { useItemActions } from "@/hooks/useItemActions"

export function EditDialog({ item }: any) {
  const { performEdit, isEditing } = useItemActions(item)
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
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to item information. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Item ID</Label>
            <Input disabled value={item.item_id} className="mt-1" />
          </div>
          <div>
            <Label>Name</Label>
            <Input name="name" defaultValue={item.name || ""} className="mt-1" />
          </div>
          <div>
            <Label>Status</Label>
            <select name="status" defaultValue={item.status} className="mt-1 block w-full rounded border p-2">
              <option value="1">Available</option>
              <option value="2">Out of Stock</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={async (e) => {
            const dialogContent = (e.currentTarget as HTMLElement).closest('[role="dialog"]');
            if (dialogContent) {
              const nameInput = dialogContent.querySelector('input[name="name"]') as HTMLInputElement;
              const statusSelect = dialogContent.querySelector('select[name="status"]') as HTMLSelectElement;

              const formData = new FormData();
              formData.set("name", nameInput?.value || "");
              formData.set("status", statusSelect?.value || item.status.toString());

              await performEdit(formData);
              setOpenEdit(false);
            }
          }}
          >
            {isEditing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EditDrawer({ item }: any) {
  const { performEdit, isEditing } = useItemActions(item)
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
          <DrawerTitle>Edit Item</DrawerTitle>
          <DrawerDescription>
            Make changes to item information. Tap save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 p-4">
          <div>
            <Label>Item ID</Label>
            <Input disabled value={item.item_id} className="mt-1" />
          </div>
          <div>
            <Label>Name</Label>
            <Input name="name" defaultValue={item.name || ""} className="mt-1" />
          </div>
          <div>
            <Label>Status</Label>
            <select name="status" defaultValue={item.status} className="mt-1 block w-full rounded border p-2">
              <option value="1">Available</option>
              <option value="2">Out of Stock</option>
            </select>
          </div>
        </div>
        <DrawerFooter className="pt-2">
          <Button onClick={async (e) => {
            const drawerContent = (e.currentTarget as HTMLElement).closest('[role="dialog"]');
            if (drawerContent) {
              const nameInput = drawerContent.querySelector('input[name="name"]') as HTMLInputElement;
              const statusSelect = drawerContent.querySelector('select[name="status"]') as HTMLSelectElement;

              const formData = new FormData();
              formData.set("name", nameInput?.value || "");
              formData.set("status", statusSelect?.value || item.status.toString());

              await performEdit(formData);
              setOpenEdit(false);
            }
          }}>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}