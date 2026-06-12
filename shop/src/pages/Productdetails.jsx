import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Heart } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshCartCount, refreshWishlistCount } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // 🔹 Fetch product
  useEffect(() => {
    async function getProduct() {
      try {
        setFetching(true);
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.data) {
          const p = res.data.data;
          setProduct({
            _id: p._id,
            title: p.name,
            price: p.price,
            image: p.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
            sizes: p.sizes || ["S", "M", "L", "XL"],
            description: p.description || "Premium T-shirt made from 100% fine cotton.",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Product not found or failed to fetch product details.");
      } finally {
        setFetching(false);
      }
    }
    if (id) {
      getProduct();
    }
  }, [id]);

  // Check wishlist status once product is loaded
  useEffect(() => {
    async function checkWishlist() {
      if (!user || !id) return;
      try {
        const res = await api.get(`/wishlist/check/${id}`);
        setIsWishlisted(res.data?.data?.isWishlisted || false);
      } catch (err) {
        // silently fail
      }
    }
    checkWishlist();
  }, [user, id]);

  const toggleWishlist = async () => {
    if (!user) { navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/remove/${id}`);
        setIsWishlisted(false);
      } else {
        await api.post(`/wishlist/add/${id}`);
        setIsWishlisted(true);
      }
      refreshWishlistCount();
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };
  const increaseQty = () => {
    if (quantity < 3) {
      setQuantity((q) => q + 1);
    } else {
      alert("Maximum quantity is 3 per item");
    }
  };
  
  const decreaseQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  // 🔹 Add to Cart API call
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    setLoading(true);

    const cartPayload = {
      product: product._id,
      price: product.price,
      size: selectedSize,
      quantity: quantity,
    };

    try {
      const res = await api.post("/order/create", cartPayload);
      if (res.data && res.data.success) {
        alert("Item added to cart successfully!");
        await refreshCartCount();
        navigate("/cart");
      } else {
        throw new Error(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Error adding product to cart");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className='p-10 text-center text-gray-500 animate-pulse'>Loading product details...</p>;
  if (error || !product) return <p className='p-10 text-center text-red-500 font-medium'>{error || "Product not found"}</p>;

  return (
    <div className='mx-auto max-w-6xl px-6 py-12 grid md:grid-cols-2 gap-12'>
      {/* IMAGE */}
      <div className='rounded-3xl premium-card overflow-hidden shadow-2xl flex items-center justify-center max-h-[550px] p-2'>
        <img
          src={product.image}
          alt={product.title}
          className='w-full h-full object-cover rounded-2xl max-h-[500px] hover:scale-105 transition-transform duration-700'
        />
      </div>

      {/* INFO */}
      <div className='space-y-6 premium-card p-8'>
        <h1 className='text-4xl font-black tracking-tight premium-text-gradient'>{product.title}</h1>
        <p className='text-sm text-gray-500 leading-relaxed font-medium'>{product.description}</p>
        <p className='text-3xl font-bold text-gray-900'>₹{product.price}</p>

        {/* SIZE SELECTOR */}
        <div>
          <p className='mb-3 font-medium text-gray-700'>Select Size</p>
          <div className='flex gap-3'>
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`h-12 w-14 rounded-xl border font-semibold transition cursor-pointer
                  ${
                    selectedSize === size
                      ? "bg-black text-white border-black shadow-sm"
                      : "border-gray-300 hover:border-black text-gray-700 bg-white"
                  }`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* QUANTITY CONTROLLER */}
        <div>
          <p className='mb-3 font-medium text-gray-700'>Quantity (Max 3)</p>
          <div className='flex items-center gap-4'>
            <button
              onClick={decreaseQty}
              disabled={quantity === 1}
              className='h-10 w-10 rounded-lg border text-lg font-bold cursor-pointer bg-white text-gray-700
                         disabled:opacity-50 hover:border-black flex items-center justify-center'>
              −
            </button>

            <span className='w-8 text-center text-lg font-semibold text-gray-900'>
              {quantity}
            </span>

            <button
              onClick={increaseQty}
              disabled={quantity >= 3}
              className='h-10 w-10 rounded-lg border text-lg font-bold cursor-pointer bg-white text-gray-700
                         disabled:opacity-50 hover:border-black flex items-center justify-center'>
              +
            </button>
          </div>
        </div>

        {/* ADD TO CART + WISHLIST */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className='flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-bold cursor-pointer
                       hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-md hover:shadow-xl flex items-center justify-center'>
            {loading ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`h-14 w-14 rounded-2xl border-2 flex items-center justify-center transition cursor-pointer disabled:opacity-50 ${
              isWishlisted
                ? "border-red-500 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:text-red-400"
            }`}>
            <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
