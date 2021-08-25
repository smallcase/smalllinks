const proxyquire = require('proxyquire');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const { assert, expect } = chai;
const sinon = require('sinon');
const packages = require('../../package.json').dependencies;
const { redisConfig } = require('../../config');
const commonFunctions = require('../../app/utils/commonFunctions');
const redis = require('redis');
const pg = require('pg');
const kafkaNode = require('kafka-node');

const loader = proxyquire('../../app/loaders', {
  nanoid: { nanoid: sinon.stub().returns('abcde') },
});

describe('Testing URL Shortener', () => {
  // Populate "utils" before testing
  let utils;

  // Before all hook
  before(async () => {
    sinon.stub(redis, 'createClient').returns({
      on() {},
      get() {},
      set() {},
      del() {},
    });

    sinon.stub(pg, 'Pool').returns({
      on() {},
      query() {},
    });

    sinon.stub(kafkaNode, 'KafkaClient').returns({});
    sinon.stub(kafkaNode, 'Producer').returns({
      on() {},
      send() {},
    });

    const result = await loader.run();
    utils = result.utils;
    utils.urlShortener = result.services.urlShortener;
    utils.dbService = result.dbService;
  });

  // After all hook
  after(() => {
    sinon.restore();
  });

  // Check dependencies
  describe('Installed modules from package.json', function () {
    Object.keys(packages).forEach(function (packageName) {
      it(packageName, function () {
        assert.ok(require.resolve(packageName));
      });
    });
  });

  // Testing utils
  describe('Testing utils', function () {
    describe('Testing commonFunctions module', function () {
      describe('TTL is provided', function () {
        it('Expiry date should be 2 years ahead', function () {
          const ttl = '2025-12-25';
          const actual = commonFunctions.getExpiryDate(ttl);
          const expected = new Date(`${ttl}`);
          assert.equal(actual.toString(), expected.toString());
        });
      });

      describe('TTL is not provided', function () {
        it('Expiry date should match what is provided', function () {
          const actual = commonFunctions.getExpiryDate();
          const expectedDate = new Date();
          expectedDate.setFullYear(expectedDate.getFullYear() + 2);
          assert.equal(actual.toString(), expectedDate.toString());
        });
      });
    });

    describe('Testing utils index', function () {
      describe('Testing shortenUrl', function () {
        let getAsyncStub;
        let findByLongUrlStub;
        let generateShortUrlStub;
        const shortUrlTest = 'abcde';
        const longUrlTest = 'veryLongUrl';

        before(function () {
          // Stub getAsync of redisUtil
          getAsyncStub = sinon.stub(utils.redisUtil, 'getAsync');
          // Stub findByLongUrl of dbService
          findByLongUrlStub = sinon.stub(utils.dbService, 'findByLongUrl');
          // Stub generateShortUrl of shortUrlGenerator
          generateShortUrlStub = sinon.stub(utils.shortUrlGenerator, 'generateShortUrl');
          // Stub saveToDb of database utils
          sinon.stub(utils.dbService, 'saveToDb');
        });

        beforeEach(function () {
          getAsyncStub.reset();
          findByLongUrlStub.reset();
        });

        after(function () {
          utils.redisUtil.getAsync.restore();
          utils.dbService.findByLongUrl.restore();
          utils.shortUrlGenerator.generateShortUrl.restore();
          utils.dbService.saveToDb.restore();
        });

        it('Check when short URL is in redis', async function () {
          getAsyncStub.withArgs(`${redisConfig.shortenerKeyPrefix}${longUrlTest}`).returns(shortUrlTest);
          const actualResult = await utils.urlShortener.shortenUrl(longUrlTest);
          expect(getAsyncStub.calledOnce).to.be.true;
          assert.equal(shortUrlTest, actualResult);
        });

        it('Check when short URL is in DB', async function () {
          getAsyncStub.returns(null);
          findByLongUrlStub.withArgs(longUrlTest).returns({ rows: [{ longUrl: longUrlTest, id: shortUrlTest, date: '2020-12-25' }] });
          const actualResult = await utils.urlShortener.shortenUrl(longUrlTest);
          expect(getAsyncStub.calledOnce).to.be.true;
          expect(findByLongUrlStub.calledOnce).to.be.true;
          assert.equal(shortUrlTest, actualResult);
        });

        it('Check when a fresh short URL gets generated', async function () {
          getAsyncStub.returns(null);
          findByLongUrlStub.returns({ rows: [] });
          generateShortUrlStub.returns(shortUrlTest);
          const actualResult = await utils.urlShortener.shortenUrl(longUrlTest);
          expect(getAsyncStub.calledOnce).to.be.true;
          expect(findByLongUrlStub.calledOnce).to.be.true;
          expect(generateShortUrlStub.calledOnce).to.be.true;
          assert.equal(shortUrlTest, actualResult);
        });
      });

      describe('Test getLongUrl', function () {
        let findByShortUrlStub;
        let setAsyncStub;
        let getAsyncStub;
        const shortUrlTest = 'abcde';
        const longUrlTest = 'veryLongUrl';

        before(function () {
          // Stub getAsync of redisUtil
          getAsyncStub = sinon.stub(utils.redisUtil, 'getAsync');
          // Stub setAsync of redisUtil
          setAsyncStub = sinon.stub(utils.redisUtil, 'setAsync');
          // Stub findByShortUrl of dbService
          findByShortUrlStub = sinon.stub(utils.dbService, 'findByShortUrl');
        });

        beforeEach(function () {
          getAsyncStub.reset();
          findByShortUrlStub.reset();
        });

        after(function () {
          utils.redisUtil.getAsync.restore();
          utils.redisUtil.setAsync.restore();
          utils.dbService.findByShortUrl.restore();
        });

        it('Check when longUrl is in redis', async function () {
          getAsyncStub.withArgs(`${redisConfig.shortenerKeyPrefix}${shortUrlTest}`).returns(longUrlTest);
          const actualResult = await utils.urlShortener.getLongUrl(shortUrlTest);
          expect(getAsyncStub.calledOnce).to.be.true;
          assert.equal(longUrlTest, actualResult);
        });

        it('Check when longUrl is in DB', async function () {
          getAsyncStub.returns(null);
          findByShortUrlStub.withArgs(shortUrlTest).returns({ rows: [{ longUrl: longUrlTest, id: shortUrlTest, date: '2020-12-25' }] });
          const actualResult = await utils.urlShortener.getLongUrl(shortUrlTest);
          expect(getAsyncStub.calledOnce).to.be.true;
          expect(findByShortUrlStub.calledOnce).to.be.true;
          assert.equal(longUrlTest, actualResult);
        });

        it('Check when longUrl is not found', async function () {
          getAsyncStub.returns(null);
          findByShortUrlStub.withArgs(shortUrlTest).returns({ rows: [] });
          const actualResult = await utils.urlShortener.getLongUrl(shortUrlTest);
          expect(getAsyncStub.calledOnce).to.be.true;
          expect(findByShortUrlStub.calledOnce).to.be.true;
          expect(actualResult).to.be.null;
        });
      });
    });

    describe('Testing shortUrlGenerator', function () {
      let findByShortUrlStub;
      let isTTLExpiredStub;
      let deleteStaleDataStub;
      let getAsyncStub;
      const shortUrlTest = 'abcde';
      let longUrlTest = 'veryLongUrl';
      const redisShortUrlKey = `${redisConfig.shortenerKeyPrefix}${shortUrlTest}`;

      before(function () {
        // Stub getAsync of redisUtil
        getAsyncStub = sinon.stub(utils.redisUtil, 'getAsync');
        // Stub findByShortUrl of dbService
        findByShortUrlStub = sinon.stub(utils.dbService, 'findByShortUrl');
        // Stub isTTLExpired of dbService
        isTTLExpiredStub = sinon.stub(utils.dbService, 'isTTLExpired');
        // Stub isTTLExpired of dbService
        deleteStaleDataStub = sinon.stub(utils.dbService, 'deleteStaleData');
      });

      beforeEach(function () {
        findByShortUrlStub.reset();
        isTTLExpiredStub.reset();
        getAsyncStub.reset();
        deleteStaleDataStub.reset();
      });

      after(function () {
        utils.redisUtil.getAsync.restore();
        utils.dbService.findByShortUrl.restore();
        utils.dbService.isTTLExpired.restore();
        deleteStaleDataStub.restore();
      });

      it('Check when short Url generation is successful in first try', async function () {
        getAsyncStub.returns(null);
        findByShortUrlStub.returns({ rows: [] });
        const actualResult = await utils.shortUrlGenerator.generateShortUrl();

        expect(getAsyncStub.calledOnce).to.be.true;
        expect(findByShortUrlStub.calledOnce).to.be.true;
        expect(findByShortUrlStub.calledWith(shortUrlTest)).to.be.true;
        expect(getAsyncStub.calledWith(redisShortUrlKey)).to.be.true;
        assert.equal(actualResult, shortUrlTest);
      });

      it('Check when short Url generation failed to generate a unique short Url', async function () {
        getAsyncStub.withArgs(redisShortUrlKey).returns(shortUrlTest);
        isTTLExpiredStub.withArgs(shortUrlTest).returns(false);
        let actualResultPromise;
        try {
          actualResultPromise = utils.shortUrlGenerator.generateShortUrl();
          assert.isRejected(actualResultPromise);
          await actualResultPromise;
        } catch (err) {
          assert(getAsyncStub.callCount, 5);
          assert(isTTLExpiredStub.callCount, 5);
          expect(getAsyncStub.calledWith(redisShortUrlKey)).to.be.true;
          expect(isTTLExpiredStub.calledWith(shortUrlTest)).to.be.true;
        }
      });

      describe('Testing when a duplicate short Url is present in redis', function () {
        it('Check when TTL is found expired in first try', async function () {
          getAsyncStub.withArgs(redisShortUrlKey).returns(shortUrlTest);
          isTTLExpiredStub.withArgs(shortUrlTest).returns(true);
          deleteStaleDataStub.withArgs(shortUrlTest).returns(true);

          const actualResult = await utils.shortUrlGenerator.generateShortUrl();
          expect(getAsyncStub.calledOnce).to.be.true;
          expect(isTTLExpiredStub.calledOnce).to.be.true;
          assert(actualResult, shortUrlTest);
        });

        it('Check when TTL is not found expired in first try', async function () {
          getAsyncStub.withArgs(redisShortUrlKey).returns(shortUrlTest);
          isTTLExpiredStub.withArgs(shortUrlTest).onCall(0).returns(false).withArgs(shortUrlTest).onCall(1).returns(true);
          deleteStaleDataStub.withArgs(shortUrlTest).returns(true);

          const actualResult = await utils.shortUrlGenerator.generateShortUrl();
          expect(getAsyncStub.calledTwice).to.be.true;
          expect(isTTLExpiredStub.calledTwice).to.be.true;
          assert(actualResult, shortUrlTest);
        });
      });

      describe('Testing when a duplicate short Url is present in DB', function () {
        it('Check when TTL is found expired in first try', async function () {
          getAsyncStub.withArgs(redisShortUrlKey).returns(null);
          findByShortUrlStub.withArgs(shortUrlTest).returns({ rows: [{ longUrl: longUrlTest, id: shortUrlTest, date: '2020-12-25' }] });
          isTTLExpiredStub.withArgs(shortUrlTest).returns(true);
          deleteStaleDataStub.withArgs(shortUrlTest).returns(true);

          const actualResult = await utils.shortUrlGenerator.generateShortUrl();
          expect(getAsyncStub.calledOnce).to.be.true;
          expect(findByShortUrlStub.calledOnce).to.be.true;
          expect(isTTLExpiredStub.calledOnce).to.be.true;
          assert(actualResult, shortUrlTest);
        });

        it('Check when TTL is not found expired in first try', async function () {
          getAsyncStub.withArgs(redisShortUrlKey).returns(null);
          findByShortUrlStub
            .withArgs(shortUrlTest)
            .onCall(0)
            .returns({ rows: [{ longUrl: longUrlTest, id: shortUrlTest, date: '2020-12-25' }] })
            .withArgs(shortUrlTest)
            .onCall(1)
            .returns({ rows: [] });
          isTTLExpiredStub.withArgs(shortUrlTest).onCall(0).returns(false);

          const actualResult = await utils.shortUrlGenerator.generateShortUrl();
          expect(getAsyncStub.calledTwice).to.be.true;
          expect(findByShortUrlStub.calledTwice).to.be.true;
          expect(isTTLExpiredStub.calledOnce).to.be.true;
          assert(actualResult, shortUrlTest);
        });
      });
    });
  });
});
