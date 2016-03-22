var bluebird = require('bluebird');
var express = require('express');
var path = require('path');
var errorHandler = require('errorhandler');
var fs = bluebird.promisifyAll(require('fs'));
var httpntlm = bluebird.promisifyAll(require('httpntlm'));
var logger = require('morgan');
var request = bluebird.promisifyAll(require('request'));
var constants = require('./constants');
var markdownifier = require('./markdownifier');
var app = express();

// all environments
app.set(constants.PORT, process.env.PORT || 3000);
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(express.static(path.resolve(__dirname, '../public')));
app.set(constants.MARKDOWN_FOLDER, process.env.MARKDOWN_FOLDER || '../markdown/');
app.set(constants.MARKDOWN_EXTERNAL_ROOT, process.env.MARKDOWN_EXTERNAL_ROOT || null);

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
  app.set(constants.HOST, 'http://localhost');
  app.use(logger('dev'));
}

// Load from local files
app.get('/:filename', function (req, res) {
  var filename = req.params.filename;
  var serverFilepath = path.resolve(__dirname, app.get(constants.MARKDOWN_FOLDER) + filename + '.md');
  fs.accessAsync(serverFilepath, fs.F_OK)
    .then(function () {
      return fs.readFileAsync(serverFilepath, "utf8");
    })
    .then(function (content) {
      return markdownifier.markdownify(content).then(function (data) {
        res.render('markdown', { markdown: data.markdown, sidebar: data.sidebar });
      });
    })
    .catch(function (err) {
      res.status(200).send(`Error while processing the request, ${err}`);
    });
});

// Load from external URLs
app.get('/external/:filename', function (req, res) {
  var root = app.get(constants.MARKDOWN_EXTERNAL_ROOT);
  if (root) {
    var targetUrl = root + req.params.filename + '.md';

    if (process.env.NTLM_USERNAME && process.env.NTLM_PASSWORD && process.env.NTLM_DOMAIN) {
      var options = {
        url: targetUrl,
        username: process.env.NTLM_USERNAME,
        password: process.env.NTLM_PASSWORD,
        domain: process.env.NTLM_DOMAIN
      };
      httpntlm.getAsync(options)
        .then(function (response) {
          handleExternalResponse(response, req, res);
        });
    } else {
      request.getAsync(targetUrl)
        .then(function (response) {
          handleExternalResponse(response, req, res);
        });
    }
  } else {
    res.status(200).send('The MARKDOWN_EXTERNAL_ROOT environment variable is not set. Could not load file from external source.');
  }
});

function handleExternalResponse(response, expressRequest, expressResponse) {
  if (response.statusCode === 200) {
    return markdownifier.markdownify(response.body).then(function (data) {
      expressResponse.render('markdown', { markdown: data.markdown, sidebar: data.sidebar });
    });
  } else if (response.statusCode === 404) {
    expressResponse.status(200).send(`File not found: ${expressRequest.params.filename} (status: ${response.statusCode})`);
  } else if (response.statusCode === 401) {
    expressResponse.status(200).send(`Unauthorized to access file ${expressRequest.params.filename} (status: ${response.statusCode})`);
  } else {
    expressResponse.status(200).send(`Error when processing request for file ${expressRequest.params.filename} (status: ${response.statusCode})`);
  }
}

module.exports = app;