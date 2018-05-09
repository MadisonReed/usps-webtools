const USPS = require('../');
const { test } = require('ava');

const usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: '##'
});

test.cb('Address verify should validate apartment', t => {
  usps.verify({
    street1: '11205 SE 233RD PL.',
    street2: 'Apartment 2',
    city: 'Kent',
    state: 'WA',
    zip: '98031'
  }, (err, address) => {
    t.falsy(err);
    t.is(address.street2, 'APT 2');
    t.end();
  });
});

test.cb('Address verify should validate Unit', t => {
  usps.verify({
    street1: '11205 SE 233RD PL.',
    street2: 'UNIT 2',
    city: 'Kent',
    state: 'WA',
    zip: '98031'
  }, (err, address) => {
    t.falsy(err);
    t.is(address.street2, 'UNIT 2');
    t.end();
  });
});

test.cb('Address verify should validate Building', t => {
  usps.verify({
    street1: '11205 SE 233RD PL.',
    street2: 'Building 2',
    city: 'Kent',
    state: 'WA',
    zip: '98031'
  }, (err, address) => {
    t.falsy(err);
    t.is(address.street2, 'BLDG 2');
    t.end();
  });
});

test.cb('Address verify should validate Floor', t => {
  usps.verify({
    street1: '11205 SE 233RD PL.',
    street2: 'Floor 2',
    city: 'Kent',
    state: 'WA',
    zip: '98031'
  }, (err, address) => {
    t.falsy(err);
    t.is(address.street2, 'FL 2');
    t.end();
  });
});
