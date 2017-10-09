const createHTML = require('create-html');
/** Uncomment for db access **/
// const fs = require('fs'); // eslint-disable-line global-require

/** Uncomment for db access **/
// const creds = JSON.parse(fs.readFileSync('./creds.json'));
// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host: creds.host,
//     user: creds.user,
//     password: creds.password,
//     database: creds.database,
//   },
// });

/** Uncomment for query logs **/
// knex.on('query-response', function(result, obj, builder) {
//   console.log('query:    ', obj.sql);
//   console.log('vars:     ', obj.bindings);
//   console.log('response: ', result[0]);
//   console.log("--------------------------");
// });

// setup base og tags
const baseOGData = `
  <meta property="og:title" content="Small Island Developing States Photo Submission" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.thatslofty.com" />
  <meta property="og:image" content="http://www.thatslofty.com/assets/windTurbine.svg" />
  <meta property="og:description" content="View the album on Flickr." />
`;

// create responses
const response = {
  facebook: {
    title: 'That\'s Lofty',
    head: `
      ${baseOGData}
    `,
    body: '<p>That\'s Lofty - Facebook Social Share</p>'
  },
  facebot: {
    title: 'That\'s Lofty',
    head: `
      ${baseOGData}
    `,
    body: '<p>That\'s Lofty - Facebook Social Share</p>'
  },
  twitter: {
    title: 'That\'s Lofty',
    head: `
      ${baseOGData}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@flickr" />
      <meta name="twitter:title" content="Small Island Developing States Photo Submission" />
      <meta name="twitter:description" content="View the album on Flickr." />
      <meta name="twitter:image" content="https://farm6.staticflickr.com/5510/14338202952_93595258ff_z.jpg" />
    `,
    body: '<p>That\'s Lofty - Twitter Social Share</p>'
  }
}

// check if response is coming from bot
const isBot = (userAgent) => new Promise(resolve => {
  // setup bot tests
  const cases = {
    facebook: userAgent.startsWith('facebookexternalhit/1.1'),
    facebot: userAgent === 'Facebot',
    twitter: userAgent.startsWith('Twitterbot')
  };
  // loop through cases, return bot name
  for (bot in cases) {
    if (cases[bot]) resolve(bot)
  }
  // if not bot, return false
  resolve(false);
});

// function to return to express
const social = (req, res, next) => {
  isBot(req.headers['user-agent']).then(bot => {
    if (bot || req.query.test) {
      // grab html object from response
      const html = createHTML(response[bot]);
      // send html to bot
      res.send(html);
    } else {
      // if not bot, move to next middleware
      next();
    }
  })
}

module.exports = social;
