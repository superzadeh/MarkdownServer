var express = require('express');
var bluebird = require('bluebird');
var markdownifier = require('../markdownifier');
var httpntlm = bluebird.promisifyAll(require('httpntlm'));
var request = bluebird.promisifyAll(require('request'));
var router = express.Router();

// Load from external URLs
router.get('/:filename', (req, res) => {
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
      httpntlm.getAsync(options)
        .then((response) => {
          handleExternalResponse(response, req, res);
        });
    } else {
      request.getAsync(targetUrl)
        .then((response) => {
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

module.exports = router;