import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Item, ProductVariation } from "@/services/itemService";

interface ItemMenuProps {
  items: Item[];
  onAddItem: (item: Item, quantity: number, variation?: ProductVariation) => void;
}

const ItemMenu = ({ items, onAddItem }: ItemMenuProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  const handleAddClick = (item: Item) => {
    setSelectedItem(item);
    setSelectedVariation(undefined);
    setQuantity(1);
    setDrawerOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedItem) return;
    onAddItem(selectedItem, quantity, selectedVariation);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-xl transition"
            onClick={() => handleAddClick(item)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{item.name}</h3>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">${item.price.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {drawerOpen && selectedItem && (
        <>
          {/* Drawer panel */}
          <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 p-6 flex flex-col transition-transform transform translate-x-0">
            <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="text-lg font-medium mb-4">
              ${(selectedItem.price).toFixed(2)}
            </p>

            {/* Quantity */}
            <div className="mb-4">
              <p className="font-semibold mb-2">Quantity</p>
              <div className="flex items-center gap-2">
                <Button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</Button>
                <span>{quantity}</span>
                <Button onClick={() => setQuantity((q) => q + 1)}>+</Button>
              </div>
            </div>

            {/* Variations */}
            {selectedItem?.variations && selectedItem.variations.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Select Variation</p>
                <ul className="flex flex-col gap-2">
                  <li key="no-variation">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="variation"
                        value="none"
                        checked={selectedVariation === undefined}
                        onChange={() => setSelectedVariation(undefined)}
                        className="accent-blue-500"
                      />
                      <span>None</span>
                    </label>
                  </li>

                  {selectedItem.variations.map((variation) => (
                    <li key={variation.id}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="variation"
                          value={variation.id}
                          checked={selectedVariation?.id === variation.id}
                          onChange={() => setSelectedVariation(variation)}
                          className="accent-blue-500"
                        />
                        <span>
                          {variation.name}{" "}
                          {variation.priceOffset !== 0 &&
                            `(${variation.priceOffset >= 0 ? "+" : ""}$${variation.priceOffset.toFixed(2)})`}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Total */}
            <div className="mb-4 mt-auto">
              <p className="font-semibold text-lg">
                Total: $
                {((selectedItem.price + (selectedVariation ? selectedVariation.priceOffset : 0)) * quantity).toFixed(2)}
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-auto flex gap-2">
              <Button className="flex-1" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Add to Order
              </Button>
            </div>
          </div>

          {/* Dimmed background */}
          <div
            className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.3)]"
            onClick={() => setDrawerOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default ItemMenu;
