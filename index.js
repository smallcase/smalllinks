const loader = require('./app/loaders');

// Load dependencies and connections
loader
  .run()
  .then(({ logger, fastify }) => {
    const { PORT, env } = require('./config');

    // Catching errors
    process.on('uncaughtException', (err) => {
      logger.fatal(err);
      process.exit(1);
    });

    process.on('unhandledRejection', (err) => {
      logger.fatal(err);
      process.exit(1);
    });

    if (env !== 'production') {
      fastify.ready((err) => {
        if (err) {
          logger.fatal(err);
          throw err;
        }
        fastify.swagger();
      });
    }

    // Start the server
    fastify.listen(PORT, '0.0.0.0', function (err, address) {
      if (err) {
        logger.fatal(err);
        process.exit(1);
      }
      logger.info({
        type: 'APPLICATION_ONLINE',
        message: {
          port: PORT,
          address,
        },
      });
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
