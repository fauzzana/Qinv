"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  MoreHorizontal,
  Search,
  QrCode,
  Edit,
  Trash2,
  GripVertical,
} from "lucide-react"

import { IconLayoutColumns, IconPlus, IconChevronDown, IconChevronsLeft, IconChevronLeft, IconChevronRight, IconChevronsRight } from "@tabler/icons-react"
import { Label } from "@/components/ui/label"

import {
  Tabs
} from "@/components/ui/tabs"

import Link from "next/link"
import { z } from "zod"
import { handleEdit, handleQr, handleDelete } from "./ActionItem"
import { useMediaQuery } from "@/hooks/use-media-query"

export const schema = z.object({
  item_id: z.string(),
  name: z.string(),
  category: z.object({
    category_name: z.string(),
  }),
  status: z.number(),
  stockItems: z.array(z.object({
    current_qty: z.number(),
  })),
  location: z.object({
    location_name: z.string(),
  }),
  qr_code_path: z.string().nullable(),
  image: z.string().nullable(),
})

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.item_id.toString()} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.image
      return (
        <div className="flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={row.original.name || "Asset Image"}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "item_id",
    header: "id",
    cell: ({ row }) => {
      const assetSerial = row.original.item_id
      return (
        <div className="flex items-center gap-2">
          <span>{assetSerial}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name
      return (
        <div className="flex items-center gap-2">
          <span>{name || "N/A"}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "category.category_name",
    header: "Category",
    cell: ({ row }) => {
      const categoryName = row.original.category.category_name
      return (
        <div className="flex items-center gap-2">
          <span>{categoryName}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "StockItems",
    header: "Quantity",
    cell: ({ row }) => {
      const qty = row.original.stockItems?.[0]?.current_qty || 0
      return (
        <div className="flex items-center gap-2">
          <span>{qty}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "location.location_name",
    header: "Location",
    cell: ({ row }) => {
      const locationName = row.original.location.location_name
      return (
        <div className="flex items-center gap-2">
          <span>{locationName}</span>
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [openEdit, setOpenEdit] = React.useState(false)
      const [openQr, setOpenQr] = React.useState(false)
      const isDesktop = useMediaQuery("(min-width: 768px)")

      const edit = handleEdit(row.original)
      const qr = handleQr(row.original.qr_code_path)
      const del = handleDelete(row.original.item_id)

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
                      <Input disabled value={row.original.item_id} className="mt-1" />
                    </div>
                    <div>
                      <Label>Name</Label>
                      <Input name="name" defaultValue={row.original.name || ""} className="mt-1" />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <select name="status" defaultValue={row.original.status} className="mt-1 block w-full rounded border p-2">
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
                        formData.set("status", statusSelect?.value || row.original.status.toString());

                        await edit(formData);
                        setOpenEdit(false);
                      }
                    }}>Save Changes</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                      QR code for {row.original.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-center p-4">
                    {row.original.qr_code_path ? (
                      <img
                        src={row.original.qr_code_path}
                        alt="QR Code"
                        className="w-64 h-64"
                        onClick={qr}
                      />
                    ) : (
                      <p className="text-gray-500">QR Code not available</p>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setOpenQr(false)}>Close</Button>
                </DialogContent>
              </Dialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={del} onSelect={(event) => event.preventDefault()}>
                <Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
                    <Input disabled value={row.original.item_id} className="mt-1" />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input name="name" defaultValue={row.original.name || ""} className="mt-1" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select name="status" defaultValue={row.original.status} className="mt-1 block w-full rounded border p-2">
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
                      formData.set("status", statusSelect?.value || row.original.status.toString());

                      await edit(formData);
                      setOpenEdit(false);
                    }
                  }}>Save Changes</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
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
                    QR code for asset {row.original.name}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex items-center justify-center p-4">
                  {row.original.qr_code_path ? (
                    <img
                      src={row.original.qr_code_path}
                      alt="QR Code"
                      className="w-48 h-48"
                      onClick={qr}
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
            {/* tombol delete */}
            <DropdownMenuItem variant="destructive" onClick={del} onSelect={(event) => event.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const getStatusBadgeVariant = (status: number) => {
  switch (status) {
    case 1:
      return "default" // AVAILABLE
    case 2:
      return "destructive" // Out of Stock
    default: return "outline"
  }
}

const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return "Available"
    case 2:
      return "Out of Stock"
    default: return `Status ${status}`
  }
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.item_id.toString(),
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} data-state={cell.column.id === "select" && row.getIsSelected() && "selected"}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function ItemTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ item_id }) => item_id) || [],
    [data]
  )
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.item_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    globalFilterFn: (row, filterValue) => {
      const asset = row.original
      const search = filterValue.toLowerCase()
      return (
        asset.item_id?.toString().toLowerCase().includes(search) ||
        asset.name?.toLowerCase().includes(search) ||
        asset.category.category_name.toLowerCase().includes(search) ||
        asset.location.location_name.toLowerCase().includes(search)
      )
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <div className="flex gap-2">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4" />
                <Input
                  className="pl-8"
                  placeholder="Search..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
            </div>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/admin/inventoryManagement/addItem">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <IconPlus />
              <span className="hidden lg:inline">Add Item</span>
            </Button>
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className=" top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  )
}
