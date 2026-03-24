import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useCart, useWishlist } from "../hooks/useQueries";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCartOpen: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onCartOpen,
}: HeaderProps) {
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();

  const cartCount =
    cart?.items.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;
  const wishlistCount = wishlist?.items.length ?? 0;

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-navy rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-navy leading-tight hidden sm:block">
            Stop N Buy
          </span>
        </div>

        <div className="flex-1 relative max-w-2xl mx-auto">
          <Input
            data-ocid="search.search_input"
            className="w-full pl-4 pr-10 py-2 rounded-full border-border bg-section-bg focus:bg-white"
            placeholder="Search for shoes, watches, fashion…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => onSearchChange("")}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto gap-0.5 px-2 py-1.5 hidden md:flex"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] text-muted-foreground">Account</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="relative flex-col h-auto gap-0.5 px-2 py-1.5 hidden md:flex"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] text-muted-foreground">Wishlist</span>
            {wishlistCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] flex items-center justify-center bg-red-accent border-none">
                {wishlistCount}
              </Badge>
            )}
          </Button>
          <Button
            data-ocid="cart.open_modal_button"
            variant="ghost"
            size="sm"
            className="relative flex-col h-auto gap-0.5 px-2 py-1.5"
            onClick={onCartOpen}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] text-muted-foreground hidden md:block">
              Cart
            </span>
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] flex items-center justify-center bg-navy border-none">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
