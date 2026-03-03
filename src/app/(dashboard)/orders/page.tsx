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
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}
interface IOrder {
    _id: string
    orderId: string
    stockName: string
    quantity: number
    remainingQuantity: number
    executedQuantity: number
    price: number
    executedPrice?: number
    orderType: "buy" | "sell"
    status: "pending" | "partially_executed" | "executed" | "cancelled"
    createdAt: string
}
function DataTable({ columns, data }: DataTableProps<IOrder, any>) {
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
    const [orders, setOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/get-orders")
                if (!response.ok) {
                    throw new Error("Failed to fetch orders")
                }

                const data = await response.json()

                const filteredOrders = (data.orders || []).filter(
                    (order: IOrder) =>
                        order.status === "pending" ||
                        order.status === "partially_executed"
                )

                setOrders(filteredOrders)

            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const columns: ColumnDef<IOrder>[] = [
        {
            accessorKey: "orderId",
            header: "Order ID",
        },
        {
            accessorKey: "stockName",
            header: "Stock",
        },
        {
            accessorKey: "orderType",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("orderType") as string
                return (
                    <span
                        className={`font-semibold ${type === "buy" ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {type.toUpperCase()}
                    </span>
                )
            },
        },
        {
            accessorKey: "quantity",
            header: "Qty",
        },
        {
            accessorKey: "price",
            header: "Order Price",
            cell: ({ row }) => {
                const price = row.getValue("price") as number
                return <span>₹{price.toFixed(2)}</span>
            },
        },
        {
            accessorKey: "executedPrice",
            header: "Executed Price",
            cell: ({ row }) => {
                const price = row.getValue("executedPrice") as number | undefined
                return price ? `₹${price.toFixed(2)}` : "-"
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string

                const colorMap: Record<string, string> = {
                    pending: "text-yellow-600",
                    partially_executed: "text-blue-600",
                    executed: "text-green-600",
                    cancelled: "text-red-600",
                }

                return (
                    <span className={`font-medium ${colorMap[status]}`}>
                        {status.replace("_", " ").toUpperCase()}
                    </span>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"))
                return <span>{date.toLocaleString()}</span>
            },
        },
    ]

    if (loading) {
        return <div className="p-4">Loading orders...</div>
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    return <DataTable columns={columns} data={orders} />
}