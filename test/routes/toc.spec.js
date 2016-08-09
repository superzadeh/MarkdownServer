var setup = require('../setup.js');
var mockery = require('mockery');
var request = require('supertest');
var assert = require('assert');
var sinon = require('sinon');
var bluebird = require('bluebird');
require('sinon-as-promised')(bluebird);
var fs = require('fs');
var constants = require('../../src/constants');

describe('GET /toc with a valid table of content', function () {
  var app;
  beforeEach(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('../credentials', {
      username: 'test',
      password: 'test'
    });
  });

  afterEach(function () {
    app = null;
    mockery.deregisterMock('fs');
    mockery.deregisterMock('credentials');
    mockery.disable();
  });

  it('should return the table of contents as JSON', function (done) {

    mockery.registerMock('fs', {
      accessAsync: sinon.stub().resolves(null),
      readFileAsync: sinon.stub().resolves('# Title 1 ## Title 2'),
      stat: fs.stat,
      readFileSync: sinon.stub()
    });

    app = require('../../src/app');

    request(app)
      .get('/toc/example')
      .expect('Content-Type', /application\/json/)
      .expect(function (res) {
        res.body.should.eql([{
          content: 'Title 1 ## Title 2',
          slug: 'title-1-##-title-2',
          lvl: 1,
          i: 0,
          seen: 0
        }]);
      })
      .expect(200, done);
  });

  it('should return an "Not found" error if the requested file does not exists', function (done) {

    mockery.registerMock('fs', {
      accessAsync: sinon.stub().rejects('ENOENT'),
      readFileAsync: sinon.stub(),
      stat: fs.stat,
      readFileSync: sinon.stub()
    });
    app = require('../../src/app');

    request(app)
      .get('/toc/notfound')
      .expect(function (res) {
        res.body.should.match(/File not found/);
      })
      .expect(404, done);
  });

  it('should return an "Internal error" if an unknown error is thrown when accessing the file', function (done) {
    mockery.registerMock('fs', {
      accessAsync: sinon.stub().rejects('unknown error'),
      readFileAsync: sinon.stub(),
      stat: fs.stat,
      readFileSync: sinon.stub()
    });
    app = require('../../src/app');

    request(app)
      .get('/toc/notfound')
      .expect(function (res) {
        res.body.should.match(/Internal error/);
      })
      .expect(500, done);
  });
});