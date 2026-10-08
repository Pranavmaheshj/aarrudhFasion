import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../store/wishlistSlice';
import ProductCard from '../components/common/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (items.length === 0 && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center text-brand-magenta mx-auto mb-4 border border-brand-gold/30">
          <Heart className="w-10 h-10 fill-brand-magenta" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-brand-dark">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto font-sans leading-relaxed">
          Save your favorite kurta sets and festive designs here for quick access later.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-brand-magenta text-white font-medium text-xs uppercase tracking-widest rounded-full hover:bg-brand-magenta-dark transition-all shadow-md"
        >
          <span>Explore Boutique</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-dark">My Saved Wishlist</h1>
        <p className="text-xs text-gray-500 mt-1 font-sans">
          {items.length} festive ethnic piece{items.length > 1 ? 's' : ''} saved to your curated collection
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
