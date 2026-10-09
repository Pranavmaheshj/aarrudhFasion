import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, Sparkles } from 'lucide-react';
import { toggleWishlist } from '../../store/wishlistSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  // Check if this item is in the user's wishlist
  const isInWishlist = wishlistItems?.some(
    (item) => (item._id || item) === product._id
  );

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist');
      navigate('/login');
      return;
    }

    dispatch(toggleWishlist(product._id))
      .unwrap()
      .then(() => {
        toast.success(
          isInWishlist ? 'Removed from Wishlist' : 'Saved to Wishlist'
        );
      })
      .catch((err) => {
        toast.error(err || 'Failed to update wishlist');
      });
  };

  const images = product.images && product.images.length > 0 ? product.images : [
    '/images/kurta-1.jpg'
  ];

  const primaryImage = images[0];
  const hoverImage = images.length > 1 ? images[1] : primaryImage;

  // Calculate discount percentage
  const discountPercent =
    product.discount ||
    (product.mrp && product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  return (
    <div
      className="group relative bg-white rounded-xl border border-brand-gold/15 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges & Wishlist Button */}
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-[3/4] bg-brand-cream/30 overflow-hidden"
      >
        <img
          src={isHovered ? hoverImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            const fallback = '/images/kurta-1.jpg';
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNewArrival && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-brand-magenta text-white rounded-md shadow-sm">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-brand-gold-dark text-white rounded-md shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label="Save to Wishlist"
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white text-gray-700 hover:text-brand-magenta transition-all duration-200 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isInWishlist
                ? 'fill-brand-magenta text-brand-magenta'
                : 'text-gray-600 hover:text-brand-magenta'
            }`}
          />
        </button>

        {/* Rating Floating Tag */}
        {product.rating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-brand-dark shadow-sm">
            <span>{product.rating.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.ratingCount ? (
              <span className="text-gray-400 text-[10px]">| {product.ratingCount}</span>
            ) : null}
          </div>
        )}
      </Link>

      {/* Product Details Section */}
      <div className="p-3.5 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Brand & Collection Label */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">
            <span className="text-brand-gold-dark font-bold">Aarrudh Fashion</span>
            {product.collection?.name && (
              <span className="truncate max-w-[100px] text-gray-400 text-[10px]">
                {product.collection.name}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product._id}`}
            className="block font-serif text-sm font-semibold text-brand-dark hover:text-brand-magenta transition-colors line-clamp-1"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Short Description */}
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-sans">
            {product.shortDescription || product.fabric || 'Festive 3-Piece Kurta Set'}
          </p>
        </div>

        {/* Price & Size Section */}
        <div className="mt-3 pt-2 border-t border-brand-gold/10">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold text-brand-dark font-sans">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>

            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through font-sans">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="text-xs font-semibold text-emerald-600 font-sans">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Available Sizes preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-[10px] text-gray-400 font-medium">Sizes:</span>
              {product.sizes.map((s) => (
                <span
                  key={s.size}
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    s.stock > 0
                      ? 'border-gray-200 text-gray-700 bg-gray-50'
                      : 'border-dashed border-gray-200 text-gray-300 line-through'
                  }`}
                >
                  {s.size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
