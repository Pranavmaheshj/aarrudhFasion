import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Save, Sparkles, Image, Phone, Mail, MapPin, Globe, Gift, Tag, XCircle, CheckCircle } from 'lucide-react';
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
    e.preventDefault();
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

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold-dark" />
            <span>Landing Page &amp; Storefront CMS</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Customize the public homepage hero banner, festival offers, boutique contact details, and social channels.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Publish Changes'}</span>
        </button>
      </div>

      {/* Festival Time Offers & Campaign Promotion Control */}
      <div className={`rounded-xl border p-6 shadow-sm transition-all space-y-4 ${
        festivalOffer.enabled 
          ? 'bg-gradient-to-br from-amber-50/60 via-white to-pink-50/40 border-brand-gold/40' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100 gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
              <Gift className="w-5 h-5 text-brand-magenta" />
              <span>Festival Time Offers &amp; Campaign Controls</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Activate or disable seasonal offers (Diwali, Pongal, Navratri, Eid, Wedding Season) and top announcement strip with a single toggle.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-white/80 px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              festivalOffer.enabled
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${festivalOffer.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {festivalOffer.enabled ? 'Active on Storefront' : 'Disabled (Hidden)'}
            </span>

            <button
              type="button"
              onClick={() => setFestivalOffer({ ...festivalOffer, enabled: !festivalOffer.enabled })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                festivalOffer.enabled ? 'bg-brand-magenta' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={festivalOffer.enabled}
              title={festivalOffer.enabled ? 'Click to Disable Festival Offer' : 'Click to Enable Festival Offer'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  festivalOffer.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Informational Callout when Disabled */}
        {!festivalOffer.enabled ? (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              <strong>Festival mode is currently OFF.</strong> The top announcement strip on the header is completely hidden, and festival coupon codes will not apply at checkout.
            </span>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Festival mode is LIVE.</strong> The announcement bar is visible at the top of every page, and coupon <strong>{festivalOffer.couponCode || 'FESTIVE10'}</strong> is active for customers.
            </span>
          </div>
        )}

        {/* 1-Click Festival Presets */}
        <div className="pt-2">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
            1-Click Festival Campaign Presets (Click to autofill)
          </label>
          <div className="flex flex-wrap gap-2">
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
                name: '🌾 Pongal / Sankranti',
                festivalName: 'Pongal Festive Celebration',
                offerText: 'Pongal Special: Flat 15% OFF + Free Matching Potli on Orders Above ₹2,499!',
                couponCode: 'PONGAL15',
                discountPercent: 15,
                minOrderAmount: 2499,
                badgeText: 'Harvest Grandeur • Silk Sets',
              },
              {
                name: '✨ Navratri / Dussehra',
                festivalName: 'Navratri Dandiya Edit',
                offerText: 'Navratri Celebrations: 10% OFF on all Vibrant Anarkali & Straight Kurta Sets with Code NAVRATRI10',
                couponCode: 'NAVRATRI10',
                discountPercent: 10,
                minOrderAmount: 1499,
                badgeText: 'Navratri Edit • Twirl in Tradition',
              },
              {
                name: '🌙 Eid Festive Glamour',
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
                  toast.success(`Loaded preset: ${preset.name}! Click "Publish Changes" to apply.`);
                }}
                className="px-3 py-1 bg-white hover:bg-brand-cream border border-brand-gold/30 hover:border-brand-gold rounded-full text-[11px] font-medium text-brand-dark transition-all shadow-2xs hover:shadow-xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Top Announcement Bar Ticker Text
            </label>
            <input
              type="text"
              value={festivalOffer.offerText || ''}
              onChange={(e) => setFestivalOffer({ ...festivalOffer, offerText: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
              placeholder="Text displayed at the very top announcement strip across the website"
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

          <div className="grid grid-cols-2 gap-2">
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
                Min. Order (₹)
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
      </div>

      {/* Hero Banner Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-brand-dark pb-2 border-b border-gray-100 flex items-center gap-2">
          <Image className="w-4 h-4 text-brand-gold-dark" />
          <span>Hero Banner Showcase</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Banner Headline / Title
            </label>
            <input
              type="text"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
              placeholder="e.g. NEW LAUNCH – Diwali Festive Collection"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
              placeholder="Handcrafted Kurta Sets with Royal Pearl & Zari Embroidery..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Banner Image URL
              </label>
              <input
                type="text"
                value={hero.image}
                onChange={(e) => setHero({ ...hero, image: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
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
      </div>

      {/* Boutique Details & Footer Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
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
              Contact Telephone / Mobile
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

          <div className="sm:col-span-2">
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
            <span>Social Handles &amp; WhatsApp</span>
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
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">WhatsApp Number</label>
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
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LandingEditor;
