const { shortUrlLength, redisConfig, shortKeyGenerationRetriesCount } = require('../../config');

module.exports = (nanoid, redisUtil, dbService) => {
  return {
    async generateShortUrl() {
      let shortUrl;
      let isShortUrlTaken;
      let retries = 1;

      /* eslint-disable no-await-in-loop */
      do {
        shortUrl = nanoid(+shortUrlLength);
        isShortUrlTaken = await redisUtil.getAsync(`${redisConfig.shortenerKeyPrefix}${shortUrl}`);
        if (isShortUrlTaken === null) {
          isShortUrlTaken = await dbService.findByShortUrl(shortUrl);
          if (isShortUrlTaken.rows.length === 0) return shortUrl;
        }

        // short URL is already in use, check if it's expired or not
        if (isShortUrlTaken !== null) {
          if (await dbService.isTTLExpired(shortUrl)) {
            // delete the already existing entries in the DB for shortUrl
            await dbService.deleteStaleData(shortUrl, redisUtil);
            return shortUrl;
          }
        }
        retries += 1;
      } while (retries <= +shortKeyGenerationRetriesCount);

      throw new Error('Could not generate a unique short key');
    },
  };
};
