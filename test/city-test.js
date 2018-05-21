const USPS = require('../');
const { test } = require('ava');

const usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: process.env.USPS_USER_ID
});

test.cb('#cityStateLookup() should return the city when passed a zipcode', t => {
  usps.cityStateLookup('98031', (err, address) => {
    t.falsy(err);
    t.is(address.city, 'KENT');
    t.end();
  });
});

test.cb('#cityStateLookup() should return the state when passed a zipcode', t => {
  usps.cityStateLookup('98031', (err, address) => {
    t.falsy(err);
    t.is(address.state, 'WA');
    t.end();
  });
});

test.cb('#cityStateLookup() should return an err when invalid zip', t => {
  usps.cityStateLookup('23234324', err => {
    t.truthy(err);
    t.end();
  });
});
