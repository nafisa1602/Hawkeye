const prisma = require('../lib/prisma');

module.exports = {
  create: (data) => prisma.repository.create({ data }),
  findById: (id) => prisma.repository.findUnique({ where: { id } }),
  findMany: ({ where, orderBy, skip, take }) =>
    prisma.$transaction([
      prisma.repository.findMany({ where, orderBy, skip, take }),
      prisma.repository.count({ where }),
    ]),
  update: (id, data) => prisma.repository.update({ where: { id }, data }),
  remove: (id) => prisma.repository.delete({ where: { id } }),
};