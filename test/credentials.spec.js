var setup = require('./setup.js');
var assert = require('assert');
var mockery = require('mockery');
var sinon = require('sinon');
var chai = require('chai').should();

describe('The credentials module', function () {
  var expectedUser = {
    username: 'test',
    password: 'test'
  };

  beforeEach(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
  });

  afterEach(function () {
    mockery.deregisterMock('fs');
    mockery.disable();
  });

  it('should read username and password from a JSON file', function () {
    mockery.registerMock('fs', {
      accessSync: sinon.stub(),
      readFileSync: function (filepath, encoding) {
        return JSON.stringify(expectedUser);
      }
    });

    var credentials = require('../src/credentials');
    var user = credentials.load();
    user.should.deep.equals(expectedUser);
  });

  it('should return empty credentials if the JSON file does not exists', function () {
    mockery.registerMock('fs', {
      accessSync: sinon.stub().throws()
    });

    var credentials = require('../src/credentials');
    var user = credentials.load();
    user.should.deep.equals({ username: '', password: '' });
  });

});