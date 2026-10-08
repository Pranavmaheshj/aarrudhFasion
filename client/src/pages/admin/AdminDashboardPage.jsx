import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Truck,
  Sparkles,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="Compiling boutique performance analytics..." />
      </div>
    );
  }

  const stats = data?.stats || {
    totalSales: 0,
    todaySales: 0,
    totalOrders: 0,
    ordersToday: 0,
    totalCustomers: 0,
    pendingShipments: 0,
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats.totalSales || 0).toLocaleString('en-IN')}`,
      sub: `₹${(stats.todaySales || 0).toLocaleString('en-IN')} today`,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders || 0,
      sub: `${stats.ordersToday || 0} placed today`,
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      label: 'Registered Customers',
      value: stats.totalCustomers || 0,
      sub: 'Verified accounts',
      icon: Users,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      label: 'Pending Dispatches',
      value: stats.pendingShipments || 0,
      sub: 'Awaiting courier assignment',
      icon: Truck,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Boutique Operations Overview
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-sans">
            Real-time sales, order fulfillment, inventory monitoring, and customer metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            + Add New Design
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 border border-brand-gold/40 text-brand-gold-dark hover:bg-brand-cream text-xs font-semibold rounded-lg transition-colors"
          >
            Manage Shipments
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {card.label}
                </p>
                <p className="font-serif text-2xl font-bold text-brand-dark mt-1">
                  {card.value}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-sans">{card.sub}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: 7-Day Sales Trend & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Performance */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-serif text-base font-bold text-brand-dark flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-gold-dark" />
              <span>7-Day Sales Trajectory</span>
            </h2>
            <span className="text-[11px] text-gray-400">Paid orders only</span>
          </div>

          <div className="space-y-3 pt-2">
            {data?.salesChart && data.salesChart.length > 0 ? (
              data.salesChart.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="w-24 text-gray-600 font-medium">{day.date}</span>
                  <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-brand-magenta h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.totalSales > 0
                            ? Math.min(100, Math.max(8, (day.sales / stats.totalSales) * 100))
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-24 text-right font-bold text-brand-dark font-sans">
                    ₹{day.sales.toLocaleString('en-IN')} ({day.orders})
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No sales recorded this week yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-serif text-base font-bold text-brand-dark flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h2>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              ≤ 3 Left
            </span>
          </div>

          <div className="space-y-3">
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.slice(0, 5).map((prod) => (
                <div
                  key={prod._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={prod.images?.[0] || 'https://via.placeholder.com/60'}
                    alt={prod.name}
                    className="w-10 h-12 object-cover rounded bg-brand-cream"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-brand-dark truncate">{prod.name}</p>
                    <p className="text-[10px] text-gray-400">₹{prod.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                    Low Stock
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-600 text-center py-8">
                All kurta sets are currently well stocked!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-base font-bold text-brand-dark">Latest Customer Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-brand-magenta hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-sans">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-6">Order #</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Fulfillment</th>
                <th className="py-3 px-6">Placed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-6 font-bold text-brand-dark">
                      #{o.orderNumber || o._id?.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-medium text-brand-dark">{o.user?.name || o.address?.name || 'Customer'}</p>
                      <p className="text-[10px] text-gray-400">{o.address?.mobile || o.user?.mobile}</p>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-brand-dark">
                      ₹{o.amounts?.total?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.payment?.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.payment?.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
