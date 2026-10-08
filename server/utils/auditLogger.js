const AuditLog = require('../models/AuditLog');

const logAdminAction = async ({ adminUser, action, entity, entityId = '', details = {}, ip = '' }) => {
  try {
    if (!adminUser) return;
    await AuditLog.create({
      admin: adminUser._id,
      adminEmail: adminUser.email,
      action,
      entity,
      entityId: String(entityId),
      details,
      ipAddress: ip,
    });
  } catch (err) {
    console.error('[AuditLog Error] Failed to log admin action:', err.message);
  }
};

module.exports = { logAdminAction };
