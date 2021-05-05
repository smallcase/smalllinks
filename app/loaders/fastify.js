const { BASE_URL, env } = require('../../config');

module.exports = (fastify, logger, controller, helmet, fastifySwagger, cors) => {
  const routes = require('../routes')(controller);

  return {
    async start() {
      /*
       * Register helmet with default config only on prod
       * - unsafe-inline is needed for swagger
       * - data: for imgSrc needed for img assets
       */
      if (env === 'production') {
        fastify.register(helmet);
      } else {
        fastify.register(helmet, {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'", '*'],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: "'self' data:",
            },
          },
        });
      }

      // Access-Control-Allow-Origin: '*'
      fastify.register(cors, {
        origin: '*',
      });

      // We don't need swagger in production
      if (env !== 'production') {
        fastify.register(fastifySwagger, {
          routePrefix: '/api-docs',
          swagger: {
            info: {
              title: 'URL Shortener',
              description: 'This is URL shortener API documentation.',
              version: '1.0.0',
            },
            externalDocs: {
              url: 'https://gitlab.com/rishabhrawat570/url-shortener/-/blob/development/README.md',
              description: 'Find more about this service here.',
            },
            host: BASE_URL,
            schemes: ['https', 'http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [
              { name: 'everyone', description: 'Operations available to everyone' },
              { name: 'org', description: 'Operations available within org ecosystem only' },
            ],
          },
          exposeRoute: true,
        });
      }

      // register routes
      fastify.register(routes);

      let responseTime;

      // Lifecycle hooks to produce logs
      fastify.addHook('onRequest', (req, reply, done) => {
        responseTime = new Date();
        req.requestId = req.headers['x-amzn-trace-id'] || `id-${Math.random()}`;

        logger.info({
          type: 'REQUEST_LOG',
          'user-agent': req.headers['user-agent'],
          message: {
            method: req.method,
            contentLength: req.headers['content-length'],
            requestId: req.requestId,
            url: req.url,
            headers: {
              host: req.headers.host,
              'x-forwarded-for': req.headers['x-forwarded-for'],
              'x-forwarded-proto': req.headers['x-forwarded-proto'],
              'x-forwarded-port': req.headers['x-forwarded-port'],
            },
            extra: {
              headers: req.headers,
              params: req.params,
              query: req.query,
              body: req.body,
            },
          },
        });
        done();
      });

      fastify.addHook('onResponse', (req, reply, done) => {
        logger.info({
          type: 'RESPONSE_LOG',
          'user-agent': req.headers['user-agent'],
          message: {
            responseTime: new Date() - responseTime,
            method: req.method,
            contentLength: req.headers['content-length'],
            requestId: req.requestId,
            statusCode: reply.statusCode,
            url: req.url,
            user: req.user,
            headers: {
              host: req.headers.host,
              'x-forwarded-for': req.headers['x-forwarded-for'],
              'x-forwarded-proto': req.headers['x-forwarded-proto'],
              'x-forwarded-port': req.headers['x-forwarded-port'],
            },
            extra: {
              headers: req.headers,
              params: req.params,
              query: req.query,
              body: req.body,
            },
          },
        });
        done();
      });
    },
  };
};
