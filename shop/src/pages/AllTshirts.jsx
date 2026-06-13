import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import TshirtCard from "../components/TshirtCard.jsx";
import SEO from "../components/SEO.jsx";
import api from "../lib/api";
import { Search, SlidersHorizontal, RotateCcw, Tag, IndianRupee, X } from "lucide-react";

export default function AllTshirts() {
  const location = useLocation();
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
    <>
      <SEO 
        title="Shop All Collections" 
        description="Browse our complete collection of premium graphic t-shirts. Sort by categories, price, and discover your new favorite oversized tee."
        keywords="graphic tees, shop t-shirts, couple chaos collections, oversized t-shirts" 
      />
      <div className="min-h-[calc(100vh-80px)] bg-[#fbfbf6] px-4 sm:px-6 py-10">
      
      {/* ── HERO SECTION (Only show on default view) ── */}
      {(activeFilter === "all" && location.pathname === "/") && (
        <div className="mx-auto max-w-7xl mb-16 mt-4 relative">
          
          {/* Grid pattern background container */}
          <div className="absolute inset-0 -mx-4 sm:-mx-6 -mt-10 rounded-3xl overflow-hidden" style={{ top: '-2rem', bottom: '-2rem', left: '-2rem', right: '-2rem' }}>
            <div className="absolute inset-0 hero-gradient-shimmer"></div>
            <div className="absolute inset-0 hero-grid-bg"></div>
            <div className="absolute inset-0 hero-dots-bg opacity-40"></div>
            {/* Fade edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbf6] via-transparent to-[#fbfbf6] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#fbfbf6] via-transparent to-[#fbfbf6] opacity-30"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Left side: Text */}
            <div className="flex-1 max-w-2xl" style={{ perspective: '800px' }}>
              <h1 className="text-6xl md:text-8xl font-black text-black leading-[0.9] tracking-tighter mb-6">
                {["Wear", "the", "joke"].map((word, i) => (
                  <span key={word} className="animate-hero-word inline-block mr-[0.25em]" style={{ animationDelay: `${i * 150}ms` }}>
                    {word}
                  </span>
                ))}
                <br />
                {["first."].map((word, i) => (
                  <span key={word} className="animate-hero-word inline-block" style={{ animationDelay: `${450 + i * 150}ms` }}>
                    {word}
                  </span>
                ))}
              </h1>
              <p className="text-lg md:text-xl text-black font-medium mb-8 max-w-md animate-hero-subtitle" style={{ animationDelay: '700ms' }}>
                Oversized tees for campus chaos, office survival, gym excuses, and software bugs.
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                className="bg-black text-white px-8 py-4 rounded-full font-black text-sm tracking-widest hover:bg-gray-900 transition-colors cursor-pointer inline-flex items-center hover:scale-105 active:scale-95 duration-200 animate-hero-cta"
                style={{ animationDelay: '900ms' }}
              >
                SHOP ₹599 TEES
              </button>
            </div>

            {/* Right side: Floating Cards Image */}
            <div className="flex-1 relative h-[300px] md:h-[400px] w-full flex items-center justify-center animate-slide-in-right opacity-0" style={{ animationDelay: '200ms' }}>
              <div className="relative w-[280px] h-[340px] animate-float">
                {/* Back Card */}
                <div className="absolute top-0 right-10 w-[200px] h-[260px] bg-white rounded-3xl shadow-sm rotate-[-10deg] flex items-center justify-center p-6 border border-gray-100 hover:rotate-[-15deg] transition-transform duration-500">
                  <span className="font-black text-2xl text-gray-300 opacity-50">404</span>
                </div>
                {/* Front Card */}
                <div className="absolute top-10 right-0 w-[200px] h-[260px] bg-white rounded-3xl shadow-xl rotate-[5deg] flex items-center justify-center p-6 z-10 border border-gray-100 hover:rotate-[10deg] hover:scale-105 transition-transform duration-500">
                  <span className="font-black text-3xl text-black text-center leading-none">NOT<br/>LAZY</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Categories / Tags below Hero */}
          <div className="relative z-10 flex flex-wrap gap-3 mt-12 animate-fade-in opacity-0" style={{ animationDelay: '400ms' }}>
            {["Funny", "Relatable", "College", "Office", "Software", "Gym"].map((tag, i) => (
              <span key={tag} className="bg-white px-5 py-2.5 rounded-full text-sm font-bold border border-gray-200 text-black hover:bg-black hover:text-white transition-colors cursor-pointer animate-pop-in opacity-0" style={{ animationDelay: `${500 + i * 100}ms` }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-8">
        
        {/* ── SIDEBAR ── */}
        <aside className="w-full lg:w-64 shrink-0 h-fit sticky top-24">
          <div className="rounded-3xl border-2 border-gray-100 bg-white shadow-sm overflow-hidden p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-black" strokeWidth={2.5} />
                <span className="font-black text-black text-lg">Filters</span>
                {activeFilter !== "all" && (
                  <span className="ml-2 bg-black text-[#cfff04] text-[10px] font-black px-2 py-0.5 rounded-sm">1 ON</span>
                )}
              </div>
              {activeFilter !== "all" && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer uppercase tracking-wider"
                >
                  <RotateCcw className="h-3 w-3" strokeWidth={3} />
                  Clear
                </button>
              )}
            </div>

            {/* ── SEARCH ── */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">Search</p>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. funny, gym..."
                  className="w-full rounded-xl border-2 border-gray-100 bg-[#fbfbf6] pl-4 pr-10 py-3 text-sm text-black placeholder-gray-400 focus:border-black focus:bg-white outline-none transition-colors font-medium"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(""); fetchAllProducts(); }}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-black transition cursor-pointer"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                ) : (
                  <button type="submit" className="absolute right-3 top-3.5 text-gray-400 hover:text-black transition cursor-pointer">
                    <Search className="h-4 w-4" strokeWidth={3} />
                  </button>
                )}
              </form>
              <p className="text-[10px] font-bold text-gray-400 mt-2 text-center uppercase tracking-widest">
                Press <span className="text-black bg-gray-100 px-1 rounded-sm">Enter</span> to search
              </p>
            </div>

            {/* ── CATEGORIES ── */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" strokeWidth={3} /> Category
              </p>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryFilter(cat)}
                      className={`flex items-center justify-between text-left text-sm font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer border-2 ${
                        isActive
                          ? "bg-black text-white border-black"
                          : "bg-[#fbfbf6] text-black hover:bg-gray-100 border-gray-100"
                      }`}
                    >
                      <span>{cat}</span>
                      {isActive && <X className="h-3 w-3" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── PRICE ── */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <IndianRupee className="h-3.5 w-3.5" strokeWidth={3} /> Price
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {pricePresets.map((preset) => {
                  const isPresetActive =
                    activeFilter === "price" &&
                    String(priceRange.min) === String(preset.min) &&
                    String(priceRange.max) === String(preset.max);
                  return (
                    <button
                      key={preset.label}
                      onClick={() => applyPricePreset(preset)}
                      className={`text-xs font-bold py-2 px-2 rounded-xl transition-colors cursor-pointer border-2 text-center ${
                        isPresetActive
                          ? "bg-black text-white border-black"
                          : "bg-[#fbfbf6] text-black hover:bg-gray-100 border-gray-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-100 pl-7 pr-2 py-2.5 text-sm font-bold outline-none focus:border-black bg-[#fbfbf6] focus:bg-white transition-colors"
                  />
                </div>
                <span className="text-gray-400 font-black">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-100 pl-7 pr-2 py-2.5 text-sm font-bold outline-none focus:border-black bg-[#fbfbf6] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* ── PRODUCTS SECTION ── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-black">
                {activeFilter === "all" ? "Trending Drops" : "Results"}
              </h2>
            </div>
            
            {activeFilter !== "all" && (
              <div className="flex items-center gap-2 bg-black text-[#cfff04] text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-wide">
                <span>
                  {activeFilter === "search" && "Search: "}
                  {activeFilter === "category" && "Category: "}
                  {activeFilter === "price" && "Price: "}
                  {activeFilterLabel}
                </span>
                <button onClick={handleResetFilters} className="hover:text-white transition cursor-pointer ml-1">
                  <X className="h-3 w-3" strokeWidth={4} />
                </button>
              </div>
            )}
          </div>

          {/* Grid / States */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-[#f3f2eb] animate-pulse h-[350px]" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-8 rounded-3xl border-2 border-red-100 text-center font-bold">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-gray-100 shadow-sm">
              <p className="text-4xl mb-4">😶</p>
              <p className="text-black font-black text-xl mb-2">No tees found</p>
              <p className="text-gray-500 font-medium mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={handleResetFilters}
                className="bg-black text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer uppercase text-sm tracking-wide"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
                {products.map((p) => (
                  <TshirtCard
                    key={p._id}
                    id={p._id}
                    name={p.name}
                    price={p.price}
                    image={p.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                    size={p.sizes ? p.sizes.join(", ") : "S, M, L, XL"}
                    stock={p.stock}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}