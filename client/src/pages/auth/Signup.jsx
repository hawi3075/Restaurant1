import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
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

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      // New users are always CUSTOMER role, redirect to home
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-orange-50/50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-orange-100/80 p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto text-orange-600 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create an Account</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Join us today and explore the best food and restaurants.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                name="name" 
                required
                placeholder="Hawi Girma"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-sm transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                name="email" 
                required
                placeholder="hawig3521@gmail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-sm transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                name="phone" 
                placeholder="+251 91 234 5678"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-sm transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                name="password" 
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-sm transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-600/25 transition-all duration-300 group text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

        </form>

        {/* Footer Link to Login */}
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}