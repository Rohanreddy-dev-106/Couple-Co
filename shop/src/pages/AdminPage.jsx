import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import {
  Plus,
  Trash2,
  Package,
  AlertTriangle,
  IndianRupee,
  ShieldAlert,
  BarChart3,
  Database,
  ShoppingBag,
  MapPin,
  Calendar,
  User
} from "lucide-react";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Tab state: 'inventory', 'add', or 'orders'
  const [activeTab, setActiveTab] = useState("inventory");

  // Catalog state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Add form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "T-Shirts",
    images: "",
    sizes: ["S", "M", "L", "XL"],
  });

  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/products/get-all");
      if (res.data && res.data.data) {
        setProducts(res.data.data);
      } else {
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products catalog.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all customer orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");
      const res = await api.get("/order/admin/all-orders");
      if (res.data && res.data.data) {
        setOrders(res.data.data);
      } else {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setOrdersError("Failed to fetch customer orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchProducts();
      fetchOrders();
    }
  }, [user]);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Sizes checkbox-style toggling
  const handleSizeChange = (size) => {
    setFormData((prev) => {
      const isSelected = prev.sizes.includes(size);
      const updatedSizes = isSelected
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updatedSizes };
    });
  };

  // Create Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage({ type: "", text: "" });

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      await api.post("/products/create", payload);

      setFormMessage({ type: "success", text: "Product successfully added to inventory!" });
      // Reset Form
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "T-Shirts",
        images: "",
        sizes: ["S", "M", "L", "XL"],
      });
      // Refresh products list
      fetchProducts();
      // Switch back to list after short delay
      setTimeout(() => {
        setActiveTab("inventory");
        setFormMessage({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Product creation failed.";
      setFormMessage({ type: "error", text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}" from inventory?`)) return;

    try {
      await api.delete(`/products/delete/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      alert("Product deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse font-medium">Checking Admin credentials...</p>
      </div>
    );
  }

  // Secure admin check - restrict to admin@gmail.com
  if (!user || user.role !== "admin" || user.email !== "admin@gmail.com") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="rounded-3xl border border-red-100 bg-red-50/40 p-8 shadow-xs">
          <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Access Restricted</h2>
          <p className="text-gray-600 text-sm mb-6">
            Only the default admin account (<strong>admin@gmail.com</strong>) is authorized to manage the store inventory.
          </p>
          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition cursor-pointer">
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalItems = products.length;
  const outOfStockItems = products.filter((p) => (Number(p.stock) || 0) === 0).length;
  const lowStockItems = products.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10).length;
  const totalRevenue = products.reduce((acc, p) => {
    return acc + (Number(p.price) || 0) * (Number(p.stock) || 0);
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-2 premium-text-gradient">
            <Database className="h-8 w-8 text-indigo-600" />
            Inventory Manager
          </h1>
          <p className="text-gray-500 font-medium mt-1">Add products and monitor placed customer orders.</p>
        </div>
        
        {/* Toggle tabs */}
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-inner">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
              activeTab === "inventory"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-indigo-600 hover:bg-white/50"
            }`}>
            Inventory Status
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-indigo-600 hover:bg-white/50"
            }`}>
            <ShoppingBag className="h-4 w-4" />
            Customer Orders
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "add"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-indigo-600 hover:bg-white/50"
            }`}>
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Total Products */}
        <div className="premium-card p-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl text-indigo-600 shadow-inner">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalItems}</h3>
          </div>
        </div>

        {/* Low Stock */}
        <div className="premium-card p-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl text-amber-600 shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Low Stock (≤10)</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{lowStockItems}</h3>
          </div>
        </div>

        {/* Customer Orders count */}
        <div className="premium-card p-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-blue-600 shadow-inner">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{orders.length}</h3>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="premium-card p-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl text-emerald-600 shadow-inner">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

      </div>

      {/* TAB CONTENT: INVENTORY LIST */}
      {activeTab === "inventory" && (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              Stock Overview
            </h3>
            <span className="text-xs text-gray-400 font-semibold uppercase">{products.length} Products</span>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <p className="text-gray-500 animate-pulse font-medium">Loading catalog...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-500 font-medium">{error}</div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center text-gray-500 font-medium">
              Inventory is empty. Get started by adding products.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 border-collapse">
                <thead className="bg-gray-50/50 text-xs text-gray-700 uppercase font-semibold border-b">
                  <tr>
                    <th scope="col" className="px-6 py-4">Product Info</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Price</th>
                    <th scope="col" className="px-6 py-4">Stock</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {products.map((p) => {
                    const stock = Number(p.stock) || 0;
                    const price = Number(p.price) || 0;
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= 10;
                    return (
                      <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={p.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover bg-gray-50 border"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{p.name}</span>
                            <span className="text-xs text-gray-400">Sizes: {p.sizes?.join(", ") || "None"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">{p.category}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{price}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-400" : "bg-emerald-500"
                              }`}
                            />
                            <span className={`font-semibold ${isOutOfStock ? "text-red-600" : "text-gray-950"}`}>
                              {stock} units
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer inline-flex items-center">
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CUSTOMER ORDERS LIST */}
      {activeTab === "orders" && (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-500" />
              Customer Orders List
            </h3>
            <button
              onClick={fetchOrders}
              className="text-xs text-black font-bold hover:underline cursor-pointer">
              Refresh Orders
            </button>
          </div>

          {ordersLoading ? (
            <div className="p-20 text-center">
              <p className="text-gray-500 animate-pulse font-medium">Loading customer orders...</p>
            </div>
          ) : ordersError ? (
            <div className="p-10 text-center text-red-500 font-medium">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center text-gray-500 font-medium">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => {
                const prod = order.productId || {};
                const customer = order.userId || {};
                const address = order.shippingAddress || null;
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={order._id} className="p-6 hover:bg-gray-50/30 transition duration-150">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                      
                      {/* Left: Product & Customer details */}
                      <div className="flex gap-4 flex-1">
                        <img
                          src={prod.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                          alt={prod.name || "Product"}
                          className="h-16 w-16 rounded-xl object-cover border bg-gray-50"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-gray-900 text-base">{prod.name || "T-Shirt Product"}</span>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {customer.name || "Guest User"} ({customer.email || "No Email"})
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {orderDate}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-700">
                            Qty: <span className="font-extrabold">{order.quantity}</span> | Price: <span className="font-extrabold">₹{order.price}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Address & Total Amount */}
                      <div className="flex flex-col sm:flex-row gap-6 lg:w-[45%] justify-between text-left">
                        {/* Shipping details */}
                        <div className="text-xs text-gray-600 max-w-[280px]">
                          <span className="font-bold text-gray-900 flex items-center gap-1 mb-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            Shipping Details:
                          </span>
                          {address ? (
                            <div className="space-y-0.5">
                              <p className="font-semibold text-gray-800">{address.fullName}</p>
                              <p>{address.addressLine1}</p>
                              {address.addressLine2 && <p>{address.addressLine2}</p>}
                              <p>{address.city}, {address.state} - {address.postalCode}</p>
                              <p className="font-semibold">Phone: {address.phone}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">No delivery profile associated.</p>
                          )}
                        </div>

                        {/* Amount & Status */}
                        <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
                          <div>
                            <span className="text-xs font-semibold text-gray-400 block uppercase">Total amount</span>
                            <span className="text-xl font-black text-gray-950">₹{order.totalAmount}</span>
                          </div>
                          
                          <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            {order.status || "Pending"}
                          </span>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ADD NEW PRODUCT */}
      {activeTab === "add" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-gray-950 mb-2">Create Catalog Item</h3>
          <p className="text-sm text-gray-500 mb-6">Enter specifications to introduce a new t-shirt product.</p>

          {formMessage.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                formMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}>
              {formMessage.text}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="space-y-6">
            
            {/* Product Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Classic Oversized White Tee"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Details about style, materials, fitting, wash instructions..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-semibold text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="899"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition"
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-semibold text-gray-700">Initial Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="100"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label htmlFor="images" className="text-sm font-semibold text-gray-700">Image URL</label>
                <input
                  type="url"
                  id="images"
                  name="images"
                  required
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/photo..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">Available Sizes</label>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => {
                  const isSelected = formData.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className={`h-11 px-5 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 h-14 rounded-2xl bg-black text-lg font-bold text-white hover:bg-gray-800 transition cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-md">
              {submitting ? "Adding Product..." : "Add Product to Inventory"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
