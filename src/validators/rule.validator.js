const { z } = require('zod');

const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const createRuleSchema = z.object({
  title: z.string().min(1).max(150),
  content: z.string().min(1),
  severity: severityEnum.default('MEDIUM'),
  enabled: z.boolean().optional(),
});

// No defaults here: a PATCH must only change the fields that were sent.
const updateRuleSchema = z.strictObject({
  title: z.string().min(1).max(150).optional(),
  content: z.string().min(1).optional(),
  severity: severityEnum.optional(),
  enabled: z.boolean().optional(),
});

const listRulesQuerySchema = z.object({
  severity: severityEnum.optional(),
  enabled: z.enum(['true', 'false']).optional(),
  sort: z.enum(['title', '-title', 'createdAt', '-createdAt']).default('-createdAt'),
});

const idSchema = z.coerce.number().int().positive();

module.exports = { createRuleSchema, updateRuleSchema, listRulesQuerySchema, idSchema };
