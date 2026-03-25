import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Loader2,
  LogIn,
  LogOut,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
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
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const cartCount =
    cart?.items.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;
  const wishlistCount = wishlist?.items.length ?? 0;

  const isLoggedIn = !!identity;
  const isLoading = isLoggingIn || isInitializing;

  const principalSnippet = isLoggedIn
    ? `${identity.getPrincipal().toString().slice(0, 8)}…`
    : null;

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
          {/* Account button — always visible */}
          <div className="block">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="account.open_modal_button"
                    variant="ghost"
                    size="sm"
                    className="flex-col h-auto gap-0.5 px-2 py-1.5"
                    disabled={isLoading}
                  >
                    <User className="w-5 h-5 text-navy" />
                    <span className="text-[10px] text-muted-foreground max-w-[56px] truncate hidden md:block">
                      {principalSnippet}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-foreground">
                      Signed in
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {identity.getPrincipal().toString().slice(0, 20)}…
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    data-ocid="account.button"
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => clear()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                data-ocid="account.open_modal_button"
                variant="default"
                size="sm"
                className="gap-1.5 bg-navy hover:bg-navy/90 text-white"
                disabled={isLoading}
                onClick={() => login()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{isLoading ? "Loading…" : "Login"}</span>
              </Button>
            )}
          </div>

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
