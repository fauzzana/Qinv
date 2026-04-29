import React, { useEffect, useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { useItemActions } from "@/hooks/useItemActions"

interface Category {
  category_id: string
  category_name: string
}

interface Location {
  location_id: string
  location_name: string
}

export function EditDialog({ item }: any) {
  const { performEdit, isEditing } = useItemActions(item)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // State untuk form fields
  const [name, setName] = useState(item.name || "")
  const [categoryId, setCategoryId] = useState(item.category?.category_id || "")
  const [locationId, setLocationId] = useState(item.location?.location_id || "")
  const [minQty, setMinQty] = useState(item.min_qty || 0)
  const [status, setStatus] = useState(item.status.toString())

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
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
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
            <Label>Minimum Quantity</Label>
            <Input type="number" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full rounded border p-2">
              <option value="1">Available</option>
              <option value="2">Out of Stock</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={async () => {
            const formData = new FormData();
            formData.set("name", name || "");
            formData.set("status", status);
            if (categoryId) {
              formData.set("category_id", categoryId);
            }
            if (locationId) {
              formData.set("location_id", locationId);
            }
            if (minQty) {
              formData.set("min_qty", minQty.toString());
            }

            await performEdit(formData);
            setOpenEdit(false);
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
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // State untuk form fields
  const [name, setName] = useState(item.name || "")
  const [categoryId, setCategoryId] = useState(item.category?.category_id || "")
  const [locationId, setLocationId] = useState(item.location?.location_id || "")
  const [minQty, setMinQty] = useState(item.min_qty || 0)
  const [status, setStatus] = useState(item.status.toString())

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
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
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
            <Label>Minimum Quantity</Label>
            <Input type="number" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full rounded border p-2">
              <option value="1">Available</option>
              <option value="2">Out of Stock</option>
            </select>
          </div>
        </div>
        <DrawerFooter className="pt-2">
          <Button onClick={async () => {
            const formData = new FormData();
            formData.set("name", name || "");
            formData.set("status", status);
            if (categoryId) {
              formData.set("category_id", categoryId);
            }
            if (locationId) {
              formData.set("location_id", locationId);
            }
            if (minQty) {
              formData.set("min_qty", minQty.toString());
            }

            await performEdit(formData);
            setOpenEdit(false);
          }}>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}