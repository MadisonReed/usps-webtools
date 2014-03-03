var assert = require('assert');
var USPS = require('../usps.js');

var usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: '###'
});
