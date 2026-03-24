import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useTrendingProducts } from "../hooks/useQueries";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

export default function TrendingSection() {
  const { data: products, isLoading } = useTrendingProducts();
  const displayed = products?.slice(0, 8) ?? [];

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <TrendingUp className="w-6 h-6 text-red-accent" />
          <div>
            <h2 className="text-3xl font-extrabold text-navy">
              Trending This Week
            </h2>
            <p className="text-muted-foreground text-sm">
              Hot picks everyone's talking about
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {isLoading ? (
            ["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
              <ProductCardSkeleton key={k} />
            ))
          ) : displayed.length > 0 ? (
            displayed.map((product, i) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={i}
              />
            ))
          ) : (
            <div
              data-ocid="trending.empty_state"
              className="col-span-4 text-center py-12 text-muted-foreground"
            >
              No trending products yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
