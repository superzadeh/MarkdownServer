var setup = require('./setup.js');
var assert = require('assert');
var mockery = require('mockery');
var chai = require('chai').should();

var cipherStub = function () {
  return {
    update: function (input, encoding, format) {
      return input;
    },
    final: function (format) {
      return ' final';
    }
  }
};

describe('crypto module', function () {

  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('crypto', {
      createCipher: cipherStub,
      createDecipher: cipherStub,
    });
  });

  after(function () {
    mockery.deregisterMock('crypto');
    mockery.disable();
  });

  it('should encrypt content', function (done) {
    var crypto = require('../src/cryptography');
    var result = crypto.encrypt('some text');
    result.should.equals('some text final');
    done();
  });

  it('should decrypt content', function (done) {
    var crypto = require('../src/cryptography');
    var result = crypto.decrypt('some text');
    result.should.equals('some text final');
    done();

  });

});