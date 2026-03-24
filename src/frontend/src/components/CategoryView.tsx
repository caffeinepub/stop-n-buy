import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { Category } from "../backend.d";
import { useProductsByCategory } from "../hooks/useQueries";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

const categoryLabels: Record<Category, string> = {
  [Category.shoes]: "Shoes",
  [Category.watches]: "Watches",
  [Category.purses]: "Purses",
  [Category.accessories]: "Accessories",
  [Category.sunglasses]: "Sunglasses",
};

const categoryEmoji: Record<Category, string> = {
  [Category.shoes]: "👟",
  [Category.watches]: "⌚",
  [Category.purses]: "👜",
  [Category.accessories]: "💍",
  [Category.sunglasses]: "🕶️",
};

interface CategoryViewProps {
  category: Category;
  searchQuery: string;
  onBack: () => void;
}

export default function CategoryView({
  category,
  searchQuery,
  onBack,
}: CategoryViewProps) {
  const { data: products, isLoading } = useProductsByCategory(category);

  const filtered =
    products?.filter((p) =>
      searchQuery
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    ) ?? [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Button
            data-ocid="category.back.button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-full border-navy text-navy hover:bg-navy hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{categoryEmoji[category]}</span>
            <h1 className="text-3xl font-extrabold text-navy">
              {categoryLabels[category]}
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
              <ProductCardSkeleton key={k} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div
            data-ocid="category.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">{categoryEmoji[category]}</div>
            <p className="text-lg font-semibold">No products found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        )}
      </motion.div>
    </main>
  );
}
