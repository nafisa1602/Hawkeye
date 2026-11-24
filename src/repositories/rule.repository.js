const prisma = require('../lib/prisma');

module.exports = {
  create: (repositoryId, data) => prisma.reviewRule.create({ data: { ...data, repositoryId } }),
  findById: (id) => prisma.reviewRule.findUnique({ where: { id } }),
  findByRepository: (repositoryId, where, orderBy) =>
    prisma.reviewRule.findMany({ where: { repositoryId, ...where }, orderBy }),
  update: (id, data) => prisma.reviewRule.update({ where: { id }, data }),
  remove: (id) => prisma.reviewRule.delete({ where: { id } }),
};
