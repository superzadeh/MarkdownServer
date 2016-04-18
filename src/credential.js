#!/usr/bin/env node --harmony

var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');
var fs = require('fs');
var crypto = require('./crypto.js');

var credentials = {
  username: '',
  password: ''
};

program
  .version('0.1.0')
  .option('-u, --username <username>', "The account's username")
  .option('-p, --password <password>', "The account's password")
  // .action(function () {
  //   co(function* () {
  //     var username = yield prompt('username: ');
  //     var password = yield prompt.password('password: ');
  //     console.log('user: %s pass: %s', username, password);
  //     credentials.username = crypto.encrypt(username);
  //     credentials.password = crypto.encrypt(password);
  //   });
  // })
  .parse(process.argv);

if (!program.username || !program.password) {
  throw new Error('Please provide both username and password arguments. Use the --help option for more information.');
}

credentials.username = crypto.encrypt(program.username);
credentials.password = crypto.encrypt(program.password);

try {
  fs.writeFileSync('./credentials.json', JSON.stringify(credentials), 'utf-8');
  console.log('Credentials written successfully');
} catch (error) {
  console.log('Error when writing credentials:', error);
}