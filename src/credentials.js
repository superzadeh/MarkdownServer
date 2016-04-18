var fs = require('fs');
var path = require('path');

module.exports = {
  load: () => {
    try {
      var filepath = path.join(__dirname, '../credentials.json');
      fs.accessSync(filepath, fs.F_OK);
      return credentials = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (error) {
      return { username: '', password: '' };
    }
  }
}