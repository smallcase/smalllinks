module.exports = (generate, dbService, redisClient, kafkaProducer) => {
  const redisUtil = require('./redis')(redisClient);
  const commonFunctions = require('./commonFunctions');
  const { recordTrackingNotification } = require('./kafka')(kafkaProducer);
  const shortUrlGenerator = require('./shortUrlGenerator')(generate, redisUtil, dbService);

  return {
    redisUtil,
    shortUrlGenerator,
    commonFunctions,
    recordTrackingNotification,
  };
};
