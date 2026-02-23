/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/settingsController.js
 */
const bcrypt = require('bcrypt');
const Setting = require('../models/Setting');
const { logAdminAction } = require('../services/auditService');

const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    return res.json(settings);
  } catch (error) {
    return next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let payload = { ...req.body };

    if (payload.conta?.senha) {
      const senhaHash = await bcrypt.hash(payload.conta.senha, 10);
      payload = {
        ...payload,
        conta: { ...payload.conta, senhaHash },
      };
      delete payload.conta.senha;
    }

    const settings = await Setting.findOneAndUpdate(
      {},
      { ...payload, atualizadoPor: req.user._id, atualizadoEm: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logAdminAction({ req, action: 'update', resource: 'settings', resourceId: settings._id, payload: req.body });
    return res.json(settings);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
