const { shortenUrlValidation, shortUrlValidation, statusValidation } = require('../validations');

module.exports = (controller) =>
  function (fastify, opts, done) {
    fastify.post('/shortenUrl', { schema: shortenUrlValidation }, controller.urlShortener.shortenUrl);
    fastify.get('/status', { schema: statusValidation }, controller.getStatus);
    fastify.get('/:shortUrl', { schema: shortUrlValidation }, controller.urlShortener.getLongUrl);

    done();
  };
