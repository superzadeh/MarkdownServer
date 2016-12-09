// core dependencies
var express = require('express');
var path = require('path');
var errorHandler = require('errorhandler');
var logger = require('morgan');
// modules
var bluebird = require('bluebird');
var markdownifier = require('./markdownifier');
var constants = require('./constants');
// routes
var local = require('./routes/local');
var external = require('./routes/external');
var toc = require('./routes/toc');

var app = express();

// all environments
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuration
// TODO: refactor with nconf
app.set(constants.PORT, process.env.PORT || 3337);
app.set(constants.MARKDOWN_FOLDER, process.env.MARKDOWN_FOLDER || './markdown/');
process.env.MARKDOWN_FOLDER = process.env.MARKDOWN_FOLDER ? process.env.MARKDOWN_FOLDER : './markdown/';

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
  app.set(constants.HOST, 'http://localhost');
  app.use(logger('dev'));
}

app.use('/', local);
app.use('/external', external);
app.use('/toc', toc);

module.exports = app;