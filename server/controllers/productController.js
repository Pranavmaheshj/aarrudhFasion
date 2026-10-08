const Product = require('../models/Product');
const Collection = require('../models/Collection');
const { logAdminAction } = require('../utils/auditLogger');

// Helper to create slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// @desc    Get filtered products (AJIO style catalog)
// @route   GET /api/products
// @access  Private (Customer or Admin)
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      collection,
      color,
      size,
      minPrice,
      maxPrice,
      fabric,
      neckStyle,
      discount,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Search by name or description or tags
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { fabric: searchRegex },
        { neckStyle: searchRegex },
      ];
    }

    // Filter by Collection (by slug or ObjectId)
    if (collection && collection !== 'all') {
      let colDoc = null;
      if (collection.match(/^[0-9a-fA-F]{24}$/)) {
        colDoc = await Collection.findById(collection);
      } else {
        colDoc = await Collection.findOne({ slug: collection });
      }
      if (colDoc) {
        query.collectionId = colDoc._id;
      }
    }

    // Filter by Colors
    if (color) {
      const colorList = color.split(',').map((c) => new RegExp(c.trim(), 'i'));
      query.colors = { $in: colorList };
    }

    // Filter by Size
    if (size) {
      const sizeList = size.split(',').map((s) => s.trim().toUpperCase());
      query['sizes.size'] = { $in: sizeList };
    }

    // Filter by Fabric
    if (fabric) {
      const fabricList = fabric.split(',').map((f) => new RegExp(f.trim(), 'i'));
      query.fabric = { $in: fabricList };
    }

    // Filter by Neck Style
    if (neckStyle) {
      const neckList = neckStyle.split(',').map((n) => new RegExp(n.trim(), 'i'));
      query.neckStyle = { $in: neckList };
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by minimum discount percentage
    if (discount) {
      query.discountPercent = { $gte: Number(discount) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price_low_to_high') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_high_to_low') {
      sortOptions = { price: -1 };
    } else if (sort === 'popularity') {
      sortOptions = { ratingAvg: -1, ratingCount: -1 };
    } else if (sort === 'discount') {
      sortOptions = { discountPercent: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('collectionId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    // Aggregate available facet filters for AJIO sidebar
    const allActive = await Product.find({ isActive: true }).select('colors fabric neckStyle price');
    const allColors = [...new Set(allActive.flatMap((p) => p.colors || []).filter(Boolean))];
    const allFabrics = [...new Set(allActive.map((p) => p.fabric).filter(Boolean))];
    const allNecks = [...new Set(allActive.map((p) => p.neckStyle).filter(Boolean))];
    const prices = allActive.map((p) => p.price);
    const minCatalogPrice = prices.length ? Math.min(...prices) : 0;
    const maxCatalogPrice = prices.length ? Math.max(...prices) : 10000;

    return res.status(200).json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      facets: {
        colors: allColors,
        fabrics: allFabrics,
        neckStyles: allNecks,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        priceRange: { min: minCatalogPrice, max: maxCatalogPrice },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Private (Customer or Admin)
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('collectionId', 'name slug description');
    } else {
      product = await Product.findOne({ slug: id }).populate('collectionId', 'name slug description');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Fetch similar products in same collection
    const similarProducts = await Product.find({
      collectionId: product.collectionId._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .populate('collectionId', 'name slug');

    return res.status(200).json({
      success: true,
      product,
      similarProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      shortDescription,
      description,
      collectionId,
      price,
      mrp,
      colors,
      sizes,
      fabric,
      neckStyle,
      setContents,
      images,
      tags,
      isNewProduct,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !shortDescription || !collectionId || !price || !mrp) {
      return res.status(400).json({
        success: false,
        message: 'Name, short description, collection, price and MRP are required.',
      });
    }

    let slug = slugify(name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Format sizes array if necessary
    const formattedSizes = Array.isArray(sizes) && sizes.length > 0
      ? sizes
      : [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 10 },
          { size: 'XXL', stock: 10 },
        ];

    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const product = await Product.create({
      name,
      slug,
      shortDescription,
      description: description || shortDescription,
      collectionId,
      price: Number(price),
      mrp: Number(mrp),
      discountPercent,
      colors: Array.isArray(colors) ? colors : colors ? colors.split(',').map((c) => c.trim()) : [],
      sizes: formattedSizes,
      fabric: fabric || 'Silk Blend / Tissue',
      neckStyle: neckStyle || 'V-Neck / Embroidered',
      setContents: Array.isArray(setContents) ? setContents : ['Kurta', 'Pant', 'Dupatta'],
      images: Array.isArray(images) && images.length > 0 ? images : [],
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()) : ['Festive', 'Kurta Set'],
      isNewProduct: isNewProduct !== undefined ? isNewProduct : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      isActive: isActive !== undefined ? isActive : true,
    });

    await logAdminAction({
      adminUser: req.user,
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: product._id,
      details: { name, price, mrp },
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const {
      name,
      shortDescription,
      description,
      collectionId,
      price,
      mrp,
      colors,
      sizes,
      fabric,
      neckStyle,
      setContents,
      images,
      tags,
      isNewProduct,
      isFeatured,
      isActive,
    } = req.body;

    if (name) product.name = name;
    if (shortDescription) product.shortDescription = shortDescription;
    if (description) product.description = description;
    if (collectionId) product.collectionId = collectionId;
    if (price !== undefined) product.price = Number(price);
    if (mrp !== undefined) product.mrp = Number(mrp);

    if (product.mrp && product.price && product.mrp > product.price) {
      product.discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    }

    if (colors !== undefined) product.colors = Array.isArray(colors) ? colors : colors.split(',').map((c) => c.trim());
    if (sizes !== undefined) product.sizes = sizes;
    if (fabric !== undefined) product.fabric = fabric;
    if (neckStyle !== undefined) product.neckStyle = neckStyle;
    if (setContents !== undefined) product.setContents = setContents;
    if (images !== undefined) product.images = images;
    if (tags !== undefined) product.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    if (isNewProduct !== undefined) product.isNewProduct = isNewProduct;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    await logAdminAction({
      adminUser: req.user,
      action: 'UPDATE_PRODUCT',
      entity: 'Product',
      entityId: product._id,
      details: req.body,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await product.deleteOne();

    await logAdminAction({
      adminUser: req.user,
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      entityId: id,
      details: { name: product.name },
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
