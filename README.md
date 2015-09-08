# Enterprise Angular Seed Project
v0.1.0

## Installation Instructions

### Clone repo
git clone https://github.com/stevehenry3/enterprise_angular_seed.git


### Install Node & NPM
Download Windows 64-bit `.msi` from [NodeJS Download](http://nodejs.org/download/).

Run `.msi` file


### Install Global NPM Dependencies
Correct versions tested together can be found in `package.json`, if want to request those explicitly.

(from command line, execute:)

```shell
npm install -g bower
```

```shell
npm install -g requirejs
```

```shell
# This will make gulp available from the command line (used as a task runner)
npm install -g gulp@3.9.0
```

```shell
# Only needed if NodeJS used. Watches for changes in Node server files, and auto-restarts server.
npm install -g nodemon@1.4.1
```

### Install Project NPM Dependencies

```shell
# Run from the ROOT folder of the project
npm install
``` 


### Install Project Bower Dependencies

```shell
# Ensure you are in the ROOT folder of the project!
# NOTE: `.bowerrc` file points to the location of the `bower_components` folder
bower install
```

### Build The Project

```shell
# Run from the ROOT folder of the project.
# This will copy/build all the project files to `./build/`
gulp dev-build
```


### Run Node Server

```shell
# To run the project in DEV mode (watching for changes):
# In command window 1 (watches for Angular file changes, and triggers gulp tasks):
gulp dev-watch
# In command window 2 (watches for Node file changes, and re-launches the server).
# (Also serves up the project to a web browser)
gulp serve-dev

# --OR--
# To run the project in PROD mode (just serves it up to browser):
node src/node_server/index.js
```


### Open in Browser
Open Chrome

Go to URL: 
```shell
http://localhost:3000
```
