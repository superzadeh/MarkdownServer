var setup = require('./setup.js');
var proxyquire = require('proxyquire');
var request = require('supertest');
var assert = require('assert');
var chai = require('chai').should();
var nock = require('nock');
var httpntlmStub = {};

var app = proxyquire('../src/app', { 'httpntlm': httpntlmStub });

describe('GET /external/test', function() {

  beforeEach(function() {
    var externalSource = nock(process.env.MARKDOWN_EXTERNAL_ROOT)
      .get('/test.md')
      .reply(200, '# Test Title');
  });

  afterEach(function() {
    nock.cleanAll();
  })

  it('should return 200', function(done) {
    request(app)
      .get('/external/test')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('should return HTML content', function(done) {
    request(app)
      .get('/external/test')
      .expect('Content-Type', /text\/html/)
      .end(function(err, res) {
        done();
      });
  });

  it('should transform markdown to HTML', function(done) {
    request(app)
      .get('/external/test')
      .end(function(err, res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
        done();
      });
  });

});


describe('GET /external/notfound', function() {

  beforeEach(function() {
    var externalSource = nock(process.env.MARKDOWN_EXTERNAL_ROOT)
      .get('/notfound.md')
      .reply(404);
  });

  afterEach(function() {
    nock.cleanAll();
  })

  it('should return 200', function(done) {
    request(app)
      .get('/external/notfound')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('should return "File not found"', function(done) {
    request(app)
      .get('/external/notfound')
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.text.should.match(/File not found/);
        done();
      });
  });

  it('should return HTML content', function(done) {
    request(app)
      .get('/external/notfound')
      .expect('Content-Type', /text\/html/)
      .end(function(err, res) {
        done();
      });
  });
});

describe('GET /external/*', function() {
  var markdownRoot = process.env.MARKDOWN_EXTERNAL_ROOT;

  before(function() {
    process.env.MARKDOWN_EXTERNAL_ROOT = '';
  });

  after(function() {
    process.env.MARKDOWN_EXTERNAL_ROOT = markdownRoot;
  })

  it('should return an error if the MARKDOWN_EXTERNAL_ROOT env variable is not set', function(done) {
    request(app)
      .get('/external/whatever')
      .end(function(err, res) {
        res.text.should.equal('The MARKDOWN_EXTERNAL_ROOT environment variable is not set. Could not load file from external source.');
        done();
      });
  });
});

describe('GET /external/* with NTLM authentication', function() {
  before(function() {
    httpntlmStub.get = function(opts, callback) {
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

  afterEach(function() {
    process.env.NTLM_USERNAME = '';
    process.env.NTLM_PASSWORD = '';
    process.env.NTLM_DOMAIN = '';
  });

  it('should return HTML content if the authentication succeeds', function(done) {
    process.env.NTLM_USERNAME = 'login';
    process.env.NTLM_PASSWORD = 'password';
    process.env.NTLM_DOMAIN = 'domain';

    request(app)
      .get('/external/whatever')
      .expect(200)
      .end(function(err, res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
        done();
      });
  });

  it('should return an error if the authentication fails', function(done) {
    process.env.NTLM_USERNAME = 'badlogin';
    process.env.NTLM_PASSWORD = 'badpassword';
    process.env.NTLM_DOMAIN = 'baddomain';

    request(app)
      .get('/external/whatever')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.text.should.match(/File not found/);
        done();
      });
  });
});
