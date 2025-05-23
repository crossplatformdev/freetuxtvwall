var express = require('express');
var router = express.Router();
var fttvw = require('../functions/index.js');
/*
router.get('/dist/index.html', (req, res) => {
  fttvw(req, res);
});

router.get('/index.html', (req, res) => {
  fttvw(req, res);
});

router.get('/', (req, res) => {
  fttvw(req, res);
});
*/

router.get('/images/favicon.png', (req, res) => {
  //__dirname = path to the directory that the executing script resides in, functions/index.js
  res.sendFile('./public/images/favicon.png', { root: '.'});
});

router.get('/stylesheets/style.css', (req, res) => {
  //__dirname = path to the directory that the executing script resides in, functions/index.js
  res.sendFile('./public/stylesheets/style.css', { root: '.' });
});

router.get('/javascripts/webplayer.min.js', (req, res) => {
    //__dirname = path to the directory that the executing script resides in, functions/index.js
    res.sendFile('./public/javascripts/webplayer.min.js', { root: '.' });
});

module.exports = router;
