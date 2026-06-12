import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import {
  Plus,
  Trash2,
  Package,
  AlertTriangle,
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

  // Users state
  const [totalUsers, setTotalUsers] = useState(0);

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

  // Fetch total users
  const fetchTotalUsers = async () => {
    try {
      const res = await api.get("/management/admin/totalusers");
      if (res.data && res.data.data) {
        setTotalUsers(res.data.data.totalUsers || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchProducts();
      fetchOrders();
      fetchTotalUsers();
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

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete this order?`)) return;

    try {
      await api.delete(`/order/admin/delete-order/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete order.");
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


  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black flex items-center gap-3">
            <Database className="h-10 w-10 text-black" strokeWidth={2.5} />
            Inventory
          </h1>
          <p className="text-gray-500 font-bold mt-2 text-sm uppercase tracking-widest">Add products and monitor orders</p>
        </div>
        
        {/* Toggle tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider border-2 ${
              activeTab === "inventory"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
            }`}>
            Status
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider border-2 flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
            }`}>
            <ShoppingBag className="h-4 w-4" strokeWidth={3} />
            Orders
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider border-2 flex items-center gap-2 ${
              activeTab === "add"
                ? "bg-[#cfff04] text-black border-[#cfff04] hover:bg-[#b0e600]"
                : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
            }`}>
            <Plus className="h-4 w-4" strokeWidth={3} />
            Add New
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-12">
        
        {/* Total Users */}
        <div className="flex-1 min-w-[160px] sm:min-w-[200px] bg-white rounded-3xl border-2 border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-[#fbfbf6] border-2 border-gray-100 rounded-2xl text-black shrink-0">
            <User className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
            <h3 className="text-2xl sm:text-3xl font-black text-black mt-1 leading-none">{totalUsers}</h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="flex-1 min-w-[160px] sm:min-w-[200px] bg-white rounded-3xl border-2 border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-[#fbfbf6] border-2 border-gray-100 rounded-2xl text-black shrink-0">
            <Package className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</p>
            <h3 className="text-2xl sm:text-3xl font-black text-black mt-1 leading-none">{totalItems}</h3>
          </div>
        </div>

        {/* Low Stock */}
        <div className="flex-1 min-w-[160px] sm:min-w-[200px] bg-white rounded-3xl border-2 border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-red-50 border-2 border-red-100 rounded-2xl text-red-500 shrink-0">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Low Stock</p>
            <h3 className="text-2xl sm:text-3xl font-black text-red-500 mt-1 leading-none">{lowStockItems}</h3>
          </div>
        </div>

        {/* Customer Orders count */}
        <div className="flex-1 min-w-[200px] sm:min-w-[250px] bg-black rounded-3xl border-2 border-black p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-[#222] rounded-2xl text-[#cfff04] shrink-0">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-none">{orders.length}</h3>
          </div>
        </div>

      </div>

      {/* TAB CONTENT: INVENTORY LIST */}
      {activeTab === "inventory" && (
        <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-fade-in-up">
          
          <div className="px-8 py-6 border-b-2 border-gray-100 flex justify-between items-center bg-[#fbfbf6]">
            <h3 className="font-black text-black text-xl flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-black" strokeWidth={2.5} />
              Stock Overview
            </h3>
            <span className="text-xs text-black font-black uppercase tracking-widest bg-gray-200 px-3 py-1 rounded-sm">{products.length} Products</span>
          </div>

          {loading ? (
            <div className="p-24 text-center">
              <p className="text-gray-500 animate-pulse font-bold tracking-widest uppercase text-sm">Loading catalog...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-500 font-bold border-2 border-red-100 rounded-xl m-8">{error}</div>
          ) : products.length === 0 ? (
            <div className="p-24 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
              Inventory is empty. Get started by adding products.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-black border-collapse">
                <thead className="bg-[#fbfbf6] text-[10px] text-gray-400 uppercase font-black tracking-widest border-b-2 border-gray-100">
                  <tr>
                    <th scope="col" className="px-8 py-5">Product Info</th>
                    <th scope="col" className="px-8 py-5">Category</th>
                    <th scope="col" className="px-8 py-5">Price</th>
                    <th scope="col" className="px-8 py-5">Stock</th>
                    <th scope="col" className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-100">
                  {products.map((p) => {
                    const stock = Number(p.stock) || 0;
                    const price = Number(p.price) || 0;
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= 10;
                    return (
                      <tr key={p._id} className="hover:bg-[#fbfbf6] transition-colors">
                        <td className="px-8 py-6 flex items-center gap-4">
                          <img
                            src={p.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                            alt={p.name}
                            className="h-14 w-14 rounded-2xl object-cover border-2 border-gray-100 bg-white p-1"
                          />
                          <div>
                            <span className="font-black text-black text-base block">{p.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Sizes: {p.sizes?.join(", ") || "None"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-gray-500">{p.category}</td>
                        <td className="px-8 py-6 font-black text-black text-base">₹{price}</td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${
                            isOutOfStock ? "bg-red-50 border-red-200 text-red-600" : isLowStock ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-gray-50 border-gray-200 text-black"
                          }`}>
                            <span className="font-bold text-xs uppercase tracking-widest">
                              {stock} units
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            className="p-3 text-red-500 hover:text-white hover:bg-red-500 border-2 border-transparent hover:border-red-600 rounded-xl transition-all cursor-pointer inline-flex items-center active:scale-95">
                            <Trash2 className="h-5 w-5" strokeWidth={2.5} />
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
        <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-fade-in-up">
          
          <div className="px-8 py-6 border-b-2 border-gray-100 flex justify-between items-center bg-[#fbfbf6]">
            <h3 className="font-black text-black text-xl flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-black" strokeWidth={2.5} />
              Customer Orders List
            </h3>
            <button
              onClick={fetchOrders}
              className="text-xs text-black font-black hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors cursor-pointer uppercase tracking-widest px-4 py-2 rounded-xl">
              Refresh Orders
            </button>
          </div>

          {ordersLoading ? (
            <div className="p-24 text-center">
              <p className="text-gray-500 animate-pulse font-bold tracking-widest uppercase text-sm">Loading customer orders...</p>
            </div>
          ) : ordersError ? (
            <div className="p-10 text-center text-red-500 font-bold border-2 border-red-100 rounded-xl m-8">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="p-24 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
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
                  <div key={order._id} className="p-6 sm:p-8 hover:bg-[#fbfbf6] transition duration-150">
                    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 justify-between">
                      
                      {/* Left: Product & Customer details */}
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1">
                        <img
                          src={prod.images || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                          alt={prod.name || "Product"}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-gray-100 bg-white p-1 shrink-0"
                        />
                        <div className="space-y-2">
                          <span className="font-black text-black text-xl">{prod.name || "T-Shirt Product"}</span>
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" strokeWidth={2.5} />
                              {customer.name || "Guest User"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" strokeWidth={2.5} />
                              {orderDate}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-black uppercase tracking-widest">
                            Qty: <span className="font-black text-base">{order.quantity}</span> | Price: <span className="font-black text-base">₹{order.price}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Address & Total Amount */}
                      <div className="flex flex-col sm:flex-row gap-8 lg:w-[45%] justify-between text-left">
                        {/* Shipping details */}
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider max-w-[280px]">
                          <span className="font-black text-black flex items-center gap-2 mb-2 uppercase tracking-widest">
                            <MapPin className="h-4 w-4 text-black" strokeWidth={2.5} />
                            Shipping Details
                          </span>
                          {address ? (
                            <div className="space-y-1">
                              <p className="font-black text-black text-sm">{address.fullName}</p>
                              <p>{address.addressLine1}</p>
                              {address.addressLine2 && <p>{address.addressLine2}</p>}
                              <p>{address.city}, {address.state} - {address.postalCode}</p>
                              <p className="font-black text-black pt-1">Phone: {address.phone}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">No delivery profile associated.</p>
                          )}
                        </div>

                        {/* Amount & Status */}
                        <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">Total amount</span>
                            <span className="text-3xl font-black text-black leading-none mt-1 block">₹{order.totalAmount}</span>
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-amber-50 text-amber-700 border-2 border-amber-200">
                              {order.status || "Pending"}
                            </span>
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                          </div>
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
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm max-w-3xl mx-auto animate-fade-in-up">
          <h3 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">Create Catalog Item</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-8">Enter specifications to introduce a new t-shirt product.</p>

          {formMessage.text && (
            <div
              className={`mb-8 p-4 rounded-xl text-sm font-bold border-2 ${
                formMessage.type === "success"
                  ? "bg-[#cfff04]/20 text-black border-[#cfff04]"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}>
              {formMessage.text}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="space-y-8">
            
            {/* Product Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold text-black uppercase tracking-widest">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Classic Oversized White Tee"
                className="w-full h-14 rounded-xl border-2 border-gray-100 px-5 font-bold text-black placeholder-gray-300 focus:border-black outline-none transition-colors bg-[#fbfbf6] focus:bg-white"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-bold text-black uppercase tracking-widest">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Details about style, materials, fitting, wash instructions..."
                className="w-full rounded-xl border-2 border-gray-100 p-5 font-bold text-black placeholder-gray-300 focus:border-black outline-none transition-colors bg-[#fbfbf6] focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="text-xs font-bold text-black uppercase tracking-widest">Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="899"
                  className="w-full h-14 rounded-xl border-2 border-gray-100 px-5 font-bold text-black placeholder-gray-300 focus:border-black outline-none transition-colors bg-[#fbfbf6] focus:bg-white"
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label htmlFor="stock" className="text-xs font-bold text-black uppercase tracking-widest">Initial Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="100"
                  className="w-full h-14 rounded-xl border-2 border-gray-100 px-5 font-bold text-black placeholder-gray-300 focus:border-black outline-none transition-colors bg-[#fbfbf6] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-xs font-bold text-black uppercase tracking-widest">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full h-14 rounded-xl border-2 border-gray-100 px-5 font-bold text-black placeholder-gray-300 focus:border-black outline-none transition-colors bg-[#fbfbf6] focus:bg-white"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label htmlFor="images" className="text-xs font-bold text-black uppercase tracking-widest">Image URL</label>
                <input
                  type="url"
                  id="images"
                  name="images"
                  required
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/photo..."
                  className="w-full h-14 rounded-xl border-2 border-gray-100 px-5 font-bold text-black placeholder-gray-300 focus:border-black outline-none transition-colors bg-[#fbfbf6] focus:bg-white"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3 pt-4">
              <label className="text-xs font-bold text-black uppercase tracking-widest block">Available Sizes</label>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => {
                  const isSelected = formData.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className={`h-12 px-6 rounded-xl border-2 font-bold transition-all cursor-pointer hover:-translate-y-1 active:translate-y-0 ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-black"
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
              className="w-full mt-8 h-16 rounded-xl bg-black text-sm tracking-widest font-black uppercase text-white hover:bg-gray-800 transition cursor-pointer disabled:opacity-50 flex items-center justify-center hover:scale-105 active:scale-95 duration-200">
              {submitting ? "Adding Product..." : "Add Product to Inventory"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
