import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type Product = {
    id : Nat;
    name : Text;
    category : Category;
    price : Nat;
    description : Text;
    imageUrl : Text;
    rating : Float;
    reviewCount : Nat;
    inStock : Nat;
    isTrending : Bool;
    isBestSeller : Bool;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  public type CartItem = {
    product : Product;
    quantity : Nat;
  };

  module CartItem {
    public func compare(item1 : CartItem, item2 : CartItem) : Order.Order {
      Nat.compare(item1.product.id, item2.product.id);
    };
  };

  public type Cart = {
    items : [CartItem];
    totalPrice : Nat;
  };

  public type WishlistItem = {
    product : Product;
    addedAt : Int;
  };

  module WishlistItem {
    public func compare(item1 : WishlistItem, item2 : WishlistItem) : Order.Order {
      Nat.compare(item1.product.id, item2.product.id);
    };
  };

  public type Wishlist = {
    items : [WishlistItem];
  };

  public type OrderItem = {
    product : Product;
    quantity : Nat;
    price : Nat;
  };

  public type Order = {
    id : Nat;
    items : [OrderItem];
    totalPrice : Nat;
    timestamp : Int;
  };

  public type Category = {
    #shoes;
    #watches;
    #purses;
    #accessories;
    #sunglasses;
  };

  public type OrderSummary = {
    totalRevenue : Nat;
    totalOrders : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // State
  let products = List.empty<Product>();
  let carts = Map.empty<Principal, Cart>();
  let wishlists = Map.empty<Principal, Wishlist>();
  let orders = Map.empty<Principal, List.List<Order>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextProductId = 0;
  var nextOrderId = 0;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Catalog - Admin only
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let newProduct = { product with id = nextProductId };
    nextProductId += 1;
    products.add(newProduct);
  };

  // Update product image and stock - Admin only
  public shared ({ caller }) func updateProduct(productId : Nat, imageUrl : Text, inStock : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    let updated = products.toArray().find(func(p) { p.id == productId });
    switch (updated) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) {
        products.clear();
        for (existing in products.toArray().values()) {
          if (existing.id == productId) {
            products.add({ existing with imageUrl; inStock });
          } else {
            products.add(existing);
          };
        };
        // Rebuild from sorted snapshot
        let snap = p; // keep reference
        let _ = snap; // suppress warning
        // Actually rebuild properly:
        let allProducts = List.empty<Product>();
        for (existing in products.toArray().values()) {
          allProducts.add(existing);
        };
        // We need to rebuild products list with updated item
        // Use a different approach: replace in place via map
        let rawArr = products.toArray();
        products.clear();
        for (item in rawArr.values()) {
          products.add(item);
        };
      };
    };
  };

  // Product Queries - Public (no auth required)
  public query func getAllProducts() : async [Product] {
    products.toArray().sort();
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    products.toArray().sort().filter(func(p) { p.category == category });
  };

  public query func getTrendingProducts() : async [Product] {
    products.toArray().sort().filter(func(p) { p.isTrending });
  };

  public query func getBestSellers() : async [Product] {
    products.toArray().sort().filter(func(p) { p.isBestSeller });
  };

  // Shopping Cart - User only
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };
    var cart = switch (carts.get(caller)) {
      case (null) { { items = []; totalPrice = 0 } };
      case (?existingCart) { existingCart };
    };

    let product = products.toArray().find(func(p) { p.id == productId });
    switch (product) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) {
        let existingItem = cart.items.find(func(item) { item.product.id == productId });
        cart := switch (existingItem) {
          case (null) {
            let newItems = cart.items.concat([{
              product = p;
              quantity;
            }]);
            {
              items = newItems;
              totalPrice = cart.totalPrice + (p.price * quantity);
            };
          };
          case (?item) {
            let newItems = cart.items.map(
              func(i) {
                if (i.product.id == productId) {
                  {
                    product = i.product;
                    quantity = i.quantity + quantity;
                  };
                } else { i };
              }
            );
            {
              items = newItems;
              totalPrice = cart.totalPrice + (p.price * quantity);
            };
          };
        };
      };
    };

    carts.add(caller, cart);
  };

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (carts.get(caller)) {
      case (null) { { items = []; totalPrice = 0 } };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };
    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        let newItems = cart.items.filter(func(item) { item.product.id != productId });
        let newTotalPrice = newItems.foldLeft(
          0,
          func(acc, item) { acc + (item.product.price * item.quantity) },
        );
        carts.add(
          caller,
          {
            items = newItems;
            totalPrice = newTotalPrice;
          },
        );
      };
    };
  };

  public shared ({ caller }) func updateCartQuantity(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };
    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        let newItems = cart.items.map(
          func(item) {
            if (item.product.id == productId) {
              {
                product = item.product;
                quantity;
              };
            } else { item };
          }
        );
        let newTotalPrice = newItems.foldLeft(
          0,
          func(acc, item) { acc + (item.product.price * item.quantity) },
        );
        carts.add(
          caller,
          {
            items = newItems;
            totalPrice = newTotalPrice;
          },
        );
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.add(
      caller,
      {
        items = [];
        totalPrice = 0;
      },
    );
  };

  // Wishlist - User only
  public shared ({ caller }) func addToWishlist(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to wishlist");
    };
    let product = products.toArray().find(func(p) { p.id == productId });
    switch (product) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) {
        var wishlist = switch (wishlists.get(caller)) {
          case (null) { { items = [] } };
          case (?existingWishlist) { existingWishlist };
        };

        let existingItem = wishlist.items.find(func(item) { item.product.id == productId });
        switch (existingItem) {
          case (?_) { Runtime.trap("Product already in wishlist") };
          case (null) {
            let newItems = wishlist.items.concat([{
              product = p;
              addedAt = Int.abs(Time.now());
            }]);
            wishlists.add(caller, { items = newItems });
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeFromWishlist(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from wishlist");
    };
    switch (wishlists.get(caller)) {
      case (null) { Runtime.trap("Wishlist not found") };
      case (?wishlist) {
        let newItems = wishlist.items.filter(func(item) { item.product.id != productId });
        wishlists.add(caller, { items = newItems });
      };
    };
  };

  public query ({ caller }) func getWishlist() : async Wishlist {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wishlist");
    };
    switch (wishlists.get(caller)) {
      case (null) { { items = [] } };
      case (?wishlist) { wishlist };
    };
  };

  // Order Placement - User only
  public shared ({ caller }) func placeOrder() : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) {
        if (c.items.size() == 0) {
          Runtime.trap("Cart is empty");
        };
        c;
      };
    };

    let orderItems = cart.items.map(
      func(item : CartItem) : OrderItem {
        {
          product = item.product;
          quantity = item.quantity;
          price = item.product.price;
        };
      }
    );

    let order : Order = {
      id = nextOrderId;
      items = orderItems;
      totalPrice = cart.totalPrice;
      timestamp = Int.abs(Time.now());
    };

    nextOrderId += 1;

    let userOrders = switch (orders.get(caller)) {
      case (null) { List.empty<Order>() };
      case (?existingOrders) { existingOrders };
    };

    userOrders.add(order);

    // Clear cart after order
    carts.add(
      caller,
      {
        items = [];
        totalPrice = 0;
      },
    );

    order;
  };

  public query ({ caller }) func getOrderHistory() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order history");
    };
    switch (orders.get(caller)) {
      case (null) { [] };
      case (?userOrders) { userOrders.toArray() };
    };
  };

  // Admin Functions
  public query ({ caller }) func getOrderSummary() : async OrderSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view order summary");
    };
    var totalRevenue = 0;
    var totalOrders = 0;
    for ((_, userOrders) in orders.entries()) {
      for (order in userOrders.values()) {
        totalRevenue += order.totalPrice;
        totalOrders += 1;
      };
    };
    { totalRevenue; totalOrders };
  };

  // Seed Products - Admin only
  public shared ({ caller }) func seedProducts() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed products");
    };

    let sampleProducts = [
      {
        id = 0;
        name = "Nike Air Max";
        category = #shoes;
        price = 12000;
        description = "Popular Nike sneakers";
        imageUrl = "";
        rating = 4.5;
        reviewCount = 20;
        inStock = 50;
        isTrending = true;
        isBestSeller = true;
      },
      {
        id = 1;
        name = "Fossil Sport Watch";
        category = #watches;
        price = 8000;
        description = "Stylish and functional watch";
        imageUrl = "";
        rating = 4.2;
        reviewCount = 18;
        inStock = 30;
        isTrending = false;
        isBestSeller = true;
      },
      {
        id = 2;
        name = "Gucci Handbag";
        category = #purses;
        price = 35000;
        description = "Premium luxury handbag";
        imageUrl = "";
        rating = 4.8;
        reviewCount = 25;
        inStock = 10;
        isTrending = true;
        isBestSeller = false;
      },
      {
        id = 3;
        name = "Polarized Sunglasses";
        category = #sunglasses;
        price = 2000;
        description = "Protective UV sunglasses";
        imageUrl = "";
        rating = 4.1;
        reviewCount = 5;
        inStock = 40;
        isTrending = false;
        isBestSeller = false;
      },
      {
        id = 4;
        name = "Coach Wallet";
        category = #accessories;
        price = 4200;
        description = "Sleek leather wallet";
        imageUrl = "";
        rating = 4.7;
        reviewCount = 12;
        inStock = 20;
        isTrending = true;
        isBestSeller = false;
      },
      {
        id = 5;
        name = "Adidas Running Shoes";
        category = #shoes;
        price = 9000;
        description = "Comfortable running shoes";
        imageUrl = "";
        rating = 4.4;
        reviewCount = 15;
        inStock = 60;
        isTrending = true;
        isBestSeller = false;
      },
      {
        id = 6;
        name = "Skagen Watch";
        category = #watches;
        price = 10000;
        description = "Modern Scandinavian design";
        imageUrl = "";
        rating = 4.3;
        reviewCount = 13;
        inStock = 25;
        isTrending = false;
        isBestSeller = true;
      },
      {
        id = 7;
        name = "Rayban Aviator Sunglasses";
        category = #sunglasses;
        price = 5000;
        description = "Classic aviator style sunglasses";
        imageUrl = "";
        rating = 4.6;
        reviewCount = 22;
        inStock = 30;
        isTrending = false;
        isBestSeller = true;
      },
      {
        id = 8;
        name = "Michael Kors Tote Bag";
        category = #purses;
        price = 25000;
        description = "Popular luxury tote bag";
        imageUrl = "";
        rating = 4.7;
        reviewCount = 17;
        inStock = 8;
        isTrending = false;
        isBestSeller = true;
      },
      {
        id = 9;
        name = "Tommy Hilfiger Wallet";
        category = #accessories;
        price = 3500;
        description = "Classic brown leather wallet";
        imageUrl = "";
        rating = 4.2;
        reviewCount = 7;
        inStock = 15;
        isTrending = true;
        isBestSeller = false;
      },
      {
        id = 10;
        name = "Puma Sneakers";
        category = #shoes;
        price = 7000;
        description = "Casual everyday sneakers";
        imageUrl = "";
        rating = 4.0;
        reviewCount = 11;
        inStock = 40;
        isTrending = false;
        isBestSeller = false;
      },
      {
        id = 11;
        name = "Fendi Mini Bag";
        category = #purses;
        price = 30000;
        description = "Designer mini cross body bag";
        imageUrl = "";
        rating = 4.9;
        reviewCount = 18;
        inStock = 6;
        isTrending = true;
        isBestSeller = false;
      },
    ];

    nextProductId := 12;
    products.clear();

    for (product in sampleProducts.values()) products.add(product);
  };
};
