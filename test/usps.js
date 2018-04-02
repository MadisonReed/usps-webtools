const USPS = require('../');
const { test } = require('ava');

test('USPS should throw an exception when constructor is called without config object', t => {
  t.throws(() => {
    new USPS();
  });
});

test('USPS should throw an exception when constructor is called without config.server', t => {
  t.throws(() => {
    new USPS({
      userId: '234DSG'
    });
  });
});

test('USPS should throw an exception when constructor is called without config.userId', t => {
  t.throws(() => {
    new USPS({
      server: '234DSG'
    });
  });
});
