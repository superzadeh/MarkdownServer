# Markdown Server
[![Build Status](https://travis-ci.org/superzadeh/MarkdownServer.svg?branch=master)](https://travis-ci.org/superzadeh/MarkdownServer)
[![Coverage Status](https://coveralls.io/repos/github/superzadeh/MarkdownServer/badge.svg?branch=master)](https://coveralls.io/github/superzadeh/MarkdownServer?branch=master)

A simple HTTP server that serves markdown files.

## Usage
Install dependencies, then start the server.
```
git clone https://github.com/superzadeh/MarkdownServer 
cd MarkdownServer
npm install gulp -g
npm install
gulp build
gulp serve-dev
```
Drop files in the ./markdown folder, and access them by file name without the extension. 
```
http://localhost:3000/example
```

The `serve-dev`task will start nodemon to automatically restart the server if server code changes, as well as browsersync to refresh if the views or markdown files are updated.
This means that you can also use this as a live previewer of your markdown files.

## Hosting on IIS
 
This server comes with a preconfigured web.config file as well as an issnode.yml. 
To host this site in IIS:
 * Clone/copy the content of this repo in a IIS WebSite.
 * Install [iisnode](https://github.com/tjanczuk/iisnode)
 * Make sure you application's pool identity has read/write permissions to the site's folder
 * The application pool can be in .NET 2 and does not need to enable 32 bits applications
 * Run `npm install` to install dependencies
 * Customize the default `web.config` (enable authentication, etc.)
 * Customize the default `issnode.yml` file (disable dev errors, etc.)

## Configuration

By default, all files within the folder ./markdown will be served. This folder can be changed by 
setting the environment variable `MARKDOWN_FOLDER`.

URL requests can use NTLM authentication. To do so, set the following environment variables:
  - NTLM_USERNAME
  - NTLM_PASSWORD
  - NTLM_DOMAIN
  
To load files from an external URL, set the following environment variable:
  - MARKDOWN_ROOT_URL

You can then access the files using `http://localhost:3000/external/filename`, where the file loaded
will be located at MARKDOWN_ROOT_URL/filename.md. Example:
  - If MARKDOWN_ROOT_URL is `http://google.com/`, then `http://localhost:3000/external/filename` will load the 
  file at the url `http://google.com/filename.md`.
  
Note that for IIS hosting, environment variables can be set using appSettings in the webconfig where the key is
the name of the environment variable and the value is its value.

## Contributions
Pull requests are welcome, as long you keep this thing simple. I want it to be and remain a very 
simple solution to serve markdown files.

### Visual Studio Code
This project is optimized for edition within [Visual Studio Code](https://code.visualstudio.com/).
make sure to run `tsd install` to retrieve all the typings. This will provide you with
Intellisense for the frameworks used in this project.

```
npm install tsd -g
tsd install
```
