import React, { useState } from "react";
import type { Order, OrderItem, OrderItemVariation } from "@/services/orderService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Percent } from "lucide-react";

export interface OrderDetailsProps {
    order: Order;
    onUpdateQuantity?: (itemId: number, newQuantity: number) => void;
    onItemRemove?: (itemId: number) => void;
    onCancel?: () => void;
    onPay?: () => void;
    onApplyOrderDiscount?: (code: string) => void;
    onApplyItemDiscount?: (itemId: number, code: string) => void;
}

function DiscountPopover({ onApply }: { onApply: (code: string) => void }) {
    const [code, setCode] = useState("");
    const [open, setOpen] = useState(false);

    const handleSubmit = () => {
        onApply(code);
        setOpen(false);
        setCode("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-5 w-5 p-2 text-xs rounded-full border border-blue-200 ml-2 hover:bg-blue-50"
                    title="Apply Item Discount"
                >
                     <Percent size={4} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" side="right">
                <div className="flex gap-2">
                    <Input
                        placeholder="Discount Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-8 text-xs"
                    />
                    <Button size="sm" onClick={handleSubmit} className="text-white h-8">Apply</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
                                                       order,
                                                       onUpdateQuantity,
                                                       onItemRemove,
                                                       onCancel,
                                                       onPay,
                                                       onApplyOrderDiscount,
                                                       onApplyItemDiscount
                                                   }) => {
    const [orderDiscountCode, setOrderDiscountCode] = useState("");

    const updateQuantity = (itemId: number, newQuantity: number) => {
        if (!onUpdateQuantity) return;
        onUpdateQuantity(itemId, newQuantity);
    };

    const removeItem = (itemId: number) => {
        if (!onItemRemove) return;
        onItemRemove(itemId);
    };

    const handleOrderDiscountSubmit = () => {
        if (onApplyOrderDiscount) {
            onApplyOrderDiscount(orderDiscountCode);
            setOrderDiscountCode("");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-medium">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{order.status}</span>
                </div>
            </div>

            {order.items.length > 0 && (
                <div className="pt-4 space-y-4 flex-1 overflow-y-auto min-h-[200px]">
                    <h3 className="text-lg font-semibold">Items</h3>
                    <div className="space-y-2">
                        {order.items.map((item: OrderItem) => {
                            const basePrice = item.price + item.variations.reduce((acc, v) => acc + v.priceOffset, 0);
                            const lineTotal = basePrice * item.quantity;

                            return (
                                <div key={item.id} className="p-2 border rounded flex gap-3">
                                    {onUpdateQuantity && (
                                        <div className="flex flex-col items-center justify-center gap-0 text-l leading-none">
                                            <span
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="cursor-pointer select-none text-gray-500 hover:text-black"
                                            >+</span>
                                            <span
                                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                className="cursor-pointer select-none text-gray-500 hover:text-black"
                                            >−</span>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="font-medium flex items-center gap-2">
                                                    {item.quantity} × {item.name}
                                                    {onApplyItemDiscount && order.status === "OPEN" && (
                                                        <DiscountPopover
                                                            onApply={(code) => onApplyItemDiscount(item.id, code)}
                                                        />
                                                    )}
                                                </span>

                                                {item.variations.length > 0 && (
                                                    <ul className="ml-4 mt-1 space-y-1 text-sm text-muted-foreground">
                                                        {item.variations.map((variation: OrderItemVariation) => (
                                                            <li key={variation.id}>{variation.name}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {item.appliedDiscountAmount && item.appliedDiscountAmount > 0 ? (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-green-600 font-semibold">
                                                            Discount: -${item.appliedDiscountAmount.toFixed(2)}
                                                        </span>
                                                        <span
                                                            onClick={() => onApplyItemDiscount && onApplyItemDiscount(item.id, "")}
                                                            className="cursor-pointer text-red-500 hover:text-red-700 text-xs"
                                                            title="Remove Discount"
                                                        >
                                                            × Remove
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="text-right">
                                                <div>${lineTotal.toFixed(2)}</div>
                                                {onItemRemove && (
                                                    <span
                                                        onClick={() => removeItem(item.id)}
                                                        className="cursor-pointer text-red-500 hover:text-red-700 text-xs"
                                                    >× Remove</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="pt-4 space-y-2 text-sm bg-white mt-auto">
                {onApplyOrderDiscount && order.status === "OPEN" && (
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="Order Discount Code"
                            value={orderDiscountCode}
                            onChange={(e) => setOrderDiscountCode(e.target.value)}
                            className="h-8 text-xs"
                        />
                        <Button size="sm" variant="secondary" disabled={orderDiscountCode.trim() === ""} onClick={handleOrderDiscountSubmit} className="text-white h-8">
                            Apply
                        </Button>
                    </div>
                )}

                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${order.taxAmount.toFixed(2)}</span>
                    </div>
                    {order.taxBreakdown?.map((tax, i) => (
                        <div key={i} className="flex justify-between text-xs text-muted-foreground pl-2 italic">
                            <span>{tax}</span>
                        </div>
                    ))}
                </div>
                {order.discountAmount > 0 && (
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-green-600 font-semibold">
                            <span>Total Discount</span>
                            <div className="flex items-center gap-2">
                                <span>-${order.discountAmount.toFixed(2)}</span>
                                {order.discountId && (
                                    <span
                                        onClick={() => onApplyOrderDiscount && onApplyOrderDiscount("")}
                                        className="cursor-pointer text-red-500 hover:text-red-700 text-xs font-normal"
                                        title="Remove Order Discount"
                                    >
                                        × Remove
                                    </span>
                                )}
                            </div>
                        </div>
                        {order.discountBreakdown && order.discountBreakdown.length > 0 && (
                            <div className="flex flex-col gap-1">
                                {order.discountBreakdown.map((d, i) => (
                                    <div key={i} className="flex justify-between text-xs text-green-600 pl-2 italic">
                                        <span>{d}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between border-t pt-2 font-semibold text-base">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            {order.payments.length > 0 && (
                <div className="border-t pt-4 space-y-3 text-sm">
                    <h3 className="text-lg font-semibold">Payments</h3>
                    {order.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-start">
                            <span className="font-medium">{payment.type}</span>
                            <div className="text-right">
                                <div>${payment.amount.toFixed(2)} - {payment.status}</div>
                                {payment.tip > 0 && (
                                    <div className="text-xs text-muted-foreground">Tip: ${payment.tip.toFixed(2)}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-4 flex gap-4 justify-end">
                {onCancel && order.status === "OPEN" && (
                    <Button className="w-1/3" variant="destructive" onClick={onCancel}>Cancel</Button>
                )}
                {onPay && order.status === "OPEN" && (
                    <Button className="w-1/3" onClick={onPay}>Take Payment</Button>
                )}
            </div>

            <div className="pt-4 text-xs text-muted-foreground space-y-1">
                <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
            </div>
        </div>
    );
};

export default OrderDetails;