const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const openapi = require('./docs/openapi');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/docs.json', (req, res) => res.json(openapi));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Shared Calendars API' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/calendars', require('./routes/calendars'));
app.use('/api', require('./routes/events'));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
