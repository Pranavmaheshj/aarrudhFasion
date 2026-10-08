import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles, CheckCircle } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const invoiceRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  const subtotal = order.subtotal || order.totalAmount || 0;
  const discount = order.discount || 0;
  const shipping = order.deliveryFee || order.shippingFee || 0;
  const grandTotal = order.totalAmount || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-brand-gold/30">
          
          {/* Action Header (Hidden during print) */}
          <div className="flex items-center justify-between px-6 py-4 bg-brand-cream border-b border-brand-gold/20 print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-brand-dark">Tax Invoice</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {order.paymentStatus || 'PAID'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-magenta text-white hover:bg-brand-magenta-dark text-xs font-semibold shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div ref={invoiceRef} className="p-8 sm:p-10 space-y-8 bg-white print:p-0">
            {/* Boutique Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold tracking-tight text-brand-dark">
                    Aarrudh Fashion
                  </span>
                  <span className="text-[10px] tracking-widest uppercase bg-brand-gold/20 text-brand-gold-dark px-2 py-0.5 rounded font-bold">
                    Women's Boutique
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Exquisite Handcrafted Ethnic Kurta Sets</p>
                <p className="text-xs text-gray-500 mt-2">
                  Email: support@aarrudhfashion.com | Tel: +91 98765 43210
                </p>
                <p className="text-xs text-gray-400">GSTIN: 27AABCA1234F1Z5</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-brand-cream border border-brand-gold/30 text-brand-gold-dark rounded">
                  Original For Recipient
                </span>
                <p className="text-xs font-bold text-brand-dark mt-2">
                  Invoice #: INV-{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">Order ID: {order.orderNumber || order._id}</p>
                <p className="text-xs text-gray-500">Date: {formattedDate}</p>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-brand-cream/30 p-4 rounded-xl border border-brand-gold/15">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark mb-1">
                  Billed &amp; Shipped To:
                </h4>
                <p className="text-sm font-semibold text-brand-dark">
                  {order.shippingAddress?.fullName || order.user?.name || 'Valued Customer'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {order.shippingAddress?.streetAddress || order.shippingAddress?.address || ''}
                </p>
                <p className="text-xs text-gray-600">
                  {[
                    order.shippingAddress?.city,
                    order.shippingAddress?.state,
                    order.shippingAddress?.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Mobile: {order.shippingAddress?.phone || order.user?.phone || 'N/A'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark mb-1">
                  Payment Details:
                </h4>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>
                    <span className="font-medium text-brand-dark">Payment Method:</span>{' '}
                    {order.paymentMethod || 'Online (Razorpay UPI/Card)'}
                  </p>
                  <p>
                    <span className="font-medium text-brand-dark">Payment Status:</span>{' '}
                    <span className="text-emerald-700 font-bold">{order.paymentStatus || 'PAID'}</span>
                  </p>
                  {order.paymentDetails?.razorpayPaymentId && (
                    <p>
                      <span className="font-medium text-brand-dark">Transaction Ref:</span>{' '}
                      {order.paymentDetails.razorpayPaymentId}
                    </p>
                  )}
                  {order.shipment?.trackingNumber && (
                    <p>
                      <span className="font-medium text-brand-dark">Courier Tracking:</span>{' '}
                      {order.shipment.courier} ({order.shipment.trackingNumber})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans divide-y divide-gray-200">
                <thead>
                  <tr className="bg-brand-cream/80 text-brand-dark font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Size</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => {
                    const price = item.price || item.product?.price || 0;
                    const lineTotal = price * (item.quantity || 1);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-brand-dark">
                            {item.name || item.product?.name || 'Ethnic Kurta Set'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {item.color || item.product?.color || 'Festive Ensemble'}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">{item.size || 'M'}</td>
                        <td className="py-3 px-3 text-center font-medium">{item.quantity || 1}</td>
                        <td className="py-3 px-3 text-right font-medium">₹{price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-bold text-brand-dark">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery / Shipping:</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-dark pt-2 border-t border-brand-gold/30">
                  <span>Grand Total (INR):</span>
                  <span className="text-brand-magenta">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Invoice Signoff */}
            <div className="border-t border-dashed border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
              <p>Thank you for choosing Aarrudh Fashion! For assistance, write to care@aarrudhfashion.com</p>
              <div className="text-right">
                <p className="font-serif italic text-brand-dark">Authorized Signatory</p>
                <p className="text-[11px]">Aarrudh Fashion Boutique</p>
              </div>
            </div>

          </div>

          {/* Footer Close Button */}
          <div className="px-6 py-3 bg-gray-50 flex justify-end print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
