import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 relative overflow-hidden'>
      {/* Decorative blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: "1s" }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: "3s" }}></div>

      <Card className='w-full max-w-md premium-card border-white/60'>
        <CardHeader className='space-y-2 text-center pb-2'>
          <CardTitle className='text-3xl font-black tracking-tight premium-text-gradient'>Create Account</CardTitle>
          <CardDescription className="text-gray-500 font-medium">Join us and start shopping today</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 border border-green-100">
                Registration successful! Redirecting to login...
              </div>
            )}
            
            <div className='space-y-2'>
              <Label htmlFor='name'>Full Name</Label>
              <Input
                id='name'
                placeholder='John Doe'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirm'>Confirm Password</Label>
              <Input
                id='confirm'
                type='password'
                placeholder='••••••••'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className='w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all rounded-xl' disabled={loading || success}>
              {loading ? "Registering..." : "Create Account"}
            </Button>

            <p className='text-center text-sm text-gray-600'>
              Already have an account?{" "}
              <Link
                to='/login'
                className='font-medium text-black hover:underline'>
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
