const { postgres } = require('../../config');

module.exports = (logger, pool) => {
  return {
    query(queryStr) {
      return pool.query(queryStr);
    },
    async findByShortUrl(shortUrl) {
      try {
        return await this.query({
          text: `SELECT * FROM "${postgres.shortenedLinksTable}" WHERE "id" = $1;`,
          values: [shortUrl],
        });
      } catch (err) {
        logger.logError(err, {
          method: 'findByShortUrl',
          description: 'Error while finding by short url.',
          shortUrl,
        });
        throw err;
      }
    },
    async findByLongUrl(longUrl) {
      try {
        return await this.query({
          text: `SELECT * FROM "${postgres.shortenedLinksTable}" WHERE "longUrl" = $1;`,
          values: [longUrl],
        });
      } catch (err) {
        logger.logError(err, {
          method: 'findByLongUrl',
          description: 'Error while finding by long url.',
          longUrl,
        });
        throw err;
      }
    },
    async saveToDb(table, data) {
      let queryKeys = `INSERT INTO "${table}" (`;
      let queryValues = ` VALUES (`;
      let counter = 1;
      const values = [];

      Object.keys(data).forEach(function (key) {
        if (counter < Object.keys(data).length) {
          queryKeys += `"${key}", `;
          queryValues = `${queryValues}$${counter}, `;
        } else if (counter === Object.keys(data).length) {
          queryKeys += `"${key}")`;
          queryValues = `${queryValues}$${counter})`;
        }
        counter += 1;
        values.push(data[key]);
      });

      const queryData = {
        text: queryKeys + queryValues,
        values,
      };

      try {
        return await this.query(queryData);
      } catch (err) {
        logger.logError(err, {
          method: 'saveToDb',
          description: 'Error occurred in saveToDb',
          queryData,
        });
        throw err;
      }
    },
    async deleteStaleData(shortUrl) {
      await this.query({
        text: `DELETE FROM "${postgres.shortenedLinksTable}" WHERE "id" = $1;`,
        values: [shortUrl],
      });
      await this.query({
        text: `DELETE FROM "${postgres.shortUrlExpiryTable}" WHERE "id" = $1;`,
        values: [shortUrl],
      });
    },
    async isTTLExpired(shortUrl) {
      try {
        const result = await this.query({
          text: `SELECT * FROM "${postgres.shortUrlExpiryTable}" WHERE "id" = $1;`,
          values: [shortUrl],
        });
        const currentDate = new Date();
        // The shortURL is expired, its fine to override it
        if (result.rows && result.rows[0].expireOn < currentDate) return true;
        return false;
      } catch (err) {
        logger.logError(err, {
          method: 'isTTLExpired',
          description: 'Error while checking for TTL expiry in URL shortener.',
          shortUrl,
        });
        throw err;
      }
    },
  };
};
