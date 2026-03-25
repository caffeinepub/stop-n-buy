import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import {
  useCart,
  usePlaceOrder,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "../hooks/useQueries";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  onOrderPlaced,
}: CartSidebarProps) {
  const { data: cart, isLoading } = useCart();
  const removeFromCart = useRemoveFromCart();
  const updateQuantity = useUpdateCartQuantity();
  const placeOrder = usePlaceOrder();

  const totalPrice = (Number(cart?.totalPrice ?? 0) / 100).toFixed(0);
  const isEmpty = !cart?.items.length;

  const handlePlaceOrder = () => {
    placeOrder.mutate(undefined, {
      onSuccess: (order) => {
        onOrderPlaced(order);
        onClose();
      },
      onError: () => toast.error("Failed to place order. Please try again."),
    });
  };

  const getCategoryEmoji = (category: string) => {
    if (category === "shoes") return "👟";
    if (category === "watches") return "⌚";
    if (category === "purses") return "👜";
    if (category === "accessories") return "💍";
    return "🕶️";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            data-ocid="cart.sheet"
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-navy text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-bold text-lg">Your Cart</span>
                {!isEmpty && (
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart!.items.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                data-ocid="cart.close_button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 px-5">
              {isLoading ? (
                <div
                  data-ocid="cart.loading_state"
                  className="flex items-center justify-center py-16"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-navy" />
                </div>
              ) : isEmpty ? (
                <div
                  data-ocid="cart.empty_state"
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="font-bold text-foreground mb-1">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add some items to get started!
                  </p>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  {cart!.items.map((item, i) => (
                    <div
                      key={String(item.product.id)}
                      data-ocid={`cart.item.${i + 1}`}
                      className="flex gap-3 p-3 rounded-xl bg-section-bg border border-border"
                    >
                      <div className="w-16 h-16 rounded-lg bg-card-bg flex items-center justify-center text-3xl flex-shrink-0">
                        {getCategoryEmoji(item.product.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-navy line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mb-2">
                          {item.product.category}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              data-ocid={`cart.item.${i + 1}.secondary_button`}
                              onClick={() => {
                                const newQty = Number(item.quantity) - 1;
                                if (newQty <= 0) {
                                  removeFromCart.mutate(item.product.id);
                                } else {
                                  updateQuantity.mutate({
                                    productId: item.product.id,
                                    quantity: BigInt(newQty),
                                  });
                                }
                              }}
                              className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:bg-navy hover:text-white hover:border-navy transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">
                              {Number(item.quantity)}
                            </span>
                            <button
                              type="button"
                              data-ocid={`cart.item.${i + 1}.primary_button`}
                              onClick={() =>
                                updateQuantity.mutate({
                                  productId: item.product.id,
                                  quantity: BigInt(Number(item.quantity) + 1),
                                })
                              }
                              className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:bg-navy hover:text-white hover:border-navy transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            data-ocid={`cart.item.${i + 1}.delete_button`}
                            onClick={() =>
                              removeFromCart.mutate(item.product.id)
                            }
                            className="w-6 h-6 rounded-full text-muted-foreground hover:text-red-accent transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-navy flex-shrink-0">
                        ₹
                        {(
                          (Number(item.product.price) * Number(item.quantity)) /
                          100
                        ).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {!isEmpty && !isLoading && (
              <div className="px-5 py-4 border-t border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm">
                    Subtotal
                  </span>
                  <span className="font-bold text-navy">₹{totalPrice}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-sm">
                    Shipping
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {Number(cart?.totalPrice) >= 49900 ? "FREE" : "₹49"}
                  </span>
                </div>
                <Separator className="mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-navy">Total</span>
                  <span className="text-xl font-extrabold text-navy">
                    ₹
                    {(Number(cart?.totalPrice) >= 49900
                      ? Number(cart?.totalPrice) / 100
                      : (Number(cart?.totalPrice) + 4900) / 100
                    ).toFixed(0)}
                  </span>
                </div>
                <Button
                  data-ocid="cart.submit_button"
                  className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-full py-3"
                  onClick={handlePlaceOrder}
                  disabled={placeOrder.isPending}
                >
                  {placeOrder.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Processing…
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
