var request = require('supertest');
var assert = require('assert');
var app = require('../src/app');
var setup =  require('./setup.js')

describe('GET /test', function() {
  it('should return 200', function(done) {
    // TODO: mock 'fs' using proxyquire to speed up the test
    request(app)
      .get('/test')
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
      .get('/test')
      .expect('Content-Type', /text\/html/)
      .end(function(err, res) {
        done();
      });
  });
  it('should transform markdown to HTML', function(done) {
    var expectedContent = '<h1 id="test-title">Test Title</h1>';
    request(app)
      .get('/test')
      
      .end(function(err, res) {
        assert(res.text.indexOf(expectedContent) > 0, 
        'Expected the response to contain "' + expectedContent + '", the response received was:\n' + res.text);
        done();
      });
  });
});

describe('GET /notfound', function() {
  it('should return 200', function(done) {
    request(app)
      .get('/notfound')
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
      .get('/notfound')
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        assert.equal(res.text, 'File not found: notfound');
        done();
      });
  });
  it('should return HTML content', function(done) {
    request(app)
      .get('/notfound')
      .expect('Content-Type', /text\/html/)
      .end(function(err, res) {
        done();
      });
  });
});
