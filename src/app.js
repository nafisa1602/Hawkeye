const express = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/repositories', require('./routes/repository.routes'));

app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
app.use(errorHandler);

module.exports = app;