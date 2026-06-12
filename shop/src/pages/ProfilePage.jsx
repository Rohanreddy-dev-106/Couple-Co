import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { User, Phone, MapPin, Building, Flag, CheckCircle } from "lucide-react";

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
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xs">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b pb-6 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-bold">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-950 mb-1.5 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-700" />
          Delivery Address
        </h2>
        <p className="text-xs text-gray-500 mb-6">Manage your primary shipping details for fast checkout placement.</p>

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
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs focus:border-black outline-none transition"
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
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs focus:border-black outline-none transition"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs focus:border-black outline-none transition"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs focus:border-black outline-none transition"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs focus:border-black outline-none transition"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs focus:border-black outline-none transition"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs focus:border-black outline-none transition"
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
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs focus:border-black outline-none transition"
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
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs focus:border-black outline-none transition"
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
            className="w-full h-12 mt-4 rounded-xl bg-black text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 transition cursor-pointer flex items-center justify-center shadow-sm">
            {submitting ? "Saving details..." : "Save Delivery Profile"}
          </button>
        </form>

      </div>

      {/* ── Saved Address Preview ── */}
      {savedProfile && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-800 text-sm">Active Shipping Address</h3>
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full capitalize">{savedProfile.addressType}</span>
          </div>
          <div className="text-sm text-gray-700 space-y-0.5 leading-relaxed">
            <p className="font-bold text-gray-900">{savedProfile.fullName}</p>
            <p>{savedProfile.addressLine1}</p>
            {savedProfile.addressLine2 && <p>{savedProfile.addressLine2}</p>}
            {savedProfile.landmark && <p className="text-gray-500">Near: {savedProfile.landmark}</p>}
            <p>{savedProfile.city}, {savedProfile.state} — {savedProfile.postalCode}</p>
            <p>{savedProfile.country}</p>
            <p className="font-semibold mt-1">📞 {savedProfile.phone}</p>
          </div>
          <p className="mt-4 text-xs text-emerald-700 font-medium">
            ✅ This address will appear on your orders and in the admin panel.
          </p>
        </div>
      )}

    </div>
  );
}
