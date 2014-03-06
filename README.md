### Installation:

``` sh
npm install usps-webtools
```

### Usage:

Initializing the usps model with usps server url address, and user id.

__Example:__

``` js
USPS = require('usps-webtools');

var usps = new USPS({
  server: 'http://production.shippingapis.com/ShippingAPI.dll',
  userId: 'USPS User id'
});
```

### validator(object, callback)

The validator takes two parameters: object and callback.

object: street1, street2, city, state, zip

callback: err, address

__Example__

``` js
usps.validator({
  street1: '322 3rd st.',
  street2: 'Apt 2',
  city: 'San Francisco',
  state: 'CA',
  zip: '94103'
}, function(err, address) {
  console.log(address);
});
```

### zipLookup(object, callback)

The validator takes two parameters: object and callback.

object: street1, street2, city, state

callback: err, address

__Example__

``` js
usps.validator({
  street1: '322 3rd st.',
  street2: 'Apt 2',
  city: 'San Francisco',
  state: 'CA'
}, function(err, address) {
  console.log(address);
});
```