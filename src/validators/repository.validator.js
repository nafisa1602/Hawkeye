const { z } = require('zod');

const createRepositorySchema = z.object({
  name: z.string().min(1).max(100),
  owner: z.string().min(1).max(100),
  githubUrl: z.string().url().startsWith('https://github.com/'),
  defaultBranch: z.string().min(1).default('main'),
  isActive: z.boolean().optional(),
});

const updateRepositorySchema = createRepositorySchema.partial().strict();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sort: z.enum(['name', '-name', 'createdAt', '-createdAt']).default('-createdAt'),
});

const idSchema = z.coerce.number().int().positive();

module.exports = { createRepositorySchema, updateRepositorySchema, listQuerySchema, idSchema };