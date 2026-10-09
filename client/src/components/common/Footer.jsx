import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

const Footer = ({ content }) => {
  const footerData = content?.footer || {
    boutiqueName: "Aarrudh Fashion",
    tagline: "Women's Boutique",
    address: "14, Royal Heritage Square, Commercial Street, Bengaluru, Karnataka 560001",
    phone: "+91 98765 43210",
    email: "care@aarrudhfashion.com",
    workingHours: "Mon - Sat: 10:30 AM to 8:30 PM",
    socials: {
      instagram: "https://instagram.com/aarrudhfashion",
      facebook: "https://facebook.com/aarrudhfashion",
      whatsapp: "+919876543210",
    },
  };

  return (
    <footer className="bg-[#FAF3E0] border-t border-brand-borderWarm text-brand-dark pt-12 pb-8 mt-16">
      {/* Value Proposition Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-brand-borderWarm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">Handcrafted Kurta Sets</h4>
            <p className="text-xs text-gray-600 mt-1">Exquisite Zari, Pearl &amp; Sequins</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-magenta/10 flex items-center justify-center text-brand-magenta mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">Express Shipping</h4>
            <p className="text-xs text-gray-600 mt-1">Free Delivery on ₹1,999+ Across India</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">Secure Payments</h4>
            <p className="text-xs text-gray-600 mt-1">100% Safe Cards &amp; UPI via Razorpay</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-magenta/10 flex items-center justify-center text-brand-magenta mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">Boutique Assistance</h4>
            <p className="text-xs text-gray-600 mt-1">Custom Styling &amp; Size Exchange</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <img
              src={logoImg}
              alt="Aarrudh Fashion"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.png';
              }}
            />
            <p className="text-xs text-gray-600 leading-relaxed font-serif">
              A luxury women's boutique celebrating Indian ethnic heritage. Hand-embroidered kurta sets designed for festive ceremonies, weddings, and celebratory moments.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              {footerData.socials?.instagram && (
                <a
                  href={footerData.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-brand-borderWarm flex items-center justify-center text-brand-magenta hover:bg-brand-magenta hover:text-white transition-all shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {footerData.socials?.facebook && (
                <a
                  href={footerData.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-brand-borderWarm flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-white transition-all shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {footerData.socials?.whatsapp && (
                <a
                  href={`https://wa.me/${footerData.socials.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-brand-borderWarm flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-brand-dark tracking-wide uppercase border-b border-brand-gold/40 pb-2 inline-block">
              Boutique Collections
            </h3>
            <ul className="space-y-2 text-xs text-gray-700">
              <li><Link to="/shop?collection=diwali-collection-new-launch" className="hover:text-brand-magenta transition-colors">Diwali Launch Collection</Link></li>
              <li><Link to="/shop?fabric=Tissue" className="hover:text-brand-magenta transition-colors">Lustrous Tissue Silk Sets</Link></li>
              <li><Link to="/shop?neckStyle=V-Neck" className="hover:text-brand-magenta transition-colors">Artisanal V-Neck Sets</Link></li>
              <li><Link to="/shop?neckStyle=Round+Neck" className="hover:text-brand-magenta transition-colors">Royal Pearl Work Yoke</Link></li>
              <li><Link to="/shop" className="hover:text-brand-magenta transition-colors">All 3-Piece Kurta Sets</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-brand-dark tracking-wide uppercase border-b border-brand-gold/40 pb-2 inline-block">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs text-gray-700">
              <li><Link to="/orders" className="hover:text-brand-magenta transition-colors">Track Your Shipment</Link></li>
              <li><Link to="/cart" className="hover:text-brand-magenta transition-colors">Shopping Bag</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-magenta transition-colors">Saved Wishlist</Link></li>
              <li><span className="text-gray-500">Free Exchanges (Within 7 Days)</span></li>
              <li><span className="text-gray-500">Size &amp; Fit Consultation</span></li>
            </ul>
          </div>

          {/* Boutique Visit & Contact */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-brand-dark tracking-wide uppercase border-b border-brand-gold/40 pb-2 inline-block">
              Boutique Studio
            </h3>
            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>{footerData.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <a href={`tel:${footerData.phone}`} className="hover:text-brand-magenta font-medium">{footerData.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a href={`mailto:${footerData.email}`} className="hover:text-brand-magenta font-medium">{footerData.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                <span>{footerData.workingHours || "Mon - Sat: 10:30 AM - 8:30 PM"}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-brand-borderWarm text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} {footerData.boutiqueName}. All Rights Reserved. Crafted with royal elegance.</p>
        <p className="flex items-center gap-2">
          <span>Accepting UPI, RuPay, Visa, MasterCard &amp; NetBanking</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
