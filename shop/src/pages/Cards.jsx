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
      <div className='flex min-h-[80vh] bg-[#fbfbf6] flex-col items-center justify-center gap-6 px-4 text-center'>
        <p className='text-3xl sm:text-4xl font-black text-black uppercase tracking-tight'>Sign in required</p>
        <button
          onClick={() => navigate("/login")}
          className='rounded-xl bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-gray-800 transition-all hover:-translate-y-1 active:translate-y-0 cursor-pointer'>
          Login to continue
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] bg-[#fbfbf6] items-center justify-center">
        <p className="text-xl sm:text-2xl font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading Cart...</p>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.product?.price || item.price) * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className='flex min-h-[80vh] bg-[#fbfbf6] flex-col items-center justify-center gap-6 px-4 text-center'>
        <p className='text-4xl mb-2'>🛒</p>
        <p className='text-3xl sm:text-4xl font-black text-black uppercase tracking-tight'>Your cart is empty</p>
        <button
          onClick={() => navigate("/")}
          className='rounded-xl bg-[#cfff04] border-2 border-black px-8 py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-[#b5e000] transition-all hover:-translate-y-1 active:translate-y-0 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#fbfbf6] pt-24 pb-24 px-6 sm:px-12 font-sans'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-12 text-5xl sm:text-6xl font-black text-black uppercase tracking-tight'>
          Your Cart
        </h1>

        <div className="space-y-6">
          {cartItems.filter(item => item.product).map((item) => {
            const prod = item.product || {};
            return (
              <div key={item._id} className='flex flex-col sm:flex-row gap-6 bg-white border-2 border-gray-100 rounded-3xl p-6 relative hover:-translate-y-1 transition-transform'>
                {/* Image */}
                <div className="bg-[#f3f2eb] rounded-2xl p-2 shrink-0 self-center sm:self-start">
                  <img
                    src={prod.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                    alt={prod.name || "Product"}
                    className='h-24 w-24 sm:h-32 sm:w-32 rounded-xl object-contain bg-white border-2 border-gray-100'
                  />
                </div>

                {/* Info */}
                <div className='flex flex-1 flex-col gap-2 justify-center'>
                  <h2 className='text-xl sm:text-2xl font-black text-black uppercase tracking-tight leading-none'>{prod.name || "T-Shirt"}</h2>
                  <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1'>Size: {item.size}</p>
                  
                  <div className='flex items-center gap-3 mt-4'>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                      disabled={item.quantity <= 1}
                      className='h-10 w-10 rounded-xl border-2 border-gray-200 text-xl font-black flex items-center justify-center cursor-pointer hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black disabled:hover:border-gray-200'>
                      −
                    </button>
                    <span className='w-8 text-center text-xl font-black text-black'>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                      disabled={item.quantity >= 3}
                      className='h-10 w-10 rounded-xl border-2 border-gray-200 text-xl font-black flex items-center justify-center cursor-pointer hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black disabled:hover:border-gray-200'>
                      +
                    </button>
                  </div>
                </div>

                {/* Price & Delete */}
                <div className='flex sm:flex-col justify-between items-end gap-4 sm:pl-6 pt-6 sm:pt-0 border-t-2 sm:border-t-0 sm:border-l-2 border-gray-100'>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer border-2 border-transparent hover:border-red-100 active:scale-95"
                    title="Remove from Cart">
                    <Trash2 className="h-6 w-6" strokeWidth={2.5} />
                  </button>
                  <div className='text-right'>
                    <p className='text-3xl sm:text-4xl font-black text-black leading-none'>₹{(prod.price || item.price) * item.quantity}</p>
                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2'>₹{prod.price || item.price} EACH</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className='mt-12 bg-white border-2 border-black rounded-3xl p-8 sm:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
          <div className='flex flex-col sm:flex-row justify-between sm:items-end mb-8 border-b-2 border-gray-100 pb-8 gap-4'>
            <span className="text-lg font-black uppercase tracking-widest text-gray-400">Subtotal</span>
            <span className="text-5xl sm:text-6xl font-black text-black leading-none">₹{totalPrice}</span>
          </div>

          {/* Address hint */}
          {hasAddress ? (
            <div className="mt-4 flex items-start gap-4 rounded-2xl bg-[#cfff04]/20 border-2 border-[#cfff04] p-4 sm:p-5">
              <span className="text-black text-xl">✅</span>
              <p className="text-[10px] sm:text-xs text-black font-bold uppercase tracking-widest leading-relaxed pt-0.5">
                Delivery address is saved. Your order will be shipped to your registered address.{" "}
                <button onClick={() => navigate("/profile")} className="underline font-black cursor-pointer ml-1 hover:text-gray-600">Update address</button>
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-4 rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 sm:p-5">
              <span className="text-amber-500 text-xl">⚠️</span>
              <p className="text-[10px] sm:text-xs text-amber-700 font-bold uppercase tracking-widest leading-relaxed pt-0.5">
                No delivery address found.{" "}
                <button onClick={() => navigate("/profile")} className="underline font-black cursor-pointer mx-1 hover:text-amber-900">Add your address</button>{" "}
                before placing an order.
              </p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className='mt-10 h-16 sm:h-20 w-full rounded-2xl bg-black text-sm sm:text-base font-black uppercase tracking-widest text-white hover:bg-gray-800 hover:-translate-y-1 transition-all active:translate-y-0 cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl'>
            {submitting ? "Placing Order..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
