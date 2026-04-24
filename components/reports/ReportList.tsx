"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  DownloadCloud,
  Search,
  FileText,
  ListChecks,
  Box,
} from "lucide-react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const reportItems = [
  {
    id: "maintenance",
    title: "Maintenance Request Report",
    description: "Track request status, assigned work, and completion details.",
    icon: ListChecks,
    columns: [
      "Status",
      "Asset Serial",
      "Condition",
      "Note",
      "Created At",
      "Completed At",
    ],
  },
  {
    id: "asset",
    title: "Asset Inventory Report",
    description: "Review asset counts, status, and location details.",
    icon: Box,
    columns: [
      "Asset Serial",
      "Name",
      "Category",
      "Location",
      "Quantity",
      "Purchase Date",
      "Purchase Price",
      "Status",
    ],
  },
  {
    id: "transaction",
    title: "Transaction Activity Report",
    description: "Analyze recent inventory and asset transactions.",
    icon: FileText,
    columns: [
      "Transaction ID",
      "User",
      "Action",
      "Person Name",
      "Asset/Item",
      "Quantity",
      "Created At",
    ],
  },
]

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

export function CollapsibleReport() {
  const [selectedReport, setSelectedReport] = React.useState<
    (typeof reportItems)[number] | null
  >(null)
  const [fromDate, setFromDate] = React.useState(getToday())
  const [toDate, setToDate] = React.useState(getToday())
  const [searchQuery, setSearchQuery] = React.useState("")
  const [reportData, setReportData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset data when report changes
  React.useEffect(() => {
    setReportData([])
    setError(null)
    setSearchQuery("")
  }, [selectedReport])

  const fetchReportData = async () => {
    if (!selectedReport) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        fromDate,
        toDate,
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/reports/${selectedReport.id}?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data")
      }

      setReportData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setReportData([])
    } finally {
      setIsLoading(false)
    }
  }

  const getExportRows = (data: any[]) => {
    const dataKeyMap: Record<string, string> = {
      Status: "status",
      "Asset Serial": "assetSerial",
      Condition: "condition",
      Note: "note",
      "Created At": "createdAt",
      "Completed At": "completedAt",
      Name: "name",
      Category: "category",
      Location: "location",
      Quantity: "quantity",
      "Purchase Date": "purchaseDate",
      "Purchase Price": "purchasePrice",
      "Transaction ID": "transactionId",
      User: "user",
      Action: "action",
      "Person Name": "personName",
      "Asset/Item": "assetItem",
    }

    return data.map((row) =>
      selectedReport!.columns.reduce((acc, column) => {
        const key = dataKeyMap[column]
        acc[column] = row[key] ?? "-"
        return acc
      }, {} as Record<string, string>)
    )
  }

  const downloadSpreadsheet = () => {
    if (!selectedReport || reportData.length === 0) return

    const sheetData = getExportRows(reportData)
    const worksheet = XLSX.utils.json_to_sheet(sheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report")

    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const blob = new Blob([wbout], {
      type: "application/octet-stream",
    })

    saveAs(blob, `${selectedReport.id}-report-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const downloadPdf = () => {
    if (!selectedReport || reportData.length === 0) return

    const doc = new jsPDF()
    doc.text(selectedReport.title, 14, 16)

    const headers = [selectedReport.columns]
    const rows = getExportRows(reportData).map((row) =>
      selectedReport.columns.map((column) => row[column])
    )

      ; (doc as any).autoTable({
        head: headers,
        body: rows,
        startY: 22,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 64, 175] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })

    doc.save(`${selectedReport.id}-report-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="space-y-6">
      <Card className="w-auto">
        <CardContent className="p-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {reportItems.map((report) => {
              const Icon = report.icon
              return (
                <Collapsible className="rounded-md data-[state=open]:bg-muted">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="group w-full">
                      <div className="flex items-center gap-2 text-left">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{report.title}</span>
                      </div>
                      <ChevronDownIcon className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col items-start gap-3 p-2.5 pt-0 text-sm">
                    <div className="text-muted-foreground">{report.description}</div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                      className="self-stretch"
                    >
                      View report
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedReport ? (
        <Card className="w-full">
          <CardHeader className="px-4 pt-4">
            <CardTitle>{selectedReport.title}</CardTitle>
            <CardDescription>{selectedReport.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 pt-2">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="from-date">
                  From Date
                </label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="to-date">
                  To Date
                </label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex  align-middle gap-2">
                  <Button className="h-10 px-4" onClick={fetchReportData} disabled={isLoading}>
                    {isLoading ? "Loading..." : "View Data"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="h-10 px-4" variant="outline">
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={6} align="end" className="w-44">
                      <DropdownMenuItem onClick={downloadSpreadsheet}>
                        Download Spreadsheet
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={downloadPdf}>
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="border-0 bg-transparent px-0 focus-visible:ring-0"
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      {selectedReport.columns.map((column) => (
                        <th key={column} className="px-3 py-3">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={selectedReport.columns.length} className="px-3 py-10 text-center text-sm text-muted-foreground">
                          Loading data...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={selectedReport.columns.length} className="px-3 py-10 text-center text-sm text-red-600">
                          Error: {error}
                        </td>
                      </tr>
                    ) : reportData.length === 0 ? (
                      <tr>
                        <td colSpan={selectedReport.columns.length} className="px-3 py-10 text-center text-sm text-muted-foreground">
                          No Data
                        </td>
                      </tr>
                    ) : (
                      reportData.map((row, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                          {selectedReport.columns.map((column) => {
                            // Map column names to data keys
                            const dataKeyMap: Record<string, string> = {
                              "Status": "status",
                              "Asset Serial": "assetSerial",
                              "Condition": "condition",
                              "Note": "note",
                              "Created At": "createdAt",
                              "Completed At": "completedAt",
                              "Name": "name",
                              "Category": "category",
                              "Location": "location",
                              "Quantity": "quantity",
                              "Purchase Date": "purchaseDate",
                              "Purchase Price": "purchasePrice",
                              "Transaction ID": "transactionId",
                              "User": "user",
                              "Action": "action",
                              "Person Name": "personName",
                              "Asset/Item": "assetItem",
                            }

                            const dataKey = dataKeyMap[column]
                            const value = row[dataKey] || "-"

                            return (
                              <td key={column} className="px-3 py-3">
                                {value}
                              </td>
                            )
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full border-dashed border-border bg-muted/50">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Click any report button to open the report preview panel.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
