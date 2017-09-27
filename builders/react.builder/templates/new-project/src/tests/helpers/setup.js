/* eslint-env browser */
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const { document } = (new JSDOM('')).window;
global.document = document;
global.window = document.defaultView;
global.navigator = window.navigator;
