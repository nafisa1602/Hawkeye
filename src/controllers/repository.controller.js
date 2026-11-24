const service = require('../services/repository.service');
const v = require('../validators/repository.validator');

module.exports = {
  create: async (req, res) => res.status(201).json(await service.create(v.createRepositorySchema.parse(req.body))),
  list: async (req, res) => res.json(await service.list(v.listQuerySchema.parse(req.query))),
  getById: async (req, res) => res.json(await service.getById(v.idSchema.parse(req.params.id))),
  update: async (req, res) =>
    res.json(await service.update(v.idSchema.parse(req.params.id), v.updateRepositorySchema.parse(req.body))),
  remove: async (req, res) => { await service.remove(v.idSchema.parse(req.params.id)); res.status(204).end(); },
};