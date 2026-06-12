import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Heart, Shield, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { cartCount, wishlistCount, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="w-full bg-[#fbfbf6]">
      {/* Top Promotional Banner */}
      <div className="bg-[#111] text-white text-[10px] sm:text-xs font-bold py-2 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 uppercase tracking-wide">
        <span>Buy 2+ Tees at ₹499 each</span>
        <span className="hidden sm:inline">•</span>
        <span className="bg-[#cfff04] text-black px-2 py-0.5 rounded-sm">Extra 10% off applied at checkout</span>
      </div>

      {/* Main Navbar */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 border-b border-gray-200/50">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tight text-black hover:opacity-80 transition-opacity">
          CoupleChaos
        </Link>

        {/* Center Links */}
        <div className="flex items-center gap-3 sm:gap-8">
          <Link to="/" className="text-xs sm:text-sm font-bold text-black hover:text-gray-600 transition uppercase tracking-wider">
            Home
          </Link>
          <Link to="/allsheets" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-black transition uppercase tracking-wider">
            Shop
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user?.role === "admin" && (
            <Link to="/admin" title="Inventory/Admin" className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-colors bg-white">
              <Shield className="h-5 w-5 text-black" strokeWidth={2.5} />
            </Link>
          )}

          {user && (
            <Link to="/wishlist" title="Wishlist" className="relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-colors bg-white">
              <Heart className="h-5 w-5 text-black" strokeWidth={2.5} />
              {wishlistCount > 0 && (
                <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          <Link 
            to="/cart" 
            title="Cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-colors bg-white"
          >
            <ShoppingBag className="h-5 w-5 text-black" strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l-2 border-gray-100">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-gray-100 group-hover:border-gray-300 transition-colors bg-white">
                  <User className="h-5 w-5 text-black" strokeWidth={2.5} />
                </div>
                <span className="hidden lg:block text-sm font-bold text-black capitalize">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <button onClick={handleLogout} title="Logout" className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-gray-100 hover:border-red-300 hover:bg-red-50 transition-colors bg-white">
                <LogOut className="h-5 w-5 text-red-500" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="ml-2 bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
