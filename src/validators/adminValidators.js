/**
 * Validator: define regras de validação para payloads de entrada das APIs.
 * Arquivo: src/validators/adminValidators.js
 */
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

const toNumber = z.coerce.number();

// Mantém undefined quando campo não é enviado; converte strings comuns de formulário para boolean.
const toOptionalBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean().optional());

const promotionSchema = z.object({
  discountPercentage: toNumber.min(1).max(100),
  productId: objectId,
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  active: toOptionalBoolean,
});

// Para atualização aceitamos payload parcial para evitar erro em PUT/PATCH no front.
const promotionUpdateSchema = promotionSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  { message: 'Envie pelo menos um campo para atualizar' }
);

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
    return res.status(400).json({
      success: false,
      message: 'Payload inválido',
      errors: result.error.issues,
    });
  }
  req.body = result.data;
  return next();
};

module.exports = {
  promotionSchema,
  promotionUpdateSchema,
  settingsSchema,
  zodValidator,
};
