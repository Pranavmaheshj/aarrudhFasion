import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Save,
  Sparkles,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin,
  Globe,
  Gift,
  Tag,
  XCircle,
  CheckCircle,
  Eye,
  ExternalLink,
  Store,
  ArrowRight,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LandingEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hero, setHero] = useState({
    title: '',
    subtitle: '',
    image: '',
    ctaText: '',
  });
  const [festivalOffer, setFestivalOffer] = useState({
    enabled: true,
    festivalName: 'Diwali Festive Launch',
    offerText: 'Diwali Festive Launch: Free Express Shipping on Orders Above ₹1,999 | Handcrafted Kurta Sets',
    couponCode: 'FESTIVE10',
    discountPercent: 10,
    minOrderAmount: 1999,
    badgeText: 'Festive Edit • Royal Collection',
  });
  const [footer, setFooter] = useState({
    boutiqueName: 'Aarrudh Fashion',
    tagline: "Women's Boutique",
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    socials: {
      instagram: '',
      facebook: '',
      whatsapp: '',
      pinterest: '',
    },
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/landing');
        if (res.data?.content) {
          const { hero: h, footer: f, festivalOffer: fo } = res.data.content;
          if (h) setHero((prev) => ({ ...prev, ...h }));
          if (f) setFooter((prev) => ({ ...prev, ...f, socials: { ...prev.socials, ...(f.socials || {}) } }));
          if (fo) setFestivalOffer((prev) => ({ ...prev, ...fo }));
        }
      } catch (err) {
        toast.error('Failed to load current landing settings');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      await api.put('/admin/landing', { hero, footer, festivalOffer });
      toast.success('Landing page, festival offer, and boutique footer updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save landing settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="Loading landing CMS content..." />
      </div>
    );
  }

  const isFestivalActive = festivalOffer?.enabled !== false;

  return (
    <form onSubmit={handleSave} className="w-full space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold-dark">
              <Sparkles className="w-5 h-5 text-brand-gold-dark" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-brand-dark">
              Landing Page &amp; Storefront CMS
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Configure the public homepage hero banner, festival seasonal campaign controls, boutique store details, and social channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:border-brand-gold/60 bg-white text-gray-700 hover:text-brand-magenta text-xs font-semibold rounded-lg shadow-2xs transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Store</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Responsive Two-Column Layout (Fits all screen sizes) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor Controls (8 cols on xl screens) */}
        <div className="xl:col-span-7 2xl:col-span-8 space-y-6">
          
          {/* 1. Festival Time Offers & Seasonal Campaign Card */}
          <div
            className={`rounded-2xl border p-5 sm:p-6 shadow-sm transition-all space-y-4 ${
              isFestivalActive
                ? 'bg-gradient-to-br from-amber-50/70 via-white to-pink-50/50 border-brand-gold/40'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100 gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                  <Gift className="w-5 h-5 text-brand-magenta" />
                  <span>Festival Time Offers &amp; Campaign Controls</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Activate or disable festival banners, top announcement strip, and coupon discounts with one switch.
                </p>
              </div>

              {/* Master Toggle Switch */}
              <div className="flex items-center gap-3 self-start sm:self-auto bg-white/90 px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isFestivalActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isFestivalActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                  {isFestivalActive ? 'Active on Storefront' : 'Disabled (Hidden)'}
                </span>

                <button
                  type="button"
                  onClick={() => setFestivalOffer({ ...festivalOffer, enabled: !isFestivalActive })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isFestivalActive ? 'bg-brand-magenta' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={isFestivalActive}
                  title={isFestivalActive ? 'Click to Disable Festival Offer' : 'Click to Enable Festival Offer'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isFestivalActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Informational Live / Disabled Banner */}
            {!isFestivalActive ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                <span>
                  <strong>Festival Mode is currently OFF.</strong> The top announcement strip on the navbar is hidden from customers, and festival coupon codes will not apply at checkout.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Festival Mode is LIVE.</strong> The top announcement bar is actively displayed across the store, and coupon code <strong>{festivalOffer.couponCode || 'FESTIVE10'}</strong> is active for customers.
                </span>
              </div>
            )}

            {/* 1-Click Festival Presets */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                1-Click Campaign Presets (Click to autofill)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  {
                    name: '🪔 Diwali Special',
                    festivalName: 'Diwali Festive Launch',
                    offerText: 'Diwali Festive Launch: Free Express Shipping on Orders Above ₹1,999 | Handcrafted Kurta Sets',
                    couponCode: 'DIWALI20',
                    discountPercent: 20,
                    minOrderAmount: 1999,
                    badgeText: 'Diwali Edit • Royal Festive',
                  },
                  {
                    name: '🌾 Pongal Special',
                    festivalName: 'Pongal Festive Celebration',
                    offerText: 'Pongal Special: Flat 15% OFF + Free Matching Potli on Orders Above ₹2,499!',
                    couponCode: 'PONGAL15',
                    discountPercent: 15,
                    minOrderAmount: 2499,
                    badgeText: 'Harvest Grandeur • Silk Sets',
                  },
                  {
                    name: '✨ Navratri Edit',
                    festivalName: 'Navratri Dandiya Edit',
                    offerText: 'Navratri Celebrations: 10% OFF on all Vibrant Anarkali & Straight Kurta Sets with Code NAVRATRI10',
                    couponCode: 'NAVRATRI10',
                    discountPercent: 10,
                    minOrderAmount: 1499,
                    badgeText: 'Navratri Edit • Twirl in Tradition',
                  },
                  {
                    name: '🌙 Eid Glamour',
                    festivalName: 'Eid Festive Glamour',
                    offerText: 'Eid Mubarak Edit: Enjoy 15% OFF on Royal Zari & Pearl Embroidered Ensembles | Code EID15',
                    couponCode: 'EID15',
                    discountPercent: 15,
                    minOrderAmount: 1999,
                    badgeText: 'Eid Royal Collection',
                  },
                  {
                    name: '💍 Wedding Season',
                    festivalName: 'Royal Wedding Season',
                    offerText: 'Wedding Season Special: Complimentary Express Shipping + 10% OFF Above ₹2,999 | Code WEDDING10',
                    couponCode: 'WEDDING10',
                    discountPercent: 10,
                    minOrderAmount: 2999,
                    badgeText: 'Boutique Bridal & Guest Edit',
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFestivalOffer({
                        ...festivalOffer,
                        enabled: true,
                        festivalName: preset.festivalName,
                        offerText: preset.offerText,
                        couponCode: preset.couponCode,
                        discountPercent: preset.discountPercent,
                        minOrderAmount: preset.minOrderAmount,
                        badgeText: preset.badgeText,
                      });
                      toast.success(`Loaded preset: ${preset.name}! Click "Publish Changes" to save.`);
                    }}
                    className="p-2 text-center bg-white hover:bg-brand-cream border border-brand-gold/30 hover:border-brand-gold rounded-xl text-[11px] font-semibold text-brand-dark transition-all shadow-2xs hover:shadow-xs group"
                  >
                    <span className="block truncate">{preset.name}</span>
                    <span className="text-[10px] text-brand-gold-dark font-normal">
                      {preset.discountPercent}% OFF
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Festival Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Campaign / Festival Name
                </label>
                <input
                  type="text"
                  value={festivalOffer.festivalName || ''}
                  onChange={(e) => setFestivalOffer({ ...festivalOffer, festivalName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  placeholder="e.g. Diwali Festive Launch"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Hero Festive Badge Tagline
                </label>
                <input
                  type="text"
                  value={festivalOffer.badgeText || ''}
                  onChange={(e) => setFestivalOffer({ ...festivalOffer, badgeText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  placeholder="e.g. Festive Edit • Royal Collection"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Festival Coupon Code
                </label>
                <input
                  type="text"
                  value={festivalOffer.couponCode || ''}
                  onChange={(e) => setFestivalOffer({ ...festivalOffer, couponCode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-xs uppercase font-mono tracking-wider rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  placeholder="e.g. FESTIVE10"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Top Announcement Bar Ticker Text
                </label>
                <input
                  type="text"
                  value={festivalOffer.offerText || ''}
                  onChange={(e) => setFestivalOffer({ ...festivalOffer, offerText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  placeholder="Banner text displayed at the very top of every storefront page"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={festivalOffer.discountPercent ?? 10}
                  onChange={(e) => setFestivalOffer({ ...festivalOffer, discountPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Min. Order Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={festivalOffer.minOrderAmount ?? 1999}
                  onChange={(e) => setFestivalOffer({ ...festivalOffer, minOrderAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                />
              </div>
            </div>
          </div>

          {/* 2. Hero Banner Showcase Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-dark pb-2 border-b border-gray-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-gold-dark" />
              <span>Hero Banner Showcase</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Banner Headline / Title
                </label>
                <input
                  type="text"
                  value={hero.title}
                  onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta font-serif text-sm"
                  placeholder="e.g. NEW LAUNCH – Diwali Festive Collection"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={hero.subtitle}
                  onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta leading-relaxed"
                  placeholder="Handcrafted Kurta Sets with Royal Pearl & Zari Embroidery for Festive Elegance..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Banner Image URL
                </label>
                <input
                  type="text"
                  value={hero.image}
                  onChange={(e) => setHero({ ...hero, image: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta font-mono text-[11px]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={hero.ctaText}
                  onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  placeholder="Explore The Collection"
                />
              </div>
            </div>
          </div>

          {/* 3. Boutique Details & Storefront Footer Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-dark pb-2 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-gold-dark" />
              <span>Boutique Information &amp; Footer</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Boutique Name
                </label>
                <input
                  type="text"
                  value={footer.boutiqueName}
                  onChange={(e) => setFooter({ ...footer, boutiqueName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={footer.tagline}
                  onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Contact Phone / Mobile
                </label>
                <input
                  type="text"
                  value={footer.phone}
                  onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={footer.email}
                  onChange={(e) => setFooter({ ...footer, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={footer.workingHours || ''}
                  onChange={(e) => setFooter({ ...footer, workingHours: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  placeholder="Mon - Sat: 10:30 AM to 8:30 PM"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Store Physical Address
                </label>
                <input
                  type="text"
                  value={footer.address}
                  onChange={(e) => setFooter({ ...footer, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-3 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-gold-dark" />
                <span>Social Handles &amp; WhatsApp Integration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={footer.socials?.instagram || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socials: { ...footer.socials, instagram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="https://instagram.com/aarrudhfashion"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">WhatsApp Mobile Number</label>
                  <input
                    type="text"
                    value={footer.socials?.whatsapp || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socials: { ...footer.socials, whatsapp: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="+919876543210"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={footer.socials?.facebook || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socials: { ...footer.socials, facebook: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="https://facebook.com/aarrudhfashion"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Pinterest URL</label>
                  <input
                    type="text"
                    value={footer.socials?.pinterest || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socials: { ...footer.socials, pinterest: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="https://pinterest.com/aarrudhfashion"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Storefront Preview (4 cols on xl screens, sticky) */}
        <div className="xl:col-span-5 2xl:col-span-4 space-y-5 xl:sticky xl:top-6">
          <div className="bg-white rounded-2xl border border-brand-gold/30 p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h3 className="font-serif text-sm font-bold text-brand-dark">
                  Live Storefront Preview
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-sans uppercase tracking-wider">
                Real-Time
              </span>
            </div>

            {/* Preview 1: Header Top Announcement Bar */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                1. Top Announcement Bar
              </p>
              {isFestivalActive ? (
                <div className="rounded-lg overflow-hidden bg-gradient-to-r from-brand-magenta via-brand-magentaDark to-brand-magenta text-[#FFF9EC] p-2 text-center text-[11px] font-medium shadow-xs">
                  <div className="flex items-center justify-center gap-1.5 truncate">
                    <Sparkles className="w-3 h-3 text-brand-goldShimmer animate-pulse shrink-0" />
                    <span className="truncate">{festivalOffer?.offerText || 'Special Offer Ticker'}</span>
                  </div>
                  {festivalOffer?.couponCode && (
                    <div className="mt-1">
                      <span className="bg-brand-gold/30 text-white font-bold px-2 py-0.5 rounded text-[9px] tracking-widest border border-brand-gold/40">
                        CODE: {festivalOffer.couponCode}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-100 border border-dashed border-gray-300 p-2 text-center text-[10px] text-gray-400 font-sans">
                  🚫 Announcement Bar Hidden (Festival mode OFF)
                </div>
              )}
            </div>

            {/* Preview 2: Hero Banner Mockup */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                2. Homepage Hero Showcase
              </p>
              <div className="rounded-xl overflow-hidden border border-brand-gold/20 bg-brand-cream p-4 space-y-3">
                {/* Badge Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-dark text-[10px] font-semibold">
                  <Sparkles className="w-3 h-3 text-brand-gold" />
                  <span>
                    {isFestivalActive
                      ? festivalOffer?.badgeText || 'Festive Edit • Royal Collection'
                      : 'Boutique Collection • Handcrafted Elegance'}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h4 className="font-serif text-base font-bold text-brand-dark leading-tight line-clamp-2">
                    {hero.title || 'NEW LAUNCH – Festive Collection'}
                  </h4>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed line-clamp-2 font-sans">
                    {hero.subtitle || 'Handcrafted ethnic kurta sets tailored for celebration.'}
                  </p>
                </div>

                {/* Banner Image Preview */}
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-brand-gold/20 bg-black/5">
                  <img
                    src={hero.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                    alt="Hero Banner"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] text-white font-serif italic">
                      Live Hero Showcase
                    </span>
                  </div>
                </div>

                {/* Button Mockup */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-magenta text-white text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-xs">
                    <span>{hero.ctaText || 'Explore Collection'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Preview 3: Boutique Contact Card */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                3. Footer Boutique Card
              </p>
              <div className="p-3 bg-brand-dark text-white rounded-xl space-y-1.5 text-xs">
                <p className="font-serif font-bold text-brand-gold">
                  {footer.boutiqueName || 'Aarrudh Fashion'}
                </p>
                <p className="text-[10px] text-gray-300">
                  {footer.tagline || "Women's Boutique"}
                </p>
                <div className="text-[10px] text-gray-400 space-y-0.5 pt-1 border-t border-white/10">
                  <p className="flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 text-brand-gold" />
                    <span>{footer.phone || '+91 98765 43210'}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5 text-brand-gold" />
                    <span className="truncate">{footer.email || 'care@aarrudhfashion.com'}</span>
                  </p>
                  {footer.workingHours && (
                    <p className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-brand-gold" />
                      <span className="truncate">{footer.workingHours}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Publish Action Box */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Publish Storefront Changes'}</span>
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Changes apply instantly across public website and shopping bag.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LandingEditor;
