var setup = require('./setup.js');
var request = require('supertest');
var assert = require('assert');
var chai = require('chai').should();
var nock = require('nock');
var app = require('../src/app');

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
