const { BASE_URL } = require('../../config');

module.exports = {
  shortenUrlValidation: {
    description: 'By passing in the original long URL, a shortened URL is generated, stored and returned.',
    tags: ['org'],
    required: ['url'],
    summary: 'Outputs shortened link for original long URL',
    produces: 'application/json',
    body: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          not: {
            type: ['integer', 'boolean', 'null', 'array'],
          },
          description: 'original long URL',
          example: 'https://example.com',
        },
        expireOn: {
          type: 'string',
          not: {
            type: ['integer', 'boolean', 'null', 'array'],
          },
          description: 'Time-to-live for the mapping of short and long URLs',
          example: '2022-01-01',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        description: 'shorten URL successful',
        properties: {
          longUrl: {
            type: 'string',
            description: 'long URL provided in the body',
            example: 'https://expressjs.com',
          },
          shortUrl: {
            type: 'string',
            description: 'short URL generated for the provided long URL',
            example: `${BASE_URL}/abcde`,
          },
        },
      },
      500: {
        type: 'object',
        description: 'Internal server error occurred',
      },
    },
  },
  shortUrlValidation: {
    description:
      "By passing in a short URL, you get redirected to the original long URL mapped to that. This errors out if the destination (long) URL server doesn't have Access-Control-Allow-Origin header in its response.",
    tags: ['everyone'],
    required: ['shortUrl'],
    summary: 'Redirects to the mapped long URL',
    produces: 'text/html',
    params: {
      type: 'object',
      properties: {
        shortUrl: {
          type: 'string',
          description: 'Enter only the short key',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        description: 'Redirect successful',
      },
      404: {
        type: 'object',
        description: 'not found',
      },
      500: {
        type: 'object',
        description: 'internal server error',
      },
    },
  },
  statusValidation: {
    description: 'Status checks for URL shortener.',
    tags: ['everyone'],
    summary: 'Checks the health of the URL shortener service.',
    produces: 'application/json',
    response: {
      200: {
        type: 'object',
        description: 'Status check successful.',
      },
      500: {
        type: 'object',
        description: 'this is a redirect response',
      },
    },
  },
};
