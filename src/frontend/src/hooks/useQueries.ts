import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category } from "../backend.d";
import { useActor } from "./useActor";

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrendingProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBestSellers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bestSellers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBestSellers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return { items: [], totalPrice: BigInt(0) };
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWishlist() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!actor) return { items: [] };
      return actor.getWishlist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeFromCart(productId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartQuantity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCartQuantity(productId, quantity);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.placeOrder();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useToggleWishlist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      inWishlist,
    }: { productId: bigint; inWishlist: boolean }) => {
      if (!actor) throw new Error("No actor");
      if (inWishlist) {
        return actor.removeFromWishlist(productId);
      }
      return actor.addToWishlist(productId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useSeedProducts() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedProducts();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["trending"] });
      qc.invalidateQueries({ queryKey: ["bestSellers"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      imageUrl,
      inStock,
    }: { productId: bigint; imageUrl: string; inStock: bigint }) => {
      if (!actor) throw new Error("No actor");
      // Cast to any to access updateProduct which is declared in backend.d.ts
      // but not yet reflected in the generated backend.ts interface
      return (actor as any).updateProduct(productId, imageUrl, inStock);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["trending"] });
      qc.invalidateQueries({ queryKey: ["bestSellers"] });
    },
  });
}
