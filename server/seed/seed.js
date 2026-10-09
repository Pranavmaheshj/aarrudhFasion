const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const LandingContent = require('../models/LandingContent');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aarrudh_fashion';
  await mongoose.connect(uri);
  console.log(`[Seed] Connected to MongoDB at ${uri}`);
};

const sampleEthnicImages = [
  "/images/kurta-1.jpg",
  "/images/kurta-2.jpg",
  "/images/kurta-3.jpg",
  "/images/kurta-4.jpg",
  "/images/kurta-5.jpg",
  "/images/kurta-6.jpg",
  "/images/kurta-7.jpg",
  "/images/kurta-8.jpg",
];

const sampleProducts = [
  {
    name: "Teal Blue pearl-embroidered round neck kurta set",
    shortDescription: "Rich teal blue kurta with hand-embroidered pearl neck yoke, matching straight pants and organza dupatta.",
    color: "Teal Blue",
    neckStyle: "Round Neck",
    fabric: "Chanderi Silk Blend",
    price: 3499,
    mrp: 5999,
  },
  {
    name: "Sky Blue floral print tissue kurta set with embroidered V-neck",
    shortDescription: "Lustrous tissue kurta in soft sky blue adorned with blooming florals and fine zari scalloped V-neckline.",
    color: "Sky Blue",
    neckStyle: "V-Neck",
    fabric: "Pure Tissue Silk",
    price: 3799,
    mrp: 6499,
  },
  {
    name: "Rose Brown keyhole neck zari kurta set",
    shortDescription: "Subtle rose brown festive kurta featuring ornate antique zari work on a stylish keyhole neckline.",
    color: "Rose Brown",
    neckStyle: "Keyhole Neck",
    fabric: "Silk Blend",
    price: 3299,
    mrp: 5499,
  },
  {
    name: "Crimson Red V-neck kurta set with butta work",
    shortDescription: "Auspicious crimson red ethnic set embellished with all-over golden zari butta motifs and embroidered V-neck.",
    color: "Crimson Red",
    neckStyle: "V-Neck",
    fabric: "Chanderi Silk",
    price: 3999,
    mrp: 6999,
  },
  {
    name: "Cream kurta set with pink thread-work yoke and ikat-print dupatta",
    shortDescription: "Classic cream kurta paired with intricate rose-pink thread work on the yoke and a woven ikat-print silk dupatta.",
    color: "Cream",
    neckStyle: "Round Neck",
    fabric: "Tussar Silk Blend",
    price: 2999,
    mrp: 4999,
  },
  {
    name: "Rust Red keyhole neck tissue kurta set",
    shortDescription: "Regal rust red shimmer tissue kurta set with keyhole neckline embellished with cutdana and moti work.",
    color: "Rust Red",
    neckStyle: "Keyhole Neck",
    fabric: "Pure Tissue Silk",
    price: 3899,
    mrp: 6599,
  },
  {
    name: "Royal Blue ombre stone-work kurta set",
    shortDescription: "Breathtaking ombre gradient kurta from sapphire to navy with shimmering Swarovski crystal stone detailing.",
    color: "Royal Blue",
    neckStyle: "Round Neck",
    fabric: "Georgette with Shantoon Lining",
    price: 4299,
    mrp: 7499,
  },
  {
    name: "Violet V-neck kurta set with silver butta work",
    shortDescription: "Deep imperial violet festive set highlighted with silver zari butta embroidery and a scalloped silver border dupatta.",
    color: "Violet",
    neckStyle: "V-Neck",
    fabric: "Banarasi Silk Blend",
    price: 3699,
    mrp: 6199,
  },
  {
    name: "Wine long-yoke embroidered kurta set with floral dupatta",
    shortDescription: "Deep wine tone kurta with an elongated artisanal embroidered yoke and an ethereal floral digital-printed organza dupatta.",
    color: "Wine",
    neckStyle: "Embroidered Yoke",
    fabric: "Silk Blend",
    price: 3999,
    mrp: 6899,
  },
  {
    name: "Lilac chikankari-style embroidered kurta set",
    shortDescription: "Pastel lilac ensemble crafted with delicate Lucknowi chikankari floral jaal and subtle sequin highlights.",
    color: "Lilac",
    neckStyle: "Round Neck",
    fabric: "Georgette with Mulmul Lining",
    price: 3499,
    mrp: 5899,
  },
  {
    name: "Peach and yellow ombre stone-work kurta set",
    shortDescription: "Warm celebratory ombre kurta merging soft peach into marigold yellow with delicate pearl and stone accents.",
    color: "Peach",
    neckStyle: "Round Neck",
    fabric: "Chiffon Silk Blend",
    price: 3899,
    mrp: 6499,
  },
  {
    name: "Turquoise keyhole neck kurta set",
    shortDescription: "Vibrant festive turquoise kurta with mirror-work accents on a stylish teardrop keyhole neckline.",
    color: "Turquoise",
    neckStyle: "Keyhole Neck",
    fabric: "Chanderi Silk",
    price: 3199,
    mrp: 5299,
  },
  {
    name: "Pale Yellow thread-and-sequin yoke kurta set",
    shortDescription: "Luminous haldi-yellow kurta highlighted with ivory thread embroidery and subtle micro-sequin embellishments.",
    color: "Pale Yellow",
    neckStyle: "Embroidered Yoke",
    fabric: "Silk Blend",
    price: 2999,
    mrp: 4999,
  },
  {
    name: "Teal Blue V-neck kurta set with floral flower embroidery",
    shortDescription: "Exquisite teal ensemble adorned with hand-guided thread floral bouquets along the neckline and hem.",
    color: "Teal Blue",
    neckStyle: "V-Neck",
    fabric: "Pure Tissue Silk",
    price: 3799,
    mrp: 6399,
  },
  {
    name: "Blush Pink yoke-work kurta set with big floral dupatta",
    shortDescription: "Romantic blush pink ethnic set featuring heavy pita embroidery on the yoke and an oversized statement floral dupatta.",
    color: "Blush Pink",
    neckStyle: "Embroidered Yoke",
    fabric: "Chanderi Silk Blend",
    price: 4199,
    mrp: 7299,
  },
  {
    name: "Peacock Blue V-neck embroidered kurta set",
    shortDescription: "Opulent peacock blue festive kurta with golden zari leaf embroidery contouring a tailored V-neckline.",
    color: "Peacock Blue",
    neckStyle: "V-Neck",
    fabric: "Silk Blend",
    price: 3599,
    mrp: 5999,
  },
  {
    name: "Teal Green long-yoke kurta set with floral dupatta",
    shortDescription: "Fresh teal green kurta featuring an extended handcrafted yoke paired with straight cigarette pants and printed dupatta.",
    color: "Teal Green",
    neckStyle: "Embroidered Yoke",
    fabric: "Chanderi Silk",
    price: 3699,
    mrp: 6299,
  },
  {
    name: "Purple pearl-rose embroidered kurta set",
    shortDescription: "Rich plum-purple kurta adorned with delicate handcrafted pearl roses and silver gota-patti border work.",
    color: "Purple",
    neckStyle: "Round Neck",
    fabric: "Silk Blend",
    price: 3899,
    mrp: 6699,
  },
  {
    name: "Maroon V-neck embroidered kurta set with printed dupatta",
    shortDescription: "Heritage bridal maroon kurta with intricate golden thread-work V-neck and a lustrous printed chanderi dupatta.",
    color: "Maroon",
    neckStyle: "V-Neck",
    fabric: "Banarasi Silk Blend",
    price: 3999,
    mrp: 6999,
  },
  {
    name: "Magenta floral-print kurta set with embroidered V-neck",
    shortDescription: "Signature magenta festive kurta set with painterly floral motifs, embroidered neckline and matching gold-bordered dupatta.",
    color: "Magenta",
    neckStyle: "V-Neck",
    fabric: "Pure Tissue Silk",
    price: 4499,
    mrp: 7999,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections, products, and landing content...');
    await Promise.all([
      Product.deleteMany({}),
      Collection.deleteMany({}),
      LandingContent.deleteMany({}),
    ]);

    // 1. Create or Update Admin Account
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@aarrudhfashion.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'Aarrudh Boutique Admin';
    const adminMobile = process.env.ADMIN_MOBILE || '9876543210';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        mobile: adminMobile,
        passwordHash: adminPassword,
        role: 'admin',
        addresses: [
          {
            name: adminName,
            mobile: adminMobile,
            pincode: '560001',
            house: '14, Boutique Studio',
            area: 'Commercial Street',
            city: 'Bengaluru',
            state: 'Karnataka',
            landmark: 'Near Brigade Road',
            addressType: 'Work',
            isDefault: true,
          },
        ],
      });
      console.log(`[Seed] Created Admin User: ${adminEmail} (password: ${adminPassword})`);
    } else {
      admin.role = 'admin';
      admin.passwordHash = adminPassword;
      await admin.save();
      console.log(`[Seed] Updated Admin User: ${adminEmail}`);
    }

    // 2. Create Sample Customer User for testing
    const customerEmail = 'customer@aarrudhfashion.com';
    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      customer = await User.create({
        name: 'Priya Sharma',
        email: customerEmail,
        mobile: '9845012345',
        passwordHash: 'Customer@123',
        role: 'customer',
        addresses: [
          {
            name: 'Priya Sharma',
            mobile: '9845012345',
            pincode: '560034',
            house: 'Flat 402, Royal Palms Residency',
            area: 'Koramangala 4th Block',
            city: 'Bengaluru',
            state: 'Karnataka',
            landmark: 'Opposite Sony World Signal',
            addressType: 'Home',
            isDefault: true,
          },
        ],
      });
      console.log(`[Seed] Created Sample Customer: ${customerEmail} (password: Customer@123)`);
    }

    // 3. Create First Collection: "Diwali Collection – New Launch"
    const diwaliCollection = await Collection.create({
      name: "Diwali Collection – New Launch",
      slug: "diwali-collection-new-launch",
      description: "Festive women's ethnic kurta sets (kurta + pant + dupatta) adorned with rich pearl work, shimmering sequins, antique zari, and stone embroidery.",
      images: [
        "/images/kurta-1.jpg",
        "/images/kurta-2.jpg"
      ],
      isVisible: true,
      sortOrder: 1,
    });
    console.log(`[Seed] Created Collection: ${diwaliCollection.name}`);

    // Create Second Secondary Collection: "Royal Heritage Silk"
    const silkCollection = await Collection.create({
      name: "Royal Heritage Tissue & Silk",
      slug: "royal-heritage-tissue-silk",
      description: "Handcrafted pure tissue silk and chanderi kurta sets woven with timeless regal motifs for weddings and celebrations.",
      images: [
        "/images/kurta-3.jpg",
        "/images/kurta-4.jpg"
      ],
      isVisible: true,
      sortOrder: 2,
    });

    // 4. Seed the 20 Sample Products into Diwali Collection
    const productDocs = sampleProducts.map((item, index) => {
      const slug = item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Assign primary and secondary preview images
      const img1 = sampleEthnicImages[index % sampleEthnicImages.length];
      const img2 = sampleEthnicImages[(index + 1) % sampleEthnicImages.length];

      return {
        name: item.name,
        slug,
        shortDescription: item.shortDescription,
        description: `${item.shortDescription} Designed exclusively at Aarrudh Fashion boutique, this designer 3-piece ethnic set includes a finely tailored kurta, coordinated pants, and a luxurious dupatta. Ideal for Diwali festivities, puja ceremonies, and special occasions.`,
        collectionId: diwaliCollection._id,
        price: item.price,
        mrp: item.mrp,
        discountPercent: Math.round(((item.mrp - item.price) / item.mrp) * 100),
        colors: [item.color],
        sizes: [
          { size: 'S', stock: 12 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 18 },
          { size: 'XL', stock: 10 },
          { size: 'XXL', stock: 8 },
        ],
        fabric: item.fabric,
        neckStyle: item.neckStyle,
        setContents: ["Kurta", "Pant", "Dupatta"],
        images: [img1, img2],
        tags: ["Diwali", "Festive", "Kurta Set", item.color, "Embroidery", "Zari"],
        isNewProduct: true,
        isFeatured: index < 6,
        isActive: true,
        ratingAvg: +(4.7 + (index % 3) * 0.1).toFixed(1),
        ratingCount: 15 + index * 4,
      };
    });

    const insertedProducts = await Product.insertMany(productDocs);
    console.log(`[Seed] Seeded ${insertedProducts.length} festive kurta set products successfully!`);

    // 5. Seed Singleton Landing Page Content
    await LandingContent.create({
      hero: {
        title: "NEW LAUNCH – Diwali Festive Collection",
        subtitle: "Handcrafted Kurta Sets with Royal Pearl & Zari Embroidery for Festive Elegance",
        image: "/images/hero-banner.jpg",
        ctaText: "Explore Collection",
      },
      footer: {
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
          pinterest: "https://pinterest.com/aarrudhfashion",
        },
      },
    });
    console.log(`[Seed] Landing content initialized.`);

    console.log('\n=============================================================');
    console.log('✨ SEEDING COMPLETE FOR AARRUDH FASHION BOUTIQUE ✨');
    console.log(`👑 Admin Login:    ${adminEmail}  |  Password: ${adminPassword}`);
    console.log(`👗 Customer Login: ${customerEmail} |  Password: Customer@123`);
    console.log(`✨ 20 Kurta Set Designs Seeded under "Diwali Collection – New Launch"`);
    console.log('=============================================================\n');

    return true;
  } catch (err) {
    console.error('[Seed Error]', err);
    throw err;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
