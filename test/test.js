process.env.NODE_ENV = 'test';
var request = require('supertest');
var assert = require('assert');
var app = require('../src/app');

describe('GET /example', function () {
  it('should return html content', function (done) {
    request(app)
      .get('/example')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });
});

describe('GET /notfound', function () {
  it('should return "File not found"', function (done) {
    request(app)
      .get('/notfound')
      .expect(200)
      .end(function (err, res) {
        if (err) {
          throw err;
        }        
        assert.equal(res.text, "File not found: notfound");
        done();
      });
  });
  it('should return HTML content', function (done) {
    request(app)
      .get('/notfound')
      .expect(200)
      .end(function (err, res) {
        done();
      });
  });
});