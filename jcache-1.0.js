/**
 *
 * jCache - V1.0
 * By Alexander P. Harwood
 * Copyright 2018 Alexander P. Harwood - MIT Licence
 *
 */


function jCache() {


    "use strict";


    /**
     * Global namespace object
     */

    var jCache = {};


    /**
     * Global cache object
     */

    jCache.cache = {};


    /**
     * Global jobs object
     */

    jCache.jobs = {};


    /**
     * Global setInterval object for removeExpiredKeys
     */

    jCache.jobs.removeExpiredKeysLoop;


    /**
     * cacheId for this site
     */

    jCache.cacheId = "";


    /**
     * Addition to Date.prototype to simplify the setting a date's value
     */

    Date.prototype.addDays = function (val) {

        var dat = new Date(this.valueOf());

        dat.setDate(dat.getDate() + val);

        return dat;

    }

    Date.prototype.addHours = function (val) {

        var dat = new Date(this.valueOf());

        dat.setHours(dat.getHours() + val);

        return dat;

    }

    Date.prototype.addMinutes = function (val) {

        var dat = new Date(this.valueOf());

        dat.setMinutes(dat.getMinutes() + val);

        return dat;

    }

    Date.prototype.addSeconds = function (val) {

        var dat = new Date(this.valueOf());

        dat.setSeconds(dat.getSeconds() + val);

        return dat;

    }


    /**
     * Methods within the jCache object
     */


    /**
     * init function puts an initial jCache.cache into memory and ensures browser compatability.
     * This needs to take a cacheId so we can use this to replace the list object which stores the chached items.
     * @return Void
     */

    jCache.init = function (cacheId) {

        if (typeof cacheId === 'undefined' || cacheId === null || cacheId === "") {

            console.error("jCache error: jCache.init requires exactly one perameter: an id under which your cached items will be stored.");

        } else {

            if (typeof (Storage) !== "undefined") {

                jCache.cacheId = cacheId;

                jCache.validateCache();

                jCache.jobs.removeExpiredKeys();

            } else {

                throw "jCache does not support your browser, sorry!";

            }

        }

    };


    /**
     * validateCache verifies that there is a jCache key in local storage, creates one if there is not, resets it if broken, and puts it into memory.
     *
     * @return Void
     */

    jCache.validateCache = function () {

        jCache.cache = localStorage.getItem('jCache');

        //This is only needed for an initial create or a reset.
        var newCacheObj = {};

        try {

            jCache.cache = JSON.parse(jCache.cache);

        } catch (e) {

            //jCache object is broken; unfortunately, we must reset it in its entirety. There seems no way at present to only reset the cache in which the error has occured, without having each cache object set against a different local storage key.

            localStorage.setItem('jCache', JSON.stringify(newCacheObj));

            jCache.validateCache();

            return;

        }

        if (jCache.cache !== null) {

            if (typeof jCache.cache[jCache.cacheId] === 'undefined') {

                jCache.cache[jCache.cacheId] = {};

                localStorage.setItem('jCache', JSON.stringify(jCache.cache));

                jCache.validateCache();

            }

        } else {

            //This should only happen if it is the first time the user has visited the site or if they have cleared their local storage.

            localStorage.setItem('jCache', JSON.stringify(newCacheObj));

            jCache.validateCache();

        }

    };


    /**
     * removeExpiredKeys loops every ten seconds to check for expired keys in chache. This is wrapped within a function so we can redefine it as a function after a reset (becasue after being called is gets defined as the setInterval object).
     *
     * @return Bool
     */


    jCache.jobs.removeExpiredKeys = function () {

        jCache.validateCache();

        function removeKey() {

            jCache.validateCache();

            var dateNow = new Date();

            for (var keyIndex in jCache.cache[jCache.cacheId]) {

                if (dateNow >= new Date(Date.parse(jCache.cache[jCache.cacheId][keyIndex].expiresAt))) {

                    delete jCache.cache[jCache.cacheId][keyIndex];

                    localStorage.setItem('jCache', JSON.stringify(jCache.cache));

                    jCache.validateCache();

                    return true;

                }

            }

        }

        jCache.jobs.removeExpiredKeysLoop = setInterval(removeKey, 5000);

    };




    /**
     * has tests whether the chache containes a given key.
     *
     * @return Bool
     */

    jCache.has = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return undefined;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                return false;

            } else {

                return true;

            }

        }

    };


    /**
     * set function sets a given value to the cache against the given key.
     *
     * @return Bool
     */

    jCache.set = function (items) {

        jCache.validateCache();

        if (items.constructor !== Array) {

            console.error("jCache error: set method expects an object or a list of objects: [[key, value, expiresAt]]");

            return false;

        } else {

            for (var cacheItemIndex in items) {

                var cacheItem = items[cacheItemIndex];

                console.log(cacheItem[0]);

                var key = cacheItem[0];

                var value = cacheItem[1];

                var expiresAt = cacheItem[2];

                var returnValue = false;

                if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

                    console.error("jCache error: Skipping, invalid key given at items[" + cacheItemIndex + "]");

                    continue;

                } else {

                    if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                        jCache.cache[jCache.cacheId][key] = {};

                        jCache.cache[jCache.cacheId][key].createdAt = new Date();

                    }

                    if (typeof value === 'function') {

                        value = value.toString();

                        console.error("jCache error: jCache does not support the storing of fuctions in cache as typeof function; they are instead converted to a string. You may convert them back yourself with eval(), but it is not reccomended (eval is evil)");

                    }

                    if (typeof value === 'undefined') {

                        console.error("jCache error: Skipping, value not set for key: " + key);

                        continue;

                    } else {

                        jCache.cache[jCache.cacheId][key].value = value;

                        jCache.cache[jCache.cacheId][key].modifiedAt = new Date();

                        if (typeof expiresAt !== 'undefined' && expiresAt !== null && expiresAt !== '') {

                            if (Object.prototype.toString.call(expiresAt) === '[object Date]') {

                                jCache.cache[jCache.cacheId][key].expiresAt = expiresAt;

                            } else if (typeof parseInt(expiresAt.substring(0, expiresAt.length - 1)) === 'number') {

                                var dat = new Date();

                                if (expiresAt[expiresAt.length - 1] === "d") {

                                    dat = dat.addDays(parseInt(expiresAt.substring(0, expiresAt.length - 1)));

                                    jCache.cache[jCache.cacheId][key].expiresAt = dat;

                                } else if (expiresAt[expiresAt.length - 1] === "h") {

                                    dat = dat.addHours(parseInt(expiresAt.substring(0, expiresAt.length - 1)));

                                    jCache.cache[jCache.cacheId][key].expiresAt = dat;

                                } else if (expiresAt[expiresAt.length - 1] === "m") {

                                    dat = dat.addMinutes(parseInt(expiresAt.substring(0, expiresAt.length - 1)));

                                    jCache.cache[jCache.cacheId][key].expiresAt = dat;

                                } else if (expiresAt[expiresAt.length - 1] === "s") {

                                    dat = dat.addSeconds(parseInt(expiresAt.substring(0, expiresAt.length - 1)));

                                    jCache.cache[jCache.cacheId][key].expiresAt = dat;

                                }

                            } else {

                                jCache.cache[jCache.cacheId][key].expiresAt = null;

                                console.error("jCache error: Invalid date format supplied; expiresAt has been set to null");

                            }

                        } else {

                            jCache.cache[jCache.cacheId][key].expiresAt = null;

                        }

                        localStorage.setItem('jCache', JSON.stringify(jCache.cache));

                        returnValue = true;

                    }

                }

            }

            return returnValue;

        }

    };


    /**
     * get function returns the entire cache object stored against the given key
     *
     * @return object
     */

    jCache.get = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return undefined;

            } else {

                return jCache.cache[jCache.cacheId][key];

            }

        }

    };


    /**
     * getValue function gets a given value from the cache against the given key.
     *
     * @return String
     */

    jCache.getValue = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return undefined;

            } else {

                return jCache.cache[jCache.cacheId][key].value;

            }

        }

    };


    /**
     * getCreatedAt function gets the createdAt value for the given key.
     *
     * @return String
     */

    jCache.getCreatedAt = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return undefined;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return undefined;

            } else {

                return jCache.cache[jCache.cacheId][key].createdAt;

            }

        }

    };


    /**
     * getModifiedAt function gets the modifiedAt value for the given key.
     *
     * @return String
     */

    jCache.getModifiedAt = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return undefined;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return undefined;

            } else {

                return jCache.cache[jCache.cacheId][key].modifiedAt;

            }

        }

    };


    /**
     * getExpiresAt function gets the getExpiresAt value for the given key.
     *
     * @return String
     */

    jCache.getExpiresAt = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return undefined;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return undefined;

            } else {

                return jCache.cache[jCache.cacheId][key].expiresAt;

            }

        }

    };


    /**
     * compare tests the validity of type and value.
     *
     * @return Bool
     */

    jCache.compare = function (key, compareValue) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {

                if (typeof jCache.cache[jCache.cacheId][key].value === 'object') {

                    if (JSON.stringify(jCache.cache[jCache.cacheId][key].value) === JSON.stringify(compareValue)) {

                        return true;

                    } else {

                        return false;

                    }

                } else {

                    if (jCache.cache[jCache.cacheId][key].value === compareValue) {

                        return true;

                    } else {

                        return false;

                    }

                }

            }

        }

    };


    /**
     * compareValue tests the validity of value only, by performing a type conversion on the retreaved key.
     *
     * @return Bool
     */

    jCache.compareValue = function (key, compareValue) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {


                if (jCache.cache[jCache.cacheId][key].value == compareValue) {

                    return true;

                } else {

                    return false;

                }

            }

        }

    };


    /**
     * compareType tests the validity of type.
     *
     * @return Bool
     */

    jCache.compareType = function (key, compareValue) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {


                if (typeof jCache.cache[jCache.cacheId][key].value === typeof compareValue) {

                    return true;

                } else {

                    return false;

                }

            }

        }

    };


    /**
     * remove removes a given key and its value from the cache.
     *
     * @return Bool
     */

    jCache.remove = function (key) {

        jCache.validateCache();
        
        console.log(key.constructor);

        if (key.constructor === Array) {

            var returnValue = false;

            for (var keyIndex in key) {

                var thisKey = key[keyIndex];

                if (typeof thisKey === 'undefined' || thisKey === null || thisKey === "" || typeof thisKey !== 'string') {

                    console.error("jCache error: Invalid key given: " + thisKey);

                } else {

                    if (typeof jCache.cache[jCache.cacheId][thisKey] === 'undefined') {

                        console.error("jCache error: " + thisKey + " not found");

                        return false;

                    } else {

                        delete jCache.cache[jCache.cacheId][thisKey];

                        localStorage.setItem('jCache', JSON.stringify(jCache.cache));

                        returnValue = true;

                    }

                }

            }

            return returnValue;

        } else {

            if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

                console.error("jCache error: Invalid key given: " + key);

                return false;

            } else {

                if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                    console.error("jCache error: " + key + " not found");

                    return false;

                } else {

                    delete jCache.cache[jCache.cacheId][key];

                    localStorage.setItem('jCache', JSON.stringify(jCache.cache));

                    return true;

                }

            }

        }

    };


    /**
     * removeAll removes all items under the cacheId from the cache
     *
     * @return Bool
     */

    jCache.removeAll = function () {

        jCache.validateCache();

        jCache.cache[jCache.cacheId] = {};

        localStorage.setItem('jCache', JSON.stringify(jCache.cache));

        return true;

    };


    /**
     * reset clears everything (including the cacheId object) from storage and reinitiates jCache.
     *
     * @return Bool
     */

    jCache.reset = function () {

        jCache.validateCache();

        localStorage.removeItem('jCache');

        clearInterval(jCache.jobs.removeExpiredKeysLoop);

        jCache.init(jCache.cacheId);

        return true;

    };


    /**
     * destroy clears everything (including the cacheId object) from storage and does not reinitiate jCache. It removes the jCache object from memory so that any further calls to the library will fail.
     *
     * @return Bool
     */

    jCache.destroy = function () {

        jCache.validateCache();

        localStorage.removeItem('jCache');

        clearInterval(jCache.jobs.removeExpiredKeysLoop);

        jCache = {};

        return true;

    };


    /**
     * isString tests whether the given key value is a string.
     *
     * @return Bool
     */

    jCache.isString = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {


                if (typeof jCache.cache[jCache.cacheId][key].value === 'string') {

                    return true;

                } else {

                    return false;

                }

            }

        }

    };


    /**
     * isInt tests whether the given key value is an integer (or a 'number' as javascript refers to integers).
     *
     * @return Bool
     */

    jCache.isInt = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {


                if (typeof jCache.cache[jCache.cacheId][key].value === 'number') {

                    return true;

                } else {

                    return false;

                }

            }

        }

    };


    /**
     * isInt tests whether the given key value is an integer (or a 'number' as javascript refers to integers).
     *
     * @return Bool
     */

    jCache.isInt = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {

                if (typeof jCache.cache[jCache.cacheId][key].value === 'object') {

                    return true;

                } else {

                    return false;

                }

            }

        }

    };


    /**
     * isArray tests whether the given key value is an array.
     *
     * @return Bool
     */

    jCache.isArray = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {

                if (jCache.cache[jCache.cacheId][key].value.constructor === Array) {

                    return true;

                } else {

                    return false;

                }

            }

        }

    };


    /**
     * isObject tests whether the given key value is an object.
     *
     * @return Bool
     */

    jCache.isObject = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return false;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return false;

            } else {

                if (typeof jCache.cache[jCache.cacheId][key].value === 'object' && jCache.cache[jCache.cacheId][key].value.constructor !== Array) {

                    return true;

                } else {

                    return false;

                }

            }

        }

    };


    /**
     * getType returns the type of the value of the given key.
     *
     * Note that JavaScript will interperet an array as an object. We are staying true to this. isArray should be used to check is the value is a true array. isObject can be used to check for an object that is not an array.
     *
     * Note that JavaScript returns 'number' for an integer.
     *
     * @return String
     */

    jCache.getType = function (key) {

        jCache.validateCache();

        if (typeof key === 'undefined' || key === null || key === "" || typeof key !== 'string') {

            console.error("jCache error: Invalid key given: " + key);

            return undefined;

        } else {

            if (typeof jCache.cache[jCache.cacheId][key] === 'undefined') {

                console.error("jCache error: " + key + " not found");

                return undefined;

            } else {

                return typeof jCache.cache[jCache.cacheId][key].value;

            }

        }

    };


    /**
     * keys returns the an array of keys for the cache
     *
     * @return Array
     */

    jCache.keys = function () {

        jCache.validateCache();

        return Object.keys(jCache.cache[jCache.cacheId]);

    };


    return jCache;

};
