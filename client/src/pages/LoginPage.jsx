import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../store/authSlice';
import { Lock, Mail, Phone, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Parse redirect query param if present
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || (user?.role === 'admin' ? '/admin' : '/shop');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' && !queryParams.get('redirect')) {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  }, [isAuthenticated, user, navigate, redirect, queryParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      return toast.error('Please enter your email/mobile and password.');
    }

    const result = await dispatch(loginUser({ identifier: identifier.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user?.name}!`);
    } else {
      toast.error(result.payload || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-brand-borderWarm shadow-boutique">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src={logoImg} alt="Aarrudh Fashion" className="h-14 w-auto mx-auto object-contain" />
          </Link>
          <h2 className="mt-4 font-serif text-2xl font-bold text-brand-dark">
            Sign In to Boutique
          </h2>
          <p className="mt-1 text-xs text-gray-500 font-serif italic">
            Access your curated wishlist, bags, and festive orders
          </p>
        </div>

        {/* Demo Quick Fill helper */}
        <div className="mb-6 p-3 bg-brand-cream/80 rounded-xl border border-brand-borderWarm text-[11px] text-gray-600 flex flex-col gap-1.5">
          <span className="font-bold text-brand-magenta flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Demo Login Credentials:
          </span>
          <div className="flex justify-between items-center">
            <span><strong>Customer:</strong> customer@aarrudhfashion.com</span>
            <button
              type="button"
              onClick={() => {
                setIdentifier('customer@aarrudhfashion.com');
                setPassword('Customer@123');
              }}
              className="text-[10px] text-brand-magenta underline font-semibold"
            >
              Fill Customer
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span><strong>Admin:</strong> admin@aarrudhfashion.com</span>
            <button
              type="button"
              onClick={() => {
                setIdentifier('admin@aarrudhfashion.com');
                setPassword('Admin@12345');
              }}
              className="text-[10px] text-brand-magenta underline font-semibold"
            >
              Fill Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="priya@example.com or 9845012345"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-brand-borderWarm rounded-xl text-xs text-brand-dark focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 border border-brand-borderWarm rounded-xl text-xs text-brand-dark focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-magenta hover:bg-brand-magentaDark text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-600 border-t border-gray-100 pt-5">
          <span>Don't have a boutique account? </span>
          <Link
            to={`/signup${location.search}`}
            className="text-brand-magenta font-bold hover:underline"
          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
