const { redisConfig } = require('../../config');

module.exports = (redis, logger) => {
  const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

  redisClient.on('connect', function () {
    logger.info({ redis: 'Connection open' });
  });
  redisClient.on('error', function (err) {
    logger.error({ err: { name: err.name, stack: err.stack } });
  });
  redisClient.on('reconnecting', function () {
    logger.info({ redis: 'Reconnecting...' });
  });
  redisClient.on('end', function () {
    logger.info({ redis: 'Connection end' });
  });
  return redisClient;
};
