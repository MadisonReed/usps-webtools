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
    if (err) {
      callback(err)
      return;
    }

    if (result.Error) {
      callback(result.Error);
      return;
    }
    
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

usps.prototype.zipLookUp = function(address, callback) {
  var xml = builder.create({
    ZipCodeLookupRequest: {
      '@USERID': this.config.userId,
      Address: {
        Address1: address.street1,
        Address2: address.street2 || '',
        City: address.city,
        State: address.state,
      }
    }
  }).end();

  call('ZipCodeLookup', this.config, xml, function(err, result) {
    // Error handling for xml2js.parseString
    if (err) {
      callback(err)
      return;
    }

    var address = result.ZipCodeLookupResponse.Address[0];

    //Error handling for USPS
    if (address.Error) {
      callback(address.Error[0]);
      return;
    }

    var obj = {
      street1: address.Address2[0],
      street2: address.Address1 ? address.Address1[0] : '',
      city: address.City[0],
      state: address.State[0],
      zip: address.Zip5[0] + '-' + address.Zip4[0]
    };

    callback(err, obj);
  });
};

var call = function(api, config, xml, callback) {
  request(config.server + '?API=' + api + '&XML=' + xml, function(err, res, body) {
    xml2js.parseString(body, function(err, result) {
      if (err) {
        callback(err);
        return;
      }

      callback(err, result);
    });
  });
};
