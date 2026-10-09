const LandingContent = require('../models/LandingContent');
const { logAdminAction } = require('../utils/auditLogger');

// @desc    Get landing content (Hero banner, footer details, socials)
// @route   GET /api/landing
// @access  Public
const getLandingContent = async (req, res, next) => {
  try {
    let content = await LandingContent.findOne();
    if (!content) {
      content = await LandingContent.create({});
    }
    return res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update landing content
// @route   PUT /api/admin/landing
// @access  Private/Admin
const updateLandingContent = async (req, res, next) => {
  try {
    const { hero, footer, festivalOffer } = req.body;

    let content = await LandingContent.findOne();
    if (!content) {
      content = new LandingContent();
    }

    if (hero) {
      content.hero = { ...content.hero.toObject(), ...hero };
    }
    if (footer) {
      content.footer = { ...content.footer.toObject(), ...footer };
    }
    if (festivalOffer !== undefined) {
      content.festivalOffer = { ...(content.festivalOffer ? content.festivalOffer.toObject() : {}), ...festivalOffer };
    }

    await content.save();

    await logAdminAction({
      adminUser: req.user,
      action: 'UPDATE_LANDING',
      entity: 'LandingContent',
      entityId: content._id,
      details: { hero, footer, festivalOffer },
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Landing page content updated successfully.',
      content,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandingContent,
  updateLandingContent,
};
