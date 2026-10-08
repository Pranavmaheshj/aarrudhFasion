import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  LogOut,
  Package,
  MapPin,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import logoImg from '../../assets/logo.png';
import logoSvg from '../../assets/logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <header className="sticky top-0 z-50 bg-[#FFF9EC]/95 backdrop-blur-md border-b border-brand-borderWarm shadow-sm transition-all">
      {/* Top Announcements Strip */}
      <div className="bg-gradient-to-r from-brand-magenta via-brand-magentaDark to-brand-magenta text-[#FFF9EC] py-1.5 px-4 text-xs font-medium text-center tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand-goldShimmer animate-pulse" />
        <span>Diwali Festive Launch: Free Express Shipping on Orders Above ₹1,999 | Handcrafted Kurta Sets</span>
        <Sparkles className="w-3.5 h-3.5 text-brand-goldShimmer animate-pulse hidden sm:inline" />
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src={logoImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = logoSvg;
              }}
              alt="Aarrudh Fashion Women's Boutique"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* AJIO-Style Search Bar (visible if authenticated or for easy lookup) */}
          {isAuthenticated ? (
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search festive kurta sets, zari, pearl work, colors..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-brand-borderWarm rounded-full text-sm text-brand-dark focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold shadow-inner transition-all placeholder:text-gray-400"
                />
                <button type="submit" className="absolute left-3.5 top-3 text-brand-gold hover:text-brand-magenta transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden md:block text-xs font-serif italic text-brand-gold tracking-widest uppercase">
              Women's Ethnic &amp; Designer Boutique
            </div>
          )}

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3 sm:gap-5">
            {isAuthenticated ? (
              <>
                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className="relative p-2 text-brand-dark hover:text-brand-magenta transition-colors"
                  title="My Wishlist"
                >
                  <Heart className="w-6 h-6 stroke-[1.7]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 bg-brand-magenta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Shopping Bag / Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 text-brand-dark hover:text-brand-gold transition-colors"
                  title="Shopping Bag"
                >
                  <ShoppingBag className="w-6 h-6 stroke-[1.7]" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-brand-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-brand-borderWarm bg-white/60 hover:bg-white text-brand-dark transition-all text-xs font-semibold"
                  >
                    <User className="w-4 h-4 text-brand-magenta" />
                    <span className="hidden sm:inline max-w-[90px] truncate">{user?.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-boutique border border-brand-borderWarm py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-brand-dark truncate">{user?.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                      </div>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-magenta bg-brand-magenta/5 hover:bg-brand-magenta/10 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        to="/shop"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-brand-dark hover:bg-brand-cream transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-brand-gold" />
                        <span>Explore Boutique Shop</span>
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-brand-dark hover:bg-brand-cream transition-colors"
                      >
                        <Package className="w-4 h-4 text-brand-gold" />
                        <span>My Orders &amp; Tracking</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors border-t border-gray-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest: Login / Sign up Button */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full border border-brand-magenta text-brand-magenta font-semibold text-xs tracking-wider uppercase hover:bg-brand-magenta hover:text-white transition-all shadow-sm"
                >
                  Login / Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-dark hover:text-brand-magenta focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* AJIO-Style Sub-Navigation Strip (for logged-in users) */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-8 py-2 border-t border-brand-borderWarm/60 text-xs font-semibold uppercase tracking-wider text-brand-dark">
            <Link
              to="/shop"
              className={`hover:text-brand-magenta transition-colors ${
                location.pathname === '/shop' && !location.search ? 'text-brand-magenta font-bold' : ''
              }`}
            >
              All Kurta Sets
            </Link>
            <Link
              to="/shop?collection=diwali-collection-new-launch"
              className="text-brand-magenta hover:text-brand-magentaDark flex items-center gap-1 font-bold"
            >
              <Sparkles className="w-3 h-3 text-brand-gold" />
              Diwali Launch
            </Link>
            <Link
              to="/shop?fabric=Tissue"
              className="hover:text-brand-gold transition-colors"
            >
              Tissue Silk Sets
            </Link>
            <Link
              to="/shop?neckStyle=V-Neck"
              className="hover:text-brand-gold transition-colors"
            >
              Embroidered V-Necks
            </Link>
            <Link
              to="/shop?neckStyle=Round+Neck"
              className="hover:text-brand-gold transition-colors"
            >
              Pearl Work Classics
            </Link>
            <Link
              to="/shop?sort=newest"
              className="hover:text-brand-gold transition-colors"
            >
              New Arrivals
            </Link>
          </nav>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9EC] border-b border-brand-borderWarm px-4 py-4 space-y-3 animate-fadeIn">
          {isAuthenticated && (
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kurta sets, colors..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-brand-borderWarm rounded-full text-xs"
              />
              <Search className="w-4 h-4 text-brand-gold absolute left-3 top-2.5" />
            </form>
          )}

          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link to="/" className="py-1.5 text-brand-dark hover:text-brand-magenta">Home Collections</Link>
            {isAuthenticated ? (
              <>
                <Link to="/shop" className="py-1.5 text-brand-dark hover:text-brand-magenta font-semibold">Shop All Kurta Sets</Link>
                <Link to="/shop?collection=diwali-collection-new-launch" className="py-1.5 text-brand-magenta font-bold">✨ Diwali Festive Launch</Link>
                <Link to="/orders" className="py-1.5 text-brand-dark hover:text-brand-magenta">My Orders &amp; Shipment</Link>
                <Link to="/wishlist" className="py-1.5 text-brand-dark hover:text-brand-magenta">My Wishlist ({wishlistCount})</Link>
                <Link to="/cart" className="py-1.5 text-brand-dark hover:text-brand-gold">My Bag ({cartCount})</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="py-1.5 text-brand-magenta font-bold">Admin Panel</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="py-1.5 text-left text-red-600 font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="mt-2 block w-full text-center py-2 bg-brand-magenta text-white rounded-full font-semibold text-xs tracking-wider uppercase shadow"
              >
                Login / Sign up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
