const { httpStatus } = require('../../constants');

module.exports = (services, logger) => {
  const urlShortenerController = require('./urlShortener.controller')(services, logger);

  return {
    getStatus(req, res) {
      res.code(httpStatus.SUCCESS).send();
    },
    urlShortener: urlShortenerController,
  };
};
