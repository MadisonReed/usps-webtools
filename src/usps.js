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
  var xml = builder
    .create({
      AddressValidateRequest: {
        '@USERID': this.config.userId,
        Address: {
          Address1: address.street2 || '',
          Address2: address.street1,
          City: address.city,
          State: address.state,
          Zip5: address.zip,
          Zip4: ''
        }
      }
    })
    .end();

  callUSPS('Verify', 'AddressValidateResponse.Address', this.config, xml, function(err, address) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, {
      street1: address.Address2[0],
      street2: address.Address1 ? address.Address1[0] : '',
      city: address.City[0],
      zip: address.Zip5[0],
      state: address.State[0]
    });
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
  var xml = builder
    .create({
      ZipCodeLookupRequest: {
        '@USERID': this.config.userId,
        Address: {
          Address1: address.street2 || '',
          Address2: address.street1,
          City: address.city,
          State: address.state,
        }
      }
    })
    .end();

  callUSPS('ZipCodeLookup', 'ZipCodeLookupResponse.Address', this.config, xml, function(err, address) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, {
      street1: address.Address2[0],
      street2: address.Address1 ? address.Address1[0] : '',
      city: address.City[0],
      state: address.State[0],
      zip: address.Zip5[0] + '-' + address.Zip4[0]
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
  var xml = builder
    .create({
      CityStateLookupRequest: {
        '@USERID': this.config.userId,
        ZipCode: {
          Zip5: zip
        }
      }
    })
    .end();

  callUSPS('CityStateLookup', 'CityStateLookupResponse.ZipCode', this.config, xml, function(err, address) {
    if (err) {
      callback(err);
      return;
    }

    callback(err, {
      city: address.City[0],
      state: address.State[0],
      zip: address.Zip5[0]
    });
  });
};

/**
  Method to call USPS
*/
function callUSPS(api, resultDotNotation, config, xml, callback) {
  request(config.server + '?API=' + api + '&XML=' + xml, function(err, res, body) {
    if (err) {
      callback(new USPSError(err.message, err, {
        method: api,
        during: 'request'
      }));
      return;
    }

    xml2js.parseString(body, function(err, result) {
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
          errMessage = result.Error.Description[0].trim();
        } catch(err) {
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
      var specificResult = result;
      var parts = resultDotNotation.split('.');
      function walkResult() {
        var key = parts.shift();

        if (key === undefined) {
          return;
        }

        specificResult = specificResult[key];

        if (Array.isArray(specificResult)) {
          specificResult = specificResult[0];
        }

        walkResult();
      }
      walkResult();

      // specific error handling
      if (specificResult.Error) {
        try {
          errMessage = specificResult.Error[0].Description[0].trim();
        } catch(err) {
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
