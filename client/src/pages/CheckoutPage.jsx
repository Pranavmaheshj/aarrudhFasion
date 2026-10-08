import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCart } from '../store/cartSlice';
import AddressModal from '../components/common/AddressModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/axios';
import {
  MapPin,
  Plus,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items: cartItems, totals: cartTotals } = useSelector((state) => state.cart);

  // Check if this checkout is for "Buy Now" single item or Cart
  const buyNowItem = location.state?.buyNowItem || null;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch addresses & cart
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const addrRes = await api.get('/addresses');
        const userAddrs = addrRes.data.addresses || [];
        setAddresses(userAddrs);

        // Pre-select default address
        const def = userAddrs.find((a) => a.isDefault);
        if (def) {
          setSelectedAddressId(def._id);
        } else if (userAddrs.length > 0) {
          setSelectedAddressId(userAddrs[0]._id);
        }

        if (!buyNowItem) {
          dispatch(fetchCart());
        }
      } catch (err) {
        toast.error('Failed to load checkout details');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [dispatch, buyNowItem]);

  // Compute checkout items & totals
  const checkoutItems = buyNowItem
    ? [
        {
          _id: 'buynow',
          product: buyNowItem.product,
          size: buyNowItem.size,
          color: buyNowItem.color,
          qty: buyNowItem.qty || 1,
        },
      ]
    : cartItems;

  const subtotal = buyNowItem
    ? buyNowItem.product.price * (buyNowItem.qty || 1)
    : cartTotals.subtotal;

  const totalMrp = buyNowItem
    ? (buyNowItem.product.mrp || buyNowItem.product.price) * (buyNowItem.qty || 1)
    : (cartTotals.totalMrp || cartTotals.subtotal);

  const discount = Math.max(0, totalMrp - subtotal);
  const deliveryFee = subtotal >= 1999 ? 0 : 99;
  const totalAmount = subtotal + deliveryFee;

  const handleAddressSaved = (newAddresses) => {
    setAddresses(newAddresses);
    const def = newAddresses.find((a) => a.isDefault);
    if (def) setSelectedAddressId(def._id);
    else if (newAddresses.length > 0) setSelectedAddressId(newAddresses[newAddresses.length - 1]._id);
  };

  const handlePayNow = async () => {
    // 1. Mandatory Address check before payment
    if (!selectedAddressId) {
      return toast.error('Please select or add a delivery address before proceeding to payment.');
    }

    if (checkoutItems.length === 0) {
      return toast.error('No items found to place an order.');
    }

    setProcessingPayment(true);
    try {
      // Step A: Create order in DB with status PENDING_PAYMENT
      const createOrderPayload = {
        addressId: selectedAddressId,
        buyNowItem: buyNowItem
          ? {
              productId: buyNowItem.productId,
              size: buyNowItem.size,
              color: buyNowItem.color,
              qty: buyNowItem.qty,
            }
          : null,
      };

      const orderRes = await api.post('/orders', createOrderPayload);
      const { order, razorpay } = orderRes.data;

      // Step B: Razorpay Checkout flow (Card & UPI)
      if (razorpay.isMock || !window.Razorpay) {
        // If developer is in development/mock mode without Razorpay API keys
        toast.loading('Processing boutique order via Razorpay secure sandbox...', { duration: 1500 });
        
        // Complete mock verification
        setTimeout(async () => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              orderId: order._id,
              razorpayOrderId: razorpay.orderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: 'mock_signature',
            });
            dispatch(clearCart());
            toast.success('Payment Received! Order placed successfully.');
            navigate(`/order-success/${verifyRes.data.order.orderNumber}`, {
              state: { order: verifyRes.data.order },
            });
          } catch (verErr) {
            toast.error(verErr.message || 'Payment verification failed');
            setProcessingPayment(false);
          }
        }, 1200);

      } else {
        // Real Razorpay SDK Checkout
        const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
        const options = {
          key: razorpay.key,
          amount: razorpay.amount,
          currency: razorpay.currency || 'INR',
          name: 'Aarrudh Fashion',
          description: `Order #${order.orderNumber} - Women's Ethnic Boutique`,
          image: '/src/assets/logo.png',
          order_id: razorpay.orderId,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify', {
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              dispatch(clearCart());
              toast.success('Payment verified successfully!');
              navigate(`/order-success/${verifyRes.data.order.orderNumber}`, {
                state: { order: verifyRes.data.order },
              });
            } catch (vErr) {
              toast.error(vErr.message || 'Payment verification failed');
              navigate(`/order-failure/${order.orderNumber}`);
            }
          },
          prefill: {
            name: selectedAddr?.name || user?.name,
            email: user?.email,
            contact: selectedAddr?.mobile || user?.mobile,
          },
          theme: {
            color: '#C2185B', // Boutique magenta theme
          },
          modal: {
            ondismiss: function () {
              setProcessingPayment(false);
              toast('Payment cancelled. Your order remains pending.', { icon: 'ℹ️' });
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(`Payment failed: ${response.error.description}`);
          navigate(`/order-failure/${order.orderNumber}`);
        });
        rzp.open();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate checkout.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Preparing secure boutique checkout..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-dark">Boutique Checkout</h1>
        <p className="text-xs text-gray-500 mt-1 font-serif italic">
          Complete delivery details and proceed to secure online payment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: 1. Address Selection, 2. Order Summary Review */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* STEP 1: DELIVERY ADDRESS (Mandatory before payment) */}
          <div className="bg-white rounded-2xl p-6 border border-brand-borderWarm shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-brand-borderWarm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-magenta text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif font-bold text-base text-brand-dark uppercase tracking-wider">
                  Select Delivery Address
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-magenta hover:text-brand-magentaDark tracking-wider uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Cards */}
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">No saved delivery address found.</p>
                <p className="text-[11px] text-gray-500 mt-0.5">A valid delivery address is mandatory before payment.</p>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="mt-4 px-5 py-2 bg-brand-magenta text-white rounded-full text-xs font-bold uppercase tracking-wider shadow"
                >
                  Add Address Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;

                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-magenta bg-brand-cream/50 shadow-sm'
                          : 'border-brand-borderWarm/70 hover:border-brand-gold bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                          {addr.name}
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {addr.addressType}
                          </span>
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-brand-magenta fill-brand-magenta text-white" />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {addr.house}, {addr.area}<br />
                        {addr.landmark && `Near ${addr.landmark}, `}
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>

                      <p className="text-xs font-semibold text-brand-dark mt-2">
                        Mobile: +91 {addr.mobile}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: ORDER ITEMS SUMMARY */}
          <div className="bg-white rounded-2xl p-6 border border-brand-borderWarm shadow-2xs">
            <div className="flex items-center gap-2 pb-4 border-b border-brand-borderWarm">
              <span className="w-6 h-6 rounded-full bg-brand-gold text-brand-dark text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-serif font-bold text-base text-brand-dark uppercase tracking-wider">
                Order Items ({checkoutItems.reduce((acc, i) => acc + i.qty, 0)})
              </h2>
            </div>

            <div className="divide-y divide-gray-100 mt-4">
              {checkoutItems.map((item, idx) => {
                const product = item.product || {};
                const img = (product.images && product.images[0]) || '';

                return (
                  <div key={idx} className="py-3 flex items-center gap-4">
                    <img src={img} alt={product.name} className="w-14 h-18 object-cover rounded-lg border border-brand-borderWarm shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-xs text-brand-dark line-clamp-1">{product.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        Size: <strong className="text-brand-magenta">{item.size}</strong> | Qty: {item.qty}
                      </p>
                      <p className="text-[10px] text-gray-400">Includes Kurta + Pant + Dupatta</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-dark">
                        ₹{((product.price || 0) * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Section: 3. Payment Method & Final Place Order */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          
          <div className="bg-white rounded-2xl p-6 border border-brand-borderWarm shadow-boutique space-y-5">
            <div className="flex items-center gap-2 border-b border-brand-borderWarm pb-3">
              <span className="w-6 h-6 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif font-bold text-base text-brand-dark uppercase tracking-wider">
                Payment Options
              </h3>
            </div>

            {/* Razorpay Badges: Cards & UPI */}
            <div className="p-3 bg-brand-cream/60 rounded-xl border border-brand-borderWarm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-magenta">
                <CreditCard className="w-4 h-4" />
                <span>Razorpay Secure Gateway</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Supports all Indian UPI Apps (Google Pay, PhonePe, Paytm), Credit/Debit Cards &amp; NetBanking.
              </p>
              <div className="flex gap-2 pt-1">
                <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700">UPI</span>
                <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700">Cards</span>
                <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700">NetBanking</span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs border-t border-brand-borderWarm pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Festive Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-brand-borderWarm pt-3 flex justify-between items-baseline text-sm font-bold text-brand-dark">
                <span>Payable Amount</span>
                <span className="text-xl text-brand-magenta">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Button - BLOCKED if no address chosen as required! */}
            {!selectedAddressId ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 bg-gray-300 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-xl cursor-not-allowed shadow-none"
                >
                  Select Address to Pay
                </button>
                <p className="text-[11px] text-amber-700 text-center font-medium flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Delivery address is mandatory before payment</span>
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePayNow}
                disabled={processingPayment}
                className="w-full py-3.5 bg-gradient-to-r from-brand-magenta to-brand-magentaDark hover:from-brand-magentaDark hover:to-brand-magenta text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-boutique flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{processingPayment ? 'Connecting Payment Gateway...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} via Razorpay`}</span>
              </button>
            )}

            <div className="text-[11px] text-gray-500 space-y-1.5 pt-2 border-t border-gray-100">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>100% Encrypted &amp; PCI-DSS Compliant</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-magenta shrink-0" />
                <span>Shipment details will be sent via SMS upon dispatch</span>
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSaved={handleAddressSaved}
      />
    </div>
  );
};

export default CheckoutPage;
