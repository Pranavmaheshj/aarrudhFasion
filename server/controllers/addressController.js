const User = require('../models/User');

// @desc    Get all saved addresses of current user
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new delivery address
// @route   POST /api/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const { name, mobile, pincode, house, area, city, state, landmark, addressType = 'Home', isDefault = false } = req.body;

    const user = await User.findById(req.user._id);

    // If marked default or first address, set as default and unset other defaults
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      name,
      mobile,
      pincode,
      house,
      area,
      city,
      state,
      landmark: landmark || '',
      addressType,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Delivery address added successfully.',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    const { name, mobile, pincode, house, area, city, state, landmark, addressType, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    if (name) address.name = name;
    if (mobile) address.mobile = mobile;
    if (pincode) address.pincode = pincode;
    if (house) address.house = house;
    if (area) address.area = area;
    if (city) address.city = city;
    if (state) address.state = state;
    if (landmark !== undefined) address.landmark = landmark;
    if (addressType) address.addressType = addressType;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated.',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== id);
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address removed.',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === id;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Default address updated.',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
