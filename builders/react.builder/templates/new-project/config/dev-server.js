const webpack = require('webpack');
const path = require('path');
const chokidar = require('chokidar');
const express = require('express');
const compress = require('compression');
const bodyParser = require('body-parser');
const proxyMiddleware = require('http-proxy-middleware');

// get port
const port = parseInt(process.env.PORT);

// define webpack setup as compiler
const compiler = webpack(require('./webpack.dev.js'));

// create express instance
const app = express();

// Use router for API calls
app.use('/api', function(req, res, next) {
  require(path.resolve('api/router'))(req, res, next);
});

// listen for changes to files in /api/
const watcher = chokidar.watch(path.resolve('./api/'));
watcher.on('ready', function() {
  watcher.on('all', function() {
    // clear require cache and re require new files after change
    console.log("Updated backend");
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]src\/api[\/\\]/.test(id)) delete require.cache[id];
    });
  });
});

// devMiddleware serves the files emitted from webpack over a connect server
const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: path.resolve('/'),
  quiet: true,
});

// hotMiddleware hot reloads the files served from devMiddleware
const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000,
});

// proxy api requests to backend
app.use(proxyMiddleware('localhost:' + (port + 30) + '/api', {logLevel: 'silent'}));

// handles '/url/path' page refreshes to /index.html - spa
app.use(require('connect-history-api-fallback')());

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
app.use(hotMiddleware);

// use body parser for api requests
app.use(bodyParser.json());

// server static files
app.use('/assets', express.static('src/assets'))

// start server
app.listen(port);

// export app
module.exports = app;
