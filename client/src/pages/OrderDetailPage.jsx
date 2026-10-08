import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import InvoiceModal from '../components/common/InvoiceModal';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Printer,
  XCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      toast.error('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${order._id}/cancel`);
      toast.success('Order has been cancelled.');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching order tracking details..." />;
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-serif font-bold">Order not found.</h2>
        <Link to="/orders" className="text-brand-magenta font-semibold underline mt-3 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const canCancel = ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 font-medium flex items-center gap-2 mb-1">
            <Link to="/orders" className="hover:text-brand-magenta">Orders</Link>
            <span>/</span>
            <span>#{order.orderNumber}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-brand-dark">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-gray-500 font-serif italic mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setInvoiceModalOpen(true)}
            className="px-4 py-2 bg-brand-cream border border-brand-borderWarm text-brand-dark rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-creamDark transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-brand-gold" />
            <span>Print Tax Invoice</span>
          </button>

          {canCancel && (
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      {/* SHIPMENT & DISPATCH BANNER (When status is SHIPPED) */}
      {order.status === 'SHIPPED' && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-brand-cream to-amber-500/10 rounded-2xl border-2 border-brand-gold/60 shadow-boutique">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shrink-0 shadow">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Package Dispatched</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-dark">
                  Shipped via {order.shipment?.courier}
                </h3>
                <p className="text-xs text-gray-700">
                  Tracking ID: <strong className="text-brand-magenta">{order.shipment?.trackingId}</strong>
                  {order.shipment?.agentName && (
                    <span> &bull; Delivery Agent: <strong>{order.shipment.agentName}</strong> ({order.shipment.agentPhone || 'Available'})</span>
                  )}
                </p>
                {order.shipment?.expectedDelivery && (
                  <p className="text-xs text-emerald-800 font-semibold">
                    Expected Delivery: {new Date(order.shipment.expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {order.shipment?.trackingUrl && (
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-brand-magenta text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-brand-magentaDark transition-all shadow flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Track Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-brand-gold/30 flex items-center gap-2 text-[11px] text-gray-600">
            <MessageSquare className="w-4 h-4 text-brand-magenta shrink-0" />
            <span>SMS tracking alert dispatched to recipient mobile <strong>+91 {order.address?.mobile}</strong></span>
          </div>
        </div>
      )}

      {/* Timeline & Progress */}
      <div className="bg-white rounded-2xl p-6 border border-brand-borderWarm shadow-2xs">
        <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-brand-dark mb-4">
          Order Status Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-borderWarm">
          {order.timeline?.map((step, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-magenta ring-4 ring-brand-cream" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">
                  {step.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(step.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              {step.comment && (
                <p className="text-xs text-gray-600 mt-0.5 font-serif italic">{step.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Items & Shipping Address */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items Left */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-brand-borderWarm shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-brand-dark border-b border-gray-100 pb-3">
            Ensemble Items ({order.items?.length})
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-22 object-cover rounded-lg border border-brand-borderWarm shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-xs sm:text-sm text-brand-dark">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Size: <strong className="text-brand-magenta">{item.size}</strong> &bull; Qty: {item.qty}
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    Handcrafted Kurta + Straight Pant + Dupatta Set
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-brand-dark">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Payment Right */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-brand-borderWarm shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-dark border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs text-gray-700 leading-relaxed">
              <p className="font-bold text-brand-dark">{order.address?.name}</p>
              <p className="mt-1">
                {order.address?.house}, {order.address?.area}
              </p>
              {order.address?.landmark && <p>Near: {order.address?.landmark}</p>}
              <p>
                {order.address?.city}, {order.address?.state} - <strong>{order.address?.pincode}</strong>
              </p>
              <p className="mt-2 font-semibold text-brand-dark">
                Phone: +91 {order.address?.mobile}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-borderWarm shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-dark border-b border-gray-100 pb-2">
              Payment Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{order.amounts?.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.amounts?.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Festive Discount:</span>
                  <span>- ₹{order.amounts?.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{order.amounts?.delivery === 0 ? 'FREE' : `₹${order.amounts?.delivery}`}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
                <span>Total Paid:</span>
                <span className="text-brand-magenta">₹{order.amounts?.total?.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 text-[10px] text-gray-400">
                Method: Razorpay &bull; Payment ID: {order.payment?.razorpayPaymentId || 'N/A'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={order}
      />
    </div>
  );
};

export default OrderDetailPage;
