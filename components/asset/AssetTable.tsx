"use client"

import * as React from "react"
import Link from "next/link"
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
  Edit,
  Trash2,
  QrCode,
  GripVertical,
  Wrench,
  Eye,
} from "lucide-react"

import { IconLayoutColumns, IconPlus, IconChevronDown, IconChevronsLeft, IconChevronLeft, IconChevronRight, IconChevronsRight } from "@tabler/icons-react"
import { Label } from "@/components/ui/label"

import {
  Tabs
} from "@/components/ui/tabs"

import { z } from "zod"
import { handleEdit, handleQr, handleDelete } from "./ActionAsset"
import { useMediaQuery } from "@/hooks/use-media-query"
import AssetEditForm from "@/components/asset/action-dropdown"

export const schema = z.object({
  asset_serial: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  category: z.object({
    category_name: z.string(),
  }),
  qty: z.number(),
  purcase_date: z.date(),
  purcase_price: z.number().nullable(),
  status: z.number(),
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
    cell: ({ row }) => <DragHandle id={row.original.asset_serial} />,
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
    accessorKey: "asset_serial",
    header: "Serial",
    cell: ({ row }) => {
      const assetSerial = row.original.asset_serial
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description
      return (
        <div className="flex items-center gap-2">
          <span>{description || "N/A"}</span>
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
    accessorKey: "qty",
    header: "Quantity",
    cell: ({ row }) => {
      const qty = row.original.qty
      return (
        <div className="flex items-center gap-2">
          <span>{qty}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "purcase_date",
    header: "Purchase Date",
    cell: ({ row }) => {
      const purchaseDate = row.original.purcase_date
      return (
        <div className="flex items-center gap-2 p-2">
          <span>{purchaseDate.toDateString()}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "purcase_price",
    header: "Purchase Price",
    cell: ({ row }) => {
      const purchasePrice = row.original.purcase_price
      return (
        <div className="flex items-center gap-2">
          <span>{purchasePrice}</span>
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
      return (
        <div>
          <AssetEditForm asset={row.original} />
        </div>
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
      return "link" // AVAILABLE
    case 2:
      return "ghost" // IN_USE
    case 3:
      return "secondary" // MAINTENANCE
    case 4:
      return "destructive" // Unused
    default: return "outline"
  }
}

const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return "Available"
    case 2:
      return "In Use"
    case 3:
      return "Maintenance"
    case 4:
      return "Unused"
    default: return `Status ${status}`
  }
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.asset_serial,
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

export function AssetTable({
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
    () => data?.map(({ asset_serial }) => asset_serial) || [],
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
    getRowId: (row) => row.asset_serial.toString(),
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
        asset.asset_serial?.toLowerCase().includes(search) ||
        asset.name?.toLowerCase().includes(search) ||
        asset.description?.toLowerCase().includes(search) ||
        asset.category.category_name.toLowerCase().includes(search) ||
        asset.location.location_name.toLowerCase().includes(search) ||
        asset.purcase_date.toLocaleDateString().toLowerCase().includes(search) ||
        asset.purcase_price?.toString().toLowerCase().includes(search) ||
        getStatusLabel(asset.status).toLowerCase().includes(search) ||
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/assetManagement/addSection">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <IconPlus />
                <span className="hidden lg:inline">Add Section</span>
              </Button>
            </Link>
            <Link href="/admin/assetManagement/assetMaintenance">
              <Button variant="destructive" size="sm" className="cursor-pointer">
                <Wrench />
                <span className="hidden lg:inline">Asset Maintenance</span>
              </Button>
            </Link>
          </div>
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
            {table.getRowModel().rows.length} row(s) found.
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
