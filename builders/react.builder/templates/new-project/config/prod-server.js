const path = require('path');
const sm = require('sitemap');
const express = require('express');
const compress = require('compression');
const bodyParser = require('body-parser');
const router = require('../api/router');
const social = require('../api/social');

// get port
const port = parseInt(process.env.PORT);

// create express instance
const app = express();

// create sitemap
const sitemap = sm.createSitemap({
  hostname: 'https://thatslofty.com',
  cacheTime: 600000,
  urls: [
    { url: '/' },
    { url: '/about' }
  ]
});

// use body parser for api requests
app.use(bodyParser.json());

// compress files before sending
app.use(compress());

// serve prod folder at '/'
app.use(express.static('prod'));

// serve static folder
app.use('/assets', express.static('src/resources/assets'));

// provide social data to bots
app.use(social);

// serve api
app.use('/api', router);

// respond with sitemap
app.get('/sitemap.xml', function(req, res) {
  res.header('Content-Type', 'application/xml');
  res.send(sitemap.toString());
});

// handles '/url/path' page refreshes to /index.html - spa
app.get('*', function(req, res){
  res.sendFile(path.resolve('./prod/index.html'));
});

// start server
app.listen(port);

// log to console
console.log('listening on', port);

// export app for tests
module.exports = app;
