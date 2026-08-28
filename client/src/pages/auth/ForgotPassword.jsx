import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Utensils, KeyRound, CheckCircle } from 'lucide-react';
import API from '../../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/auth/forgot-password', {
        email: formData.email
      });
      
      setSuccess('A 6-digit reset code has been sent to your email.');
      setStep(2);
      
      // In development, show the code
      if (response.data.resetCode) {
        console.log('Reset Code:', response.data.resetCode);
        setSuccess(`Reset code: ${response.data.resetCode} (Check console in production)`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await API.post('/auth/reset-password', {
        email: formData.email,
        resetCode: formData.resetCode,
        newPassword: formData.newPassword
      });
      
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-orange-950 via-gray-900 to-orange-900 overflow-hidden">

      {/* Background Effects */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 overflow-hidden flex flex-col md:flex-row z-10">

        {/* Top Orange Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500 z-20" />

        {/* Left Side: Information */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-600 to-amber-600 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">

          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          <div className="relative z-20">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>

          <div className="relative z-10 my-auto py-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 leading-tight">
              Reset Your Password
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
              Enter your email address and we'll send you a verification code to reset your password securely.
            </p>
          </div>

          <div className="relative z-10"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">

          <div className="mb-6">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
              <Utensils className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {step === 1 ? 'Forgot Password?' : 'Enter Reset Code'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {step === 1 
                ? 'No worries! Enter your email to receive a reset code.' 
                : 'Enter the 6-digit code sent to your email and your new password.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs mb-4 flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            // Step 1: Request Reset Code
            <form onSubmit={handleRequestReset} className="space-y-4">
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
                    placeholder="your.email@maad.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium transition disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-600/25 transition text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Sending Code...' : 'Send Reset Code'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            // Step 2: Verify Code & Reset Password
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">6-Digit Reset Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="resetCode"
                    required
                    placeholder="123456"
                    maxLength={6}
                    value={formData.resetCode}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium tracking-widest transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium transition disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-600/25 transition text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                {!loading && <CheckCircle className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-gray-500 hover:text-gray-700 font-medium transition"
              >
                Didn't receive code? Try again
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
