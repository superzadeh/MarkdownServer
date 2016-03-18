var assert = require('assert');
var chai = require('chai').should();
var markdownifier = require('../src/markdownifier');

describe('markdownifier.markdownify', function() {
  it('should transform markdown to html', function(done) {
    markdownifier.markdownify('# test').then(function(content) {
      content.should.match(/<h1 id="test">test<\/h1>/);
      done();
    });
  });
});