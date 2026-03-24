import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Category, type Product } from "../backend.d";
import {
  useAddToCart,
  useToggleWishlist,
  useWishlist,
} from "../hooks/useQueries";

const categoryColors: Record<Category, string> = {
  [Category.shoes]: "from-blue-100 to-blue-200",
  [Category.watches]: "from-slate-100 to-slate-200",
  [Category.purses]: "from-pink-100 to-pink-200",
  [Category.accessories]: "from-purple-100 to-purple-200",
  [Category.sunglasses]: "from-amber-100 to-amber-200",
};

const categoryEmoji: Record<Category, string> = {
  [Category.shoes]: "👟",
  [Category.watches]: "⌚",
  [Category.purses]: "👜",
  [Category.accessories]: "💍",
  [Category.sunglasses]: "🕶️",
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-border">
      <Skeleton className="w-full h-52" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();

  const inWishlist =
    wishlist?.items.some((item) => item.product.id === product.id) ?? false;
  const price = (Number(product.price) / 100).toFixed(2);
  const stars = Math.round(product.rating);
  const hasImage = product.imageUrl && product.imageUrl.trim() !== "";

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: product.id, quantity: BigInt(1) },
      { onSuccess: () => toast.success(`${product.name} added to cart`) },
    );
  };

  const handleWishlist = () => {
    toggleWishlist.mutate(
      { productId: product.id, inWishlist },
      {
        onSuccess: () =>
          toast.success(
            inWishlist ? "Removed from wishlist" : "Added to wishlist",
          ),
      },
    );
  };

  return (
    <div
      data-ocid={`products.item.${index + 1}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-xs border border-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
    >
      <div
        className={`relative h-52 ${
          hasImage
            ? "bg-muted"
            : `bg-gradient-to-br ${categoryColors[product.category]}`
        } flex items-center justify-center`}
      >
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl">{categoryEmoji[product.category]}</span>
        )}
        {product.isBestSeller && (
          <Badge className="absolute top-3 left-3 bg-orange-accent text-white border-none text-[10px] font-bold">
            Best Seller
          </Badge>
        )}
        {product.isTrending && !product.isBestSeller && (
          <Badge className="absolute top-3 left-3 bg-red-accent text-white border-none text-[10px] font-bold">
            Trending
          </Badge>
        )}
        <button
          type="button"
          data-ocid={`products.item.${index + 1}.toggle`}
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            inWishlist
              ? "bg-red-accent text-white"
              : "bg-white/80 text-foreground hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>
        {Number(product.inStock) === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-bold text-muted-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-bold text-navy line-clamp-2 leading-tight mb-1">
          {product.name}
        </h3>
        <Badge variant="secondary" className="text-[10px] mb-2 capitalize">
          {product.category}
        </Badge>

        <div className="flex items-center gap-1 mb-2">
          {["1", "2", "3", "4", "5"].map((n, i) => (
            <Star
              key={n}
              className={`w-3 h-3 ${
                i < stars
                  ? "text-gold fill-gold"
                  : "text-muted-foreground/30 fill-muted-foreground/10"
              }`}
            />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">
            ({Number(product.reviewCount)})
          </span>
        </div>

        <span className="text-lg font-extrabold text-navy">${price}</span>

        <Button
          data-ocid={`products.item.${index + 1}.button`}
          className="w-full mt-3 bg-navy hover:bg-navy-dark text-white text-xs font-bold rounded-full py-2"
          onClick={handleAddToCart}
          disabled={addToCart.isPending || Number(product.inStock) === 0}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          {Number(product.inStock) === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
