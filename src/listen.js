var app = require('./app');

app.listen(app.get('port'), function () {
  var h = (app.get('host') || os.hostname() || 'unknown') + ':' + app.get('port');
  console.log('Express server listening at ' + h);
});
