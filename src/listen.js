process.env.NODE_ENV = 'development';
var os = require('os');
var app = require('./app');
var constants = require('./constants');

app.listen(app.get(constants.PORT), function () {
  var h = (app.get(constants.HOST) || os.hostname() || 'unknown') + ':' + app.get(constants.PORT);
  console.log('Express server listening at ' + h);
  console.log('Markdown Server started and serving the folder ' + app.get(constants.MARKDOWN_FOLDER));
});
