const express = require('express');
const path = require('path');
const jsonServer = require('json-server');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const port = process.env.PORT || 3000;

// ============================================
// CONFIGURATION - Adjust these values as needed
// ============================================
const config = {
  // Latency range in milliseconds
  latency: {
    min: parseInt(process.env.LATENCY_MIN) || 100,
    max: parseInt(process.env.LATENCY_MAX) || 500,
  },
  // Error rate as a percentage (0-100)
  errorRate: parseFloat(process.env.ERROR_RATE) || 0,
  // Possible error codes to return
  errorCodes: [500, 502, 503, 504],
};

// Helper function to get random latency within range
const getRandomLatency = () => {
  return Math.floor(
    Math.random() * (config.latency.max - config.latency.min + 1) + config.latency.min
  );
};

// Helper function to determine if request should fail
const shouldFail = () => {
  return Math.random() * 100 < config.errorRate;
};

// Helper function to get random error code
const getRandomErrorCode = () => {
  return config.errorCodes[Math.floor(Math.random() * config.errorCodes.length)];
};

// Carica documento OpenAPI
const openapiPath = path.join(__dirname, 'openapi.yaml');
const openapiDocument = YAML.load(openapiPath);

// Swagger UI su /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));

// Middleware json-server (logger, static, cors, ecc.)
const middlewares = jsonServer.defaults();

// Configurable latency and error simulation middleware
app.use((req, res, next) => {
  // Don't affect documentation
  if (req.path.startsWith('/docs')) {
    return next();
  }

  const latency = getRandomLatency();

  setTimeout(() => {
    // Check if request should fail
    if (shouldFail()) {
      const errorCode = getRandomErrorCode();
      console.log(`[SIMULATED ERROR] ${req.method} ${req.path} - ${errorCode} (after ${latency}ms)`);
      return res.status(errorCode).json({
        error: true,
        code: errorCode,
        message: `Simulated server error (${errorCode})`,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[LATENCY] ${req.method} ${req.path} - ${latency}ms`);
    next();
  }, latency);
});

app.use(middlewares);

// Router json-server montato alla root: /products, /orders, ecc.
const router = jsonServer.router(path.join(__dirname, 'db.json'));
app.use('/api', router);

// Endpoint to get/update current configuration
app.get('/config', (_req, res) => {
  res.json(config);
});

app.patch('/config', express.json(), (req, res) => {
  const { latency, errorRate, errorCodes } = req.body;

  if (latency) {
    if (typeof latency.min === 'number') config.latency.min = latency.min;
    if (typeof latency.max === 'number') config.latency.max = latency.max;
  }
  if (typeof errorRate === 'number') config.errorRate = Math.min(100, Math.max(0, errorRate));
  if (Array.isArray(errorCodes)) config.errorCodes = errorCodes;

  console.log('[CONFIG UPDATED]', config);
  res.json(config);
});

// Redirect root alla documentazione per comodità
app.get('/', (_req, res) => {
  res.redirect('/docs');
});

app.listen(port, () => {
  console.log(`Mock API in esecuzione su http://localhost:${port}`);
  console.log(`Endpoint JSON Server: http://localhost:${port}/api/products`);
  console.log(`Swagger UI: http://localhost:${port}/docs`);
  console.log(`Configuration: http://localhost:${port}/config`);
  console.log(`\nCurrent settings:`);
  console.log(`  Latency: ${config.latency.min}-${config.latency.max}ms`);
  console.log(`  Error rate: ${config.errorRate}%`);
});
