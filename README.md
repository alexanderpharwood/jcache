# jCache

A lightweight library for local caching in Javascript.

- No dependencies
- 12kb minified
- Simple API

## Docs

### Initialise

```
var cache = new jCache();
cache.init('demo');
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
