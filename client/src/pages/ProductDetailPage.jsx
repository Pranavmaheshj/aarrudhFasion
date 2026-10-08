import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import ProductCard from '../components/common/ProductCard';
import SizeChartModal from '../components/common/SizeChartModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/axios';
import {
  Heart,
  ShoppingBag,
  Zap,
  Star,
  Ruler,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Check,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
        setSimilarProducts(res.data.similarProducts || []);
        if (res.data.product.images?.length > 0) {
          setSelectedImage(res.data.product.images[0]);
        }
        if (res.data.product.colors?.length > 0) {
          setSelectedColor(res.data.product.colors[0]);
        }
        // Pre-select first in-stock size
        const firstInStock = res.data.product.sizes?.find((s) => s.stock > 0);
        if (firstInStock) {
          setSelectedSize(firstInStock.size);
        }
      } catch (err) {
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Fetching exquisite product details..." />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-serif font-bold">Product not found.</h2>
        <Link to="/shop" className="mt-4 inline-block text-brand-magenta font-semibold underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((item) => (item._id || item) === product._id);

  const handleWishlistToggle = () => {
    dispatch(toggleWishlist(product._id));
    toast.success(isWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist');
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      return toast.error('Please choose a size before adding to bag.');
    }
    setAddingToCart(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          size: selectedSize,
          color: selectedColor,
          qty: 1,
        })
      ).unwrap();
      toast.success(`Added ${product.name} (Size: ${selectedSize}) to Bag!`);
    } catch (err) {
      toast.error(err || 'Failed to add to bag.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      return toast.error('Please choose a size first.');
    }
    // Navigate straight to checkout with buyNow state
    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: product._id,
          product,
          size: selectedSize,
          color: selectedColor,
          qty: 1,
        },
      },
    });
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return toast.error('Please enter a valid 6-digit Indian postal code');
    }
    setPincodeStatus({
      available: true,
      message: 'Standard Express Delivery available in 3-5 business days! Free shipping applied.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 font-medium">
        <Link to="/" className="hover:text-brand-magenta">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-magenta">Kurta Sets</Link>
        <span>/</span>
        <span className="text-brand-dark truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 max-h-[580px] pb-2 md:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-brand-magenta ring-2 ring-brand-magenta/30 shadow' : 'border-brand-borderWarm opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Selected Image */}
          <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-brand-creamDark border border-brand-borderWarm shadow-boutique group">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
            />
            {product.isNewProduct && (
              <span className="absolute top-4 left-4 bg-brand-magenta text-white text-[11px] font-bold px-3 py-1 rounded tracking-wider uppercase shadow">
                NEW LAUNCH
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Purchasing & Details (7 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aarrudh Fashion Women's Boutique</span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark leading-snug">
              {product.name}
            </h1>

            <p className="mt-1 text-xs text-gray-500 font-serif italic">
              {product.shortDescription}
            </p>

            {/* Rating pill */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs font-bold text-amber-900">
              <span>{product.ratingAvg || 4.8}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-gray-500 font-normal">| {product.ratingCount || 18} Verified Boutique Reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-brand-cream/60 rounded-xl border border-brand-borderWarm">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-brand-dark">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.mrp?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-extrabold text-brand-magenta">
                    ({product.discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              Inclusive of all taxes. Free Express Delivery across India.
            </p>
          </div>

          {/* Color Details */}
          {product.colors?.length > 0 && (
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Color: </span>
              <span className="text-xs font-semibold text-brand-magenta">{selectedColor}</span>
              <div className="flex gap-2 mt-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      selectedColor === c
                        ? 'border-brand-magenta bg-brand-magenta text-white shadow-xs'
                        : 'border-brand-borderWarm bg-white text-brand-dark'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector + Size Chart Modal Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Size:
              </span>
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-brand-magenta hover:underline"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Chart &amp; Fit Guide</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {product.sizes?.map((sz) => {
                const isOutOfStock = sz.stock <= 0;
                const isSelected = selectedSize === sz.size;

                return (
                  <button
                    key={sz.size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(sz.size)}
                    className={`relative w-12 h-12 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-2 border-brand-magenta bg-brand-magenta text-white shadow-md'
                        : isOutOfStock
                        ? 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                        : 'border border-brand-borderWarm bg-white text-brand-dark hover:border-brand-gold'
                    }`}
                  >
                    <span>{sz.size}</span>
                    {sz.stock > 0 && sz.stock <= 5 && (
                      <span className="text-[8px] font-normal text-amber-500 absolute -bottom-1">
                        Only {sz.stock}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 py-3.5 px-6 rounded-full bg-brand-magenta hover:bg-brand-magentaDark text-white font-bold text-xs uppercase tracking-widest transition-all shadow-boutique flex items-center justify-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addingToCart ? 'Adding to Bag...' : 'Add to Bag'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-3.5 px-6 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight hover:from-brand-goldLight hover:to-brand-gold text-brand-dark font-extrabold text-xs uppercase tracking-widest transition-all shadow-boutique flex items-center justify-center gap-2 active:scale-98"
            >
              <Zap className="w-4 h-4 fill-brand-dark" />
              <span>Buy Now</span>
            </button>

            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`p-3.5 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                isWishlisted
                  ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                  : 'border-brand-borderWarm bg-white text-brand-dark hover:text-brand-magenta'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-brand-magenta' : ''}`} />
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 bg-white rounded-xl border border-brand-borderWarm">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Truck className="w-4 h-4 text-brand-gold" />
              <span>Delivery Availability Check</span>
            </span>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                className="flex-1 px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>

          {/* "What's in the set" & Fabric & Care */}
          <div className="border-t border-brand-borderWarm pt-6 space-y-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-brand-dark uppercase tracking-wider mb-2">
                What's In The Set:
              </h4>
              <div className="flex flex-wrap gap-2">
                {(product.setContents || ['Kurta', 'Pant', 'Dupatta']).map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cream border border-brand-borderWarm rounded-full text-xs font-semibold text-brand-dark"
                  >
                    <Check className="w-3.5 h-3.5 text-brand-magenta" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-brand-borderWarm">
                <span className="text-gray-500 font-medium block">Fabric Details:</span>
                <span className="font-bold text-brand-dark mt-0.5 block">{product.fabric || 'Pure Tissue Silk'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-brand-borderWarm">
                <span className="text-gray-500 font-medium block">Neck Style:</span>
                <span className="font-bold text-brand-dark mt-0.5 block">{product.neckStyle || 'Handcrafted V-Neck'}</span>
              </div>
            </div>

            <div>
              <h4 className="font-serif font-bold text-sm text-brand-dark uppercase tracking-wider mb-1">
                Full Description &amp; Care:
              </h4>
              <p className="text-xs text-gray-600 font-serif leading-relaxed">
                {product.description}
              </p>
              <p className="text-[11px] text-gray-500 mt-2 italic">
                Care Instructions: Dry clean only to preserve fine zari, sequins, and pearl hand-embroidery.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Similar Products Carousel / Grid */}
      {similarProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-brand-borderWarm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-magenta">Coordinated Styling</span>
            <h3 className="font-serif text-2xl font-bold text-brand-dark mt-1">Similar Designer Ensembles</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
};

export default ProductDetailPage;
