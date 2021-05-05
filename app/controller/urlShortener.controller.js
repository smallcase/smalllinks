const { httpStatus } = require('../../constants');
const { BASE_URL } = require('../../config');

module.exports = (services, logger) => {
  return {
    async shortenUrl(req, res) {
      try {
        const { url, expireOn } = req.body;
        const shortUrl = await services.urlShortener.shortenUrl(url, expireOn);
        res.send({ longUrl: url, shortUrl: `${BASE_URL}/${shortUrl}` });
      } catch (err) {
        logger.logError(err, {
          reqBody: req.body,
        });
        res.code(httpStatus.INTERNAL_SERVER_ERROR).send();
      }
    },
    async getLongUrl(req, res) {
      try {
        const { shortUrl } = req.params;
        const longUrl = await services.urlShortener.getLongUrl(shortUrl);
        if (longUrl === null) return res.code(httpStatus.NOT_FOUND).send();
        res.code(httpStatus.REDIRECT).redirect(`${longUrl}`);
      } catch (err) {
        logger.logError(err, {
          reqParams: req.params,
        });
        res.code(httpStatus.INTERNAL_SERVER_ERROR).send();
      }
    },
  };
};
