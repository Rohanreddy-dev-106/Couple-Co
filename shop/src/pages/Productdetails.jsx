import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO.jsx";
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

  //  Fetch product
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
    <>
      <SEO 
        title={product.title} 
        description={product.description}
        keywords={`buy ${product.title}, graphic tee, premium cotton shirt`} 
      />
      <div className='mx-auto max-w-7xl px-6 py-12 grid lg:grid-cols-2 gap-12 lg:gap-20 bg-[#fbfbf6] min-h-[calc(100vh-80px)]'>
      {/* IMAGE CONTAINER */}
      <div className='bg-white border-2 border-gray-100 rounded-[40px] p-8 md:p-16 flex items-center justify-center min-h-[500px] animate-fade-in-up opacity-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all' style={{ animationDelay: '100ms' }}>
        <div className="bg-[#fbfbf6] rounded-[32px] w-full max-w-md aspect-[4/5] flex items-center justify-center overflow-hidden border-2 border-gray-100">
          <img
            src={product.image}
            alt={product.title}
            className='w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-700'
          />
        </div>
      </div>

      {/* PRODUCT INFO */}
      <div className='space-y-8 py-4 animate-slide-in-right opacity-0' style={{ animationDelay: '300ms' }}>
        <div>
          <h1 className='text-5xl md:text-6xl font-black tracking-tight text-black mb-4 leading-none'>
            {product.title}
          </h1>
          <div className="flex items-center gap-2 text-base">
            <span className='font-black text-black text-xl'>₹{product.price}</span>
            <span className="text-gray-500 font-medium">• Add one more tee and both become ₹499 each.</span>
          </div>
        </div>

        {/* SIZE SELECTOR */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wide text-gray-900">
            <span>Size</span>
            <button className="underline underline-offset-4 text-gray-500 hover:text-black transition cursor-pointer">
              Size Guide
            </button>
          </div>
          
          <div className='flex flex-wrap gap-3'>
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`h-12 flex-1 min-w-[3.5rem] rounded-xl border-2 font-bold transition-all duration-200 cursor-pointer text-sm hover:-translate-y-1 active:translate-y-0
                  ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "border-gray-200 hover:border-gray-300 text-black bg-white"
                  }`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* QUANTITY CONTROLLER (Hidden in mockup but keeping it minimal) */}
        <div className="space-y-4">
          <p className='text-sm font-bold uppercase tracking-wide text-gray-900'>Quantity</p>
          <div className='flex items-center gap-4 w-fit'>
            <button
              onClick={decreaseQty}
              disabled={quantity === 1}
              className='h-12 w-12 rounded-xl border-2 border-gray-200 text-xl font-bold cursor-pointer bg-white text-black
                         disabled:opacity-50 hover:border-gray-300 flex items-center justify-center transition-colors active:bg-gray-100'>
              −
            </button>
            <span className='w-8 text-center text-lg font-bold text-black'>
              {quantity}
            </span>
            <button
              onClick={increaseQty}
              disabled={quantity >= 3}
              className='h-12 w-12 rounded-xl border-2 border-gray-200 text-xl font-bold cursor-pointer bg-white text-black
                         disabled:opacity-50 hover:border-gray-300 flex items-center justify-center transition-colors active:bg-gray-100'>
              +
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className='flex-1 h-14 rounded-xl bg-black text-white text-sm font-black tracking-widest uppercase cursor-pointer
                       hover:bg-gray-800 hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]'>
            {loading ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0 hover:scale-105 active:scale-95 ${
              isWishlisted
                ? "border-red-500 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600"
            }`}>
            <Heart className={`h-6 w-6 transition-colors duration-300 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} strokeWidth={2.5} />
          </button>
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-6 pt-8 border-t border-gray-200">
          <p className='text-sm text-gray-600 font-medium leading-relaxed'>{product.description}</p>
          
          <ul className="space-y-3 text-sm text-gray-600 font-medium list-disc pl-5 marker:text-gray-400">
            <li>100% Premium Cotton (220 GSM)</li>
            <li>Oversized, drop-shoulder fit</li>
            <li>Printed after order (Zero waste)</li>
          </ul>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            Delivery charges shown before payment. 10-day issue window for print defects.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
