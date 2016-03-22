var setup = require('./setup.js');
var assert = require('assert');
var chai = require('chai').should();
var markdownifier = require('../src/markdownifier');

describe('markdownifier.markdownify', function () {
  it('should transform markdown to html', function (done) {
    markdownifier.markdownify('# test').then(function (content) {
      content.markdown.should.match(/<h1 id="test">test<\/h1>/);
      done();
    });
  });

  it('should throw an error when null content is received', function (done) {
    markdownifier.markdownify(null).catch(function (err) {
      done();
    });
  });
});