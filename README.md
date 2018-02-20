# jCache

A lightweight library for local caching in Javascript.

- No dependencies
- 12kb minified
- Simple API

## Docs

### Initialise

You can have multiple cache objects which store items under their respective id's:

```
var cache = new jCache();
cache.init('demo');

var cache1 = new jCache();
cache1.init('demo1');
```

### Setting vaues

The set method expects a list of arrays.

set({key}, {value}, {expiresAt})

The key must be a string.

The value can be any type (but functions are stored as strings).

expiresAt can be set thus:

  '30s' = 30 seconds, 
  '30m' = 30 minutes, 
  '30h' = 30 hours, 
  '30d' = 30 days
 
 Alternatively, you can pass in a Javascript date object.

Returns a boolean

```
var items = [

  ['string', 'I am a string!', null],
  ['int', 99, '30m'],

];

cache.set(items);
```
