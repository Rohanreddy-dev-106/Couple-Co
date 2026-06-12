import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 bg-[#fbfbf6]'>
      <div className='w-full max-w-md bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-8 sm:p-10'>
        <div className='space-y-2 text-center pb-8'>
          <h1 className='text-3xl font-black tracking-tight text-black uppercase'>Welcome Back</h1>
          <p className="text-gray-500 font-bold text-sm">Login to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 font-bold border-2 border-red-100">
              {error}
            </div>
          )}
          
          <div className='space-y-2'>
            <label htmlFor='email' className="text-sm font-bold uppercase tracking-wider text-black">Email</label>
            <input
              id='email'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 rounded-xl border-2 border-gray-100 bg-[#fbfbf6] px-4 font-bold text-black placeholder:font-medium placeholder-gray-400 focus:border-black focus:bg-white outline-none transition-colors"
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className="text-sm font-bold uppercase tracking-wider text-black">Password</label>
            <input
              id='password'
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 rounded-xl border-2 border-gray-100 bg-[#fbfbf6] px-4 font-bold text-black placeholder-gray-400 focus:border-black focus:bg-white outline-none transition-colors"
            />
          </div>

          <button type="submit" className='w-full h-14 mt-4 text-sm font-black tracking-widest uppercase bg-black text-white hover:bg-gray-800 hover:-translate-y-1 active:translate-y-0 active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-200 rounded-xl flex items-center justify-center disabled:opacity-50 cursor-pointer' disabled={loading}>
            {loading ? "Logging in..." : "Login to Account"}
          </button>

          <p className='text-center text-sm text-gray-500 font-bold pt-4'>
            Don’t have an account?{" "}
            <Link
              to='/register'
              className='text-black hover:underline underline-offset-4'>
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
