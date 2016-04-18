var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));

module.exports = fs.accessAsync('./credentials.json', fs.F_OK)
  .then(() => {
    return credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
  });