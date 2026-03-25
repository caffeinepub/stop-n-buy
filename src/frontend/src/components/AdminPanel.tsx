import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, ShieldCheck, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Category, UserRole } from "../backend.d";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { useAllProducts, useUpdateProduct } from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";

const categoryEmoji: Record<Category, string> = {
  [Category.shoes]: "👟",
  [Category.watches]: "⌚",
  [Category.purses]: "👜",
  [Category.accessories]: "💍",
  [Category.sunglasses]: "🕶️",
};

interface AdminPanelProps {
  onClose: () => void;
}

interface RowState {
  stock: string;
  uploadProgress: number | null;
  uploading: boolean;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { data: products, isLoading } = useAllProducts();
  const updateProduct = useUpdateProduct();
  const { actor } = useActor();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [transferPrincipal, setTransferPrincipal] = useState("");
  const [transferring, setTransferring] = useState(false);

  const getRowState = (id: string): RowState =>
    rowStates[id] ?? { stock: "", uploadProgress: null, uploading: false };

  const setRowField = (id: string, patch: Partial<RowState>) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...getRowState(id), ...patch },
    }));
  };

  const handleImageUpload = async (productId: bigint, file: File) => {
    const id = productId.toString();
    try {
      setRowField(id, { uploading: true, uploadProgress: 0 });
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setRowField(id, { uploadProgress: pct });
      });
      const url = await storageClient.getDirectURL(hash);

      const product = products?.find((p) => p.id === productId);
      const currentStock = product ? product.inStock : BigInt(0);
      const stockVal = rowStates[id]?.stock;
      const inStock =
        stockVal !== undefined && stockVal !== ""
          ? BigInt(stockVal)
          : currentStock;

      await updateProduct.mutateAsync({ productId, imageUrl: url, inStock });
      toast.success("Image uploaded successfully!");
    } catch (e) {
      toast.error(
        `Upload failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setRowField(id, { uploading: false, uploadProgress: null });
    }
  };

  const handleSaveStock = async (productId: bigint) => {
    const id = productId.toString();
    const product = products?.find((p) => p.id === productId);
    if (!product) return;
    const stockStr = rowStates[id]?.stock;
    if (stockStr === undefined || stockStr === "") {
      toast.error("Enter a stock value first");
      return;
    }
    const inStock = BigInt(Math.max(0, Number.parseInt(stockStr, 10) || 0));
    try {
      await updateProduct.mutateAsync({
        productId,
        imageUrl: product.imageUrl,
        inStock,
      });
      toast.success("Stock updated!");
      setRowField(id, { stock: "" });
    } catch (e) {
      toast.error(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleTransferAdmin = async () => {
    if (!transferPrincipal.trim()) {
      toast.error("Please enter a Principal ID");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure? This will give full admin access to this account.",
    );
    if (!confirmed) return;
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setTransferring(true);
    try {
      const principal = Principal.fromText(transferPrincipal.trim());
      await actor.assignCallerUserRole(principal, UserRole.admin);
      toast.success("Admin access transferred successfully!");
      setTransferPrincipal("");
    } catch (e) {
      toast.error(
        `Transfer failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div
      data-ocid="admin.panel"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-auto py-8 px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-navy">Admin Panel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage product images and stock quantities
            </p>
          </div>
          <button
            type="button"
            data-ocid="admin.close_button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="p-6">
          {isLoading ? (
            <div
              data-ocid="admin.loading_state"
              className="flex items-center justify-center py-20 gap-3 text-muted-foreground"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading products…
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-bold text-navy w-12">
                      Image
                    </TableHead>
                    <TableHead className="font-bold text-navy">
                      Product
                    </TableHead>
                    <TableHead className="font-bold text-navy">
                      Category
                    </TableHead>
                    <TableHead className="font-bold text-navy w-36">
                      Stock
                    </TableHead>
                    <TableHead className="font-bold text-navy">
                      Upload Image
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(products ?? []).map((product, idx) => {
                    const id = product.id.toString();
                    const row = getRowState(id);
                    return (
                      <TableRow
                        key={id}
                        data-ocid={`admin.item.${idx + 1}`}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        {/* Image preview */}
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl">
                                {categoryEmoji[product.category]}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Name */}
                        <TableCell>
                          <p className="font-semibold text-sm text-navy line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ₹{(Number(product.price) / 100).toFixed(0)}
                          </p>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="capitalize text-[10px]"
                          >
                            {product.category}
                          </Badge>
                        </TableCell>

                        {/* Stock */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Input
                              data-ocid={`admin.item.${idx + 1}.input`}
                              type="number"
                              min="0"
                              placeholder={String(Number(product.inStock))}
                              value={row.stock}
                              onChange={(e) =>
                                setRowField(id, { stock: e.target.value })
                              }
                              className="w-20 h-7 text-xs"
                            />
                            <Button
                              data-ocid={`admin.item.${idx + 1}.save_button`}
                              size="sm"
                              className="h-7 px-2 text-xs bg-navy hover:bg-navy-dark text-white"
                              onClick={() => handleSaveStock(product.id)}
                              disabled={
                                updateProduct.isPending || row.stock === ""
                              }
                            >
                              Save
                            </Button>
                          </div>
                        </TableCell>

                        {/* Upload */}
                        <TableCell>
                          <input
                            ref={(el) => {
                              fileInputRefs.current[id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(product.id, file);
                              e.target.value = "";
                            }}
                          />
                          {row.uploading ? (
                            <div className="flex items-center gap-2 min-w-28">
                              <Progress
                                value={row.uploadProgress ?? 0}
                                className="h-1.5 flex-1"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 shrink-0">
                                {row.uploadProgress ?? 0}%
                              </span>
                            </div>
                          ) : (
                            <Button
                              data-ocid={`admin.item.${idx + 1}.upload_button`}
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => fileInputRefs.current[id]?.click()}
                            >
                              <Upload className="w-3 h-3" />
                              Upload
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Transfer Admin Section */}
        <div className="px-6 pb-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900 text-base">
                Transfer Admin Access
              </h3>
            </div>
            <p className="text-sm text-amber-700 mb-4">
              Enter the new owner's Principal ID to grant them admin access.
              They can find their ID by logging in and viewing their profile.
            </p>
            <div className="flex gap-2">
              <Input
                data-ocid="admin.transfer.input"
                placeholder="e.g. aaaaa-aa or xyz3r-..."
                value={transferPrincipal}
                onChange={(e) => setTransferPrincipal(e.target.value)}
                className="flex-1 bg-white border-amber-300 focus-visible:ring-amber-400 text-sm"
              />
              <Button
                data-ocid="admin.transfer.submit_button"
                onClick={handleTransferAdmin}
                disabled={transferring || !transferPrincipal.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                {transferring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {transferring ? "Transferring…" : "Transfer Admin"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
