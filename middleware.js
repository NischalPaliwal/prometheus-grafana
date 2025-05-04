import client from 'prom-client';

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeRequestGauge = new client.Gauge({
  name: 'active_requests',
  help: 'Number of active requests'
});

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000],
});

export const promClient = client;

export const requestCountMiddleware = (req, res, next) => {
  const startTime = Date.now();
  activeRequestGauge.inc();

  res.on('finish', () => {
    const endTime = Date.now();
    console.log(`Request took ${endTime - startTime}ms.`);

    requestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode
    });

    if (req.path !== '/metrics') {
      activeRequestGauge.dec();
    }

    httpRequestDurationMicroseconds.observe({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.status_code
    }, endTime - startTime);
  });

  next();
}

export const middleware = (req, res, next) => {
  const startTime = Date.now();
  next();
  const endTime = Date.now();
  console.log(`Time it took is: ${endTime - startTime}ms for method ${req.method} for route ${req.route.path}.`);
}