import { motion } from "motion/react";
import { useAllProducts } from "../hooks/useQueries";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const { data: products, isLoading } = useAllProducts();

  const filtered =
    products?.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()),
    ) ?? [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold text-navy mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-muted-foreground mb-8">
          {isLoading
            ? "Searching…"
            : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
        </p>

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
            data-ocid="search.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </motion.div>
    </main>
  );
}
