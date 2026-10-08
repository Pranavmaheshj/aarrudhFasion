const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } = require('../config/constants');

// Helper to compute cart totals
const calculateCartTotals = (items) => {
  let subtotal = 0;
  let totalMrp = 0;

  for (const item of items) {
    if (item.product) {
      const price = item.product.price || 0;
      const mrp = item.product.mrp || price;
      subtotal += price * item.qty;
      totalMrp += mrp * item.qty;
    }
  }

  const discount = Math.max(0, totalMrp - subtotal);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  return {
    subtotal,
    totalMrp,
    discount,
    delivery,
    total,
  };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price mrp discountPercent images sizes colors fabric isActive',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out deleted/inactive products if any
    cart.items = cart.items.filter((item) => item.product && item.product.isActive);

    const totals = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      cart,
      totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, size, color = '', qty = 1 } = req.body;

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and size are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is no longer available.',
      });
    }

    // Check size stock
    const sizeConfig = product.sizes.find((s) => s.size === size);
    if (!sizeConfig || sizeConfig.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: `Selected size ${size} is currently out of stock.`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if same product and size already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].qty += Number(qty);
    } else {
      cart.items.push({
        product: productId,
        size,
        color: color || (product.colors && product.colors[0]) || '',
        qty: Number(qty),
      });
    }

    await cart.save();

    // Populate for fresh client response
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price mrp discountPercent images sizes colors fabric isActive',
    });

    const totals = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      message: 'Added to your boutique bag.',
      cart,
      totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { qty } = req.body;

    if (!qty || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    item.qty = Number(qty);
    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price mrp discountPercent images sizes colors fabric isActive',
    });

    const totals = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      cart,
      totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove cart item
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price mrp discountPercent images sizes colors fabric isActive',
    });

    const totals = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      message: 'Item removed from bag.',
      cart,
      totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.status(200).json({
      success: true,
      message: 'Cart cleared.',
      cart: { items: [] },
      totals: { subtotal: 0, totalMrp: 0, discount: 0, delivery: 0, total: 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
