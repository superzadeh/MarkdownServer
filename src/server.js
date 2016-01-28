/* global __dirname */
/* global process */
var express = require('express');
var path = require('path');
var os = require('os');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var markdownServe = require('markdown-serve');
var request = require('request')
var fs = require('fs');
var app = express();
var marked = require('marked');

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.static(path.resolve(__dirname, '../public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
  app.set('host', 'http://localhost');
}

app.get('/:filename', function (req, res) {
  var filename = req.params.filename;
  var content = fs.readFileSync('guides/' + filename + '.md', "utf8");
  // Using async version of marked 
  marked(content, function (err, content) {
    res.render('markdown', { markdown: marked(content) });
  });
});


app.listen(app.get('port'), function () {
  var h = (app.get('host') || os.hostname() || 'unknown') + ':' + app.get('port');
  console.log('Express server listening at ' + h);
});