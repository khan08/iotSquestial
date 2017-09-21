'use strict'

var express = require('express');
var router = express.Router();
var sequeue = require('seq-queue');
var queue = sequeue.createQueue(5000);
const moment = require('moment')
const AWS = require("aws-sdk")
AWS.config.update({region: 'us-west-2'})
const lib = require('../../lib')
const models = require('../../models')
const iotData = new AWS.IotData({endpoint: 'a2wfi15g6zmios.iot.us-west-2.amazonaws.com'})
const Callbacker = lib.Callbacker
/* GET home page. */
router.get('/', function(req, res, next) {
  queue.push(
    function(task) {
      setTimeout(function() {
        console.log('hello ');
        task.done();
      }, 5000);
    }, 
    function() {
      console.log('task timeout');
    }, 
    6000
  );
   
  queue.push(
    function(task) {
      setTimeout(function() {
        console.log('world~');
        task.done();
      }, 500);
    }
  );
  res.end();
});

module.exports = router;
