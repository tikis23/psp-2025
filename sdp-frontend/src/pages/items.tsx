import React, { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  getAllItems,
  createItem,
  deleteItem,
  getVariations,
  createVariation,
  updateVariation,
  deleteVariation,
} from "@/services/itemService"
import type {
  Item,
  ItemCreateRequest,
  ProductVariation,
  VariationCreateRequest,
} from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function ItemsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [newItem, setNewItem] = useState<ItemCreateRequest>({
    name: "",
    price: 0,
    type: "PRODUCT",
    taxRateId: "",
  })

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [variations, setVariations] = useState<ProductVariation[]>([])
  const [newVariation, setNewVariation] = useState<VariationCreateRequest>({
    name: "",
    priceOffset: 0,
  })
  const [editingVariation, setEditingVariation] = useState<{
    id: number
    name: string
    priceOffset: number
  } | null>(null)

  useEffect(() => {
    if (!user) return
    loadItems()
  }, [user])

  const loadItems = async () => {
    if (!user?.merchantId) return
    setIsLoading(true)
    try {
      const data = await getAllItems(user.merchantId)
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
    if (!user?.merchantId || !newItem.name || newItem.price <= 0) {
      toast.error("Please fill in all fields")
      return
    }

    setIsCreating(true)
    try {
      await createItem(newItem, user.merchantId)
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
    if (!user?.merchantId || !confirm("Delete this item?")) return

    try {
      await deleteItem(id, user.merchantId)
      toast.success("Item deleted!")
      loadItems()
    } catch (error: any) {
      console.error("Delete failed:", error)
      toast.error(error.message || "Failed to delete item")
    }
  }

  // VARIATION HANDLERS

  const loadVariations = async (itemId: number) => {
    if (!user?.merchantId) return
    try {
      const data = await getVariations(itemId, user.merchantId)
      setVariations(data)
      setSelectedItemId(itemId)
    } catch (error) {
      toast.error("Failed to load variations")
    }
  }

  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.merchantId || !selectedItemId) return

    try {
      await createVariation(selectedItemId, newVariation, user.merchantId)
      toast.success("Variation created!")
      setNewVariation({ name: "", priceOffset: 0 })
      loadVariations(selectedItemId)
    } catch (error) {
      toast.error("Failed to create variation")
    }
  }

  const handleUpdateVariation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.merchantId || !selectedItemId || !editingVariation) return

    try {
      await updateVariation(
        selectedItemId,
        editingVariation.id,
        {
          name: editingVariation.name,
          priceOffset: editingVariation.priceOffset,
        },
        user.merchantId
      )
      toast.success("Variation updated!")
      setEditingVariation(null)
      loadVariations(selectedItemId)
    } catch (error) {
      toast.error("Failed to update variation")
    }
  }

  const handleDeleteVariation = async (variationId: number) => {
    if (
      !user?.merchantId ||
      !selectedItemId ||
      !confirm("Delete this variation?")
    )
      return

    try {
      await deleteVariation(selectedItemId, variationId, user.merchantId)
      toast.success("Variation deleted!")
      loadVariations(selectedItemId)
    } catch (error) {
      toast.error("Failed to delete variation")
    }
  }

  if (!user) return <div>Please log in</div>

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Item Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your products and services
        </p>
      </div>

      {/* Create Item Form */}
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
              <Label htmlFor="taxRateId">Tax Rate ID</Label>
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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Items</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">
                No items yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedItemId === item.id
                      ? "ring-2 ring-blue-500"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => {
                    if (item.type === "PRODUCT") {
                      loadVariations(item.id)
                    } else {
                      setSelectedItemId(null)
                      toast.info("Services don't have variations")
                    }
                  }}
                >
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
                          Tax: {item.taxRateId}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
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

        {/* Variations Panel */}
        <div>
          {selectedItemId ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Product Variations
              </h2>

              {/* Create Variation Form */}
              <form onSubmit={handleCreateVariation} className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="varName">Variation Name</Label>
                  <Input
                    id="varName"
                    value={newVariation.name}
                    onChange={(e) =>
                      setNewVariation({ ...newVariation, name: e.target.value })
                    }
                    placeholder="e.g., Large Size"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="varOffset">Price Offset</Label>
                  <Input
                    id="varOffset"
                    type="number"
                    step="0.01"
                    value={newVariation.priceOffset || ""}
                    onChange={(e) =>
                      setNewVariation({
                        ...newVariation,
                        priceOffset: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Variation
                </Button>
              </form>

              {/* Variations List */}
              <div className="space-y-2">
                <h3 className="font-medium">Existing Variations</h3>
                {variations.length === 0 ? (
                  <p className="text-gray-500 text-sm">No variations yet</p>
                ) : (
                  variations.map((v) => (
                    <div
                      key={v.id}
                      className="border rounded p-3 flex justify-between items-center"
                    >
                      {editingVariation?.id === v.id ? (
                        <form
                          onSubmit={handleUpdateVariation}
                          className="flex-1 flex gap-2"
                        >
                          <Input
                            value={editingVariation.name}
                            onChange={(e) =>
                              setEditingVariation({
                                ...editingVariation,
                                name: e.target.value,
                              })
                            }
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={editingVariation.priceOffset}
                            onChange={(e) =>
                              setEditingVariation({
                                ...editingVariation,
                                priceOffset: parseFloat(e.target.value),
                              })
                            }
                            className="w-24"
                          />
                          <Button type="submit" size="sm">
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingVariation(null)}
                          >
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium">{v.name}</p>
                            <p className="text-sm text-gray-600">
                              +${v.priceOffset.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingVariation(v)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteVariation(v.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">
                Click on a product to manage its variations
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
