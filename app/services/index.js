module.exports = ({ redisUtil, shortUrlGenerator, recordTrackingNotification, logger, dbService }) => {
  const urlShortener = require('./urlShortener.service')(redisUtil, shortUrlGenerator, recordTrackingNotification, logger, dbService);

  return {
    dbService,
    urlShortener,
  };
};
