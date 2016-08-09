#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var crypto = require('./cryptography');

var credentials = {
  username: '',
  password: ''
};

program
  .version('2.2.1')
  .description('Interactive mode to configure the server')
  .action(() => {
    //TODO: use co and co-prompt to retrieve the username, password, domain and external URI 
    // Do you want to serve local file or files loaded using HTTP?
    // IF yes
    //  indicate the folder in which the files are located (default markdown)
    // ELSE 
    // Do these files require NTLM authentication to be accessed?
    //  IF yes
    //    please enter the username 
    //    please enter the password
    //    please enter the domain (default empty)
    //  END IF
    //  Please enter the root URL of the website that contains the files. 
    //  Example: if your files are located at http://domain.com/files/mymarkdownfile.md, type "http://domain.com/files/"
  })
  .option('-u, --username <username>', "The account's username")
  .option('-p, --password <password>', "The account's password")
  .parse(process.argv);

if (!program.username || !program.password) {
  console.log('Please provide both username and password arguments. Use the --help option for more information.');
} else {
  saveCredentials(program.username, program.password);
}

function saveCredentials(username, password) {
  credentials.username = crypto.encrypt(username);
  credentials.password = crypto.encrypt(password);
  try {
    fs.writeFileSync('./credentials.json', JSON.stringify(credentials), 'utf-8');
    console.log('Credentials written successfully');
  } catch (error) {
    console.log('Error when writing credentials:', error);
  }
}