const mongoose = require('mongoose');

const LandingContentSchema = new mongoose.Schema({
  hero: {
    title: {
      type: String,
      default: "NEW LAUNCH – Diwali Festive Collection",
    },
    subtitle: {
      type: String,
      default: "Handcrafted Kurta Sets with Royal Pearl & Zari Embroidery for Festive Elegance",
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80",
    },
    ctaText: {
      type: String,
      default: "Explore The Collection",
    },
  },
  festivalOffer: {
    enabled: {
      type: Boolean,
      default: true,
    },
    festivalName: {
      type: String,
      default: "Diwali Festive Launch",
    },
    offerText: {
      type: String,
      default: "Diwali Festive Launch: Free Express Shipping on Orders Above ₹1,999 | Handcrafted Kurta Sets",
    },
    couponCode: {
      type: String,
      default: "FESTIVE10",
    },
    discountPercent: {
      type: Number,
      default: 10,
    },
    minOrderAmount: {
      type: Number,
      default: 1999,
    },
    badgeText: {
      type: String,
      default: "Festive Edit • Royal Collection",
    },
  },
  footer: {
    boutiqueName: {
      type: String,
      default: "Aarrudh Fashion",
    },
    tagline: {
      type: String,
      default: "Women's Boutique",
    },
    address: {
      type: String,
      default: "14, Royal Heritage Square, Commercial Street, Bengaluru, Karnataka 560001",
    },
    phone: {
      type: String,
      default: "+91 98765 43210",
    },
    email: {
      type: String,
      default: "care@aarrudhfashion.com",
    },
    workingHours: {
      type: String,
      default: "Mon - Sat: 10:30 AM to 8:30 PM",
    },
    socials: {
      instagram: {
        type: String,
        default: "https://instagram.com/aarrudhfashion",
      },
      facebook: {
        type: String,
        default: "https://facebook.com/aarrudhfashion",
      },
      whatsapp: {
        type: String,
        default: "+919876543210",
      },
      pinterest: {
        type: String,
        default: "https://pinterest.com/aarrudhfashion",
      },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('LandingContent', LandingContentSchema);
