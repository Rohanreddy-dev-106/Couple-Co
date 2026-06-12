import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user, refreshCartCount } = useAuth();
  const navigate = useNavigate();
  const [hasAddress, setHasAddress] = useState(false);

  const checkAddressStatus = async () => {
    try {
      const res = await api.get("/user/get-profile");
      if (res.data && res.data.message && res.data.message.profile) {
        setHasAddress(true);
      } else {
        setHasAddress(false);
      }
    } catch (err) {
      console.error(err);
      setHasAddress(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/order/getall");
      // The APIResponse structure is { data: [...] }
      if (res.data && res.data.data) {
        setCartItems(res.data.data);
      } else {
        setCartItems(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch cart. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
      checkAddressStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdateQuantity = async (id, currentQty, inc) => {
    const newQty = currentQty + inc;
    if (newQty < 1 || newQty > 3) return;

    try {
      // Backend expects: PUT /order/update?id=XYZ&quantity=inc
      await api.put(`/order/update?id=${id}&quantity=${inc}`);
      // Refresh cart state
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, quantity: newQty, total: newQty * item.price }
            : item
        )
      );
      refreshCartCount();
    } catch (err) {
      console.error(err);
      alert("Failed to update item quantity");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      await api.delete(`/order/delete/${id}`);
      setCartItems((prev) => prev.filter((item) => item._id !== id));
      refreshCartCount();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item from cart");
    }
  };

  const handleCheckout = async () => {
    if (!hasAddress) {
      alert("Please add your delivery address in your Profile before placing an order.");
      navigate("/profile");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/order/createorder", {});
      alert("Order placed successfully!");
      setCartItems([]);
      refreshCartCount();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.errors || err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className='flex h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center'>
        <p className='text-lg text-gray-600 font-medium'>Please login to view your cart</p>
        <button
          onClick={() => navigate("/login")}
          className='rounded-xl bg-black px-6 py-3 text-white hover:bg-gray-800 transition cursor-pointer font-semibold'>
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse">Loading your cart...</p>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.product?.price || item.price) * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className='flex h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center'>
        <p className='text-lg text-gray-600 font-medium'>Your cart is empty</p>
        <button
          onClick={() => navigate("/")}
          className='rounded-xl bg-black px-6 py-3 text-white hover:bg-gray-800 transition cursor-pointer font-semibold'>
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl px-6 py-12'>
      <h1 className='mb-8 text-4xl font-black tracking-tight premium-text-gradient'>Your Cart</h1>

      <div className="space-y-6">
        {cartItems.filter(item => item.product).map((item) => {
          const prod = item.product || {};
          return (
            <div key={item._id} className='flex flex-col sm:flex-row gap-6 premium-card p-6 relative'>
              {/* Image */}
              <img
                src={prod.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                alt={prod.name || "Product"}
                className='h-28 w-28 rounded-xl object-cover bg-gray-50 border border-gray-100 self-center sm:self-start'
              />

              {/* Info */}
              <div className='flex flex-1 flex-col gap-1.5 justify-center'>
                <h2 className='text-lg font-semibold text-gray-900'>{prod.name || "T-Shirt"}</h2>
                <p className='text-sm text-gray-500 font-medium'>Size: {item.size}</p>
                <div className='flex items-center gap-3 mt-1.5'>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                    disabled={item.quantity <= 1}
                    className='h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold flex items-center justify-center cursor-pointer hover:border-black disabled:opacity-50'>
                    −
                  </button>
                  <span className='w-6 text-center text-sm font-semibold text-gray-800'>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                    disabled={item.quantity >= 3}
                    className='h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold flex items-center justify-center cursor-pointer hover:border-black disabled:opacity-50'>
                    +
                  </button>
                </div>
              </div>

              {/* Price & Delete */}
              <div className='flex sm:flex-col justify-between items-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0'>
                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition cursor-pointer self-start sm:self-end">
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className='text-right'>
                  <p className='text-lg font-bold text-gray-900'>₹{(prod.price || item.price) * item.quantity}</p>
                  <p className='text-xs text-gray-400 font-medium'>₹{prod.price || item.price} each</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      <div className='mt-10 premium-card p-8'>
        <div className='flex justify-between text-xl font-bold text-gray-900'>
          <span>Subtotal</span>
          <span className="premium-text-gradient">₹{totalPrice}</span>
        </div>

        {/* Address hint */}
        {hasAddress ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <span className="text-emerald-600 text-sm">✅</span>
            <p className="text-xs text-emerald-700 font-medium">
              Delivery address is saved. Your order will be shipped to your registered address.{" "}
              <button onClick={() => navigate("/profile")} className="underline font-bold cursor-pointer">Update address</button>
            </p>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3">
            <span className="text-amber-500 text-sm">⚠️</span>
            <p className="text-xs text-amber-700 font-medium">
              No delivery address found.{" "}
              <button onClick={() => navigate("/profile")} className="underline font-bold cursor-pointer">Add your address</button>{" "}
              before placing an order.
            </p>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={submitting}
          className='mt-6 h-14 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-lg font-bold text-white hover:from-indigo-700 hover:to-blue-700 transition-all cursor-pointer disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center'>
          {submitting ? "Placing Order..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
}
