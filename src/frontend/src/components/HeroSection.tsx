import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Category } from "../backend.d";

interface HeroSectionProps {
  onShopNow: (cat: Category) => void;
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.97_0.006_245)] via-white to-[oklch(0.93_0.025_245)]">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-navy opacity-5" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-orange-accent opacity-5" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-navy opacity-5" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
        {/* Left content */}
        <motion.div
          className="flex-1 z-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-orange-accent" />
            <span className="text-sm font-semibold tracking-widest uppercase text-orange-accent">
              Summer Essentials
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-navy leading-tight mb-4">
            Upgrade
            <br />
            <span className="text-red-accent">Your Style</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md">
            Discover the latest in fashion — from premium sneakers to luxury
            watches and designer purses. Shop the trends that define you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              data-ocid="hero.primary_button"
              className="bg-navy text-white hover:bg-navy-dark px-6 py-3 text-sm font-bold rounded-full"
              onClick={() => onShopNow(Category.shoes)}
            >
              Shop Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              data-ocid="hero.secondary_button"
              variant="outline"
              className="border-navy text-navy hover:bg-navy hover:text-white px-6 py-3 text-sm font-bold rounded-full"
              onClick={() => onShopNow(Category.accessories)}
            >
              Browse Collections
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-border">
            {[
              { value: "50K+", label: "Happy Customers" },
              { value: "1,200+", label: "Products" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-extrabold text-navy">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right decorative */}
        <motion.div
          className="flex-1 flex justify-center items-center z-10"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Main circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-navy to-[oklch(0.25_0.055_255)] flex items-center justify-center">
              <div className="text-center">
                <div className="text-7xl mb-2">🛍️</div>
                <div className="text-white font-bold text-lg">Stop N Buy</div>
                <div className="text-white/60 text-sm">Premium Fashion</div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2">
              <span className="text-2xl">👟</span>
              <div>
                <div className="text-xs font-bold text-navy">Shoes</div>
                <div className="text-[10px] text-muted-foreground">New In</div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2">
              <span className="text-2xl">⌚</span>
              <div>
                <div className="text-xs font-bold text-navy">Watches</div>
                <div className="text-[10px] text-muted-foreground">
                  Trending
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-red-accent rounded-2xl shadow-card p-3">
              <span className="text-2xl">👜</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
