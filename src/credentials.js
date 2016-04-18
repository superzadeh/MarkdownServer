var bluebird = require('bluebird');
var fs = require('fs');

module.exports = {
  load: () => {
    return fs.access('./credentials.json', fs.F_OK, (err) => {
      if (err) {
        return { username: '', password: '' };
      } else {
        return credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
      }
    });
  }
}