const Collection = require('../models/Collection');
const Product = require('../models/Product');
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

// @desc    Get all public collections
// @route   GET /api/collections
// @access  Public
const getPublicCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ isVisible: true }).sort({ sortOrder: 1, createdAt: 1 });

    // Attach product count to each collection
    const collectionsWithCount = await Promise.all(
      collections.map(async (col) => {
        const count = await Product.countDocuments({ collectionId: col._id, isActive: true });
        return {
          ...col.toObject(),
          productCount: count,
        };
      })
    );

    return res.status(200).json({
      success: true,
      collections: collectionsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all collections (including hidden, for Admin)
// @route   GET /api/admin/collections
// @access  Private/Admin
const getAllCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find().sort({ sortOrder: 1, createdAt: -1 });
    const collectionsWithCount = await Promise.all(
      collections.map(async (col) => {
        const count = await Product.countDocuments({ collectionId: col._id });
        return {
          ...col.toObject(),
          productCount: count,
        };
      })
    );
    return res.status(200).json({
      success: true,
      collections: collectionsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create collection
// @route   POST /api/admin/collections
// @access  Private/Admin
const createCollection = async (req, res, next) => {
  try {
    const { name, description, images = [], isVisible = true, sortOrder = 0 } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Collection name and description are required.',
      });
    }

    let slug = slugify(name);
    // ensure unique slug
    const existing = await Collection.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const collection = await Collection.create({
      name,
      slug,
      description,
      images,
      isVisible,
      sortOrder,
    });

    await logAdminAction({
      adminUser: req.user,
      action: 'CREATE_COLLECTION',
      entity: 'Collection',
      entityId: collection._id,
      details: { name, slug },
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Collection created successfully.',
      collection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update collection
// @route   PUT /api/admin/collections/:id
// @access  Private/Admin
const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, images, isVisible, sortOrder } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.',
      });
    }

    if (name && name !== collection.name) {
      collection.name = name;
      collection.slug = slugify(name);
    }
    if (description !== undefined) collection.description = description;
    if (images !== undefined) collection.images = images;
    if (isVisible !== undefined) collection.isVisible = isVisible;
    if (sortOrder !== undefined) collection.sortOrder = sortOrder;

    await collection.save();

    await logAdminAction({
      adminUser: req.user,
      action: 'UPDATE_COLLECTION',
      entity: 'Collection',
      entityId: collection._id,
      details: req.body,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Collection updated successfully.',
      collection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete collection
// @route   DELETE /api/admin/collections/:id
// @access  Private/Admin
const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.',
      });
    }

    const attachedProducts = await Product.countDocuments({ collectionId: id });
    if (attachedProducts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete collection containing ${attachedProducts} products. Please reassign or delete the products first.`,
      });
    }

    await collection.deleteOne();

    await logAdminAction({
      adminUser: req.user,
      action: 'DELETE_COLLECTION',
      entity: 'Collection',
      entityId: id,
      details: { name: collection.name },
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Collection deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicCollections,
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
};
