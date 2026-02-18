const AdminNotification = require('../models/AdminNotification');

const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await AdminNotification.find({ type: 'sale' }).sort({ createdAt: -1 }).limit(200);
    return res.json(notifications);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAdminNotifications };
