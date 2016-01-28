# Markdown Server

A simple HTTP server that serves markdown files.

## Usage
Install dependencies, then start the server.
```
npm install
npm start
```

Drop files in the ./markdown folder, and access them by file name without the extension. 
```
http://localhost:3000/example
```
 
 ## Hosting on IIS
 
This server comes with a preconfigured web.config file as well as an issnode.yml. To host this site in IIS:
 * Clone/copy the content of this repo in a IIS WebSite.
 * Install [iisnode](https://github.com/tjanczuk/iisnode)
 * Make sure you application has read/write permissions to the application's folder
 * The application pool can be in .NET 2 and does not need to enable 32 bits applications
 * Run `npm install` to install dependencies
 * Customize the default `web.config` (enable authentication, etc.)
 * Customize the default `issnode.yml` file (disable dev errors, etc.)