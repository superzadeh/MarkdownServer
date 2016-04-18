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

  beforeEach(function () {
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

  afterEach(function () {
    mockery.deregisterMock('crypto');
    mockery.disable();
  });

  it('should encrypt content', function () {
    var crypto = require('../src/cryptography');
    var result = crypto.encrypt('some text');
    result.should.equals('some text final');
  });

  it('should decrypt content', function () {
    var crypto = require('../src/cryptography');
    var result = crypto.decrypt('some text');
    result.should.equals('some text final');
  });

  it('should produce the original output when encrypting and decrypting', function () {
    mockery.deregisterMock('crypto');
    mockery.disable();
    var input = 'some long text that will be processed';
    var crypto = require('../src/cryptography');
    crypto.decrypt(crypto.encrypt(input)).should.equals(input);
  });

});