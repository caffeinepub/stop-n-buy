import { Award } from "lucide-react";
import { motion } from "motion/react";
import { useBestSellers } from "../hooks/useQueries";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

export default function BestSellersSection() {
  const { data: products, isLoading } = useBestSellers();

  return (
    <section className="py-14 bg-section-bg">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Award className="w-6 h-6 text-orange-accent" />
          <div>
            <h2 className="text-3xl font-extrabold text-navy">Best Sellers</h2>
            <p className="text-muted-foreground text-sm">
              Customer favorites you'll love
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {isLoading ? (
            ["a", "b", "c", "d"].map((k) => <ProductCardSkeleton key={k} />)
          ) : (products?.length ?? 0) > 0 ? (
            products!.map((product, i) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={i}
              />
            ))
          ) : (
            <div
              data-ocid="bestsellers.empty_state"
              className="col-span-4 text-center py-12 text-muted-foreground"
            >
              No best sellers yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
