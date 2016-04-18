var setup = require('../setup.js');
var mockery = require('mockery');
var request = require('supertest');
var assert = require('assert');
var chai = require('chai').should();
var nock = require('nock');
var constants = require('../../src/constants');

process.env.MARKDOWN_EXTERNAL_ROOT = 'http://www.test.com/';

describe('GET /external/*', function () {
  var app;
  before(function () {
    app = require('../../src/app');

  });
  beforeEach(function () {
    var externalSource = nock(process.env.MARKDOWN_EXTERNAL_ROOT)
      .get('/test.md')
      .reply(200, '# Test Title')
      .get('/500file.md')
      .reply(500, null)
      .get('/notfound.md')
      .reply(404);
  });

  afterEach(function () {
    nock.cleanAll();
  })

  it('should return HTML content for a file that exists', function (done) {
    request(app)
      .get('/external/test')
      .expect('Content-Type', /text\/html/)
      .expect(200, done);
  });

  it('should transform the markdown file\'s content to HTML', function (done) {
    request(app)
      .get('/external/test')
      .expect(function (res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
      })
      .expect(200, done);
  });

  it('should return 200 as status code for an URL that does not exist', function (done) {
    request(app)
      .get('/external/notfound')
      .expect(200, done);
  });

  it('should return "File not found" for an URL that does not exist', function (done) {
    request(app)
      .get('/external/notfound')
      .expect(function (res) {
        res.text.should.match(/File not found/);
      })
      .expect(200, done);
  });

  it('should return HTML content an URL that does not exist', function (done) {
    request(app)
      .get('/external/notfound')
      .expect('Content-Type', /text\/html/)
      .expect(200, done);
  });

  it('should indicate that there was a server error if the URL returns a 500 response', function (done) {
    request(app)
      .get('/external/500file')
      .expect(200, done);
  });

});

describe('GET /external/*', function () {
  var markdownRoot;
  var app;
  before(function () {
    markdownRoot = process.env.MARKDOWN_EXTERNAL_ROOT;
    process.env.MARKDOWN_EXTERNAL_ROOT = '';
    app = require('../../src/app');
  });

  after(function () {
    process.env.MARKDOWN_EXTERNAL_ROOT = markdownRoot;
  })

  it('should return an error if the MARKDOWN_EXTERNAL_ROOT env variable is not set', function (done) {
    request(app)
      .get('/external/whatever')
      .expect(function (res) {
        res.text.should.equal('The MARKDOWN_EXTERNAL_ROOT environment variable is not set. Could not load file from external source.');
      })
      .expect(200, done);
  });

});

describe('GET /external/* with NTLM authentication', function () {
  var app;

  before(function () {
    mockery.enable({
      warnOnReplace: true,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    mockery.registerMock('httpntlm', {
      get: function get(opts, callback) {
        // Stub successful and failed authentication
        if (opts.username === 'login' && opts.password === 'password' && opts.domain === 'domain') {
          return callback(null, {
            statusCode: 200,
            body: '# Test Title'
          });
        } else {
          return callback(null, {
            statusCode: 401,
            body: 'Unauthorized'
          });
        }
      }
    });
    mockery.registerMock('../crypto', {
      decrypt: function (input) {
        return input;
      }
    });

  });

  after(function () {
    mockery.deregisterMock('httpntlm');
    mockery.deregisterMock('../crypto');
    mockery.disable();
  });

  afterEach(function () {
    process.env.NTLM_DOMAIN = '';
    mockery.deregisterMock('../credentials');
  });

  it('should return HTML content if the authentication succeeds', function (done) {
    process.env.NTLM_DOMAIN = 'domain';
    mockery.registerMock('../credentials', {
      username: 'login',
      password: 'password'
    });
    app = require('../../src/app');

    request(app)
      .get('/external/whatever')
      .expect(function (res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
      })
      .expect(200, done);
  });

  it('should return an error if the authentication fails (401 response)', function (done) {
    process.env.NTLM_DOMAIN = 'baddomain';
    mockery.registerMock('../credentials', {
      username: 'badlogin',
      password: 'badpassword'
    });
    app = require('../../src/app');

    request(app)
      .get('/external/whatever')
      .expect(function (res) {
        res.text.should.match(/Unauthorized to access file/);
      })
      .expect(200, done);
  });

});