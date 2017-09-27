const express = require('express');
const fs = require('fs'); // eslint-disable-line global-require

const creds = JSON.parse(fs.readFileSync('./creds.json'));
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: creds.host,
    user: creds.user,
    password: creds.password,
    database: creds.database,
  },
});

const router = express.Router(); // eslint-disable-line new-cap

// import user routes
const user = require('./controllers/user');

router.get('/users', (req, res) => user.getUser(req, res, knex));

module.exports = router;
