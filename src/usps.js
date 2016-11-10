// external dependencies
var request = require('request');
var builder = require('xmlbuilder');
var xml2js = require('xml2js');

// internal dependencies
var USPSError = require('./error.js');

var usps = module.exports = function(config) {
  if (!(config && config.server && config.userId)) {
    throw 'Error: must pass usps server url and userId';
  }
  if(!config.ttl){
    config.ttl = 100000;
  }

  this.config = config;
};

/**
  Verifies an address

  @param {Object} address The address to be verified
  @param {String} address.street1 Street
  @param {String} [address.street2] Secondary street (apartment, etc)
  @param {String} address.city City
  @param {String} address.state State (two-letter, capitalized)
  @param {String} address.zip Zipcode
  @param {Function} callback The callback function
  @returns {Object} instance of module
*/
usps.prototype.verify = function(address, callback) {
  var obj = {
    Address: {
      FirmName: address.firm_name,
      Address1: address.street2 || '',
      Address2: address.street1,
      City: address.city,
      State: address.state,
      Zip5: address.zip,
      Zip4: address.zip4 ? address.zip4 : ''
    }
  };

  if(address.urbanization) {
    obj.Address.Urbanization = address.urbanization;
  }

  callUSPS('Verify', 'AddressValidateRequest', 'AddressValidateResponse.Address', this.config, obj, function(err, address) {
    if (err) {
      callback(err);
      return;
    }

    var result = {
      street1: address.Address2[0],
      street2: address.Address1 ? address.Address1[0] : '',
      city: address.City[0],
      zip: address.Zip5[0],
      state: address.State[0],
      zip4: address.Zip4[0]
    };

    if(address.FirmName) {
      result.firm_name = address.FirmName[0];
    }

    if(address.Urbanization) {
      result.urbanization = address.Urbanization[0];
    }

    callback(null, result);
  });

  return this;
};

/**
  Looks up a zipcode, given an address

  @param {Object} address Address to find zipcode for
  @param {String} address.street1 Street
  @param {String} [address.street2] Secondary street (apartment, etc)
  @param {String} address.city City
  @param {String} address.state State (two-letter, capitalized)
  @param {String} address.zip Zipcode
  @param {Function} callback The callback function
  @returns {Object} instance of module
*/
usps.prototype.zipCodeLookup = function(address, callback) {
  var obj = {
    Address: {
      Address1: address.street2 || '',
      Address2: address.street1,
      City: address.city,
      State: address.state
    }
  };

  callUSPS('ZipCodeLookup', 'ZipCodeLookup', 'Address', this.config, obj, function(err, address) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, {
      street1: address.Address2,
      street2: address.Address1 ? address.Address1 : '',
      city: address.City,
      state: address.State,
      zip: address.Zip5 + '-' + address.Zip4
    });
  });

  return this;
};

/**
  City State lookup, based on zip

  @param {String} zip Zipcode to retrieve city & state for
  @param {Function} callback The callback function
  @returns {Object} instance of module
*/
usps.prototype.cityStateLookup = function(zip, callback) {
  var obj = {
    ZipCode: {
      Zip5: zip
    }
  };

  callUSPS('CityStateLookup', 'CityStateLookup', 'ZipCode', this.config, obj, function(err, address) {
    if (err) {
      callback(err);
      return;
    }

    callback(err, {
      city: address.City,
      state: address.State,
      zip: address.Zip5
    });
  });
};

/**
  Method to call USPS
*/
function callUSPS(api, method, property, config, params, callback) {
  var requestName = method + 'Request';
  var responseName = method + 'Response';

  var obj = {};
  obj[requestName] = params;
  obj[requestName]['@USERID'] = config.userId;

  var xml = builder.create(obj).end();

  var opts = {
    url: config.server,
    qs: {
      API: api,
      XML: xml
    },
    timeout: config.ttl,
  };

  request(opts, function(err, res, body) {
    if (err) {
      callback(new USPSError(err.message, err, {
        method: api,
        during: 'request'
      }));
      return;
    }

    xml2js.parseString(body, {explicitArray: false}, function(err, result) {
      var errMessage;

      if (err) {
        callback(new USPSError(err.message, err, {
          method: api,
          during: 'xml parse'
        }));
        return;
      }

      // may have a root-level error
      if (result.Error) {
        try {
          errMessage = result.Error.Description.trim();
        } catch(e) {
          errMessage = result.Error;
        }

        callback(new USPSError(errMessage, result.Error));
        return;
      }

      /**
        walking the result, to drill into where we want
        resultDotNotation looks like 'key.key'
        though it may actually have arrays, so returning first cell
      */

      var specificResult = {};
      if (result && result[responseName] && result[responseName][property]) {
        specificResult = result[responseName][property];
      }

      // specific error handling
      if (specificResult.Error) {
        try {
          errMessage = specificResult.Error.Description.trim();
        } catch(e) {
          errMessage = specificResult.Error;
        }

        callback(new USPSError(errMessage, specificResult.Error));
        return;
      }

      // just peachy
      callback(null, specificResult);
    });
  });
}