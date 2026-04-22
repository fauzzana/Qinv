"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { date, z } from "zod"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { IconLayoutColumns, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconChevronDown } from "@tabler/icons-react"
import { Search } from "lucide-react"

const schema = z.object({
  asset_serial: z.string().min(1, "Asset serial is required"),
  condition: z.number(),
  note: z.string().min(1, "Note is required"),
  date_end: z.string().optional(),
  status_maintain: z.number(),
  attachment: z.instanceof(File).optional(),
})

type MaintenanceForm = z.infer<typeof schema>

interface MaintenanceAssetProps {
  data: any[]
}

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "asset_serial",
    header: "Serial",
    cell: ({ row }) => (
      <Link href={`/admin/assetManagement/${row.original.asset_serial}`}>
        <span>{row.original.asset_serial}</span>
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span>{row.original.name || "-"}</span>,
  },
  {
    accessorKey: "category.category_name",
    header: "Category",
    cell: ({ row }) => <span>{row.original.category?.category_name || "-"}</span>,
  },
  {
    accessorKey: "maintenance",
    header: "Date End",
    cell: ({ row }) => {
      const dateEnd = row.original.maintenance?.[0]?.date_end
      return (
        <span>
          {dateEnd
            ? new Date(dateEnd).toDateString()
            : "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => {
      const condition = row.original.condition
      return (
        <Badge variant={getConditionVariant(condition)}>{getConditionText(condition)}</Badge>
      )
    }
  },
  {
    accessorKey: "status_maintain",
    header: "Maintenance Status",
    cell: ({ row }) => {
      const dateEnd = row.original.maintenance?.[0]?.date_end
      const statusMaintain = row.original.maintenance?.[0]?.status_maintain
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let effectiveStatus = statusMaintain
      if (dateEnd) {
        const endDate = new Date(dateEnd)
        endDate.setHours(0, 0, 0, 0)
        if (endDate < today) {
          effectiveStatus = 2 // Done
        }
      }

      return (
        <Badge variant={getStatusVariant(effectiveStatus || 1)}>{getStatusText(effectiveStatus || 1)}</Badge>
      )
    }
  },
  {
    id: "attachment",
    header: "Attachment",
    cell: ({ row }) => {
      const attachment = row.original.maintenance?.[0]?.attachment
      return attachment ? (
        <Link href={attachment} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const statusMaintain = row.original.maintenance?.[0]?.status_maintain
      const maintenance_id = row.original.maintenance?.[0]?.maintenance_id
      const asset_serial = row.original.asset_serial

      return statusMaintain === 1 ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Will be handled in component
              (window as any).handleMarkAsDone?.(maintenance_id)
            }}
          >
            Mark as Done
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // Will be handled in component
              (window as any).handleDeleteMaintenance?.(maintenance_id, asset_serial)
            }}
          >
            Delete
          </Button>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
  },
]

const getConditionVariant = (condition: number) => {
  switch (condition) {
    case 1:
      return "destructive"
    case 2:
      return "link"
    case 3:
      return "secondary"
    default: return "outline"
  }
}

const getConditionText = (condition: number) => {
  switch (condition) {
    case 1:
      return "Poor"
    case 2:
      return "Okay"
    case 3:
      return "Good"
    default: return `${condition}`
  }
}

const getStatusVariant = (status: number) => {
  switch (status) {
    case 1:
      return "destructive"
    case 2:
      return "link"
    default:
      return "outline"
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return "On Process"
    case 2:
      return "Done"
    default: return `${status}`
  }
}

