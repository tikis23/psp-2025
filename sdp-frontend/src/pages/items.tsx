import React, { useEffect, useState } from "react"
import {
  getAllItems,
  createItem,
  deleteItem,
} from "../services/itemService"
import type { Item, ItemCreateRequest } from "../types"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card } from "../components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export default function ItemsPage() {
    const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [newItem, setNewItem] = useState<ItemCreateRequest>({
    name: "",
    price: 0,
    type: "PRODUCT",
    taxRateId: "",
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const data = await getAllItems()
      setItems(data)
    } catch (error: any) {
      console.error("Failed to load items:", error)
      toast.error("Failed to load items")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.name || newItem.price <= 0) {
      toast.error("Please fill in all fields")
      return
    }
    
    setIsCreating(true)
    try {
      await createItem(newItem)
      toast.success("Item created successfully!")
      setNewItem({ name: "", price: 0, type: "PRODUCT", taxRateId: "" })
      loadItems()
    } catch (error: any) {
      console.error("Create failed:", error)
      toast.error(error.message || "Failed to create item")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    
    try {
      await deleteItem(id)
      toast.success("Item deleted successfully!")
      loadItems()
    } catch (error: any) {
      console.error("Delete failed:", error)
      toast.error(error.message || "Failed to delete item")
    }
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null // Prevent rendering on server side
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Item Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your products and services
        </p>
      </div>

      {/* Create Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Item</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="e.g., Espresso"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={newItem.price || ""}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                className="w-full p-2 border rounded-md"
                value={newItem.type}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    type: e.target.value as "PRODUCT" | "SERVICE_ITEM",
                  })
                }
              >
                <option value="PRODUCT">Product</option>
                <option value="SERVICE_ITEM">Service</option>
              </select>
            </div>

            <div>
              <Label htmlFor="taxRateId">Tax Rate ID (Optional)</Label>
              <Input
                id="taxRateId"
                value={newItem.taxRateId}
                onChange={(e) =>
                  setNewItem({ ...newItem, taxRateId: e.target.value })
                }
                placeholder="e.g., TAX001"
              />
            </div>
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? "Creating..." : "Create Item"}
          </Button>
        </form>
      </Card>

      {/* Items List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Items</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No items yet. Create your first item above!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {item.type === "PRODUCT" ? "Product" : "Service"}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${item.price.toFixed(2)}
                    </p>
                    {item.taxRateId && (
                      <p className="text-sm text-gray-500 mt-1">
                        Tax Rate: {item.taxRateId}
                      </p>
                    )}
                    {item.variations && item.variations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">
                          Variations:
                        </p>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {item.variations.map((v) => (
                            <li key={v.id} className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              {v.name} (+${v.priceOffset.toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
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
