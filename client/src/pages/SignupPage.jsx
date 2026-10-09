import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../store/authSlice';
import { Eye, EyeOff, Sparkles, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/shop';

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      let digits = e.target.value.replace(/\D/g, '');
      if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
      else if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);
      digits = digits.slice(0, 10);
      setFormData({ ...formData, phone: digits });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Please enter your full name (minimum 2 characters)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Sanitize phone number (strip spaces, country code, leading zeros)
    let cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) cleanPhone = cleanPhone.slice(2);
    else if (cleanPhone.length > 10 && cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    cleanPhone = cleanPhone.slice(-10);

    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await dispatch(
        signupUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: cleanPhone,
          phone: cleanPhone,
          password: formData.password,
        })
      ).unwrap();

      toast.success(`Welcome to Aarrudh Fashion, ${res.user?.name || 'Customer'}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-cream/40">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-brand-gold/30">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-3">
            <img src={logoImg} alt="Aarrudh Fashion" className="h-12 w-auto mx-auto object-contain" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-dark text-[11px] uppercase tracking-widest font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Join Our Boutique</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-brand-dark tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-gray-500 mt-2 font-sans">
            Gain exclusive access to our festive ethnic lookbooks, private launches, and order tracking.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. priya@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Mobile Number * (For Courier SMS)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <div className="absolute inset-y-0 left-8 pl-1 flex items-center pointer-events-none text-gray-500 text-xs font-bold">
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full pl-16 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 bg-brand-magenta hover:bg-brand-magenta-dark text-white font-medium text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-600 font-sans">
            Already have an account?{' '}
            <Link
              to={`/login${location.search}`}
              className="font-bold text-brand-magenta hover:text-brand-magenta-dark transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
