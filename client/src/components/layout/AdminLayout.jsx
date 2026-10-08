import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import {
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  FolderTree,
  Package,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Store,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Landing Editor', path: '/admin/landing', icon: Sparkles },
  { name: 'Product Catalog', path: '/admin/products', icon: ShoppingBag },
  { name: 'Collections', path: '/admin/collections', icon: FolderTree },
  { name: 'Orders & Shipments', path: '/admin/orders', icon: Package },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Audit Logs', path: '/admin/audit', icon: ShieldAlert },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out from Admin Console');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-dark text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Title */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/20">
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="font-serif text-xl font-bold tracking-wider text-brand-gold">
                Aarrudh
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-brand-magenta text-white">
                Admin
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Admin User Badge */}
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-brand-gold truncate">{user?.email || 'admin@aarrudhfashion.com'}</p>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-magenta text-white shadow-md'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-grow">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/shop"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-brand-gold hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>View Boutique</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-semibold text-gray-700 hidden sm:block">
              Aarrudh Fashion Boutique Management Console
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-gold/40 text-brand-gold-dark hover:bg-brand-cream text-xs font-semibold transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-8 w-8 rounded-full bg-brand-magenta text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
