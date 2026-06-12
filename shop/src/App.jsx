import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import AllTshirts from "./pages/AllTshirts.jsx";
import ProductDetails from "./pages/Productdetails.jsx";
import CartPage from "./pages/Cards.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<AllTshirts />} />
            <Route path="/allsheets" element={<AllTshirts />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
          
          {/* Minimal Black Footer */}
          <footer className="bg-[#111] text-white py-12 px-6 md:px-12 w-full mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="text-xl font-black tracking-tight">CoupleChaos</div>
              <div className="flex gap-12 font-bold text-sm tracking-wide">
                <a href="#" className="hover:text-gray-300">Shop</a>
                <a href="#" className="hover:text-gray-300">Support</a>
                <a href="#" className="hover:text-gray-300">Legal</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;