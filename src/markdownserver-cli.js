#!/usr/bin/env node --harmony

var program = require('commander');
var fs = require('fs');
var crypto = require('./crypto.js');

var credentials = {
  username: '',
  password: ''
};

program
  .version('0.1.1')
  .option('-u, --username <username>', "The account's username")
  .option('-p, --password <password>', "The account's password")
  .parse(process.argv);

if (!program.username || !program.password) {
  console.log('Please provide both username and password arguments. Use the --help option for more information.');
} else {
  credentials.username = crypto.encrypt(program.username);
  credentials.password = crypto.encrypt(program.password);
  try {
    fs.writeFileSync('./credentials.json', JSON.stringify(credentials), 'utf-8');
    console.log('Credentials written successfully');
  } catch (error) {
    console.log('Error when writing credentials:', error);
  }
}