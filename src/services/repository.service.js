const repo = require('../repositories/repository.repository');
const AppError = require('../utils/AppError');

async function getById(id) {
  const found = await repo.findById(id);
  if (!found) throw new AppError(404, 'NOT_FOUND', 'Repository not found');
  return found;
}

async function list({ page, limit, search, isActive, sort }) {
  const where = {};
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (isActive) where.isActive = isActive === 'true';
  const field = sort.replace('-', '');
  const orderBy = { [field]: sort.startsWith('-') ? 'desc' : 'asc' };
  const [items, total] = await repo.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit });
  return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

module.exports = {
  create: (data) => repo.create(data),
  getById,
  list,
  update: async (id, data) => { await getById(id); return repo.update(id, data); },
  remove: async (id) => { await getById(id); await repo.remove(id); },
};