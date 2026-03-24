import { motion } from "motion/react";
import { Category } from "../backend.d";

interface ShopByCategoryProps {
  onCategorySelect: (cat: Category) => void;
}

const categories = [
  {
    value: Category.shoes,
    label: "Shoes",
    emoji: "👟",
    color: "from-blue-50 to-blue-100",
    border: "border-blue-200",
  },
  {
    value: Category.watches,
    label: "Watches",
    emoji: "⌚",
    color: "from-gray-50 to-gray-100",
    border: "border-gray-200",
  },
  {
    value: Category.purses,
    label: "Purses",
    emoji: "👜",
    color: "from-pink-50 to-pink-100",
    border: "border-pink-200",
  },
  {
    value: Category.accessories,
    label: "Accessories",
    emoji: "💍",
    color: "from-purple-50 to-purple-100",
    border: "border-purple-200",
  },
  {
    value: Category.sunglasses,
    label: "Sunglasses",
    emoji: "🕶️",
    color: "from-amber-50 to-amber-100",
    border: "border-amber-200",
  },
];

export default function ShopByCategory({
  onCategorySelect,
}: ShopByCategoryProps) {
  return (
    <section className="py-14 bg-section-bg">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold text-navy mb-2">
            Shop by Category
          </h2>
          <p className="text-muted-foreground">
            Find exactly what you're looking for
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.value}
              data-ocid={`category.${cat.value}.button`}
              onClick={() => onCategorySelect(cat.value)}
              className={`group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-b ${cat.color} border ${cat.border} hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                {cat.emoji}
              </span>
              <span className="text-sm font-bold text-navy">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
