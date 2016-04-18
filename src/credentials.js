var fs = require('fs');

module.exports = {
  load: () => {
    try {
      return credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
    } catch (error) {
      return { username: '', password: '' };
    }
  }
}