'use strict';
var _ = require('lodash')
  , getKeyValue = require('./get-key-value')
  , setKeyValue = require('./set-key-value')
  , _undefined
  ;


/**
 * Map a object to another using the passed map
 * @param fromObject
 * @param toObject
 * @param propertyMap
 * @returns {*}
 * @constructor
 */
function ObjectMapper(fromObject, toObject, propertyMap) {
  //avoid ref change
  fromObject = _.cloneDeep(fromObject);
  toObject = _.cloneDeep(toObject);
  propertyMap = _.cloneDeep(propertyMap);

  var propertyKeys;

  if (typeof propertyMap === 'undefined') {
    propertyMap = toObject;
    toObject = _undefined;
  }

  if (typeof toObject === 'undefined') {
    toObject = {};
  }

  propertyKeys = Object.keys(propertyMap);

  return _map(fromObject, toObject, propertyMap, propertyKeys);
}
module.exports = ObjectMapper;
module.exports.merge = ObjectMapper;
module.exports.getKeyValue = getKeyValue;
module.exports.setKeyValue = setKeyValue;

/**
 * Function that calls get and set key values
 * @param fromObject
 * @param fromKey
 * @param toObject
 * @param toKey
 * @private
 * @recursive
 */
function _mapKey(fromObject, fromKey, toObject, toKey) {
  var fromValue
    , restToKeys
    , _default = null
    , transform
    ;

  if (Array.isArray(toKey) && toKey.length) {
    restToKeys = toKey.splice(1);
    toKey = toKey[0];
  }


  if (toKey instanceof Object && Object.getPrototypeOf(toKey) === Object.prototype) {
    _default = toKey.default || null;
    transform = toKey.transform;
    toKey = toKey.key;
  }

  if (Array.isArray(toKey)) {
    transform = toKey[1];
    _default = toKey[2] || null;
    toKey = toKey[0];
  }

  if (typeof _default === 'function') {
    _default = _default(fromObject, fromKey, toObject, toKey);
  }

  fromValue = getKeyValue(fromObject, fromKey);
  if (typeof fromValue === 'undefined' || fromValue === null) {
    fromValue = _default;
  }

  if (typeof fromValue !== 'undefined' && typeof transform === 'function') {
    fromValue = transform(fromValue, fromObject, toObject, fromKey, toKey);
  }

  setKeyValue(toObject, toKey, fromValue);

  if (Array.isArray(restToKeys) && restToKeys.length) {
    _mapKey(fromObject, fromKey, toObject, restToKeys);
  }
}

/**
 * Function that handle each key from map
 * @param fromObject
 * @param toObject
 * @param propertyMap
 * @param propertyKeys
 * @returns {*}
 * @private
 * @recursive
 */
function _map(fromObject, toObject, propertyMap, propertyKeys) {
  var fromKey
    , toKey
    ;

  if (propertyKeys.length) {
    fromKey = propertyKeys.splice(0, 1)[0];
    if (propertyMap.hasOwnProperty(fromKey)) {
      toKey = propertyMap[fromKey];

      _mapKey(fromObject, fromKey, toObject, toKey);
    }
    return _map(fromObject, toObject, propertyMap, propertyKeys);
  } else {
    return toObject;
  }
}