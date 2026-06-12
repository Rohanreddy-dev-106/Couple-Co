import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, LogOut, User, Shield, Heart } from "lucide-react";

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className='sticky top-0 z-50 w-full glass border-b border-white/50'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
        {/* Logo */}
        <Link to='/' className='text-2xl font-black tracking-tighter premium-text-gradient hover:opacity-85 transition-opacity'>
         couple chaos
        </Link>

        {/* Navigation Links */}
        <div className='flex gap-8 items-center'>
          <Link
            to='/'
            className='text-sm font-medium text-gray-600 transition hover:text-gray-900'>
            Home
          </Link>

          <Link
            to='/allsheets'
            className='text-sm font-medium text-gray-600 transition hover:text-gray-900'>
            All T-Shirts
          </Link>
        </div>

        {/* Right Actions */}
        <div className='flex items-center gap-4'>
          {user ? (
            <>
              <Link to='/wishlist' className="relative p-2 text-gray-600 hover:text-red-500 transition" title="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to='/cart' className="relative p-2 text-gray-600 hover:text-gray-900 transition">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center animate-scaleIn">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user.role === "admin" && (
                <Link to='/admin' className="relative p-2 text-gray-600 hover:text-gray-900 transition" title="Admin Dashboard">
                  <Shield className="h-5 w-5" />
                </Link>
              )}
              <Link to='/profile' className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition cursor-pointer" title="View Profile">
                <User className="h-4 w-4 text-gray-500" />
                <span>{user.name || user.email}</span>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full px-4 flex items-center gap-1.5 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <Link to='/login'>
              <Button className='rounded-full px-6 bg-black text-white hover:bg-gray-800 transition'>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
