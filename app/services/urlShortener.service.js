const { debug, redisConfig } = require('../../config');
const commonFunctions = require('../utils/commonFunctions');

module.exports = (redisUtil, shortUrlGenerator, recordTrackingNotification, logger, dbService) => {
  return {
    async shortenUrl(url, expireOn) {
      try {
        if (debug)
          logger.info({
            type: 'DEBUG_MESSAGES',
            method: 'shortenUrl',
            description: 'Request to shorten URL.',
            url,
            expireOn,
          });

        // Check in cache
        const shortUrlInCache = await redisUtil.getAsync(`${redisConfig.shortenerKeyPrefix}${url}`);
        if (shortUrlInCache !== null) return shortUrlInCache;

        // Not in cache, check in DB
        const shortUrlInDb = await dbService.findByLongUrl(url);
        if (shortUrlInDb.rows.length !== 0) return shortUrlInDb.rows[0].id;

        // new long url, shorten it
        const shortUrl = await shortUrlGenerator.generateShortUrl();

        // Check for TTL, if not provided, let it sit in DB for 2 yrs
        const expiry = commonFunctions.getExpiryDate(expireOn);

        // save short URL mapping
        await dbService.saveToDb('shortenedLinks', {
          id: shortUrl,
          longUrl: url,
          date: new Date().toISOString(),
        });

        // save expiry for short URL
        await dbService.saveToDb('shortUrlExpiry', {
          id: shortUrl,
          expireOn: expiry.toISOString(),
        });

        return shortUrl;
      } catch (err) {
        logger.logError(err, {
          method: 'shortenUrl',
          description: 'Error while shortening the long URL.',
          url,
          expireOn,
        });
        throw err;
      }
    },
    async getLongUrl(shortUrl) {
      try {
        if (debug)
          logger.info({
            type: 'DEBUG_MESSAGES',
            method: 'getLongUrl',
            description: 'Trying to fetch longUrl for the provided short URL.',
            shortUrl,
          });

        // Check in cache
        const longUrlInCache = await redisUtil.getAsync(`${redisConfig.shortenerKeyPrefix}${shortUrl}`);
        if (longUrlInCache !== null) {
          recordTrackingNotification({ shortUrl });
          return longUrlInCache;
        }

        // not in cache, check in DB
        if (debug)
          logger.info({
            type: 'DEBUG_MESSAGES',
            method: 'getLongUrl',
            description: 'Checking DB for the provided short URL.',
            shortUrl,
          });
        const queryRes = await dbService.findByShortUrl(shortUrl);
        if (queryRes.rows.length === 0) return null; // non-existent short Url

        // entry present, update the cache
        const { longUrl } = queryRes.rows[0];
        await Promise.all([redisUtil.setAsync(`${redisConfig.shortenerKeyPrefix}${shortUrl}`, longUrl), redisUtil.setAsync(`${redisConfig.shortenerKeyPrefix}${longUrl}`, shortUrl)]);
        recordTrackingNotification({ shortUrl });

        return longUrl;
      } catch (err) {
        logger.logError(err, {
          method: 'getLongUrl',
          description: 'Error while fetching the longUrl for redirect.',
          shortUrl,
        });
        throw err;
      }
    },
  };
};
