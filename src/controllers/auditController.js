const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.max(Number(req.query.limit || 20), 1);
    const [totalItems, items] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'nome email role'),
    ]);

    return res.json({ totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, items });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAuditLogs };
