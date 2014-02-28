var request = require('request');
var builder = require('xmlbuilder');
var xml2js = require('xml2js');

var usps = module.exports = function(config) {
  if (!(config && config.server && config.userId)) {
    throw "Error: must pass usps server url and userId"
    return;
  }
  this.config = config;
};

usps.prototype.validator = function(address, callback) {
  var xml = builder.create({
    AddressValidateRequest: {
      '@USERID': this.config.userId,
      Address: {
        Address1: address.street1,
        Address2: address.street2 || '',
        City: address.city,
        State: address.state,
        Zip5: address.zip,
        Zip4: ''
      }
    }
  }).end();

  call('Verify', this.config, xml, function(err, result) {
    var address = result.AddressValidateResponse.Address[0];
    var obj = {
      street1: address.Address2[0],
      street2: address.Address1 ? address.Address1[0] : '',
      city: address.City[0],
      zip: address.Zip5[0],
      state: address.State[0]
    };

    callback(err, obj);
  });
};

var call = function(api, config, xml, callback) {
  request(config.server + '?API=' + api + '&XML=' + xml, function(err, res, body){
    xml2js.parseString(body, function(err, result) {
      if (result.Error){
        callback(result.Error);
        return;
      };

      callback(err, result);
    });
  });
};

