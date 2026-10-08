import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';

const OrderFailurePage = () => {
  const { orderNumber } = useParams();

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6 border border-red-200">
        <AlertCircle className="w-12 h-12" />
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
        Payment Incomplete
      </h1>

      <p className="text-xs text-gray-600 mt-2 font-serif italic">
        We were unable to complete online payment for order #{orderNumber}. Your selected items remain saved.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          to="/cart"
          className="w-full py-3 bg-brand-magenta text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-brand-magentaDark transition-all shadow flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Payment via Cart</span>
        </Link>

        <Link
          to="/shop"
          className="w-full py-3 bg-white border border-brand-borderWarm text-brand-dark text-xs font-semibold uppercase tracking-widest rounded-full hover:bg-brand-cream transition-all flex items-center justify-center gap-2"
        >
          <span>Return to Boutique</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderFailurePage;
