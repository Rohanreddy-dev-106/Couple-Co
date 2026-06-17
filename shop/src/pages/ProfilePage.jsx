import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import SEO from "../components/SEO.jsx";
import { User, Phone, MapPin, Building, Flag, CheckCircle, Package, Truck } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    landmark: "",
    addressType: "home",
  });

  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [savedProfile, setSavedProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const getStatusStyles = (status) => {
    const styles = {
      Pending: "bg-gray-100 text-gray-700",
      "Payment Done": "bg-blue-100 text-blue-700",
      "Sent to Fulfillment": "bg-purple-100 text-purple-700",
      Processing: "bg-amber-100 text-amber-700",
      Shipped: "bg-sky-100 text-sky-700",
      Delivered: "bg-emerald-100 text-emerald-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-amber-100 text-amber-700";
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get("/order/my-orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/get-profile");
      if (res.data && res.data.message && res.data.message.profile) {
        const prof = res.data.message.profile;
        setSavedProfile(prof);
        setFormData({
          fullName: prof.fullName || "",
          phone: prof.phone || "",
          addressLine1: prof.addressLine1 || "",
          addressLine2: prof.addressLine2 || "",
          city: prof.city || "",
          state: prof.state || "",
          postalCode: prof.postalCode || "",
          country: prof.country || "India",
          landmark: prof.landmark || "",
          addressType: prof.addressType || "home",
        });
        setHasProfile(true);
      } else {
        setHasProfile(false);
        setSavedProfile(null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Always upsert via profile-update — backend handles create-or-update
      const res = await api.put("/user/profile-update", formData);
      const updatedProfile = res.data?.data || null;

      // Update AuthContext so the saved profile is immediately visible everywhere
      if (updatedProfile) {
        setSavedProfile(updatedProfile);
        setUser((prev) => ({ ...prev, profile: updatedProfile }));
        setHasProfile(true);
      }

      setMessage({ type: "success", text: "Delivery profile saved! Your address will be used for future orders." });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to save profile. Please check all required fields.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg text-gray-600 font-medium">Please login to manage your profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse font-medium">Loading details...</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="My Profile" 
        description="Manage your account, view your profile details, and track your orders at Couple Chaos."
      />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 bg-[#fbfbf6] min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <div className="w-full rounded-3xl border-2 border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up">
          
          {/* Header */}
          <div className="flex items-center gap-4 border-b-2 border-gray-100 pb-6 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-black">
          </div>
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">{user.name}</h1>
            <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">{user.email}</p>
          </div>
        </div>

        <h2 className="text-lg font-black text-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-black" strokeWidth={2.5} />
          Delivery Address
        </h2>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Manage your primary shipping details for fast checkout placement.</p>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
            {message.type === "success" && <CheckCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-bold text-gray-700">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Receiver's name"
                  className="w-full rounded-xl border-2 border-gray-100 pl-10 pr-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-bold text-gray-700">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border-2 border-gray-100 pl-10 pr-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
                />
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Address Line 1 */}
          <div className="space-y-1.5">
            <label htmlFor="addressLine1" className="text-xs font-bold text-gray-700">Flat, House no., Building, Apartment</label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              required
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="Address Line 1"
              className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
            />
          </div>

          {/* Address Line 2 */}
          <div className="space-y-1.5">
            <label htmlFor="addressLine2" className="text-xs font-bold text-gray-700">Area, Street, Sector, Village</label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Address Line 2 (Optional)"
              className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
            />
          </div>

          {/* City & State & Postal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-bold text-gray-700">City / Town</label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="state" className="text-xs font-bold text-gray-700">State</label>
              <input
                type="text"
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="postalCode" className="text-xs font-bold text-gray-700">Pincode</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                required
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
              />
            </div>
          </div>

          {/* Country & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="landmark" className="text-xs font-bold text-gray-700">Landmark</label>
              <div className="relative">
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Near Apollo Hospital"
                  className="w-full rounded-xl border-2 border-gray-100 pl-10 pr-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
                />
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="country" className="text-xs font-bold text-gray-700">Country</label>
              <div className="relative">
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-gray-100 pl-10 pr-4 py-2.5 text-xs font-bold text-black focus:border-black outline-none transition bg-[#fbfbf6] focus:bg-white"
                />
                <Flag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Address Type Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-700 block">Address Type</label>
            <div className="flex gap-4">
              {["home", "work", "other"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-semibold capitalize text-gray-700">
                  <input
                    type="radio"
                    name="addressType"
                    value={type}
                    checked={formData.addressType === type}
                    onChange={handleInputChange}
                    className="accent-black h-4 w-4"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 mt-8 rounded-xl bg-black text-sm font-black tracking-widest uppercase text-white hover:bg-gray-800 hover:-translate-y-1 active:translate-y-0 active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] disabled:opacity-50 transition-all duration-200 cursor-pointer flex items-center justify-center">
            {submitting ? "Saving details..." : "Save Delivery Profile"}
          </button>
        </form>

      </div>

      {/* ── Saved Address Preview ── */}
      {savedProfile && (
        <div className="mt-8 w-full rounded-3xl border-2 border-[#b5e000] bg-[#cfff04]/10 p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-[#8eb000]" strokeWidth={2.5} />
            <h3 className="font-black text-black uppercase tracking-widest text-sm">Active Shipping Address</h3>
            <span className="ml-auto text-[10px] bg-black text-[#cfff04] font-black px-3 py-1 rounded-md uppercase tracking-widest">{savedProfile.addressType}</span>
          </div>
          <div className="text-sm font-bold text-gray-800 space-y-1 leading-relaxed">
            <p className="font-black text-black text-base">{savedProfile.fullName}</p>
            <p>{savedProfile.addressLine1}</p>
            {savedProfile.addressLine2 && <p>{savedProfile.addressLine2}</p>}
            {savedProfile.landmark && <p className="text-gray-500 uppercase tracking-widest text-[10px]">Near: {savedProfile.landmark}</p>}
            <p>{savedProfile.city}, {savedProfile.state} — {savedProfile.postalCode}</p>
            <p>{savedProfile.country}</p>
            <p className="font-black mt-2 bg-white inline-block px-3 py-1 rounded-lg border-2 border-gray-100">📞 {savedProfile.phone}</p>
          </div>
        </div>
      )}

      {/* ── Order History ── */}
      <div className="mt-8 w-full max-w-2xl rounded-3xl border-2 border-gray-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-5 w-5 text-black" strokeWidth={2.5} />
          <h3 className="font-black text-black uppercase tracking-widest text-sm">Your Orders</h3>
        </div>

        {ordersLoading ? (
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No orders yet. Your purchases will appear here.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const product = order.productId || {};
              const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div key={order._id} className="rounded-2xl border-2 border-gray-100 p-4 sm:p-5 bg-[#fbfbf6]">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <img
                        src={product.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                        alt={product.name || "Product"}
                        className="h-16 w-16 rounded-xl object-cover border-2 border-gray-100 bg-white shrink-0"
                      />
                      <div>
                        <p className="font-black text-black text-sm uppercase">{product.name || "Product"}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {orderDate} · Qty {order.quantity}
                          {order.size ? ` · Size ${order.size}` : ""}
                        </p>
                        <p className="text-sm font-black text-black mt-2">₹{order.totalAmount}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${getStatusStyles(order.status)}`}>
                        {order.status || "Pending"}
                      </span>
                      {(order.trackingNumber || order.trackingUrl) && (
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5" />
                          {order.trackingUrl ? (
                            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-black underline">
                              {order.trackingNumber || "Track shipment"}
                            </a>
                          ) : (
                            <span>{order.trackingNumber}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      </div>
    </>
  );
}
