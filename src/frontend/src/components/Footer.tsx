import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Facebook, Instagram, Mail, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FooterProps {
  isAdmin?: boolean;
  onAdminClick?: () => void;
}

export default function Footer({ isAdmin, onAdminClick }: FooterProps) {
  const [email, setEmail] = useState("");
  const year = new Date().getFullYear();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("You're subscribed! Welcome to Stop N Buy.");
      setEmail("");
    }
  };

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
                🛍️
              </div>
              <span className="font-extrabold text-lg">Stop N Buy</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Your one-stop destination for premium fashion, footwear, and
              accessories.
            </p>
            <div className="flex gap-3">
              {([Instagram, Twitter, Facebook] as const).map((Icon, i) => (
                <span
                  key={i === 0 ? "instagram" : i === 1 ? "twitter" : "facebook"}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase text-white/80">
              Customer Service
            </h4>
            <ul className="space-y-2">
              {[
                "Track Order",
                "Returns & Exchanges",
                "Shipping Info",
                "Size Guide",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <span className="text-white/60 hover:text-white text-sm transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase text-white/80">
              Company
            </h4>
            <ul className="space-y-2">
              {["About Us", "Careers", "Press", "Blog", "Sustainability"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-white/60 hover:text-white text-sm transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase text-white/80">
              Stay Updated
            </h4>
            <p className="text-white/60 text-sm mb-3">
              Get the latest drops & exclusive deals.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                data-ocid="newsletter.input"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm flex-1"
              />
              <Button
                data-ocid="newsletter.submit_button"
                type="submit"
                className="bg-red-accent hover:bg-[oklch(0.5_0.18_25)] text-white text-sm px-3 flex-shrink-0"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </form>
            <div className="mt-4">
              <p className="text-white/50 text-xs mb-2">We accept</p>
              <div className="flex gap-2 flex-wrap">
                {["Visa", "MC", "PayPal", "Apple"].map((card) => (
                  <div
                    key={card}
                    className="bg-white/10 rounded px-2 py-1 flex items-center gap-1"
                  >
                    <CreditCard className="w-3 h-3 text-white/60" />
                    <span className="text-[10px] text-white/70">{card}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-sm">
            © {year}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white underline"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <span
                key={item}
                className="text-white/50 hover:text-white text-xs transition-colors cursor-pointer"
              >
                {item}
              </span>
            ))}
            {isAdmin && (
              <button
                type="button"
                data-ocid="admin.open_modal_button"
                onClick={onAdminClick}
                className="text-white/40 hover:text-white text-xs transition-colors underline underline-offset-2"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
