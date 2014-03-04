var assert = require('assert');
var USPS = require('../usps.js');

var usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: '##'
});

describe('Address Validator', function() {
  it('should validate apartment', function(done) {
    usps.validator({
      street1: '11205 SE 233RD PL.',
      street2: 'Apartment 2',
      city: 'Kent',
      state: 'WA',
      zip: '98031'
    }, function(err, address){
      assert.equal(address.street2, 'APT 2');
      done();
    });
  });

  it('should validate Unit', function(done) {
    usps.validator({
      street1: '11205 SE 233RD PL.',
      street2: 'UNIT 2',
      city: 'Kent',
      state: 'WA',
      zip: '98031'
    }, function(err, address){
      assert.equal(address.street2, 'UNIT 2');
      done();
    });
  });

  it('should validate Building', function(done) {
    usps.validator({
      street1: '11205 SE 233RD PL.',
      street2: 'Building 2',
      city: 'Kent',
      state: 'WA',
      zip: '98031'
    }, function(err, address){
      assert.equal(address.street2, 'BLDG 2');
      done();
    });
  });

  it('should validate Floor', function(done) {
    usps.validator({
      street1: '11205 SE 233RD PL.',
      street2: 'Floor 2',
      city: 'Kent',
      state: 'WA',
      zip: '98031'
    }, function(err, address){
      assert.equal(address.street2, 'FL 2');
      done();
    });
  });

  it('should move the apartment number to street2', function(done) {
    usps.validator({
      street1: '11205 SE 233RD PL. apartment 2',
      city: 'Kent',
      state: 'WA',
      zip: '98031'
    }, function(err, address){
      assert.equal(address.street1, '11205 SE 233RD PL');
      assert.equal(address.street2, 'APT 2');
      done();
    });
  });

  it('should move the number to street2 with #', function(done) {
    usps.validator({
      street1: '11205 SE 233RD PL. 2',
      city: 'Kent',
      state: 'WA',
      zip: '98031'
    }, function(err, address){
      assert.equal(address.street1, '11205 SE 233RD PL');
      assert.equal(address.street2, '# 2');
      done();
    });
  });
});

describe('It should throw exceptions', function() {
  it('should throw an exception when constructor is called without config object', function(done) {
    assert.throws(USPS, 'Error: must pass usps server url and userId');
    done();
  });

  it('should throw an exception when constructor is called without config.server', function(done) {
    var throwsException = function() {
      USPS({
        userId: '234DSG'
      });
    };
    assert.throws(throwsException, 'Error: must pass usps server url and userId');
    done();
  });

  it('should throw an exception when constructor is called without config.userId', function(done) {
    var throwsException = function() {
      USPS({
        server: '234DSG'
      });
    };
    assert.throws(throwsException, 'Error: must pass usps server url and userId');
    done();
  });
});

