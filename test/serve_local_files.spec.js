var setup =  require('./setup.js');
var request = require('supertest');
var assert = require('assert');
var constants = require('../src/constants');
var app = require('../src/app');

app.set(constants.MARKDOWN_FOLDER, '../test/markdown/');

describe('GET /test', function() {
  it('should return 200', function(done) {
    // TODO: mock 'fs' using proxyquire to speed up the test
    request(app)
      .get('/test')
      .expect(200)
      .end(function(err, res) {
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
    request(app)
      .get('/test')      
      .end(function(err, res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
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
        done();
      });
  });
  it('should return "File not found"', function(done) {
    request(app)
      .get('/notfound')
      .end(function(err, res) {
        res.text.should.match(/File not found/);
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
