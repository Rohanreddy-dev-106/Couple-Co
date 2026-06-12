import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshCartCount = async () => {
    try {
      const res = await api.get("/order/getall");
      if (res.data && res.data.data) {
        const count = res.data.data.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      setCartCount(0);
    }
  };

  const refreshWishlistCount = async () => {
    try {
      const res = await api.get("/wishlist");
      setWishlistCount(res.data?.data?.length || 0);
    } catch (err) {
      setWishlistCount(0);
    }
  };

  // Try to load user profile on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get("/user/get-profile");
        // The API returns message: profileData
        if (res.data && res.data.message) {
          setUser(res.data.message);
        }
      } catch (err) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      refreshCartCount();
      refreshWishlistCount();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user]);

  const login = async (email, password) => {
    // Post to login endpoint
    const res = await api.post("/user/login", { email, password });
    if (res.data && res.data.success) {
      // The login response has user details in data
      const userData = res.data.data;
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || "Login failed");
  };

  const register = async (name, email, password) => {
    // Post to register endpoint
    const res = await api.post("/user/register", { name, email, password });
    if (res.data && res.data.success) {
      return res.data;
    }
    throw new Error(res.data?.message || "Registration failed");
  };

  const logout = async () => {
    try {
      await api.delete("/user/logout");
    } catch (err) {
      console.error("Logout failed on server:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, cartCount, refreshCartCount, wishlistCount, refreshWishlistCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
