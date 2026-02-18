const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

const promotionSchema = z.object({
  title: z.string().min(2),
  discountPercentage: z.number().min(1).max(100),
  productId: objectId,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  active: z.boolean().optional(),
});

const settingsSchema = z.object({
  conta: z.object({ nome: z.string().optional(), email: z.string().email().optional(), senha: z.string().min(6).optional() }).optional(),
  aparencia: z.object({
    corPrimaria: z.string().optional(),
    corSecundaria: z.string().optional(),
    logo: z.string().optional(),
    bannerPrincipal: z.string().optional(),
    favicon: z.string().optional(),
  }).optional(),
  gerais: z.object({
    nomeSite: z.string().optional(),
    emailSuporte: z.string().email().optional(),
    whatsapp: z.string().optional(),
    taxaPadrao: z.number().nonnegative().optional(),
    moeda: z.string().optional(),
    cadastroPublicoHabilitado: z.boolean().optional(),
  }).optional(),
});

const zodValidator = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Payload inválido', errors: result.error.issues });
  }
  req.body = result.data;
  return next();
};

module.exports = {
  promotionSchema,
  settingsSchema,
  zodValidator,
};
