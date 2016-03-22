var setup = require('./setup.js');
var proxyquire = require('proxyquire');
var request = require('supertest');
var assert = require('assert');
var chai = require('chai').should();
var nock = require('nock');
var constants = require('../src/constants');

var httpntlmStub = {};
var app = proxyquire('../src/app', {
  'httpntlm': httpntlmStub
});
app.set(constants.MARKDOWN_EXTERNAL_ROOT, 'http://www.test.com/');

describe('GET /external/*', function () {

  beforeEach(function () {
    var externalSource = nock(app.get(constants.MARKDOWN_EXTERNAL_ROOT))
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

  it('should return 200 as status code for a file that exists', function (done) {
    request(app)
      .get('/external/test')
      .expect(200)
      .end(function (err, res) {
        done();
      });
  });

  it('should return HTML content for a file that exists', function (done) {
    request(app)
      .get('/external/test')
      .expect('Content-Type', /text\/html/)
      .end(function (err, res) {
        done();
      });
  });

  it('should transform the markdown file\'s content to HTML', function (done) {
    request(app)
      .get('/external/test')
      .end(function (err, res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
        done();
      });
  });

  it('should return 200 as status code for an URL that does not exist', function (done) {
    request(app)
      .get('/external/notfound')
      .expect(200)
      .end(function (err, res) {
        done();
      });
  });

  it('should return "File not found" for an URL that does not exist', function (done) {
    request(app)
      .get('/external/notfound')
      .end(function (err, res) {
        res.text.should.match(/File not found/);
        done();
      });
  });

  it('should return HTML content an URL that does not exist', function (done) {
    request(app)
      .get('/external/notfound')
      .expect('Content-Type', /text\/html/)
      .end(function (err, res) {
        done();
      });
  });

  it('should indicate that there was a server error if the URL returns a 500 response', function (done) {
    request(app)
      .get('/external/500file')
      .expect(200)
      .end(function (err, res) {
        res.text.should.equal('Error when processing request for file 500file (status: 500)');
        done();
      });
  });
});

describe('GET /external/*', function () {
  var markdownRoot = app.get(constants.MARKDOWN_EXTERNAL_ROOT);

  before(function () {
    app.set(constants.MARKDOWN_EXTERNAL_ROOT, '');
  });

  after(function () {
    app.set(constants.MARKDOWN_EXTERNAL_ROOT, markdownRoot);
  })

  it('should return an error if the MARKDOWN_EXTERNAL_ROOT env variable is not set', function (done) {
    request(app)
      .get('/external/whatever')
      .end(function (err, res) {
        res.text.should.equal('The MARKDOWN_EXTERNAL_ROOT environment variable is not set. Could not load file from external source.');
        done();
      });
  });
});

describe('GET /external/* with NTLM authentication', function () {
  before(function () {
    httpntlmStub.get = function (opts, callback) {
      // stub successful and failed authentication
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
    };
  });

  afterEach(function () {
    process.env.NTLM_USERNAME = '';
    process.env.NTLM_PASSWORD = '';
    process.env.NTLM_DOMAIN = '';
  });

  it('should return HTML content if the authentication succeeds', function (done) {
    process.env.NTLM_USERNAME = 'login';
    process.env.NTLM_PASSWORD = 'password';
    process.env.NTLM_DOMAIN = 'domain';

    request(app)
      .get('/external/whatever')
      .expect(200)
      .end(function (err, res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
        done();
      });
  });

  it('should return an error if the authentication fails (401 response)', function (done) {
    process.env.NTLM_USERNAME = 'badlogin';
    process.env.NTLM_PASSWORD = 'badpassword';
    process.env.NTLM_DOMAIN = 'baddomain';

    request(app)
      .get('/external/whatever')
      .expect(200)
      .end(function (err, res) {
        res.text.should.match(/Unauthorized to access file/);
        done();
      });
  });
});