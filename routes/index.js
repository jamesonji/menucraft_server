var express = require('express');
var router = express.Router();
var util = require('../modules/util');

/* GET home page. */
router.get('/test', function(req, res) {
  var key = "abc";
  cache.set(key, "hello world", function (err, reply) {
    if(reply){
      res.send(reply);
    }else {
      res.send(err);
    }
  });
});

router.get('/', function(req, res) {
  res.render('index', { title: 'World' });
});

router.get('/get', function(req,res) {
  var key = req.query.key;
  var cache = global.cache;
  cache.get(key, function (err, reply) {
    if(reply){
      res.send(reply);
    }else {
      res.send(err);
    }
  });
});

router.get('/clear', function(req,res) {
  var key = req.query.key;
  var cache = global.cache;
  cache.del(key, function () {
    res.send('OK');
  });
});

module.exports = router;
