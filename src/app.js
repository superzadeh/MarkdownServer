var express = require('express');
var path = require('path');
var os = require('os');
var errorHandler = require('errorhandler');
var fs = require('fs');
var logger = require('morgan');
var marked = require('marked');
var constants = require('./constants')
var app = express();
var toc = require('markdown-toc');

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

app.get('/:filename', function (req, res) {
  var filename = req.params.filename;
  var serverFilepath = path.resolve(__dirname, app.get(constants.MARKDOWN_FOLDER) + filename + '.md');
  fs.access(serverFilepath, fs.F_OK, function (err) {
    if (!err) {
      var content = fs.readFileSync(serverFilepath, "utf8");
      // Using async version of marked 
      marked(content, function (err, contentMarked) {
      res.render('markdown', { markdown: marked(contentMarked), sidebar:marked(toc(content).content)});
      });
    } else {
      res.status(200).send('File not found: ' + filename);
    }
  });
});

module.exports = app;