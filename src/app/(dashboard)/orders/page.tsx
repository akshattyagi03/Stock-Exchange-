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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MoreHorizontal, Pencil, X } from "lucide-react"

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

const STATUS_COLORS: Record<string, string> = {
    pending: "text-yellow-500",
    partially_executed: "text-blue-500",
    executed: "text-green-500",
    cancelled: "text-red-500",
}

const canActOn = (status: IOrder["status"]) =>
    status === "pending" || status === "partially_executed"

export default function Page() {
    const [orders, setOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Cancel confirm
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [cancelLoading, setCancelLoading] = useState(false)

    // Modify sheet
    const [modifyOrder, setModifyOrder] = useState<IOrder | null>(null)
    const [modifyPrice, setModifyPrice] = useState("")
    const [modifyQty, setModifyQty] = useState("")
    const [modifyLoading, setModifyLoading] = useState(false)

    async function fetchOrders() {
        try {
            const res = await fetch("/api/get-orders")
            if (!res.ok) throw new Error("Failed to fetch orders")
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrders() }, [])

    async function handleCancel() {
        if (!cancellingId) return
        setCancelLoading(true)
        try {
            const res = await fetch("/api/orders/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: cancellingId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to cancel")
            toast.success("Order cancelled")
            setCancellingId(null)
            fetchOrders()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to cancel order")
        } finally {
            setCancelLoading(false)
        }
    }

    function openModify(order: IOrder) {
        setModifyOrder(order)
        setModifyPrice(String(order.price))
        setModifyQty(String(order.remainingQuantity))
    }

    async function handleModify() {
        if (!modifyOrder) return
        setModifyLoading(true)
        try {
            const res = await fetch("/api/orders/modify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: modifyOrder.orderId,
                    price: Number(modifyPrice),
                    quantity: Number(modifyQty),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to modify")
            toast.success("Order modified")
            setModifyOrder(null)
            fetchOrders()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to modify order")
        } finally {
            setModifyLoading(false)
        }
    }

    const columns: ColumnDef<IOrder>[] = [
        { accessorKey: "orderId", header: "Order ID" },
        { accessorKey: "stockName", header: "Stock" },
        {
            accessorKey: "orderType",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("orderType") as string
                return (
                    <span className={`font-semibold ${type === "buy" ? "text-green-500" : "text-red-500"}`}>
                        {type.toUpperCase()}
                    </span>
                )
            },
        },
        { accessorKey: "quantity", header: "Qty" },
        {
            accessorKey: "price",
            header: "Order Price",
            cell: ({ row }) => `₹${(row.getValue("price") as number).toFixed(2)}`,
        },
        {
            accessorKey: "executedPrice",
            header: "Executed Price",
            cell: ({ row }) => {
                const p = row.getValue("executedPrice") as number | undefined
                return p ? `₹${p.toFixed(2)}` : "—"
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <span className={`font-medium ${STATUS_COLORS[status]}`}>
                        {status.replace("_", " ").toUpperCase()}
                    </span>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const order = row.original
                if (!canActOn(order.status)) return null
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openModify(order)}>
                                <Pencil className="size-3.5 mr-2" />
                                Modify Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={() => setCancellingId(order.orderId)}
                            >
                                <X className="size-3.5 mr-2" />
                                Cancel Order
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({ data: orders, columns, getCoreRowModel: getCoreRowModel() })

    if (loading) return <div className="p-4 text-muted-foreground">Loading orders...</div>
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>

    return (
        <>
            {/* Cancel confirm overlay */}
            {cancellingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                    <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <X className="size-5 text-red-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Cancel Order</p>
                                <p className="text-xs text-muted-foreground">This cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to cancel order <span className="font-mono text-foreground">{cancellingId}</span>? Frozen funds will be returned to your balance.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setCancellingId(null)} disabled={cancelLoading}>
                                Keep Order
                            </Button>
                            <Button variant="destructive" className="flex-1" onClick={handleCancel} disabled={cancelLoading}>
                                {cancelLoading ? "Cancelling…" : "Yes, Cancel"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modify sheet */}
            <Sheet open={!!modifyOrder} onOpenChange={(open) => { if (!open) setModifyOrder(null) }}>
                <SheetContent side="right" className="w-[400px] sm:max-w-none">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Modify Order</SheetTitle>
                    </SheetHeader>
                    {modifyOrder && (
                        <div className="space-y-5">
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm space-y-1">
                                <p><span className="text-muted-foreground">Stock:</span> <span className="font-mono font-semibold">{modifyOrder.stockName}</span></p>
                                <p><span className="text-muted-foreground">Type:</span> <span className={`font-semibold ${modifyOrder.orderType === "buy" ? "text-green-500" : "text-red-500"}`}>{modifyOrder.orderType.toUpperCase()}</span></p>
                                <p><span className="text-muted-foreground">Status:</span> <span className={`font-medium ${STATUS_COLORS[modifyOrder.status]}`}>{modifyOrder.status.replace("_", " ").toUpperCase()}</span></p>
                            </div>

                            <div className="space-y-2">
                                <Label>New Price (₹)</Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={modifyPrice}
                                    onChange={e => setModifyPrice(e.target.value)}
                                    className="font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>New Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={modifyQty}
                                    onChange={e => setModifyQty(e.target.value)}
                                    className="font-mono"
                                />
                            </div>

                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 flex justify-between text-sm">
                                <span className="text-muted-foreground">New estimated value</span>
                                <span className="font-mono font-semibold">
                                    ₹{(Number(modifyPrice) * Number(modifyQty)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <Button className="w-full" onClick={handleModify} disabled={modifyLoading}>
                                {modifyLoading ? "Saving…" : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>
                                {hg.headers.map(h => (
                                    <TableHead key={h.id}>
                                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}
