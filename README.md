### Installation:

``` sh
npm install usps-webtools
```

### Usage:

Initializing the usps model with usps server url address, and user id.

__Example:__

``` js
const USPS = require('usps-webtools');

const usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: 'USPS User id',
  ttl: 10000 //TTL in milliseconds for request
});
```

### verify(object, callback)

Verify takes two parameters: object and callback.

object: street1, street2, city, state, zip

callback: err, address

__Example__

``` js
usps.verify({
  street1: '322 3rd st.',
  street2: 'Apt 2',
  city: 'San Francisco',
  state: 'CA',
  zip: '94103'
}, function(err, address) {
  console.log(address);
});
```

### zipCodeLookup(object, callback)

zipCodeLookup takes two parameters: object and callback.

object: street1, street2, city, state

callback: err, address

__Example__

``` js
usps.zipCodeLookup({
  street1: '322 3rd st.',
  street2: 'Apt 2',
  city: 'San Francisco',
  state: 'CA'
}, function(err, address) {
  console.log(address);
});
```

### cityStateLookup(object, callback)

cityStateLookup takes two parameters: zipcode and callback.

zipcode: 5 digit zipcode

callback: err, address

__Example__

``` js
usps.cityStateLookup({
  street1: '322 3rd st.',
  street2: 'Apt 2',
  city: 'San Francisco',
  state: 'CA'
}, function(err, address) {
  console.log(address);
});
```
