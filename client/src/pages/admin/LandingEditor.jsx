import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Save, Sparkles, Image, Phone, Mail, MapPin, Globe } from 'lucide-react';
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
          const { hero: h, footer: f } = res.data.content;
          if (h) setHero((prev) => ({ ...prev, ...h }));
          if (f) setFooter((prev) => ({ ...prev, ...f, socials: { ...prev.socials, ...(f.socials || {}) } }));
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
      await api.put('/admin/landing', { hero, footer });
      toast.success('Landing page and boutique footer updated successfully!');
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
            Customize the public homepage hero banner, boutique contact details, and social channels.
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
