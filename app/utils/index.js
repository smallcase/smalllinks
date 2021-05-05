module.exports = (nanoid, dbService, redisClient, kafkaProducer) => {
  const redisUtil = require('./redis')(redisClient);
  const commonFunctions = require('./commonFunctions');
  const { recordTrackingNotification } = require('./kafka')(kafkaProducer);
  const shortUrlGenerator = require('./shortUrlGenerator')(nanoid, redisUtil, dbService);

  return {
    redisUtil,
    shortUrlGenerator,
    commonFunctions,
    recordTrackingNotification,
  };
};
