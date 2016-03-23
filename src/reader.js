var fs = require('fs');
var path = require('path');

var reader = {};
reader.getLocalFile = function getLocalFile(filename) {
  var fileName = path.join(process.env.MARKDOWN_FOLDER, filename);
  fs.accessSync(fileName, fs.R_OK, function (err) {
    if (err) {
      return err;
    }
    fs.readFileSync(fileName, 'utf8', function (err, data) {
      if (err) {
        return err;
      }
      return data;
    });
  });
}

module.exports = reader;