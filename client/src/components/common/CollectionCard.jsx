import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';

const CollectionCard = ({ collection }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const targetLink = isAuthenticated
    ? `/shop?collection=${collection.slug}`
    : `/login?redirect=${encodeURIComponent(`/shop?collection=${collection.slug}`)}`;

  const defaultImage =
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";

  const primaryImage =
    collection.images && collection.images.length > 0
      ? collection.images[0]
      : defaultImage;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-borderWarm shadow-boutique hover:shadow-boutique-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-creamDark">
        <img
          src={primaryImage}
          alt={collection.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            if (e.currentTarget.src !== defaultImage) {
              e.currentTarget.src = defaultImage;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {collection.productCount !== undefined && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-brand-dark px-3 py-1 rounded-full text-xs font-semibold shadow">
            {collection.productCount} Designs
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-1.5 text-brand-goldShimmer text-xs tracking-wider uppercase font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Designer Showcase</span>
          </div>
          <h3 className="font-serif text-2xl font-bold leading-snug drop-shadow-sm">
            {collection.name}
          </h3>
        </div>
      </div>

      {/* Description & Action */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-[#FFFDF7]">
        <p className="text-gray-600 text-sm font-serif italic line-clamp-3 leading-relaxed mb-6">
          {collection.description}
        </p>

        <Link
          to={targetLink}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-brand-magenta text-white hover:bg-brand-magentaDark font-semibold text-xs tracking-widest uppercase transition-all shadow-sm group/btn"
        >
          <span>Explore Collection</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default CollectionCard;
