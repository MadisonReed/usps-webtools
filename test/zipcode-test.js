const USPS = require('../');
const { test } = require('ava');

const usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: process.env.USPS_USER_ID
});

const ZIP = '94607-3785';

test.cb('Zipcode Lookup should return the address with zip', t => {
  usps.zipCodeLookup({
    street1: '121 Embarcadero West',
    street2: 'Apt 2205',
    city: 'Oakland',
    state: 'CA'
  }, (err, address) => {
    t.falsy(err);
    t.is(address.zip, ZIP);
    t.end();
  });
});

test.cb('Zipcode Lookup should error if address is invalid', t => {
  usps.zipCodeLookup({
    street1: 'sdfisd',
    street2: 'Apt 2205',
    city: 'Seattle',
    state: 'WA'
  }, err => {
    t.truthy(err);
    t.is(err.message, 'Address Not Found.');
    t.end();
  });
});

test.cb('Zipcode Lookup should pass error to callback if street is missing', t => {
  usps.zipCodeLookup({
    city: 'Oakland',
    state: 'CA'
  }, err => {
    t.truthy(err);
    t.end();
  });
});

test.cb('Zipcode Lookup error should be passed to callback if city is missing', t => {
  usps.zipCodeLookup({
    street1: '121 Embarcadero West',
    street2: 'Apt 2205',
    state: 'CA'
  }, err => {
    t.truthy(err);
    t.end();
  });
});

test.cb('Zipcode Lookup should return an error if the address is fake', t => {
  usps.zipCodeLookup({
    street1: '453 sdfsdfa Road',
    street2: 'sdfadf',
    city: 'kojs',
    state: 'LS'
  }, err => {
    t.truthy(err);
    t.end();
  });
});
