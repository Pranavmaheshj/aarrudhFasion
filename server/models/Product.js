const mongoose = require('mongoose');

const SizeStockSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL'],
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 10,
  },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Detailed description is required'],
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: [true, 'Collection reference is required'],
  },
  price: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0,
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: 0,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  colors: [{
    type: String, // e.g. Teal Blue, Magenta, Sky Blue, Rose Brown
  }],
  sizes: [SizeStockSchema],
  fabric: {
    type: String,
    default: 'Silk Blend / Tissue',
  },
  neckStyle: {
    type: String,
    default: 'Round Neck / V-Neck',
  },
  setContents: [{
    type: String, // e.g. "Kurta", "Pant", "Dupatta"
  }],
  images: [{
    type: String, // Array of image URLs (Cloudinary or local static paths)
  }],
  tags: [{
    type: String, // e.g. "Festive", "Diwali", "Embroidery", "Pearl Work", "Zari"
  }],
  isNewProduct: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  ratingAvg: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 12,
  },
}, { timestamps: true });

// Auto-calculate discountPercent before save if not manually specified
ProductSchema.pre('save', function (next) {
  if (this.mrp && this.price && this.mrp > this.price) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
