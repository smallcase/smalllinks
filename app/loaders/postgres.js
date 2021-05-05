const config = require('../../config');
const { postgres } = require('../../config');

module.exports = (Pool, logger) => {
  const pool = new Pool(config.postgres);

  pool.on('error', (err) => {
    logger.error({ message: 'Unexpected error on idle client', err });
  });

  return {
    initialize() {
      const queryStr1 = `
      CREATE TABLE IF NOT EXISTS "${postgres.shortenedLinksTable}" (
        "id" VARCHAR(128) PRIMARY KEY,
        "longUrl" TEXT,
        "date" DATE
        );
        `;
      const queryStr2 = `
        CREATE TABLE IF NOT EXISTS "${postgres.shortUrlExpiryTable}" (
          "id" VARCHAR(128) PRIMARY KEY,
          "expireOn" DATE
          );
          `;

      return Promise.all([pool.query(queryStr1), pool.query(queryStr2)])
        .then(() => {
          logger.info({
            type: 'DEBUG_MESSAGES',
            method: 'initialize',
            description: 'Tables initialized successfully.',
          });
          return pool;
        })
        .catch((err) => {
          logger.logError(err, {
            method: 'initialize',
            description: 'Error occurred while initializing tables.',
          });
        });
    },
  };
};
