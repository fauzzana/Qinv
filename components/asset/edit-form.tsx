import React, { useEffect, useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { useAssetActions } from "@/hooks/useAssetActions"
import { Separator } from "@/components/ui/separator"

interface Category {
  category_id: string
  category_name: string
}

interface Location {
  location_id: string
  location_name: string
}

export function EditDialogContent({ asset }: any) {
  const { performEdit, isEditing } = useAssetActions(asset)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // State untuk form fields
  const [name, setName] = useState(asset.name || "")
  const [description, setDescription] = useState(asset.description || "")
  const [qty, setQty] = useState(asset.qty || 0)
  const [status, setStatus] = useState(asset.status.toString())
  const [categoryId, setCategoryId] = useState(asset.category?.category_id || "")
  const [locationId, setLocationId] = useState(asset.location?.location_id || "")

  useEffect(() => {
    async function loadOptions() {
      try {
        const [categoryRes, locationRes] = await Promise.all([
          fetch("/api/category"),
          fetch("/api/location"),
        ])

        if (categoryRes.ok) {
          const data = await categoryRes.json()
          setCategories(data.data || [])
        }

        if (locationRes.ok) {
          const data = await locationRes.json()
          setLocations(data.data || [])
        }
      } catch (error) {
        console.error("Error loading category/location", error)
      }
    }

    loadOptions()
  }, [])

  return (
    <div>
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
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.location_id} value={location.location_id}>
                  {location.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quantity</Label>
          <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
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
      <div className="flex gap-2 p-2 justify-end">
        <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
        <Button
          onClick={async () => {
            const formData = new FormData();
            formData.set("name", name || "");
            formData.set("description", description || "");
            formData.set("qty", qty.toString());
            formData.set("status", status);
            if (categoryId) {
              formData.set("category_id", categoryId);
            }
            if (locationId) {
              formData.set("location_id", locationId);
            }

            await performEdit(formData);
            setOpenEdit(false);
          }}
          disabled={isEditing}
        >
          {isEditing ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

export function EditDialog({ asset }: any) {
  const [openEdit, setOpenEdit] = React.useState(false)

  return (
    <Dialog open={openEdit} onOpenChange={setOpenEdit}>
      {/* tombol edit */}
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <EditDialogContent asset={asset} />
      </DialogContent>
    </Dialog>
  )
}

export function EditDrawerContent({ asset }: any) {
  const { performEdit, isEditing } = useAssetActions(asset)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // State untuk form fields
  const [name, setName] = useState(asset.name || "")
  const [description, setDescription] = useState(asset.description || "")
  const [qty, setQty] = useState(asset.qty || 0)
  const [status, setStatus] = useState(asset.status.toString())
  const [categoryId, setCategoryId] = useState(asset.category?.category_id || "")
  const [locationId, setLocationId] = useState(asset.location?.location_id || "")

  useEffect(() => {
    async function loadOptions() {
      try {
        const [categoryRes, locationRes] = await Promise.all([
          fetch("/api/category"),
          fetch("/api/location"),
        ])

        if (categoryRes.ok) {
          const data = await categoryRes.json()
          setCategories(data.data || [])
        }

        if (locationRes.ok) {
          const data = await locationRes.json()
          setLocations(data.data || [])
        }
      } catch (error) {
        console.error("Error loading category/location", error)
      }
    }

    loadOptions()
  }, [])

  return (
    <div>
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
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.location_id} value={location.location_id}>
                  {location.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quantity</Label>
          <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
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
          onClick={async () => {
            const formData = new FormData();
            formData.set("name", name || "");
            formData.set("description", description || "");
            formData.set("qty", qty.toString());
            formData.set("status", status);
            if (categoryId) {
              formData.set("category_id", categoryId);
            }
            if (locationId) {
              formData.set("location_id", locationId);
            }

            await performEdit(formData);
            setOpenEdit(false);
          }}
          disabled={isEditing}
        >
          {isEditing ? "Saving..." : "Save Changes"}
        </Button>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </div>
  )
}

export function EditDrawer({ asset }: any) {
  const [openEdit, setOpenEdit] = React.useState(false)
  return (
    <Drawer open={openEdit} onOpenChange={setOpenEdit}>
      {/* tombol edit */}
      <DrawerTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
      </DrawerTrigger>
      <DrawerContent>
        <EditDrawerContent asset={asset} />
      </DrawerContent>
    </Drawer>
  )
}