import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Category, Order } from "./backend.d";
import AdminPanel from "./components/AdminPanel";
import AnnouncementBar from "./components/AnnouncementBar";
import BestSellersSection from "./components/BestSellersSection";
import CartSidebar from "./components/CartSidebar";
import CategoryNav from "./components/CategoryNav";
import CategoryView from "./components/CategoryView";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import OrderConfirmationModal from "./components/OrderConfirmationModal";
import SearchResults from "./components/SearchResults";
import ShopByCategory from "./components/ShopByCategory";
import TrendingSection from "./components/TrendingSection";
import { useActor } from "./hooks/useActor";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function AppInner() {
  const { actor, isFetching } = useActor();
  const [seeded, setSeeded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", actor?.toString()],
    queryFn: async () => (actor ? actor.isCallerAdmin() : false),
    enabled: !!actor,
  });

  useEffect(() => {
    if (!actor || isFetching || seeded) return;
    const flag = localStorage.getItem("stopnbuy_seeded_v3");
    if (!flag) {
      actor
        .seedProducts()
        .then(() => {
          localStorage.setItem("stopnbuy_seeded_v3", "1");
          setSeeded(true);
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["trending"] });
          queryClient.invalidateQueries({ queryKey: ["bestSellers"] });
        })
        .catch(() => setSeeded(true));
    } else {
      setSeeded(true);
    }
  }, [actor, isFetching, seeded]);

  const handleCategorySelect = (cat: Category | null) => {
    setActiveCategory(cat);
    setSearchQuery("");
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q) setActiveCategory(null);
  };

  const showSearch = searchQuery.trim().length > 0;
  const showCategory = !showSearch && activeCategory !== null;
  const showHome = !showSearch && !showCategory;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <AnnouncementBar />
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCartOpen={() => setCartOpen(true)}
      />
      <CategoryNav
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
      />

      <main className="flex-1">
        {showSearch && <SearchResults query={searchQuery} />}
        {showCategory && (
          <CategoryView
            category={activeCategory!}
            searchQuery=""
            onBack={() => setActiveCategory(null)}
          />
        )}
        {showHome && (
          <>
            <HeroSection onShopNow={handleCategorySelect} />
            <ShopByCategory onCategorySelect={handleCategorySelect} />
            <TrendingSection />
            <BestSellersSection />
          </>
        )}
      </main>

      <Footer
        isAdmin={isAdmin ?? false}
        onAdminClick={() => setShowAdmin(true)}
      />

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrderPlaced={(order) => {
          setCartOpen(false);
          setConfirmedOrder(order);
        }}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
