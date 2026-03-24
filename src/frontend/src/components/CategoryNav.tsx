import { Category } from "../backend.d";

interface CategoryNavProps {
  activeCategory: Category | null;
  onCategorySelect: (cat: Category | null) => void;
}

const navItems: Array<{
  label: string;
  value: Category | null;
  sale?: boolean;
}> = [
  { label: "New Arrivals", value: null },
  { label: "Men", value: null },
  { label: "Women", value: null },
  { label: "Accessories", value: Category.accessories },
  { label: "Lifestyle", value: null },
  { label: "Brands", value: null },
  { label: "Sale", value: null, sale: true },
];

export default function CategoryNav({
  activeCategory,
  onCategorySelect,
}: CategoryNavProps) {
  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "-")}.link`}
                onClick={() => onCategorySelect(item.value)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  item.sale
                    ? "text-red-accent border-transparent hover:border-red-accent"
                    : activeCategory === item.value && item.value !== null
                      ? "text-navy border-navy"
                      : "text-foreground border-transparent hover:text-navy hover:border-navy"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
