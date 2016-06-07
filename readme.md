# Markdown Server

[![Build Status](https://travis-ci.org/superzadeh/MarkdownServer.svg?branch=master)](https://travis-ci.org/superzadeh/MarkdownServer)
[![Coverage Status](https://coveralls.io/repos/github/superzadeh/MarkdownServer/badge.svg?branch=master)](https://coveralls.io/github/superzadeh/MarkdownServer?branch=master)

A simple HTTP server that serves markdown files.

## Usage

Install dependencies, build, then start the server with `gulp`.

```bash
git clone https://github.com/superzadeh/MarkdownServer
cd MarkdownServer
npm install gulp -g
npm install
gulp build
gulp
```

Drop files in the ./markdown folder, and access them by file name without the extension.

If you need to serve images, you can drop them in the `public/images` folder. To reference them in a markdown document, simply use `images/your_image.png` as source.

```bash
http://localhost:3000/example
```

### Gulp tasks

The following gulp tasks are available:

| Task name         | Description |
-----------------------------------
| gulp              | run the `serve` task |
| gulp serve        | starts serving using browser sync and watches for views/markdown changes |
| gulp build        | builds semantic UI and deploys dependencies to the `public/dist` folder |
| gulp serve-build  | runs `build` and `serve` |

The `serve` task (which is also the default `gulp` task) will start nodemon to automatically restart the server if server code changes, 
as well as browsersync to refresh if the views or markdown files are updated.
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

### Local files

By default, all files within the folder ./markdown will be served. This folder can be changed by 
setting the environment variable `MARKDOWN_FOLDER`.

### External files

To load files from an external URL, set the following environment variable:

* MARKDOWN_EXTERNAL_ROOT

You can then access the files using `http://localhost:3000/external/filename`, where the file loaded
will be located at MARKDOWN_EXTERNAL_ROOT/filename.md. Example:

* If MARKDOWN_EXTERNAL_ROOT is `http://google.com/`, then `http://localhost:3000/external/filename` will load the 
  file at the url `http://google.com/filename.md`.

Note that for IIS hosting, environment variables can be set using appSettings in the webconfig where the key is
the name of the environment variable and the value is its value.

### Authentication

URL requests for external files can use NTLM authentication. To do so, set the `NTLM_DOMAIN` environment variables and run the command 
line tool provided with markdown server to set the username and password that should be used for the NTLM authentication.
These credentials will be encrypted and stored in a credentials.json file at the root of the server:

    npm install markdownserver -g
    markdownserver -u username -p password


## Contributions

Pull requests are welcome, as long you keep this thing simple. I want it to be and remain a very 
simple solution to serve markdown files.

### Running tests

You can run tests using `npm test`. To run the tests as well as a coverage analysis, use `npm run test-cover`.
There is also a watchable task `npm run test-watch`.

Note that the coverage threshold is at 90%, so make sure your stay above it if you make changes.

### TODO

* [X] Implement NTLM tests
* [X] Add bluebird and promisify all the things
* [X] Improve the sidebar: make it collapsible and make the content good looking
* [X] Expose the table of content of a local file through a JSON API
* [X] Expose the table of content of an external file through a JSON API
* [ ] Add a search feature
* [ ] Create a review workflow with ability to add comments
* [ ] Add FTP support
* [ ] Add an administration UI (or CLI client) to setup NTLM, External & FTP parameters, as well as select the default highlighter theme
* [X] Provide a more secure way to store credentials
* [ ] Allow users to upload files to be served
* [ ] Tune performances

### Visual Studio Code

This project is optimized for edition within [Visual Studio Code](https://code.visualstudio.com/).
make sure to run `tsd install` to retrieve all the typings. This will provide you with
Intellisense for the frameworks used in this project.

    npm install tsd -g
    tsd install

I also recommend to use the [Beautify](https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify)
extension that will help ensure the same coding style automatically (beautify on save is enabled).
