import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sparkles, ArrowRight } from 'lucide-react';

const HeroBanner = ({ banner }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const defaultBanner = {
    title: 'NEW LAUNCH – Diwali Festive Collection',
    subtitle: 'Exquisite 3-Piece Kurta Sets featuring handcrafted pearl, sequin, and zari detailing tailored for royal celebration.',
    bannerImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Explore Collection',
    buttonLink: '/shop'
  };

  const currentBanner = banner || defaultBanner;
  const targetLink = isAuthenticated ? (currentBanner.buttonLink || '/shop') : '/login';

  return (
    <div className="relative overflow-hidden bg-brand-cream border-b border-brand-gold/20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading and copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-dark text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Festive Edit 2024</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-brand-dark font-normal leading-tight tracking-tight">
              {currentBanner.title || defaultBanner.title}
            </h1>

            <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              {currentBanner.subtitle || defaultBanner.subtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to={targetLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-brand-magenta hover:bg-brand-magenta-dark text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>{currentBanner.buttonText || 'Explore Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-brand-gold text-brand-gold-dark hover:bg-brand-gold/10 font-medium rounded-full transition-all duration-300"
                >
                  Create Account
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-gold/20 max-w-md mx-auto lg:mx-0 text-center">
              <div>
                <p className="font-serif text-2xl font-bold text-brand-magenta">100%</p>
                <p className="text-xs text-gray-500 font-sans tracking-wide">Authentic Silk & Tissue</p>
              </div>
              <div className="border-x border-brand-gold/20">
                <p className="font-serif text-2xl font-bold text-brand-magenta">Handmade</p>
                <p className="text-xs text-gray-500 font-sans tracking-wide">Zari & Pearl Work</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-brand-magenta">Pan-India</p>
                <p className="text-xs text-gray-500 font-sans tracking-wide">Express Delivery</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-brand-gold/30 via-brand-magenta/10 to-brand-gold/20 blur-sm transform rotate-1"></div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/30 bg-white aspect-[4/5]">
                <img
                  src={currentBanner.bannerImage || defaultBanner.bannerImage}
                  alt={currentBanner.title || 'Aarrudh Festive Kurta Set'}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = defaultBanner.bannerImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="text-xs tracking-wider uppercase text-brand-gold bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">Exclusive Launch</span>
                    <p className="font-serif text-lg font-medium mt-1">3-Piece Pure Chanderi & Organza Sets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
