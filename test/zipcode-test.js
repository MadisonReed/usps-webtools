var assert = require('assert');
var USPS = require('../usps.js');
var chai = require('chai');
var should = require('chai').should();

var usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: '##'
});


describe('Zipcode Lookup', function() {
  var zip = '94607-3785';

  it('should return the address with zip', function(done) {
    usps.zipLookUp({
      street1: '121 Embarcadero West',
      street2: 'Apt 2205',
      city: 'Oakland',
      state: 'CA'
    }, function(err, address) {
      address.zip.should.equal(zip);
      done();
    });
  });

  it('should error if address is invalid', function(done) {
    usps.zipLookUp({
      street1: 'sdfisd',
      street2: 'Apt 2205',
      city: 'Seattle',
      state: 'WA'
    }, function(err, address) {
      err.should.equal('Address Not Found.  ');
      done();
    });
  });

  it('should pass error to callback if street is missing', function(done) {
    usps.zipLookUp({
      city: 'Oakland',
      state: 'CA'
    }, function(err, address) {
      should.exist(err);
      done();
    });
  });

  it('error should be passed to callback if city is missing', function(done) {
    usps.zipLookUp({
      street1: '121 Embarcadero West',
      street2: 'Apt 2205',
      state: 'CA'
    }, function(err, address) {
      should.exist(err);
      done();
    });
  });

  it('should return an error if the address is fake', function(done) {
    usps.zipLookUp({
      street1: '453 sdfsdfa Road',
      street2: 'sdfadf',
      city: 'kojs',
      state: 'LS'
    }, function(err, address) {
      should.exist(err);
      done();
    })
  });
});