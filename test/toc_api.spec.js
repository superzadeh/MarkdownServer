var setup = require('./setup.js');
var request = require('supertest');
var assert = require('assert');
var constants = require('../src/constants');
var app = require('../src/app');

app.set(constants.MARKDOWN_FOLDER, '../test/markdown/');

describe.skip('GET /toc with a valid table of content', function () {

  it('should return JSON content', function (done) {
    request(app)
      .get('/toc/example')
      .expect('Content-Type', /applicatino\/json/);
  });

  it('should return the table of contents as JSON', function (done) {
    request(app)
      .get('/toc/example')
      .expect(function (res) {
        res.text.should.match({

        });
      })
      .expect(200, done);
  });

  it('should return an "Not found" error if the requested file does not exists', function (done) {
    request(app)
      .get('/toc/example')
      .expect(function (res) {
        res.text.should.match({

        });
      })
      .expect(404, done);
  });

  it('should return an "Unauthorized" error if the requested file cannot be opened', function (done) {

    request(app)
      .get('/toc/example')
      .expect(function (res) {
        res.text.should.match({

        });
      })
      .expect(404, done);
  });

});