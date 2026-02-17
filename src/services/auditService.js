const AuditLog = require('../models/AuditLog');

const logAdminAction = async ({ req, action, resource, resourceId, payload }) => {
  await AuditLog.create({
    user: req.user?._id,
    role: req.user?.role,
    action,
    resource,
    resourceId: resourceId ? String(resourceId) : undefined,
    payload,
    ip: req.ip,
  });
};

module.exports = {
  logAdminAction,
};
