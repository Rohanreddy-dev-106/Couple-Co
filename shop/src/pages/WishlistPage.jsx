import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Heart, Trash2, ShoppingCart } from "lucide-react";

export default function WishlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist");
      // Filter out null entries (products that were deleted from DB)
      const rawItems = res.data?.data || [];
      setItems(rawItems.filter(p => p !== null && p._id));
    } catch (err) {
      console.error(err);
      setError("Failed to load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWishlist();
    else setLoading(false);
  }, [user]);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/remove/${productId}`);
      setItems((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove product from wishlist.");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear your entire wishlist?")) return;
    try {
      await api.delete("/wishlist/clear");
      setItems([]);
    } catch (err) {
      console.error(err);
      alert("Failed to clear wishlist.");
    }
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <Heart className="h-12 w-12 text-gray-300" />
        <p className="text-lg text-gray-600 font-medium">Please login to see your wishlist</p>
        <button
          onClick={() => navigate("/login")}
          className="rounded-xl bg-black px-6 py-3 text-white hover:bg-gray-800 transition font-semibold cursor-pointer">
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse font-medium">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbf6] pt-12 pb-24 px-6 sm:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black uppercase flex items-center gap-3">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 fill-red-500 text-red-500" />
              Wishlist
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-black text-red-500 hover:text-white hover:bg-red-500 transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-widest px-4 py-2.5 rounded-xl border-2 border-red-200 hover:border-red-500">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={3} />
              Clear All
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-2xl bg-red-50 border-2 border-red-100 p-5 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white rounded-3xl border-2 border-gray-100">
            <Heart className="h-14 w-14 text-gray-200" />
            <p className="text-black font-black text-xl uppercase">Your wishlist is empty</p>
            <p className="text-gray-400 font-medium text-sm">Browse and heart the products you love!</p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 rounded-xl bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-gray-800 transition cursor-pointer hover:-translate-y-1 active:translate-y-0">
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((product) => (
              <div
                key={product._id}
                className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-200">
                {/* Image */}
                <Link to={`/product/${product._id}`} className="block">
                  <div className="relative h-48 w-full overflow-hidden bg-[#f3f2eb] flex items-center justify-center p-4">
                    <img
                      src={product.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                      alt={product.name}
                      className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.stock === 0 && (
                      <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        Sold Out
                      </span>
                    )}
                    {/* Remove button overlay */}
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemove(product._id); }}
                      title="Remove from wishlist"
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer opacity-100 sm:opacity-0 group-hover:opacity-100 active:scale-90 border-2 border-transparent hover:border-red-600">
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </Link>

                {/* Details */}
                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h2 className="font-black text-black text-sm uppercase tracking-tight leading-tight hover:text-gray-600 transition-colors truncate">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{product.category}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-2xl font-black text-black leading-none">₹{product.price}</span>

                    <Link
                      to={`/product/${product._id}`}
                      className="flex items-center gap-1.5 text-[10px] font-black bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0">
                      <ShoppingCart className="h-3.5 w-3.5" strokeWidth={3} />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
