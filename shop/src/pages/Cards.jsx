import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO.jsx";

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
      const res = await api.post("/order/createorder", {});
      const { razorpayOrder, orderIds, keyId } = res.data.data;

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Couple Chaos",
        description: "Test Transaction",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post("/order/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderIds: orderIds
            });
            alert("Order placed and payment successful!");
            setCartItems([]);
            refreshCartCount();
          } catch (err) {
            alert("Payment verification failed.");
          }
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert("Payment failed: " + response.error.description);
      });
      rzp1.open();

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
    <>
      <SEO 
        title="Your Cart" 
        description="Review your selected items and checkout securely at Couple Chaos."
      />
      <div className='min-h-[calc(100vh-80px)] bg-[#fbfbf6] px-4 py-8'>
        <div className='mx-auto max-w-4xl'>
          <h1 className='mb-12 text-5xl sm:text-6xl font-black text-black uppercase tracking-tight'>
            Your Cart
          </h1>
          <div className="space-y-4">
            {cartItems.filter(item => item.product).map((item) => {
              const prod = item.product || {};
              return (
              <div key={item._id} className='flex items-center gap-4 sm:gap-6 bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-5 relative hover:-translate-y-0.5 transition-transform group'>
                {/* Image */}
                <img
                  src={prod.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                  alt={prod.name || "Product"}
                  className='h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover bg-[#f3f2eb] border-2 border-gray-100 shrink-0'
                />

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <h2 className='text-base sm:text-lg font-black text-black uppercase tracking-tight leading-tight truncate'>{prod.name || "T-Shirt"}</h2>
                  <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5'>Size: {item.size} · ₹{prod.price || item.price} each</p>
                  
                  <div className='flex items-center gap-2 mt-3'>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                      disabled={item.quantity <= 1}
                      className='h-8 w-8 rounded-lg border-2 border-gray-200 text-sm font-black flex items-center justify-center cursor-pointer hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black disabled:hover:border-gray-200'>
                      −
                    </button>
                    <span className='w-6 text-center text-base font-black text-black'>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                      disabled={item.quantity >= 3}
                      className='h-8 w-8 rounded-lg border-2 border-gray-200 text-sm font-black flex items-center justify-center cursor-pointer hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black disabled:hover:border-gray-200'>
                      +
                    </button>
                  </div>
                </div>

                {/* Price & Delete */}
                <div className='flex flex-col items-end gap-2 shrink-0'>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100 active:scale-95"
                    title="Remove from Cart">
                    <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  <p className='text-2xl sm:text-3xl font-black text-black leading-none'>₹{(prod.price || item.price) * item.quantity}</p>
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
    </>
  );
}
