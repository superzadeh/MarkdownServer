var bluebird = require('bluebird');
var express = require('express');
var path = require('path');
var os = require('os');
var errorHandler = require('errorhandler');
var fs = bluebird.promisifyAll(require('fs'));
var httpntlm = require('httpntlm');
var logger = require('morgan');
var request = require('request');
var constants = require('./constants');
var markdownifier = require('./markdownifier');
var app = express();

// all environments
app.set(constants.PORT, process.env.PORT || 3000);
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(express.static(path.resolve(__dirname, '../public')));
app.set(constants.MARKDOWN_FOLDER, process.env.MARKDOWN_FOLDER || '../markdown/');

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
  app.set(constants.HOST, 'http://localhost');
  app.use(logger('dev'));
}

// Load from local files
app.get('/:filename', function(req, res) {
  var filename = req.params.filename;
  var serverFilepath = path.resolve(__dirname, app.get(constants.MARKDOWN_FOLDER) + filename + '.md');
  fs.accessAsync(serverFilepath, fs.F_OK)
    .then(function() {
      return fs.readFileAsync(serverFilepath, "utf8");
    })
    .then(function(content) {
      markdownifier.markdownify(content).then(function(markdownContent, sideBarContent) {
        res.render('markdown', { markdown: markdownContent, sidebar: sideBarContent });
      });
    })
    .catch(function(err) {
      // reply 200 to still render a page, but indicate that the file was not found
      res.status(200).send('File not found: ' + filename);
    });
});

// Load from external URLs
app.get('/external/:filename', function(req, res) {
  var root = process.env.MARKDOWN_EXTERNAL_ROOT;
  if (root) {
    var targetUrl = root + req.params.filename + '.md';

    if (process.env.NTLM_USERNAME && process.env.NTLM_PASSWORD && process.env.NTLM_DOMAIN) {
      var options = {
        url: targetUrl,
        username: process.env.NTLM_USERNAME,
        password: process.env.NTLM_PASSWORD,
        domain: process.env.NTLM_DOMAIN
      };
      httpntlm.get(options, function(error, response) {
        if (!error && response.statusCode === 200) {
          markdownifier.markdownify(response.body).then(function(markdownContent, sideBarContent) {
            res.render('markdown', { markdown: markdownContent, sidebar: sideBarContent });
          });
        } else {
          res.status(200).send('File not found: ' + req.params.filename);
        }
      });
    } else {
      request.get(targetUrl, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          markdownifier.markdownify(response.body).then(function(markdownContent, sideBarContent) {
            res.render('markdown', { markdown: markdownContent, sidebar: sideBarContent });
          });
        } else {
          res.status(200).send('File not found: ' + req.params.filename);
        }
      });
    }
  } else {
    res.status(200).send('The MARKDOWN_EXTERNAL_ROOT environment variable is not set. Could not load file from external source.');
  }
});

module.exports = app;
