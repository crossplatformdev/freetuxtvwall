var express = require('express');
var router = express.Router();
var main = require('../functions/index.js');
/* GET home page. */

router.get('/style.css', (req, res) => {
  //__dirname = path to the directory that the executing script resides in, functions/index.js
  res.sendFile('stylesheets/style.css', { root: '.' });
});

router.get('/channels.csv', (req, res) => { 
  res.sendFile('assets/channels.csv', { root: '.' });
});

router.get('/channels.xml', (req, res) => { 
  res.sendFile('assets/channels.xml', { root: '.' });
});

router.get('/stylesheets/style.css', (req, res) => {
  //__dirname = path to the directory that the executing script resides in, functions/index.js
  res.sendFile('stylesheets/style.css', { root: '.' });    
});

router.get('/dist/index.html', (req, res) => {
  main(req, res);
});

router.get('/index.html', (req, res) => {
  main(req, res);
});

router.get('/', (req, res) => {
  main(req, res);
});

module.exports = router;
