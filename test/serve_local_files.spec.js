var setup = require('./setup.js');
var request = require('supertest');
var assert = require('assert');
var constants = require('../src/constants');
var app = require('../src/app');

process.env.MARKDOWN_FOLDER = 'test/markdown/';

describe('GET /test', function () {

  it('should return HTML content', function (done) {
    request(app)
      .get('/test')
      .expect('Content-Type', /text\/html/)
      .expect(200, done);
  });

  it('should transform markdown to HTML', function (done) {
    request(app)
      .get('/test')
      .expect(function (res) {
        res.text.should.match(/<h1 id="test-title">Test Title<\/h1>/);
      })
      .expect(200, done);
  });
});

describe('GET /notfound', function () {

  it('should return 200', function (done) {
    request(app)
      .get('/notfound')
      .expect(200, done);
  });

  it('should return "no such file"', function (done) {
    request(app)
      .get('/notfound')
      .expect(function (res) {
        res.text.should.match(/no such file/);
      })
      .expect(200, done);
  });

  it('should return HTML content', function (done) {
    request(app)
      .get('/notfound')
      .expect('Content-Type', /text\/html/)
      .expect(200, done);
  });

});