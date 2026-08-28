import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Utensils } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Starting login with:', formData.email);
    const result = await login(formData.email, formData.password);
    console.log('Login result:', result);
    setLoading(false);

    if (result.success) {
      console.log('Login successful! Role:', result.role);
      // Redirect based on user role
      switch (result.role) {
        case 'ADMIN':
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
          break;
        case 'CHEF':
          console.log('Redirecting to chef dashboard');
          navigate('/chef');
          break;
        case 'WAITER':
          console.log('Redirecting to waiter dashboard');
          navigate('/waiter');
          break;
        case 'DRIVER':
          console.log('Redirecting to driver dashboard');
          navigate('/driver');
          break;
        case 'CUSTOMER':
        default:
          console.log('Redirecting to home');
          navigate('/');
          break;
      }
    } else {
      console.error('Login failed:', result.error);
      setError(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    const result = await googleLogin(credentialResponse.credential);
    setLoading(false);

    if (result.success) {
      // Redirect based on user role
      switch (result.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'CHEF':
          navigate('/chef');
          break;
        case 'WAITER':
          navigate('/waiter');
          break;
        case 'DRIVER':
          navigate('/driver');
          break;
        case 'CUSTOMER':
        default:
          navigate('/');
          break;
      }
    } else {
      setError(result.error);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign in failed. Please try again.');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-orange-950 via-gray-900 to-orange-900 overflow-hidden">

      {/* Restaurant Food Background Overlay Effect */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Glowing Ambient Shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 overflow-hidden flex flex-col md:flex-row z-10">

        {/* Top Orange Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500 z-20" />

        {/* Left Side: Engaging Restaurant Showcase */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-600 to-amber-600 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">

          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          <div className="relative z-20">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="relative z-10 my-auto py-8">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 leading-tight">
              Delicious meals delivered to your doorstep.
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
              Sign in to manage your orders, track real-time deliveries, and experience top-tier local restaurants with Ma'ad (ማእድ).
            </p>
          </div>

          <div className="relative z-10"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">

          <div className="mb-6">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
              <Utensils className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-gray-500 mt-1">Please enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="chef.tadesse@maad.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium transition disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-orange-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-600/25 transition text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="100%"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>

          </form>

          <div className="text-center mt-6 text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:underline">
              Sign Up
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}