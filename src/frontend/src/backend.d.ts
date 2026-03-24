import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderSummary {
    totalOrders: bigint;
    totalRevenue: bigint;
}
export interface Wishlist {
    items: Array<WishlistItem>;
}
export interface OrderItem {
    quantity: bigint;
    price: bigint;
    product: Product;
}
export interface WishlistItem {
    addedAt: bigint;
    product: Product;
}
export interface CartItem {
    quantity: bigint;
    product: Product;
}
export interface Cart {
    items: Array<CartItem>;
    totalPrice: bigint;
}
export interface Order {
    id: bigint;
    timestamp: bigint;
    items: Array<OrderItem>;
    totalPrice: bigint;
}
export interface Product {
    id: bigint;
    inStock: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: Category;
    rating: number;
    price: bigint;
    reviewCount: bigint;
    isBestSeller: boolean;
    isTrending: boolean;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    watches = "watches",
    accessories = "accessories",
    sunglasses = "sunglasses",
    purses = "purses",
    shoes = "shoes"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    addToWishlist(productId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getBestSellers(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getOrderHistory(): Promise<Array<Order>>;
    getOrderSummary(): Promise<OrderSummary>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getTrendingProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWishlist(): Promise<Wishlist>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(): Promise<Order>;
    removeFromCart(productId: bigint): Promise<void>;
    removeFromWishlist(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedProducts(): Promise<void>;
    updateCartQuantity(productId: bigint, quantity: bigint): Promise<void>;
    updateProduct(productId: bigint, imageUrl: string, inStock: bigint): Promise<void>;
}
