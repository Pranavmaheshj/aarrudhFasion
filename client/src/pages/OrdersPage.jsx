import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Package, ChevronRight, Truck, CheckCircle2, Clock } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to load customer orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching your boutique orders..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-brand-gold mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-brand-dark">No Orders Yet</h2>
        <p className="text-xs text-gray-500 mt-2 font-serif italic max-w-sm mx-auto">
          You haven't placed any festive orders yet. Explore our handcrafted kurta sets to find your perfect fit.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block px-8 py-3 bg-brand-magenta text-white font-bold text-xs uppercase tracking-widest rounded-full shadow hover:bg-brand-magentaDark transition-all"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-dark">My Orders &amp; Shipments</h1>
        <p className="text-xs text-gray-500 mt-1 font-serif italic">
          Track the live delivery progress of your designer ethnic ensembles
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-brand-borderWarm shadow-2xs p-5 sm:p-6 transition-all hover:shadow-boutique"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                  Order Number
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-dark">
                  #{order.orderNumber}
                </h3>
                <span className="text-xs text-gray-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-1.5 text-xs font-bold text-brand-magenta hover:bg-brand-magenta/5 border border-brand-magenta/30 rounded-full transition-colors flex items-center gap-1"
                >
                  <span>Details &amp; Tracking</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Shipment preview if shipped */}
            {order.status === 'SHIPPED' && order.shipment?.courier && (
              <div className="my-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-3">
                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Shipped via {order.shipment.courier}!</span> Tracking ID: <strong>{order.shipment.trackingId}</strong>
                  {order.shipment.agentName && ` &bull; Agent: ${order.shipment.agentName}`}
                </div>
              </div>
            )}

            {/* Line items thumbnail row */}
            <div className="divide-y divide-gray-50 mt-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded border border-brand-borderWarm shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-xs text-brand-dark line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      Size: <strong className="text-brand-magenta">{item.size}</strong> &bull; Qty: {item.qty}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-dark">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Total */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500">Total Paid Amount:</span>
              <span className="text-base font-bold text-brand-magenta">
                ₹{order.amounts?.total?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
