const config = require('../../config');

module.exports = function (bunyan) {
  const streams = [
    {
      level: 'info',
      stream: process.stdout,
    },
  ];

  const logger = bunyan.createLogger({
    name: config.logger.loggerName,
    streams,
  });

  return {
    /**
     * debug logs
     * @param {LogFormat} data
     */
    debug(data) {
      logger.debug(data);
    },

    /**
     * pinpoint locations of current code execution
     * ("you are here" kind of logs)
     * @param {LogFormat} data
     */
    trace(data) {
      logger.trace(data);
    },

    /**
     * Any simple logs
     * @param {LogFormat} data
     */
    info(data) {
      logger.info(data);
    },

    /**
     * Something's slow or something should be improved etc
     * @param {LogFormat} data
     */
    warn(data) {
      logger.warn(data);
    },

    /**
     * errors like network failure etc
     * @param {LogFormat} data
     */
    error(data) {
      logger.error(data);
    },

    /**
     * fatal logs, needs attention
     * @param {LogFormat} data
     */
    fatal(error, { type, context } = {}) {
      const log = {
        type: type || 'UNCAUGHT_EXCEPTION',
        message: {
          error: this.errorToObject(error),
          context,
        },
      };
      logger.fatal(log);
    },

    logError(error, { type, context, level } = {}) {
      /** @type {LogFormat} */
      const log = {
        type: type || 'ERRORS',
        message: {
          error: this.errorToObject(error),
          context,
        },
      };
      const logLevel = level || 'error';
      logger[logLevel](log);
    },

    errorToObject(error) {
      if (!error) return undefined;
      return {
        name: error.name,
        message: error,
        stack: error.stack,
      };
    },

    child() {
      return Object.create(this);
    },
  };
};
