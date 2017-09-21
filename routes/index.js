'use strict'

var express = require('express');
var router = express.Router();
var sequeue = require('seq-queue');
var queue = sequeue.createQueue(5000);
const AWS = require("aws-sdk")
AWS.config.update({region: 'us-west-2'})
const iotData = new AWS.IotData({endpoint: 'a2wfi15g6zmios.iot.us-west-2.amazonaws.com'})
/* GET home page. */
router.post('/', function(req, res, next) {
  console.log(req.body);
  var sensorData = req.body
  queue.push(
    function(task) {
      new Promise(function (resolve, reject) {
        publishData(sensorData, resolve, reject)
      })
      .then(function (results) {
        console.log('====================== results: ' + JSON.stringify(results))
        //callback(null, 'OK')
        task.done();
      })
      .catch(function (err) {
        console.log(err, err.stack)
        //callback(err)
        task.done();
      })
    }, 
    function() {
      console.log('task timeout');
    }, 
    3000
  );
  res.end();
});

function publishData (data, resolve, reject) {
  var timestamp = data.Timestamp
  var mac = data.Mac
  var rawTimestamp = data['Raw Timestamp']
//  var diagnostics = data.Diagnostics

  var payloadCurrent = {}
  var payloadTemperature = {}
  var current = {}
  var temperature = {}

  var readings= data.SensorReadings
  console.log(readings)
  var sensorIds = Object.keys(readings)
  sensorIds.forEach(function (sensorId) {
    var sensorData = readings[sensorId]
    if(!(sensorData.hasOwnProperty('Temperature'))){
       console.log('=============Current')
       current[sensorId] = sensorData
    } else {
      console.log('==============TempData')
      temperature[sensorId] = sensorData
    }
  })

  payloadCurrent.Timestamp = timestamp
  payloadCurrent.Mac = mac
  payloadCurrent['Raw Timestamp'] = rawTimestamp
  payloadCurrent.SensorReadings = current

  payloadTemperature.Timestamp = timestamp
  payloadTemperature.Mac = mac
  payloadTemperature['Raw Timestamp'] = rawTimestamp
  payloadTemperature.SensorReadings = temperature

  if( payloadCurrent.SensorReadings === {}) {
  console.log(payloadCurrent)
    new Promise(function (resolve, reject) {
      publishCurrentData (payloadCurrent, resolve, reject)
    })
  }
  if( payloadTemperature.SensorReadings === {}) {
  console.log(payloadTemperature)
    new Promise(function (resolve, reject) {
      publishTemperatureData (payloadTemperature, resolve, reject)
    })
  }

}
//  var data = '{"Timestamp": "' +  moment().format('YYYY-MM-DD HH:mm:ss') + '", "Raw Timestamp": ' + new Date().getTime()/1000 + ', "Mac":"9c:65:f9:1b:f8:3c","Diagnostics":["SensorMon","1/1 Entries"],"SensorReadings":{"' + sensorName + '":{"Door":0,"Temperature":' + temperature + ',"Battery":"3.06","Humidity":' + humidity + ',"SensorModuleId":"' + sensorName + '","Sensor1":"Open","Sensor2":"Open"}}}'
function publishTemperatureData (data, resolve, reject) {
  var params = {
    topic: 'sensors/temperature',
    payload: JSON.stringify(data),
    qos: 0
  }

  iotData.publish(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
      reject(err)
    } else {
      resolve()
    }
  })
}

function publishCurrentData (data, resolve, reject) {
  var params = {
    topic: 'sensors/temperature',
    payload: JSON.stringify(data),
    qos: 0
  }

  iotData.publish(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
      reject(err)
    } else {
      resolve()
    }
  })
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

module.exports = router;
