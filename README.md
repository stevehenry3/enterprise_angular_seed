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
(from the root folder of this project, run in command line:)

```shell
npm install
``` 


### Install Project Bower Dependencies
(from the root folder of this project, run in command line:)

```shell
# Ensure you are in the ROOT folder of the project!
# NOTE: `.bowerrc` file points to the location of the `bower_components` folder
bower install
```


### Run Node Server
```shell
# Run from the root folder of this project:
node src/node_server/index.js
```


### Open in Browser
Open Chrome

Go to URL: 
```shell
http://localhost:3000
```
