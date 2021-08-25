module.exports = (redisClient) => {
  const { promisify } = require('util');

  return {
    getAsync: promisify(redisClient.get).bind(redisClient),
    setAsync: promisify(redisClient.set).bind(redisClient),
    delAsync: promisify(redisClient.del).bind(redisClient),
  };
};
