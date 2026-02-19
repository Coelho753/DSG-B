const { z } = require('zod');

/**
 * Validação de ObjectId do MongoDB
 */
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

/**
 * ================================
 * PROMOTION SCHEMA
 * ================================
 */
const promotionSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),

  // Converte string para number automaticamente
  discountPercentage: z.coerce
    .number({
      invalid_type_error: 'Desconto deve ser um número',
    })
    .min(1, 'Desconto mínimo é 1%')
    .max(100, 'Desconto máximo é 100%'),

  productId: objectId,

  startDate: z.string().min(1, 'Data inicial é obrigatória'),
  endDate: z.string().min(1, 'Data final é obrigatória'),

  active: z
    .preprocess(
      (value) => {
        if (value === 'false') return false;
        if (value === 'true') return true;
        return Boolean(value);
      },
      z.boolean()
    )
    .optional(),
});

/**
 * ================================
 * SETTINGS SCHEMA
 * ================================
 */
const settingsSchema = z.object({
  conta: z
    .object({
      nome: z.string().optional(),
      email: z.string().email('Email inválido').optional(),
      senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
    })
    .optional(),

  aparencia: z
    .object({
      corPrimaria: z.string().optional(),
      corSecundaria: z.string().optional(),
      logo: z.string().optional(),
      bannerPrincipal: z.string().optional(),
      favicon: z.string().optional(),
    })
    .optional(),

  gerais: z
    .object({
      nomeSite: z.string().optional(),
      emailSuporte: z.string().email('Email inválido').optional(),
      whatsapp: z.string().optional(),

      // Corrigido para aceitar string e converter
      taxaPadrao: z.coerce
        .number({
          invalid_type_error: 'Taxa deve ser um número',
        })
        .nonnegative('Taxa não pode ser negativa')
        .optional(),

      moeda: z.string().optional(),
      cadastroPublicoHabilitado: z.coerce.boolean().optional(),
    })
    .optional(),
});

/**
 * ================================
 * MIDDLEWARE DE VALIDAÇÃO
 * ================================
 */
const zodValidator = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Payload inválido',
      errors: result.error.issues,
    });
  }

  // Substitui body pelo dado já validado e convertido
  req.body = result.data;

  return next();
};

module.exports = {
  promotionSchema,
  settingsSchema,
  zodValidator,
};