const redis = require('redis');
const kafkaNode = require('kafka-node');
const { Pool } = require('pg');
const bunyan = require('bunyan');
const { nanoid } = require('nanoid');
const helmet = require('fastify-helmet');
const fastifySwagger = require('fastify-swagger');
const cors = require('fastify-cors');
const fastify = require('fastify')({
  logger: false,
  ignoreTrailingSlash: true,
  bodyLimit: 1000000, // in bytes = 1MB
});

module.exports = {
  run() {
    return new Promise((resolve, reject) => {
      const logger = require('../logger')(bunyan);
      const kafkaProducer = require('./kafka')(kafkaNode, nanoid, logger);
      const postgres = require('./postgres')(Pool, logger);

      postgres
        .initialize()
        .then((pool) => {
          const redisClient = require('./redis')(redis, logger);
          const dbService = require('../services/postgres.service')(logger, pool);
          const utils = require('../utils')(nanoid, dbService, redisClient, kafkaProducer);
          const services = require('../services')({ ...utils, logger, pool, dbService });
          const controller = require('../controller')(services, logger);
          const fastifyLoader = require('./fastify')(fastify, logger, controller, helmet, fastifySwagger, cors);

          fastifyLoader.start();
          resolve({ logger, fastify, utils, services, dbService, pool });
        })
        .catch((err) => {
          logger.logError(err, {
            description: 'Failed to initialize connections in loader.',
          });
          reject(err);
        });
    });
  },
};
