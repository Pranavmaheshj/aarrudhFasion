import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, ArrowRight, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';
import api from '../api/axios';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#B8860B', '#C2185B', '#D4A62A', '#FFF9EC'],
    });

    if (!order && orderNumber) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${orderNumber}`);
          setOrder(res.data.order);
        } catch (err) {
          console.error('Error fetching confirmed order:', err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderNumber, order]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-sm border border-emerald-200">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="inline-block px-3 py-1 bg-brand-gold/15 text-brand-dark rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-brand-gold/40">
        Payment Verified &bull; Order Confirmed
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
        Thank You For Shopping With Us!
      </h1>

      <p className="text-sm text-gray-600 font-serif italic mt-2 max-w-lg mx-auto">
        Your order <strong>#{order?.orderNumber || orderNumber}</strong> has been received and is being carefully packed at Aarrudh Fashion boutique.
      </p>

      {/* SMS & Tracking Notification Callout */}
      <div className="mt-8 p-5 bg-brand-cream/80 border border-brand-borderWarm rounded-2xl text-left max-w-xl mx-auto space-y-3">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-brand-magenta shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700">
            <h4 className="font-bold text-brand-dark">SMS Delivery Updates Enabled</h4>
            <p className="mt-1">
              Once our boutique admin assigns the courier partner and tracking details, an SMS with the tracking link and agent contact will be automatically sent to <strong>+91 {order?.address?.mobile || 'your registered number'}</strong>.
            </p>
          </div>
        </div>

        {order?.address && (
          <div className="flex items-start gap-3 pt-3 border-t border-brand-borderWarm/60">
            <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <h4 className="font-bold text-brand-dark">Delivering To:</h4>
              <p className="mt-0.5">
                {order.address.name} &bull; {order.address.house}, {order.address.area}, {order.address.city} - {order.address.pincode}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Actions */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/orders/${order?._id || orderNumber}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-magenta text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-brand-magentaDark transition-all shadow-boutique flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>View Order Status</span>
        </Link>

        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-white border border-brand-borderWarm text-brand-dark text-xs font-bold uppercase tracking-widest rounded-full hover:bg-brand-cream transition-all shadow-2xs flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
