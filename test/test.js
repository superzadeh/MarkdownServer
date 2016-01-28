var request = require('supertest');
var app = require('../src/app');

request(app)
  .get('/example')
  .expect('Content-Type', 'text/html; charset=utf-8')
  .expect(200)
  .end(function (err, res) {
    if (err) throw err;
  });