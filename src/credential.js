#!/usr/bin/env node

var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');
var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

var credentials = {
  username: '',
  password: ''
};

program
  .version('0.1.0')
  .option('-u, --username <username>', "The account's username")
  .option('-p, --password <password>', "The account's password")
  .action(function () {
    co(function* () {
      var username = yield prompt('username: ');
      var password = yield prompt.password('password: ');
      console.log('user: %s pass: %s', username, password);
      credentials.username = encrypt(username);
      credentials.password = encrypt(password);
    });
  })
  .parse(process.argv);

if (!program.username || program.password) {
  console.log('Please provide both username and password arguments. Use the --help option for more information.')
}

try {
  fs.writeFileSync('./credentials.json', JSON.stringify(credentials), 'utf-8');
  console.log('Credentials written successfully');
} catch (error) {
  console.log('Error when writing credentials:', error);
}