const service = require('../services/rule.service');
const v = require('../validators/rule.validator');

module.exports = {
  create: async (req, res) =>
    res.status(201).json(await service.create(v.idSchema.parse(req.params.id), v.createRuleSchema.parse(req.body))),
  listForRepository: async (req, res) =>
    res.json(await service.listForRepository(v.idSchema.parse(req.params.id), v.listRulesQuerySchema.parse(req.query))),
  getById: async (req, res) => res.json(await service.getById(v.idSchema.parse(req.params.ruleId))),
  update: async (req, res) =>
    res.json(await service.update(v.idSchema.parse(req.params.ruleId), v.updateRuleSchema.parse(req.body))),
  remove: async (req, res) => { await service.remove(v.idSchema.parse(req.params.ruleId)); res.status(204).end(); },
};
