import { useState, useEffect } from "react";

// LocalStorage helper
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, value]);

  return [value, setValue];
}

// Cart Store
export function useCart() {
  const [cart, setCart] = useLocalStorage("vigyaan-cart", []);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };
}

// Wishlist Store
export function useWishlist() {
  const [wishlist, setWishlist] = useLocalStorage("vigyaan-wishlist", []);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  return { wishlist, toggleWishlist, isInWishlist, removeFromWishlist };
}

// User Store
export function useUser() {
  const [user, setUser] = useLocalStorage("vigyaan-user", null);

  const login = (userData) => {
    setUser({
      ...userData,
      loginTime: new Date().toISOString(),
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vigyaan-user");
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const isLoggedIn = !!user;

  return { user, login, logout, updateUser, isLoggedIn };
}

// Orders Store
export function useOrders() {
  const [orders, setOrders] = useLocalStorage("vigyaan-orders", []);

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      status: "Confirmed",
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId) || null;
  };

  return { orders, addOrder, getOrderById };
}
