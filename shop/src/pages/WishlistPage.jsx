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
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Heart className="h-8 w-8 fill-red-500 text-red-500" />
          My Wishlist
        </h1>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold text-red-500 hover:text-red-700 transition cursor-pointer flex items-center gap-1.5">
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Heart className="h-14 w-14 text-gray-200" />
          <p className="text-gray-500 font-medium text-lg">Your wishlist is empty.</p>
          <p className="text-gray-400 text-sm">Browse and heart the products you love!</p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition cursor-pointer">
            Shop Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((product) => (
            <div
              key={product._id}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
              {/* Image */}
              <Link to={`/product/${product._id}`} className="block">
                <div className="relative h-52 w-full overflow-hidden bg-gray-50">
                  <img
                    src={product.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 bg-gray-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </Link>

              {/* Details */}
              <div className="p-5">
                <Link to={`/product/${product._id}`}>
                  <h2 className="font-bold text-gray-900 text-base leading-tight hover:underline">
                    {product.name}
                  </h2>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-gray-900">₹{product.price}</span>

                  <div className="flex items-center gap-2">
                    {/* Go to product */}
                    <Link
                      to={`/product/${product._id}`}
                      className="flex items-center gap-1.5 text-xs font-bold bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </Link>

                    {/* Remove from wishlist */}
                    <button
                      onClick={() => handleRemove(product._id)}
                      title="Remove from wishlist"
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer">
                      <Heart className="h-4.5 w-4.5 fill-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
