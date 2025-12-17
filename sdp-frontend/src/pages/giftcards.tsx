import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import type { GiftCard, GiftCardCreateRequest } from "@/types"
import {
    getAllGiftCards,
    createGiftCard,
    deleteGiftCard as deleteGiftCardApi,
} from "@/services/giftCardService"

export default function GiftCardsPage() {
    const { user } = useAuth()

    const [giftCards, setGiftCards] = useState<GiftCard[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    const [newGiftCard, setNewGiftCard] = useState<GiftCardCreateRequest>({
        amount: 0,
    })

    useEffect(() => {
        if (!user?.merchantId) return
        loadGiftCards()
    }, [user])

    const handleDeleteGiftCard = async (code: string) => {
        setIsLoading(true)
        try {
            if (!user?.merchantId) return
            await deleteGiftCardApi(code, user.merchantId)
            toast.success("Gift card deleted")
            loadGiftCards()
        } catch (err: any) {
            toast.error("Failed to delete gift card", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const loadGiftCards = async () => {
        setIsLoading(true)
        try {
            if (!user?.merchantId) return
            const data = await getAllGiftCards(user.merchantId)
            setGiftCards(data)
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to load gift cards", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newGiftCard.amount || newGiftCard.amount <= 0) {
            toast.error("Amount must be a positive number")
            return
        }

        setIsCreating(true)
        try {
            if (!user?.merchantId) return
            const created = await createGiftCard(newGiftCard, user.merchantId)
            toast.success("Gift card created", { description: created.code })
            setNewGiftCard({ amount: 0 })
            loadGiftCards()
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to create gift card", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsCreating(false)
        }
    }

    if (!user) {
        if (typeof window !== "undefined") window.location.href = "/login"
        return null
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Gift Cards</h1>
                <p className="text-gray-600 mt-2">Create and manage gift cards</p>
            </div>

            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Create New Gift Card</h2>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amount">Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newGiftCard.amount || ""}
                                onChange={(e) =>
                                    setNewGiftCard({
                                        amount: parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isCreating} className="w-full text-white">
                        {isCreating ? "Creating..." : "Create Gift Card"}
                    </Button>
                </form>
            </Card>

            <div>
                <h2 className="text-xl font-semibold mb-4">All Gift Cards</h2>

                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : giftCards.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500">No gift cards yet. Create one above!</p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {giftCards.map((gc) => (
                            <Card key={gc.code} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">{gc.code}</h3>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${gc.active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-200 text-gray-700"
                                                    }`}
                                            >
                                                {gc.active ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-sm text-gray-500">Current Balance</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    €{Number(gc.currentBalance).toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Initial Balance</p>
                                                <p className="text-lg font-semibold">
                                                    €{Number(gc.initialBalance).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {gc.expiryDate && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Expires: {new Date(gc.expiryDate).toLocaleString()}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Created: {new Date(gc.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        type="button"
                                        size="sm"
                                        className="text-white"
                                        onClick={async () => {
                                            try {
                                                await handleDeleteGiftCard(gc.code)
                                                toast.success("Gift card deleted")
                                                loadGiftCards()
                                            } catch (err: any) {
                                                toast.error("Failed to delete gift card", {
                                                    description: err?.data || err?.message || "Unknown error",
                                                })
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
