const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const { nestedRouter, ruleRouter } = require('./routes/rule.routes');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/repositories', require('./routes/repository.routes'));
app.use('/api/repositories/:id/rules', nestedRouter);
app.use('/api/rules', ruleRouter);

app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
app.use(errorHandler);

module.exports = app;
