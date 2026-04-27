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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useMediaQuery } from "@/hooks/use-media-query"

import {
  MoreHorizontal,
  Search,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  GripVertical,
} from "lucide-react"

import { IconLayoutColumns, IconChevronDown, IconChevronsLeft, IconChevronLeft, IconChevronRight, IconChevronsRight, IconPlus } from "@tabler/icons-react"
import { Label } from "@/components/ui/label"

import {
  Tabs
} from "@/components/ui/tabs"

import { z } from "zod"
import { handleEdit } from "./ActionUsers"

export const schema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  role: z.enum(["ADMIN", "MANAGEMENT", "STAFF"]),
  userId: z.string().nullable(),
  department: z.object({
    depart_name: z.string().nullable(),
  }).nullable(),
})

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7"
    >
      <GripVertical className="size-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
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

export function UserTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
  const [data, setData] = React.useState(() => initialData)
  const [departments, setDepartments] = React.useState<{ depart_id: number; depart_name: string }[]>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})
  const [roleFilter, setRoleFilter] = React.useState("all")
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

  React.useEffect(() => {
    fetch('/api/department')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDepartments(data.data)
        }
      })
      .catch(error => console.error('Error fetching departments:', error))
  }, [])

  const columns = React.useMemo<ColumnDef<z.infer<typeof schema>>[]>(() => [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span>{row.original.name || "N/A"}</span>
          </div>)
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span>{row.original.email || "N/A"}</span>
          </div>)
      }
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const getRoleBadgeVariant = (role: string) => {
          switch (role) {
            case "ADMIN":
              return "destructive"
            case "MANAGEMENT":
              return "default"
            case "STAFF":
              return "secondary"
            default: return "outline"
          }
        }

        return (
          <Badge variant={getRoleBadgeVariant(row.original.role)}>{row.original.role}</Badge>
        )
      }
    },
    {
      accessorKey: "department.depart_name",
      header: "Department",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span>{row.original.department?.depart_name || "N/A"}</span>
          </div>)
      }
    },
    {
      accessorKey: "userId",
      header: "User ID",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span>{row.original.userId || "N/A"}</span>
          </div>)
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const [openEdit, setOpenEdit] = React.useState(false)
        const [editName, setEditName] = React.useState(row.original.name || "")
        const [editRole, setEditRole] = React.useState(row.original.role)
        const [editDepartment, setEditDepartment] = React.useState(row.original.department?.depart_name || "")
        const isDesktop = useMediaQuery("(min-width: 768px)")

        const edit = handleEdit({
          ...row.original,
          department: {
            department_name: editDepartment,
          },
        } as any)

        if (isDesktop) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                  {/* tombol edit */}
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                      <DialogDescription>
                        edit the user information here.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>ID</Label>
                        <Input disabled value={row.original.id} className="mt-1" />
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input name="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input disabled name="email" value={row.original.email || ""} className="mt-1" />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select value={editRole} onValueChange={(value: "ADMIN" | "MANAGEMENT" | "STAFF") => setEditRole(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                            <SelectItem value="MANAGEMENT">MANAGEMENT</SelectItem>
                            <SelectItem value="STAFF">STAFF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Select value={editDepartment} onValueChange={setEditDepartment}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.depart_id} value={dept.depart_name}>
                                {dept.depart_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
                      <Button onClick={async (e) => {
                        const updateData = {
                          name: editName,
                          role: editRole,
                          department_name: editDepartment,
                        }
                        await edit(updateData);
                        setOpenEdit(false);
                      }}>Save Changes</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <DropdownMenuItem>
                  <UserCheck className="mr-2 h-4 w-4" /> Activate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <UserX className="mr-2 h-4 w-4" /> Deactivate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      }
    }
  ], [departments])

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map((item) => item.id),
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
    getRowId: (row) => row.id.toString(),
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
      const user = row.original
      const search = filterValue.toLowerCase()
      return (
        !!user.id?.toLowerCase().includes(search) ||
        !!user.name?.toLowerCase().includes(search) ||
        !!user.email?.toLowerCase().includes(search) ||
        !!user.role?.toLowerCase().includes(search) ||
        !!user.department?.depart_name?.toLowerCase().includes(search)
      )
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id)
        const newIndex = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="hidden lg:inline">Filter by Role</span>
                  <span className="lg:hidden">Role</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => {
                  setRoleFilter("all")
                  table.setColumnFilters([])
                }}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setRoleFilter("ADMIN")
                  table.setColumnFilters([{ id: "role", value: "ADMIN" }])
                }}>
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setRoleFilter("MANAGEMENT")
                  table.setColumnFilters([{ id: "role", value: "MANAGEMENT" }])
                }}>
                  Management
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setRoleFilter("STAFF")
                  table.setColumnFilters([{ id: "role", value: "STAFF" }])
                }}>
                  Staff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/userManagement/department">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <IconPlus />
                <span className="hidden lg:inline">Departments</span>
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