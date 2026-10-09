import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  updateCartQty,
  removeCartItem,
} from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ShoppingBag,
  Trash2,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Plus,
  Minus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const festivalOffer = outletCtx?.landingContent?.festivalOffer;

  const { items, totals, isLoading } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQtyChange = (itemId, currentQty, delta, maxStock = 10) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      toast.error(`Only ${maxStock} units currently available`);
      return;
    }
    dispatch(updateCartQty({ itemId, qty: newQty }))
      .unwrap()
      .catch((err) => toast.error(err || 'Failed to update quantity'));
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId))
      .unwrap()
      .then(() => toast.success('Item removed from cart'))
      .catch((err) => toast.error(err || 'Failed to remove item'));
  };

  const handleMoveToWishlist = (item) => {
    const productId = item.product?._id || item.product;
    dispatch(toggleWishlist(productId))
      .unwrap()
      .then(() => {
        dispatch(removeCartItem(item._id));
        toast.success('Moved to Wishlist');
      })
      .catch(() => toast.error('Could not move to wishlist'));
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    const festivalEnabled = festivalOffer?.enabled !== false;
    const activeFestiveCode = (festivalOffer?.couponCode || 'FESTIVE10').toUpperCase();
    const activeDiscountPct = festivalOffer?.discountPercent ?? 10;
    const activeMinOrder = festivalOffer?.minOrderAmount ?? 0;

    if (cleanCode === activeFestiveCode) {
      if (!festivalEnabled) {
        toast.error(`The festival promotion has concluded and code ${cleanCode} is no longer active.`);
        return;
      }
      if (totals.subtotal < activeMinOrder) {
        toast.error(`Minimum order amount of ₹${activeMinOrder.toLocaleString('en-IN')} required for ${cleanCode}.`);
        return;
      }
      const disc = Math.round(totals.subtotal * (activeDiscountPct / 100));
      setCouponDiscount(disc);
      setCouponApplied(true);
      toast.success(`Festival coupon ${cleanCode} applied! ₹${disc.toLocaleString('en-IN')} saved.`);
      return;
    }

    // Standard fallback coupons
    if (cleanCode === 'WELCOME10') {
      const disc = Math.round(totals.subtotal * 0.1);
      setCouponDiscount(disc);
      setCouponApplied(true);
      toast.success(`Coupon WELCOME10 applied! ₹${disc} saved.`);
      return;
    }

    toast.error(
      festivalEnabled
        ? `Invalid code. Active festival code is ${activeFestiveCode}`
        : 'Invalid coupon code. Please verify the code entered.'
    );
  };

  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-creamDark rounded-full flex items-center justify-center text-brand-magenta mx-auto mb-4 border border-brand-borderWarm">
          <ShoppingBag className="w-10 h-10 text-brand-gold-dark" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-brand-dark">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto font-sans leading-relaxed">
          Looks like you haven't added any of our festive kurta sets yet. Explore the collection and discover your look.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-brand-magenta hover:bg-brand-magenta-dark text-white font-medium text-xs uppercase tracking-widest rounded-full transition-all shadow-md transform hover:-translate-y-0.5"
        >
          <span>Explore Boutique</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const finalSubtotal = totals?.subtotal || 0;
  const delivery = totals?.delivery ?? (finalSubtotal > 1999 ? 0 : 99);
  const finalTotal = Math.max(0, (totals?.total || finalSubtotal + delivery) - couponDiscount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-dark">Shopping Bag</h1>
        <p className="text-xs text-gray-500 mt-1 font-sans">
          {items.length} item{items.length > 1 ? 's' : ''} in your bag
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const product = item.product || {};
            const itemPrice = item.price || product.price || 0;
            const itemMrp = item.mrp || product.mrp || itemPrice;
            const discountPct = itemMrp > itemPrice ? Math.round(((itemMrp - itemPrice) / itemMrp) * 100) : 0;
            const image = item.image || product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-brand-gold/15 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm hover:border-brand-gold/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Link
                    to={`/product/${product._id || ''}`}
                    className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-brand-cream/40 border border-brand-gold/15"
                  >
                    <img
                      src={image}
                      alt={product.name || 'Kurta Set'}
                      className="w-full h-full object-cover object-top"
                    />
                  </Link>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-brand-gold-dark tracking-wider">
                      Aarrudh Fashion
                    </p>
                    <Link
                      to={`/product/${product._id || ''}`}
                      className="font-serif font-bold text-sm sm:text-base text-brand-dark hover:text-brand-magenta transition-colors line-clamp-1"
                    >
                      {product.name || item.name}
                    </Link>
                    <p className="text-xs text-gray-500 font-sans">
                      Size: <span className="font-semibold text-brand-dark">{item.size}</span>
                      {item.color && (
                        <>
                          {' '}
                          | Colour: <span className="font-semibold text-brand-dark">{item.color}</span>
                        </>
                      )}
                    </p>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm sm:text-base font-bold text-brand-dark font-sans">
                        ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {itemMrp > itemPrice && (
                        <span className="text-xs text-gray-400 line-through font-sans">
                          ₹{(itemMrp * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                      {discountPct > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-600">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item._id, item.quantity, -1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-brand-dark font-sans min-w-[32px] text-center bg-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item._id, item.quantity, 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Move to Wishlist & Remove Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(item)}
                      className="text-xs text-gray-500 hover:text-brand-magenta flex items-center gap-1 transition-colors"
                      title="Move to Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Wishlist</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item._id)}
                      className="text-xs text-gray-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Price Summary Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Promo Coupon Card */}
          <div className="bg-white rounded-xl border border-brand-gold/20 p-5 shadow-sm">
            <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-gold-dark" />
                <span>Apply Boutique Coupon</span>
              </span>
              {festivalOffer?.enabled !== false && (
                <span className="text-[10px] bg-brand-gold/20 text-brand-gold-dark px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Festive Special
                </span>
              )}
            </h3>

            {/* Dynamic Festival Offer Hint & 1-Click Code Apply */}
            {festivalOffer?.enabled !== false && festivalOffer?.couponCode && !couponApplied && (
              <div className="mb-3 p-2.5 bg-gradient-to-r from-amber-50 to-pink-50 rounded-lg border border-brand-gold/30 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-brand-dark truncate">
                    🎉 {festivalOffer.festivalName || 'Festive Offer'} ({festivalOffer.discountPercent || 10}% OFF)
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Use code <span className="font-mono font-bold text-brand-magenta">{festivalOffer.couponCode}</span>
                    {festivalOffer.minOrderAmount > 0 ? ` on orders above ₹${festivalOffer.minOrderAmount}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCouponCode(festivalOffer.couponCode)}
                  className="px-2.5 py-1 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-[10px] font-bold rounded shrink-0 transition-colors uppercase tracking-wider shadow-2xs"
                >
                  Use Code
                </button>
              </div>
            )}

            <form onSubmit={applyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder={festivalOffer?.enabled !== false ? `e.g. ${festivalOffer?.couponCode || 'FESTIVE10'}` : 'Enter Coupon Code'}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow px-3 py-2 text-xs uppercase tracking-wider rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-dark hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Apply
              </button>
            </form>
            {couponApplied && (
              <p className="text-[11px] text-emerald-600 mt-2 font-medium">
                ✓ Coupon applied! Saved ₹{couponDiscount}
              </p>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-xl border border-brand-gold/20 p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-dark pb-2 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-gray-600 font-sans">
              <div className="flex justify-between">
                <span>Total MRP:</span>
                <span>₹{(totals?.totalMrp || finalSubtotal).toLocaleString('en-IN')}</span>
              </div>

              {(totals?.discount > 0 || couponDiscount > 0) && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Bag Discount:</span>
                  <span>-₹{((totals?.discount || 0) + couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Convenience / Delivery Fee:</span>
                <span>
                  {delivery === 0 ? (
                    <span className="text-emerald-600 font-semibold uppercase text-[11px]">Free</span>
                  ) : (
                    `₹${delivery}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-gold/20 flex justify-between items-baseline font-sans">
              <span className="font-bold text-brand-dark text-sm">Estimated Total:</span>
              <span className="font-bold text-brand-magenta text-xl">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand-magenta hover:bg-brand-magenta-dark text-white font-medium text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 transform hover:-translate-y-0.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Boutique Promises */}
          <div className="bg-brand-cream/50 rounded-xl border border-brand-gold/15 p-4 space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-700">
              <ShieldCheck className="w-4 h-4 text-brand-gold-dark flex-shrink-0" />
              <span>100% Handcrafted Authenticity Guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-700">
              <Truck className="w-4 h-4 text-brand-gold-dark flex-shrink-0" />
              <span>Pan-India Safe Express Courier Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-700">
              <RotateCcw className="w-4 h-4 text-brand-gold-dark flex-shrink-0" />
              <span>Easy 7-Day Size Exchange Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
