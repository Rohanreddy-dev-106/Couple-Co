import { useEffect, useState, useRef } from "react";
import TshirtCard from "../components/TshirtCard.jsx";
import api from "../lib/api";
import { Search, SlidersHorizontal, RotateCcw, Tag, IndianRupee, X } from "lucide-react";

export default function AllTshirts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const priceDebounceRef = useRef(null);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/products/get-all");
      setProducts(res.data?.data || res.data || []);
      setActiveFilter("all");
    } catch (err) {
      setError("Failed to fetch products. Make sure the backend server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Handle Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) { fetchAllProducts(); return; }
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/management/products/search?name=${encodeURIComponent(searchTerm)}`);
      setProducts(res.data?.data || res.data || []);
      setActiveFilter("search");
    } catch (err) {
      console.error(err);
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Category Filter
  const handleCategoryFilter = async (category) => {
    if (selectedCategory === category) {
      setSelectedCategory("");
      fetchAllProducts();
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSelectedCategory(category);
      const res = await api.get(`/management/products/category/${encodeURIComponent(category)}`);
      setProducts(res.data?.data || res.data || []);
      setActiveFilter("category");
    } catch (err) {
      console.error(err);
      setError(`Failed to filter by category: ${category}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Price Filter — auto-applies with debounce
  const handlePriceChange = (field, value) => {
    const updated = { ...priceRange, [field]: value };
    setPriceRange(updated);

    // Clear previous timer
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);

    // If both cleared, reset to all products
    if (!updated.min && !updated.max) {
      fetchAllProducts();
      return;
    }

    // Auto-apply after 600ms of no typing
    priceDebounceRef.current = setTimeout(async () => {
      const min = updated.min || 0;
      const max = updated.max || 99999;
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/management/products/filter/price?minprice=${min}&maxprice=${max}`);
        setProducts(res.data?.data || res.data || []);
        setActiveFilter("price");
      } catch (err) {
        console.error(err);
        setError("Failed to filter products by price.");
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  // Quick price presets
  const pricePresets = [
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500–₹800", min: 500, max: 800 },
    { label: "₹800–₹1200", min: 800, max: 1200 },
    { label: "Above ₹1200", min: 1200, max: 99999 },
  ];

  const applyPricePreset = async (preset) => {
    setPriceRange({ min: preset.min, max: preset.max });
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/management/products/filter/price?minprice=${preset.min}&maxprice=${preset.max}`);
      setProducts(res.data?.data || res.data || []);
      setActiveFilter("price");
    } catch (err) {
      console.error(err);
      setError("Failed to filter products by price.");
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    fetchAllProducts();
  };

  const categories = ["Casual", "Premium", "Sports", "Cotton"];

  const activeFilterLabel = {
    search: `"${searchTerm}"`,
    category: selectedCategory,
    price: priceRange.min || priceRange.max
      ? `₹${priceRange.min || 0} – ₹${priceRange.max || "∞"}`
      : "Custom range",
  }[activeFilter];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── SIDEBAR ── */}
        <aside className="w-full lg:w-64 shrink-0 h-fit sticky top-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                <span className="font-bold text-gray-900 text-sm">Filters</span>
                {activeFilter !== "all" && (
                  <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">1 ON</span>
                )}
              </div>
              {activeFilter !== "all" && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="p-5 space-y-6">

              {/* ── SEARCH ── */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Search</p>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g. black tee, cotton..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-9 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:bg-white outline-none transition"
                  />
                  {searchTerm ? (
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(""); fetchAllProducts(); }}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600 transition cursor-pointer">
                      <Search className="h-3.5 w-3.5" />
                    </button>
                  )}
                </form>
                <p className="text-[10px] text-gray-400 mt-1">Press Enter or click 🔍 to search</p>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200" />

              {/* ── CATEGORIES ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Tag className="h-3.5 w-3.5 text-indigo-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Category</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryFilter(cat)}
                        className={`flex items-center justify-between text-left text-xs font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-200"
                        }`}
                      >
                        <span>{cat}</span>
                        {isActive && <X className="h-3 w-3 opacity-80" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Click again to deselect</p>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200" />

              {/* ── PRICE ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <IndianRupee className="h-3.5 w-3.5 text-indigo-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Price Range</p>
                </div>

                {/* Quick presets */}
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {pricePresets.map((preset) => {
                    const isPresetActive =
                      activeFilter === "price" &&
                      String(priceRange.min) === String(preset.min) &&
                      String(priceRange.max) === String(preset.max);
                    return (
                      <button
                        key={preset.label}
                        onClick={() => applyPricePreset(preset)}
                        className={`text-[10px] font-semibold py-1.5 px-2 rounded-lg transition-all duration-200 cursor-pointer text-center ${
                          isPresetActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom range */}
                <p className="text-[10px] text-gray-400 mb-2">Or type a custom range — auto applies:</p>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1.5 text-gray-400 text-xs">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 pl-6 pr-2 py-1.5 text-xs outline-none focus:border-indigo-400 bg-gray-50 focus:bg-white transition"
                    />
                  </div>
                  <span className="text-gray-300 text-sm font-light">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1.5 text-gray-400 text-xs">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 pl-6 pr-2 py-1.5 text-xs outline-none focus:border-indigo-400 bg-gray-50 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* ── PRODUCTS SECTION ── */}
        <div className="flex-1 min-w-0">

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight premium-text-gradient">
                {activeFilter === "all" ? "Our Collection" : "Filtered Results"}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {activeFilter === "all"
                  ? `Showing all ${products.length} products`
                  : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {/* Active filter chip */}
            {activeFilter !== "all" && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span>
                  {activeFilter === "search" && "🔍 "}
                  {activeFilter === "category" && "🏷️ "}
                  {activeFilter === "price" && "💰 "}
                  {activeFilterLabel}
                </span>
                <button
                  onClick={handleResetFilters}
                  className="hover:text-red-600 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Grid / States */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 text-center font-medium">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-700 font-bold text-lg mb-1">No products found</p>
              <p className="text-gray-400 text-sm mb-5">Try adjusting your filters or search term</p>
              <button
                onClick={handleResetFilters}
                className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <TshirtCard
                  key={p._id}
                  id={p._id}
                  name={p.name}
                  price={p.price}
                  image={p.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                  size={p.sizes ? p.sizes.join(", ") : "S, M, L, XL"}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}