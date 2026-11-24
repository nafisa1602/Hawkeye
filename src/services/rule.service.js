const ruleRepo = require('../repositories/rule.repository');
const repositoryService = require('./repository.service');
const AppError = require('../utils/AppError');

async function getById(id) {
  const rule = await ruleRepo.findById(id);
  if (!rule) throw new AppError(404, 'NOT_FOUND', 'Rule not found');
  return rule;
}

async function create(repositoryId, data) {
  await repositoryService.getById(repositoryId); // 404 if repo doesn't exist
  return ruleRepo.create(repositoryId, data);
}

async function listForRepository(repositoryId, { severity, enabled, sort }) {
  await repositoryService.getById(repositoryId);
  const where = {};
  if (severity) where.severity = severity;
  if (enabled) where.enabled = enabled === 'true';
  const field = sort.replace('-', '');
  const orderBy = { [field]: sort.startsWith('-') ? 'desc' : 'asc' };
  return ruleRepo.findByRepository(repositoryId, where, orderBy);
}

module.exports = {
  create,
  listForRepository,
  getById,
  update: async (id, data) => { await getById(id); return ruleRepo.update(id, data); },
  remove: async (id) => { await getById(id); await ruleRepo.remove(id); },
};