export function MaintenanceAsset({ data }: MaintenanceAssetProps) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<Omit<MaintenanceForm, 'attachment'>>({
    asset_serial: "",
    condition: 1,
    status_maintain: 1,
    note: "",
    date_end: "",
  })
  const [attachment, setAttachment] = React.useState<File | undefined>()
  const [loading, setLoading] = React.useState(false)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [tableData, setTableData] = React.useState(data)

  // Auto-update maintenance status when component mounts
  React.useEffect(() => {
    const autoUpdateMaintenanceStatus = async () => {
      try {
        const response = await fetch("/api/asset/maintenance", {
          method: "PUT",
        })

        if (response.ok) {
          const result = await response.json()
          if (result.updated > 0) {
            console.log(`Updated ${result.updated} maintenance record(s)`)
            // Refresh table data
            window.location.reload()
          }
        }
      } catch (error) {
        console.error("Error updating maintenance statuses:", error)
      }
    }

    autoUpdateMaintenanceStatus()
  }, [])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      columnVisibility,
      columnFilters,
      sorting,
      pagination,
      globalFilter,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, filterValue) => {
      const search = String(filterValue).toLowerCase()
      const searchableFields = [
        row.original.asset_serial,
        row.original.name,
        row.original.category?.category_name,
        row.original.location?.location_name,
        row.original.condition,
        row.original.maintenance?.[0]?.date_end,
        row.original.maintenance?.[0]?.status_maintain,
      ]
      return searchableFields
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(search))
    },
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append("asset_serial", formData.asset_serial)
      formDataToSend.append("condition", String(formData.condition))
      formDataToSend.append("note", formData.note)
      formDataToSend.append("date_end", formData.date_end || "")
      formDataToSend.append("status_maintain", String(formData.status_maintain))
      if (attachment) {
        formDataToSend.append("attachment", attachment)
      }

      const response = await fetch("/api/asset/maintenance", {
        method: "POST",
        body: formDataToSend,
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.message || "Failed to create maintenance record")
        return
      }

      toast.success("Maintenance record created successfully")
      setOpen(false)
      setFormData({
        asset_serial: "",
        condition: 1,
        note: "",
        date_end: "",
        status_maintain: 1,
      })
      setAttachment(undefined)
      window.location.reload()
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues?.[0]?.message || "Validation error")
      } else {
        toast.error("An error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle manual mark as done
  const handleMarkAsDone = async (maintenance_id: string) => {
    try {
      const response = await fetch("/api/asset/maintenance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maintenance_id,
          status_maintain: 2,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to update maintenance status")
        return
      }

      toast.success("Maintenance marked as done successfully")
      window.location.reload()
    } catch (error) {
      console.error("Error updating maintenance:", error)
      toast.error("An error occurred while updating maintenance")
    }
  }

  const handleDeleteMaintenance = async (maintenance_id: string, asset_serial: string) => {
    try {
      if (!confirm("Are you sure you want to delete this asset?")) {
        return
      }
      const response = await fetch("/api/asset/maintenance", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maintenance_id: maintenance_id,
          asset_serial: asset_serial,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to delete asset")
        return
      }

      toast.success("Asset deleted successfully")

      // Refresh page untuk update data terbaru
      window.location.reload()
    } catch (error) {
      console.error("Error deleting asset:", error)
      toast.error("An error occurred while deleting the asset")
    }
  }



  // Make function available globally for column cell
  React.useEffect(() => {
    (window as any).handleMarkAsDone = handleMarkAsDone
  }
    , [])
  React.useEffect(() => {
    (window as any).handleDeleteMaintenance = handleDeleteMaintenance
  }
    , [])


  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4" />
            <Input
              className="pl-8"
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
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
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add Maintenance</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Asset Maintenance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="asset_serial">Asset Serial</Label>
                  <Input
                    id="asset_serial"
                    type="text"
                    value={formData.asset_serial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        asset_serial: e.target.value,
                      })
                    }
                    placeholder="Enter asset serial"
                  />
                </div>

                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={String(formData.condition)}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        condition: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Poor</SelectItem>
                      <SelectItem value="2">Okay</SelectItem>
                      <SelectItem value="3">Good</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status_maintain">Maintenance Status</Label>
                  <Select
                    value={String(formData.status_maintain)}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status_maintain: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="status_maintain">
                      <SelectValue placeholder="Select maintenance status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">On Process</SelectItem>
                      <SelectItem value="2">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        note: e.target.value,
                      })
                    }
                    placeholder="Enter maintenance note"
                  />
                </div>

                <div>
                  <Label htmlFor="date_end">Date End</Label>
                  <Input
                    id="date_end"
                    type="date"
                    value={formData.date_end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_end: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="attachment">Attachment (File Pendukung)</Label>
                  <Input
                    id="attachment"
                    type="file"
                    onChange={(e) =>
                      setAttachment(e.target.files?.[0])
                    }
                    placeholder="Choose file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {attachment && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected: {attachment.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>

          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-17.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}