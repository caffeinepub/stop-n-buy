import { Tag } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-navy text-white py-2 px-4 text-center text-sm font-medium">
      <span>🚚 Free Shipping on Orders Over ₹499 </span>
      <span className="mx-2 opacity-50">|</span>
      <span>Use Code: </span>
      <span className="inline-flex items-center gap-1 bg-white/15 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
        <Tag className="w-3 h-3" />
        STOPNBUY23
      </span>
    </div>
  );
}
