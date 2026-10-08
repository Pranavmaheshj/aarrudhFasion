const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'collectionId', select: 'name slug' },
    });

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle/:productId
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    const existsIndex = user.wishlist.findIndex((id) => id.toString() === productId);
    let added = false;

    if (existsIndex > -1) {
      user.wishlist.splice(existsIndex, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'collectionId', select: 'name slug' },
    });

    return res.status(200).json({
      success: true,
      added,
      message: added ? 'Saved to your Wishlist.' : 'Removed from Wishlist.',
      wishlist: updatedUser.wishlist || [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
