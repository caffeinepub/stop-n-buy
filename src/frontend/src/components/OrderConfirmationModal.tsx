import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Order } from "../backend.d";

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderConfirmationModal({
  order,
  onClose,
}: OrderConfirmationModalProps) {
  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            data-ocid="order.dialog"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative">
              <button
                type="button"
                data-ocid="order.close_button"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-navy mb-2">
                Order Confirmed! 🎉
              </h2>
              <p className="text-muted-foreground mb-4">
                Thank you for shopping with Stop N Buy! Your order has been
                placed successfully.
              </p>

              <div className="bg-section-bg rounded-2xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-navy" />
                  <span className="font-bold text-navy text-sm">
                    Order #{String(order.id)}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={String(item.product.id)}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-foreground truncate">
                        {item.product.name} ×{Number(item.quantity)}
                      </span>
                      <span className="font-semibold text-navy ml-2">
                        $
                        {(
                          (Number(item.price) * Number(item.quantity)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
                <div className="flex justify-between font-bold text-navy border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span>${(Number(order.totalPrice) / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button
                data-ocid="order.confirm_button"
                className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-full"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
