"use client"
import { useEffect, useState } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface IHolding {
    _id: string
    stockName: string
    availableQuantity: number
    frozenQuantity: number
    averageBuyPrice: number
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function DataTable({ columns, data }: DataTableProps<IHolding, any>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
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
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default function Page() {
    const [holdings, setHoldings] = useState<IHolding[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchHoldings = async () => {
            try {
                const response = await fetch("/api/holdings")
                if (!response.ok) {
                    throw new Error("Failed to fetch holdings")
                }
                const data = await response.json()
                setHoldings(data.holdings || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchHoldings()
    }, [])

    const columns: ColumnDef<IHolding>[] = [
        {
            accessorKey: "stockName",
            header: "Stock Name",
        },
        {
            accessorKey: "availableQuantity",
            header: "Available Quantity",
            cell: ({ row }) => <div className="text-right">{row.getValue("availableQuantity")}</div>,
        },
        {
            accessorKey: "frozenQuantity",
            header: "Frozen Quantity",
            cell: ({ row }) => <div className="text-right">{row.getValue("frozenQuantity")}</div>,
        },
        {
            accessorKey: "averageBuyPrice",
            header: "Average Buy Price",
            cell: ({ row }) => {
                const price = row.getValue("averageBuyPrice") as number
                return <div className="text-right">₹{price.toFixed(2)}</div>
            },
        },
    ]

    if (loading) {
        return <div className="p-4">Loading holdings... <Loader2/></div>
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    return <DataTable columns={columns} data={holdings} />
}