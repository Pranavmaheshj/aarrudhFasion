import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroBanner from '../components/common/HeroBanner';
import CollectionCard from '../components/common/CollectionCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/axios';
import { Sparkles, Crown } from 'lucide-react';

const LandingPage = () => {
  const { landingContent } = useOutletContext();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/collections');
        setCollections(res.data.collections || []);
      } catch (err) {
        console.error('Failed to load collections:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Admin-Editable Hero Banner */}
      <HeroBanner hero={landingContent?.hero} festivalOffer={landingContent?.festivalOffer} />

      {/* 2. Collections Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-magenta mb-2">
            <Crown className="w-4 h-4 text-brand-gold" />
            <span>Curated Lookbooks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-dark tracking-tight">
            Our Designer Collections
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto mt-3" />
          <p className="mt-3 text-sm text-gray-600 font-serif italic">
            Explore handcrafted ethnic kurta sets meticulously styled with fine tissue silks, royal pearl yokes, and festive zari borders.
          </p>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <LoadingSpinner text="Loading boutique collections..." />
        ) : collections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-brand-borderWarm p-8">
            <p className="text-gray-500 font-serif italic">No collections currently published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
            {collections.map((col) => (
              <CollectionCard key={col._id} collection={col} />
            ))}
          </div>
        )}
      </div>

      {/* Boutique Story / Heritage Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#2A0818] via-[#4A0E2B] to-[#2A0818] text-[#FFF9EC] p-8 sm:p-12 border border-brand-gold/40 shadow-boutique-lg">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-brand-goldShimmer text-xs tracking-widest uppercase font-bold mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Aarrudh Fashion Craftsmanship</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Every Kurta Set Tells A Story Of Royal Indian Tradition
            </h3>
            <p className="mt-4 text-xs sm:text-sm text-brand-cream/80 font-serif italic leading-relaxed">
              From the weavers of Chanderi and Banaras to our master artisans in Bengaluru, every ensemble includes a coordinated kurta, tailored pant, and a fluid statement dupatta detailed with authentic pearl and stone embellishments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
