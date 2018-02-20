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

```
var items = [

  ['string', 'I am a string!', null]

];

cache.set(items);
```
