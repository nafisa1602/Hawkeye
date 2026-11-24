const express = require('express');
const c = require('../controllers/rule.controller');

// mounted at /api/repositories/:id/rules
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.post('/', c.create);
nestedRouter.get('/', c.listForRepository);

// mounted at /api/rules
const ruleRouter = express.Router();
ruleRouter.get('/:ruleId', c.getById);
ruleRouter.patch('/:ruleId', c.update);
ruleRouter.delete('/:ruleId', c.remove);

module.exports = { nestedRouter, ruleRouter };
