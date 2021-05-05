module.exports = {
  serviceName: process.env.APPLICATION_NAME || 'smalllinks',
  BASE_URL: process.env.BASE_URL || 'localhost:8201',
  PORT: process.env.PORT || 8201,
  debug: process.env.SHORTENER_DEBUG || false,
  shortUrlLength: process.env.SHORT_URL_LENGTH || 5,
  shortKeyGenerationRetriesCount: process.env.SHORT_KEY_GENERATION_RETRIES_COUNT || 5,

  kafka: {
    host: process.env.KAFKA_HOST || 'localhost:9092',
    producerOptions: {
      requireAcks: 1, // Configuration for when to consider a message as acknowledged, default 1
      partitionerType: 2, // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
    },
  },

  postgres: {
    user: process.env.DB_USER || 'worker',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'fastdb',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
    // two instances of this, PG will maintain 5 + 5 = 10 connections
    max: process.env.DB_CONNECTIONS || 5,
    // an unused connection will be closed after 30s of inactivity
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
    // no timeout
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 0,
    // tables
    shortenedLinksTable: process.env.shortenedLinksTable || 'shortenedLinks',
    shortUrlExpiryTable: process.env.shortUrlExpiryTable || 'shortUrlExpiry',
  },

  redisConfig: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    auth: process.env.REDIS_AUTH || '',
    options: {},
    shortenerKeyPrefix: 'smalllinks:',
  },

  logger: {
    loggerName: process.env.APPLICATION_NAME || 'smalllinks',
    level: process.env.LOG_LEVEL || 'info', // info, debug, warn, error
    path: `./`,
  },
};
