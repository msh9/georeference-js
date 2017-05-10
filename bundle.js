(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.georeference = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.referenceNames = undefined;
exports.fromLatLng = fromLatLng;
exports.toLatLng = toLatLng;

var _MaidenheadLocator = require('./src/MaidenheadLocator');

var MH = _interopRequireWildcard(_MaidenheadLocator);

var _GeoRef = require('./src/GeoRef');

var GR = _interopRequireWildcard(_GeoRef);

var _GeoHash = require('./src/GeoHash');

var GH = _interopRequireWildcard(_GeoHash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Defines fixed names for implemented georeference systems.
 */
var referenceNames = exports.referenceNames = {
  GeoRef: GR.name,
  GeoHash: GH.name,
  Maidenhead: MH.name
};

/**
 * Converts from a WGS84 lat,lng to a string calculated using the given system.
 * @param {string} referenceName The name of the geo reference system to use
 * @param {number} latitude The latitude to convert from
 * @param {number} longitude The longitde to convert from
 * @returns {string} The result of the geo reference system calculation
 */
/*
 Copyright 2017 Michael Hughes

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

function fromLatLng(referenceName, latitude, longitude) {
  switch (referenceName) {
    case GR.name:
      {
        return GR.georefFromLatLng(latitude, longitude);
      }
    case GH.name:
      {
        return GH.geohashFromLatLng(latitude, longitude);
      }
    case MH.name:
      {
        return MH.mhLocatorFromLatLng(latitude, longitude);
      }
    default:
      throw new Error('Unsupported system name ' + referenceName);
  }
}

/**
 * toLatLng returns an averaged location for the string in the given geo reference system
 * @param {string} referenceName The name of the geo reference system to use
 * @param {string} reference The reference to average into a lat,lng point
 */
function toLatLng(referenceName, reference) {
  switch (referenceName) {
    case GR.name:
      {
        return GR.latLngFromGeoref(reference);
      }
    case GH.name:
      {
        return GH.latLngFromGeohash(reference);
      }
    case MH.name:
      {
        return MH.latLngFromMhLocator(reference);
      }
    default:
      throw new Error('Unsupported system name ' + referenceName);
  }
}

},{"./src/GeoHash":4,"./src/GeoRef":5,"./src/MaidenheadLocator":7}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boundCheckAndAdd = boundCheckAndAdd;
exports.boundCheckAndRetrieve = boundCheckAndRetrieve;
/*
 Copyright 2017 Michael Hughes

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

function boundCheckAndAdd(quadId, characters, charMap) {
  if (quadId >= charMap.length || quadId < 0) {
    throw new Error("Latitude or Longitude value: " + quadId + " was out of range");
  }
  characters.push(charMap[quadId]);
}

function boundCheckAndRetrieve(character, charMap) {
  if (charMap[character] === undefined) {
    throw new Error("Invalid character " + character + " used in string");
  }

  return charMap[character];
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.round10 = round10;
exports.floor10 = floor10;
exports.ceil10 = ceil10;
/**
 * Original code from Mozilla Developer Network; logic was subsequently modified to fit into an es6 module.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Decimal_rounding|Decimal Rounding}
 * Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
 */

/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Number} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  var forcedValue = +value;
  var forcedExponent = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(forcedValue) || !(typeof forcedExponent === 'number' && forcedExponent % 1 === 0)) {
    return NaN;
  }
  // If the value is negative...
  if (forcedValue < 0) {
    return -decimalAdjust(type, -forcedValue, forcedExponent);
  }
  // Shift
  forcedValue = forcedValue.toString().split('e');
  forcedValue = Math[type](+(forcedValue[0] + 'e' + (forcedValue[1] ? +forcedValue[1] - forcedExponent : -forcedExponent)));
  // Shift back
  forcedValue = forcedValue.toString().split('e');
  return +(forcedValue[0] + 'e' + (forcedValue[1] ? +forcedValue[1] + forcedExponent : forcedExponent));
}

function round10(value, exp) {
  return decimalAdjust('round', value, exp);
}

function floor10(value, exp) {
  return decimalAdjust('floor', value, exp);
}

function ceil10(value, exp) {
  return decimalAdjust('ceil', value, exp);
}

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.geohashFromLatLng = geohashFromLatLng;
exports.latLngFromGeohash = latLngFromGeohash;
/*
 Copyright 2017 Michael Hughes

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * These are small utility functions implementing algorithms
 * originally design by Gustavo Niemeyer. All functions that deal with latitude and
 * longitude assume the WGS84 coordinate system.
 *
 * @see {@link http://geohash.org/|Geohash} converter
 * @see {@link https://en.wikipedia.org/wiki/Geohash|Algorithm} description
 *
 * @module
 */
var name = exports.name = 'GeoHash';
var geohashBase32Indices = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

/*
I will admit, this looks really stupid, but it does save us from
executing #indexOf or similar many times against geohashBase32Indices
when converting from a geohash.
 */
var geohashBase32CharMap = geohashBase32Indices.reduce(function (accumulator, val, idx) {
  /* eslint no-param-reassign: 0 */
  accumulator[val] = idx;
  return accumulator;
}, {});

var maxLatitudeBound = 90;
var maxLongitudeBound = 180;
var encodeBits = 5;

/**
 * Returns a geohash string built from a WGS84 latitude longitude pair
 * @param {number} latitude A WGS84 latitude
 * @param {number} longitude A WGS84 longitude
 * @param {number} [precision=12] The level of precision to encode, defaults to 12 characters
 * @returns {string} A geohash string
 */
function geohashFromLatLng(latitude, longitude) {
  var precision = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 12;

  if (precision < 1) {
    throw new Error('Precision value must be 1 or greater');
  }
  var doEven = true;
  var lowerLatitudeBound = maxLatitudeBound * -1;
  var lowerLongitudeBound = maxLongitudeBound * -1;
  var upperLatitudeBound = maxLatitudeBound;
  var upperLongitudeBound = maxLongitudeBound;
  var fiveBitResult = [];
  var encodedResult = [];

  /* NB: This loop is 1-indexed so we don't to add one each time we check to see
   * if a base32 character needs to be encoded.
   */
  for (var i = 1; i <= precision * encodeBits; i += 1) {
    var midLongitude = (lowerLongitudeBound + upperLongitudeBound) / 2;
    var midLatitude = (lowerLatitudeBound + upperLatitudeBound) / 2;

    if (doEven) {
      // evens are for longitude
      var position = longitude < midLongitude ? 0 : 1;
      fiveBitResult.push(position.toString());
      if (position) {
        lowerLongitudeBound = midLongitude;
      } else {
        upperLongitudeBound = midLongitude;
      }
    } else {
      var _position = latitude < midLatitude ? 0 : 1;
      fiveBitResult.push(_position.toString());
      if (_position) {
        lowerLatitudeBound = midLatitude;
      } else {
        upperLatitudeBound = midLatitude;
      }
    }

    if (i % encodeBits === 0) {
      /* Please let me know if there is better JS trickery to get from
       * an array of 1/0s in base 2 to a base 10 number
       */
      var charVal = Number.parseInt(fiveBitResult.join(''), 2);
      if (charVal < 0 || charVal > 31) {
        throw new Error('Parsing latitude and longitude resulted in invalid base32 value');
      }
      encodedResult.push(geohashBase32Indices[charVal]);
      fiveBitResult.length = 0;
    }

    doEven = !doEven;
  }

  return encodedResult.join('');
}

/**
 * Returns an approximate WGS84 point based on a given geohash
 * @param {string} geohash A geohash to decode into an approximate latitude and longitude
 * @returns {object} The approximate point represented by the geohash
 */
function latLngFromGeohash(geohash) {
  if (geohash === null || geohash.length < 1) {
    throw new Error('Empty geohash is not valid.');
  }
  var doEven = true;
  var lowerLatitudeBound = maxLatitudeBound * -1;
  var lowerLongitudeBound = maxLongitudeBound * -1;
  var upperLatitudeBound = maxLatitudeBound;
  var upperLongitudeBound = maxLongitudeBound;
  var midLongitude = (lowerLongitudeBound + upperLongitudeBound) / 2;
  var midLatitude = (lowerLatitudeBound + upperLatitudeBound) / 2;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = geohash[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var char = _step.value;

      var baseTenEncoded = geohashBase32CharMap[char];
      if (baseTenEncoded === undefined) {
        throw new Error('Invalid character in geohash, cannot convert ' + char);
      }

      /*
       * why? because strings and binary don't mix well and we need left
       * padding zeros in order for our calculations
       * to work
      */
      var baseTwoEncoded = ('0000' + baseTenEncoded.toString(2)).slice(-5);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = baseTwoEncoded[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var binaryChar = _step2.value;

          if (doEven && binaryChar === '1') {
            lowerLongitudeBound = midLongitude;
          } else if (doEven) {
            upperLongitudeBound = midLongitude;
          } else if (binaryChar === '0') {
            upperLatitudeBound = midLatitude;
          } else {
            lowerLatitudeBound = midLatitude;
          }

          midLongitude = (lowerLongitudeBound + upperLongitudeBound) / 2;
          midLatitude = (lowerLatitudeBound + upperLatitudeBound) / 2;
          doEven = !doEven;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return {
    latitude: midLatitude,
    longitude: midLongitude
  };
}

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.name = undefined;
exports.georefFromLatLng = georefFromLatLng;
exports.latLngFromGeoref = latLngFromGeoref;

var _GeoRefPrecision = require('./GeoRefPrecision');

var quads = _interopRequireWildcard(_GeoRefPrecision);

var _DecimalRounding = require('./DecimalRounding');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Small utility functions that implement the World Geographic Reference System (GEOREF). GEOREF
 * was developed by the United State Govt. for defense and strategic air operations.
 * Conveniently, is
 * it also a useful way of describing the general location of something. This module supports
 * precision to 0.01
 * arc minutes by use of 12 character GEOREF strings.
 *
 * @see {@link http://earth-info.nga.mil/GandG/publications/tm8358.1/tr83581c.html#ZZ38|Here} for
  * more information.
 *
 * @module
 */
/*
Copyright 2017 Michael Hughes

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
limitations under the License.
*/

var name = exports.name = 'GeoRef';

// I and O are removed for clarity
var cleanedAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/*
 Just like we did for the geohash module, we include a fixed reverse look up map in ensure
 that we're not iterating the cleanAlphabet array many, many, times.
 */
var georefCharMap = cleanedAlphabet.reduce(function (accumulator, val, idx) {
  /* eslint no-param-reassign: 0 */
  accumulator[val] = idx;
  return accumulator;
}, {});

var startingLongitude = -180;
var startingLatitude = -90;
var firstQuadWidth = 15;
var degreeArcMinutes = 60;
var tenthDegreeArcMinutes = degreeArcMinutes * 10;
var hundrethDegreeArcMinutes = degreeArcMinutes * 100;

/**
 * Returns a GEOREF string based on the given WGS84 latitude, longitude, and precision
 * @param {number} latitude A decimal latitude
 * @param {number} longitude A decimal longitude
 * @param {boolean} spaced Indicates whether to return GEOREF strings with spaces between
 * lat-lng characters--defaults to true
 * @param {QuadSize} precision The number of characters in the returned GEOREF string, allowed
 * values are 2 <= precision <= 12 and must be one of values exported by GeoRefPrecision
 * @returns {string} A GEOREF string based on the given values
 */
function georefFromLatLng(latitude, longitude) {
  var spaced = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var precision = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 8;

  if (precision < 2 || precision > 12) {
    throw new Error('GEOREF precision of ' + precision + ' is out of bounds');
  } else if (precision !== quads.FifteenDegreeQuad && precision !== quads.OneArcMinuteQuad && precision !== quads.OneDegreeQuad && precision !== quads.OneHundrethArcMinuteQuad && precision !== quads.OneTenthArcMinuteQuad) {
    throw new Error('GEOREF precision of ' + precision + ' is not an acceptable value from' + ' GeoRefPrecision');
  }
  var characters = [];
  var lastLeftLongitudeEdge = startingLongitude;
  var lastLowerLatitudeEdge = startingLatitude;

  // Create 15 degree bounding box
  var quadId = Math.floor((longitude - lastLeftLongitudeEdge) / firstQuadWidth);
  lastLeftLongitudeEdge += quadId * firstQuadWidth;
  boundCheckAndAdd(quadId, characters);
  quadId = Math.floor((latitude - lastLowerLatitudeEdge) / firstQuadWidth);
  lastLowerLatitudeEdge += quadId * firstQuadWidth;
  boundCheckAndAdd(quadId, characters);
  if (spaced && precision > quads.FifteenDegreeQuad) {
    characters.push(' ');
  } else if (precision <= quads.FifteenDegreeQuad) {
    return characters.join('');
  }
  // End 15 degree bounding box
  // Create one (1) degree bound box
  quadId = Math.floor(longitude - lastLeftLongitudeEdge);
  boundCheckAndAdd(quadId, characters);
  quadId = Math.floor(latitude - lastLowerLatitudeEdge);
  boundCheckAndAdd(quadId, characters);
  if (spaced && precision > quads.OneDegreeQuad) {
    characters.push(' ');
  } else if (precision <= quads.OneDegreeQuad) {
    return characters.join('');
  }
  // End one (1) degree bounding box
  /* For what it's worth we try to reduce the amount of error introduced by floating point
     calculations in the following sections by *not* reusing certain results. I should probably
     run a test or two to verify if this is actually worthwhile.
   */
  var flooredLongitude = Math.abs(longitude - Math.floor(longitude));
  var flooredLatitude = Math.abs(latitude - Math.floor(latitude));
  var longitudeArcMinutes = flooredLongitude * degreeArcMinutes;
  var latitudeArcMinutes = flooredLatitude * degreeArcMinutes;
  switch (precision) {
    case quads.OneArcMinuteQuad:
      {
        characters.push(('0' + Math.round(longitudeArcMinutes).toString()).slice(-2));
        if (spaced) {
          characters.push(' ');
        }
        characters.push(('0' + Math.round(latitudeArcMinutes).toString()).slice(-2));
        break;
      }
    case quads.OneTenthArcMinuteQuad:
      {
        // 60 ArcMinutes to a degree => up to 600 1/10 arcminutes, a three digit number
        characters.push(('00' + Math.round(longitudeArcMinutes * 10).toString()).slice(-3));
        if (spaced) {
          characters.push(' ');
        }
        characters.push(('00' + Math.round(latitudeArcMinutes * 10).toString()).slice(-3));
        break;
      }
    case quads.OneHundrethArcMinuteQuad:
      {
        // 60 ArcMinutes to a degree => up to 6000 1/100 arcminutes, a four digit number
        characters.push(('000' + Math.round(longitudeArcMinutes * 100).toString()).slice(-4));
        if (spaced) {
          characters.push(' ');
        }
        characters.push(('000' + Math.round(latitudeArcMinutes * 100).toString()).slice(-4));
        break;
      }
    default:
      throw new Error('GEOREF precision ' + precision + ' didn\'t match predefined valued');
  }

  return characters.join('');
}

function boundCheckAndAdd(quadId, characters) {
  if (quadId >= cleanedAlphabet.length) {
    throw new Error('Latitude or Longitude value: ' + quadId + ' was out of range');
  }
  characters.push(cleanedAlphabet[quadId]);
}

function boundCheckAndRetrieve(character) {
  if (georefCharMap[character] === undefined) {
    throw new Error('Invalid character ' + character + ' used in GEOREF string');
  }

  return georefCharMap[character];
}

/**
 * Returns an approximate latitude, longitude pair given a valid GEOREF string
 * @param {string} georef A valid georef string, null values or invalid characters will cause an
 * error to be thrown
 * @returns {object} A latitude, longitude point that represents the average location of the
 * given GEOREF string
 */
function latLngFromGeoref(georef) {
  if (!georef) {
    throw new Error('Empty GEOREF strings are invalid');
  } else if (georef.length < 2 || georef.length > 12) {
    throw new Error('GEOREF of ' + georef.length + ' is out of bounds');
  } else if (georef.length !== quads.FifteenDegreeQuad && georef.length !== quads.OneArcMinuteQuad && georef.length !== quads.OneDegreeQuad && georef.length !== quads.OneHundrethArcMinuteQuad && georef.length !== quads.OneTenthArcMinuteQuad) {
    throw new Error('GEOREF georef of ' + georef + ' is not an acceptable value from' + ' GeoRefPrecision');
  }
  return getLatLngFromGeoref(georef, true);
}

function getLatLngFromGeoref(georef) {
  var isSmallestQuad = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  switch (georef.length) {
    case quads.FifteenDegreeQuad:
      {
        var point = {
          latitude: startingLatitude + boundCheckAndRetrieve(georef[1]) * firstQuadWidth,
          longitude: startingLongitude + boundCheckAndRetrieve(georef[0]) * firstQuadWidth
        };
        if (isSmallestQuad) {
          point.latitude = Math.trunc(firstQuadWidth / 2 + point.latitude);
          point.longitude = Math.trunc(firstQuadWidth / 2 + point.longitude);
        }
        return point;
      }
    case quads.OneArcMinuteQuad:
      {
        var _point = getLatLngFromGeoref(georef.substr(0, 4));
        var easting = Number.parseInt(georef.substr(-4, 2), 10);
        var northing = Number.parseInt(georef.substr(-2, 2), 10);
        _point.latitude += (northing + (isSmallestQuad ? 0.5 : 0)) / degreeArcMinutes;
        _point.longitude += (easting + (isSmallestQuad ? 0.5 : 0)) / degreeArcMinutes;
        if (isSmallestQuad) {
          _point.latitude = (0, _DecimalRounding.round10)(_point.latitude, -1);
          _point.longitude = (0, _DecimalRounding.round10)(_point.longitude, -1);
        }
        return _point;
      }
    case quads.OneDegreeQuad:
      {
        var _point2 = getLatLngFromGeoref(georef.substr(0, 2));
        _point2.latitude += boundCheckAndRetrieve(georef[3]);
        _point2.longitude += boundCheckAndRetrieve(georef[2]);
        if (isSmallestQuad) {
          _point2.latitude = (0, _DecimalRounding.round10)(_point2.latitude + 0.5, 0);
          _point2.longitude = (0, _DecimalRounding.round10)(_point2.longitude + 0.5, 0);
        }
        return _point2;
      }
    case quads.OneHundrethArcMinuteQuad:
      {
        var _point3 = getLatLngFromGeoref(georef.substr(0, 4));
        var _easting = Number.parseInt(georef.substr(-8, 4), 10);
        var _northing = Number.parseInt(georef.substr(-4, 4), 10);
        _point3.latitude += (_northing + (isSmallestQuad ? 0.005 : 0)) / hundrethDegreeArcMinutes;
        _point3.longitude += (_easting + (isSmallestQuad ? 0.005 : 0)) / hundrethDegreeArcMinutes;
        if (isSmallestQuad) {
          _point3.latitude = (0, _DecimalRounding.round10)(_point3.latitude, -3);
          _point3.longitude = (0, _DecimalRounding.round10)(_point3.longitude, -3);
        }
        return _point3;
      }
    case quads.OneTenthArcMinuteQuad:
      {
        var _point4 = getLatLngFromGeoref(georef.substr(0, 4));
        var _easting2 = Number.parseInt(georef.substr(-6, 3), 10);
        var _northing2 = Number.parseInt(georef.substr(-3, 3), 10);
        _point4.latitude += (_northing2 + (isSmallestQuad ? 0.05 : 0)) / tenthDegreeArcMinutes;
        _point4.longitude += (_easting2 + (isSmallestQuad ? 0.05 : 0)) / tenthDegreeArcMinutes;
        if (isSmallestQuad) {
          _point4.latitude = (0, _DecimalRounding.round10)(_point4.latitude, -2);
          _point4.longitude = (0, _DecimalRounding.round10)(_point4.longitude, -2);
        }
        return _point4;
      }
    default:
      {
        throw new Error('Unrecognized GEOREF length ' + georef.length);
      }
  }
}

},{"./DecimalRounding":3,"./GeoRefPrecision":6}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 Copyright 2017 Michael Hughes

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 Defines friendly names for different levels of Georef precision
 @module
 */

/**
 * The size/type of a Georef quadrangle
 * @typedef {number} QuadSize
 */

/**
 * @type {QuadSize}
 */
var FifteenDegreeQuad = exports.FifteenDegreeQuad = 2;
/**
 * @type {QuadSize}
 */
var OneDegreeQuad = exports.OneDegreeQuad = 4;
/**
 * @type {QuadSize}
 */
var OneArcMinuteQuad = exports.OneArcMinuteQuad = 8;
/**
 * @type {QuadSize}
 */
var OneTenthArcMinuteQuad = exports.OneTenthArcMinuteQuad = 10;
/**
 * @type {QuadSize}
 */
var OneHundrethArcMinuteQuad = exports.OneHundrethArcMinuteQuad = 12;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.name = undefined;
exports.mhLocatorFromLatLng = mhLocatorFromLatLng;
exports.latLngFromMhLocator = latLngFromMhLocator;

var _Common = require('./Common');

var _DecimalRounding = require('./DecimalRounding');

/**
 * Implements functions for converting to/from a Maidenhead Locator using WGS84 latitude and
 * longitude
 * coordinates. Please note that implemented library functions only implement subsquare precision,
 * that is up to 6 characters are handled.
 *
 * Original description of system by @see {@link http://www.arrl.org/grid-squares|ARRL}
 * @module
 */
/*
 Copyright 2017 Michael Hughes

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var name = exports.name = 'Maidenhead';

var firstLevelDivisions = 18;
var firstLevelLongitudeDivision = 360 / firstLevelDivisions;
var firstLevelLatitudeDivision = 180 / firstLevelDivisions;
var thirdLevelDivisions = 24;
var degreeArcMinutes = 60;
var thirdLevelLongitudeDivisions = 2 * degreeArcMinutes / thirdLevelDivisions;
var thirdLevelLatitudeDivisions = degreeArcMinutes / thirdLevelDivisions;
var startingLongitude = -180;
var startingLatitude = -90;

var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x'];

var charMap = alphabet.reduce(function (accumulator, val, idx) {
  /* eslint no-param-reassign: 0 */
  accumulator[val] = idx;
  return accumulator;
}, {});

/**
 * Converts to a Maidenhead Locator Square from a WGS84 decimal latitude, longitude pair
 * @param {number} latitude A WGS84 decimal latitude
 * @param {number} longitude A WGS84 decimal longitude
 * @return {string} A Maidenhead Locator Square
 */
function mhLocatorFromLatLng(latitude, longitude) {
  if (latitude < -90 || latitude > 180 || longitude < -180 || longitude > 180) {
    throw new Error(latitude + ',' + longitude + ' was not a valid decimal WGS84 pair');
  }
  var characters = [];

  // In maidenhead locators are calculated as easting and northing from -90 S and -180 W
  var easting = longitude - startingLongitude;
  var northing = latitude - startingLatitude;

  // First level calculations
  var westLongitudeBoxBoundary = Math.floor(easting / firstLevelLongitudeDivision);
  (0, _Common.boundCheckAndAdd)(westLongitudeBoxBoundary, characters, alphabet);
  var southLatitudeBoxBoundary = Math.floor(northing / firstLevelLatitudeDivision);
  (0, _Common.boundCheckAndAdd)(southLatitudeBoxBoundary, characters, alphabet);
  // Only the top level square characters are upper case
  characters[0] = characters[0].toUpperCase();
  characters[1] = characters[1].toUpperCase();
  // End first level calculations

  // Second level, 'square', calculations
  westLongitudeBoxBoundary = Math.floor(easting % firstLevelLongitudeDivision / 2);
  southLatitudeBoxBoundary = Math.floor(northing % firstLevelLatitudeDivision);
  characters.push(westLongitudeBoxBoundary.toString());
  characters.push(southLatitudeBoxBoundary.toString());
  // End second level calculations

  // Third level, 'subsquares', calculations
  westLongitudeBoxBoundary = Math.floor(easting % 2 * degreeArcMinutes / thirdLevelLongitudeDivisions);
  southLatitudeBoxBoundary = Math.floor(northing % 1 * degreeArcMinutes / thirdLevelLatitudeDivisions);
  (0, _Common.boundCheckAndAdd)(westLongitudeBoxBoundary, characters, alphabet);
  (0, _Common.boundCheckAndAdd)(southLatitudeBoxBoundary, characters, alphabet);

  return characters.join('');
}

/**
 * Converts to a decimal WGS84 latitude, longitude pair from a Maidenhead Locator Square
 * @param {string} mhLocator A Maiden Locator Square
 * @return {object} A point object with latitude and longitude
 */
function latLngFromMhLocator(mhLocator) {
  if (!mhLocator || mhLocator.length % 2 !== 0 || mhLocator.length < 2 || mhLocator.length > 6) {
    throw new Error('Locator, ' + mhLocator + ', is badly formed by length');
  }

  return getLatLngFromMhLocator(mhLocator.split(''), true);
}

function getLatLngFromMhLocator(locatorChars) {
  var last = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  switch (locatorChars.length) {
    case 2:
      {
        var point = {
          latitude: startingLatitude,
          longitude: startingLongitude
        };
        var idx = (0, _Common.boundCheckAndRetrieve)(locatorChars[0].toLowerCase(), charMap);
        point.longitude += idx * firstLevelLongitudeDivision;
        idx = (0, _Common.boundCheckAndRetrieve)(locatorChars[1].toLowerCase(), charMap);
        point.latitude += idx * firstLevelLatitudeDivision;
        if (last) {
          point.longitude = (0, _DecimalRounding.round10)(firstLevelLongitudeDivision / 2 + point.longitude, 0);
          point.latitude = (0, _DecimalRounding.round10)(firstLevelLatitudeDivision / 2 + point.latitude, 0);
        }
        return point;
      }
    case 4:
      {
        var _point = getLatLngFromMhLocator(locatorChars.slice(0, 2));
        var lng = void 0;
        var lat = void 0;
        try {
          lng = parseInt(locatorChars[2], 10) * 2;
          lat = parseInt(locatorChars[3], 10);
        } catch (e) {
          throw new Error('Invalid characters found in locator, was either ' + locatorChars[2] + ' or\n        ' + locatorChars[3]);
        }
        _point.longitude += lng;
        _point.latitude += lat;
        if (last) {
          _point.longitude = (0, _DecimalRounding.round10)(_point.longitude + 1, -1);
          _point.latitude = (0, _DecimalRounding.round10)(_point.latitude + 0.5, -1);
        }
        return _point;
      }
    case 6:
      {
        var _point2 = getLatLngFromMhLocator(locatorChars.slice(0, 4));
        var LngIdx = (0, _Common.boundCheckAndRetrieve)(locatorChars[4].toLowerCase(), charMap);
        var LatIdx = (0, _Common.boundCheckAndRetrieve)(locatorChars[5].toLowerCase(), charMap);
        _point2.longitude += (LngIdx * thirdLevelLongitudeDivisions + (last ? 2.5 : 0)) / degreeArcMinutes;
        _point2.latitude += (LatIdx * thirdLevelLatitudeDivisions + (last ? 1.25 : 0)) / degreeArcMinutes;
        if (last) {
          _point2.longitude = (0, _DecimalRounding.round10)(_point2.longitude, -1);
          _point2.latitude = (0, _DecimalRounding.round10)(_point2.latitude, -1);
        }
        return _point2;
      }
    default:
      {
        throw new Error('Invalid number of Maidenhead Locator characters ' + locatorChars.length);
      }
  }
}

},{"./Common":2,"./DecimalRounding":3}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyY1xcQ29tbW9uLmpzIiwic3JjXFxEZWNpbWFsUm91bmRpbmcuanMiLCJzcmNcXEdlb0hhc2guanMiLCJzcmNcXEdlb1JlZi5qcyIsInNyY1xcR2VvUmVmUHJlY2lzaW9uLmpzIiwic3JjXFxNYWlkZW5oZWFkTG9jYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztRQ29DZ0IsVSxHQUFBLFU7UUFvQkEsUSxHQUFBLFE7O0FBeENoQjs7SUFBWSxFOztBQUNaOztJQUFZLEU7O0FBQ1o7O0lBQVksRTs7OztBQUVaOzs7QUFHTyxJQUFNLDBDQUFpQjtBQUM1QixVQUFRLEdBQUcsSUFEaUI7QUFFNUIsV0FBUyxHQUFHLElBRmdCO0FBRzVCLGNBQVksR0FBRztBQUhhLENBQXZCOztBQU1QOzs7Ozs7O0FBN0JBOzs7Ozs7Ozs7Ozs7Ozs7O0FBb0NPLFNBQVMsVUFBVCxDQUFvQixhQUFwQixFQUFtQyxRQUFuQyxFQUE2QyxTQUE3QyxFQUF3RDtBQUM3RCxVQUFRLGFBQVI7QUFDRSxTQUFLLEdBQUcsSUFBUjtBQUFjO0FBQ1osZUFBTyxHQUFHLGdCQUFILENBQW9CLFFBQXBCLEVBQThCLFNBQTlCLENBQVA7QUFDRDtBQUNELFNBQUssR0FBRyxJQUFSO0FBQWM7QUFDWixlQUFPLEdBQUcsaUJBQUgsQ0FBcUIsUUFBckIsRUFBK0IsU0FBL0IsQ0FBUDtBQUNEO0FBQ0QsU0FBSyxHQUFHLElBQVI7QUFBYztBQUNaLGVBQU8sR0FBRyxtQkFBSCxDQUF1QixRQUF2QixFQUFpQyxTQUFqQyxDQUFQO0FBQ0Q7QUFDRDtBQUFTLFlBQU0sSUFBSSxLQUFKLDhCQUFxQyxhQUFyQyxDQUFOO0FBVlg7QUFZRDs7QUFFRDs7Ozs7QUFLTyxTQUFTLFFBQVQsQ0FBa0IsYUFBbEIsRUFBaUMsU0FBakMsRUFBNEM7QUFDakQsVUFBUSxhQUFSO0FBQ0UsU0FBSyxHQUFH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QUFnQixXQUFoQixFQUF0QixFQUFxRCxPQUFyRCxDQUFmO0FBQ0EsWUFBTSxTQUFTLG1DQUFzQixhQUFhLENBQWIsRUFBZ0IsV0FBaEIsRUFBdEIsRUFBcUQsT0FBckQsQ0FBZjtBQUNBLGdCQUFNLFNBQU4sSUFBbUIsQ0FBRSxTQUFTLDRCQUFWLElBQTJDLE9BQU8sR0FBUCxHQUFhLENBQXhELENBQUQsSUFDZixnQkFESjtBQUVBLGdCQUFNLFFBQU4sSUFBa0IsQ0FBRSxTQUFTLDJCQUFWLElBQTBDLE9BQU8sSUFBUCxHQUFjLENBQXhELENBQUQsSUFDZCxnQkFESjtBQUVBLFlBQUksSUFBSixFQUFVO0FBQ1Isa0JBQU0sU0FBTixHQUFrQiw4QkFBUSxRQUFNLFNBQWQsRUFBeUIsQ0FBQyxDQUExQixDQUFsQjtBQUNBLGtCQUFNLFFBQU4sR0FBaUIsOEJBQVEsUUFBTSxRQUFkLEVBQXdCLENBQUMsQ0FBekIsQ0FBakI7QUFDRDtBQUNELGVBQU8sT0FBUDtBQUNEO0FBQ0Q7QUFBUztBQUNQLGNBQU0sSUFBSSxLQUFKLHNEQUE2RCxhQUFhLE1BQTFFLENBQU47QUFDRDtBQW5ESDtBQXFERCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuIENvcHlyaWdodCAyMDE3IE1pY2hhZWwgSHVnaGVzXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgTUggZnJvbSAnLi9zcmMvTWFpZGVuaGVhZExvY2F0b3InO1xuaW1wb3J0ICogYXMgR1IgZnJvbSAnLi9zcmMvR2VvUmVmJztcbmltcG9ydCAqIGFzIEdIIGZyb20gJy4vc3JjL0dlb0hhc2gnO1xuXG4vKipcbiAqIERlZmluZXMgZml4ZWQgbmFtZXMgZm9yIGltcGxlbWVudGVkIGdlb3JlZmVyZW5jZSBzeXN0ZW1zLlxuICovXG5leHBvcnQgY29uc3QgcmVmZXJlbmNlTmFtZXMgPSB7XG4gIEdlb1JlZjogR1IubmFtZSxcbiAgR2VvSGFzaDogR0gubmFtZSxcbiAgTWFpZGVuaGVhZDogTUgubmFtZSxcbn07XG5cbi8qKlxuICogQ29udmVydHMgZnJvbSBhIFdHUzg0IGxhdCxsbmcgdG8gYSBzdHJpbmcgY2FsY3VsYXRlZCB1c2luZyB0aGUgZ2l2ZW4gc3lzdGVtLlxuICogQHBhcmFtIHtzdHJpbmd9IHJlZmVyZW5jZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGdlbyByZWZlcmVuY2Ugc3lzdGVtIHRvIHVzZVxuICogQHBhcmFtIHtudW1iZXJ9IGxhdGl0dWRlIFRoZSBsYXRpdHVkZSB0byBjb252ZXJ0IGZyb21cbiAqIEBwYXJhbSB7bnVtYmVyfSBsb25naXR1ZGUgVGhlIGxvbmdpdGRlIHRvIGNvbnZlcnQgZnJvbVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgZ2VvIHJlZmVyZW5jZSBzeXN0ZW0gY2FsY3VsYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21MYXRMbmcocmVmZXJlbmNlTmFtZSwgbGF0aXR1ZGUsIGxvbmdpdHVkZSkge1xuICBzd2l0Y2ggKHJlZmVyZW5jZU5hbWUpIHtcbiAgICBjYXNlIEdSLm5hbWU6IHtcbiAgICAgIHJldHVybiBHUi5nZW9yZWZGcm9tTGF0TG5nKGxhdGl0dWRlLCBsb25naXR1ZGUpO1xuICAgIH1cbiAgICBjYXNlIEdILm5hbWU6IHtcbiAgICAgIHJldHVybiBHSC5nZW9oYXNoRnJvbUxhdExuZyhsYXRpdHVkZSwgbG9uZ2l0dWRlKTtcbiAgICB9XG4gICAgY2FzZSBNSC5uYW1lOiB7XG4gICAgICByZXR1cm4gTUgubWhMb2NhdG9yRnJvbUxhdExuZyhsYXRpdHVkZSwgbG9uZ2l0dWRlKTtcbiAgICB9XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBzeXN0ZW0gbmFtZSAke3JlZmVyZW5jZU5hbWV9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiB0b0xhdExuZyByZXR1cm5zIGFuIGF2ZXJhZ2VkIGxvY2F0aW9uIGZvciB0aGUgc3RyaW5nIGluIHRoZSBnaXZlbiBnZW8gcmVmZXJlbmNlIHN5c3RlbVxuICogQHBhcmFtIHtzdHJpbmd9IHJlZmVyZW5jZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGdlbyByZWZlcmVuY2Ugc3lzdGVtIHRvIHVzZVxuICogQHBhcmFtIHtzdHJpbmd9IHJlZmVyZW5jZSBUaGUgcmVmZXJlbmNlIHRvIGF2ZXJhZ2UgaW50byBhIGxhdCxsbmcgcG9pbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvTGF0TG5nKHJlZmVyZW5jZU5hbWUsIHJlZmVyZW5jZSkge1xuICBzd2l0Y2ggKHJlZmVyZW5jZU5hbWUpIHtcbiAgICBjYXNlIEdSLm5hbWU6IHtcbiAgICAgIHJldHVybiBHUi5sYXRMbmdGcm9tR2VvcmVmKHJlZmVyZW5jZSk7XG4gICAgfVxuICAgIGNhc2UgR0gubmFtZToge1xuICAgICAgcmV0dXJuIEdILmxhdExuZ0Zyb21HZW9oYXNoKHJlZmVyZW5jZSk7XG4gICAgfVxuICAgIGNhc2UgTUgubmFtZToge1xuICAgICAgcmV0dXJuIE1ILmxhdExuZ0Zyb21NaExvY2F0b3IocmVmZXJlbmNlKTtcbiAgICB9XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBzeXN0ZW0gbmFtZSAke3JlZmVyZW5jZU5hbWV9YCk7XG4gIH1cbn1cbiIsIi8qXG4gQ29weXJpZ2h0IDIwMTcgTWljaGFlbCBIdWdoZXNcblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYm91bmRDaGVja0FuZEFkZChxdWFkSWQsIGNoYXJhY3RlcnMsIGNoYXJNYXApIHtcbiAgaWYgKHF1YWRJZCA+PSBjaGFyTWFwLmxlbmd0aCB8fCBxdWFkSWQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBMYXRpdHVkZSBvciBMb25naXR1ZGUgdmFsdWU6ICR7cXVhZElkfSB3YXMgb3V0IG9mIHJhbmdlYCk7XG4gIH1cbiAgY2hhcmFjdGVycy5wdXNoKGNoYXJNYXBbcXVhZElkXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBib3VuZENoZWNrQW5kUmV0cmlldmUoY2hhcmFjdGVyLCBjaGFyTWFwKSB7XG4gIGlmIChjaGFyTWFwW2NoYXJhY3Rlcl0gPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjaGFyYWN0ZXIgJHtjaGFyYWN0ZXJ9IHVzZWQgaW4gc3RyaW5nYCk7XG4gIH1cblxuICByZXR1cm4gY2hhck1hcFtjaGFyYWN0ZXJdO1xufVxuIiwiLyoqXG4gKiBPcmlnaW5hbCBjb2RlIGZyb20gTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yazsgbG9naWMgd2FzIHN1YnNlcXVlbnRseSBtb2RpZmllZCB0byBmaXQgaW50byBhbiBlczYgbW9kdWxlLlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTWF0aC9yb3VuZCNEZWNpbWFsX3JvdW5kaW5nfERlY2ltYWwgUm91bmRpbmd9XG4gKiBBbnkgY29weXJpZ2h0IGlzIGRlZGljYXRlZCB0byB0aGUgUHVibGljIERvbWFpbi4gaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGljZG9tYWluL3plcm8vMS4wL1xuICovXG5cbi8qKlxuICogRGVjaW1hbCBhZGp1c3RtZW50IG9mIGEgbnVtYmVyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSAgdHlwZSAgVGhlIHR5cGUgb2YgYWRqdXN0bWVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSAgdmFsdWUgVGhlIG51bWJlci5cbiAqIEBwYXJhbSB7TnVtYmVyfSBleHAgICBUaGUgZXhwb25lbnQgKHRoZSAxMCBsb2dhcml0aG0gb2YgdGhlIGFkanVzdG1lbnQgYmFzZSkuXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYWRqdXN0ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGRlY2ltYWxBZGp1c3QodHlwZSwgdmFsdWUsIGV4cCkge1xuICAvLyBJZiB0aGUgZXhwIGlzIHVuZGVmaW5lZCBvciB6ZXJvLi4uXG4gIGlmICh0eXBlb2YgZXhwID09PSAndW5kZWZpbmVkJyB8fCArZXhwID09PSAwKSB7XG4gICAgcmV0dXJuIE1hdGhbdHlwZV0odmFsdWUpO1xuICB9XG4gIGxldCBmb3JjZWRWYWx1ZSA9ICt2YWx1ZTtcbiAgY29uc3QgZm9yY2VkRXhwb25lbnQgPSArZXhwO1xuICAvLyBJZiB0aGUgdmFsdWUgaXMgbm90IGEgbnVtYmVyIG9yIHRoZSBleHAgaXMgbm90IGFuIGludGVnZXIuLi5cbiAgaWYgKGlzTmFOKGZvcmNlZFZhbHVlKSB8fCAhKHR5cGVvZiBmb3JjZWRFeHBvbmVudCA9PT0gJ251bWJlcicgJiYgZm9yY2VkRXhwb25lbnQgJSAxID09PSAwKSkge1xuICAgIHJldHVybiBOYU47XG4gIH1cbiAgLy8gSWYgdGhlIHZhbHVlIGlzIG5lZ2F0aXZlLi4uXG4gIGlmIChmb3JjZWRWYWx1ZSA8IDApIHtcbiAgICByZXR1cm4gLWRlY2ltYWxBZGp1c3QodHlwZSwgLWZvcmNlZFZhbHVlLCBmb3JjZWRFeHBvbmVudCk7XG4gIH1cbiAgLy8gU2hpZnRcbiAgZm9yY2VkVmFsdWUgPSBmb3JjZWRWYWx1ZS50b1N0cmluZygpLnNwbGl0KCdlJyk7XG4gIGZvcmNlZFZhbHVlID0gTWF0aFt0eXBlXSgrKGZvcmNlZFZhbHVlWzBdICsgJ2UnICsgKGZvcmNlZFZhbHVlWzFdID8gKCtmb3JjZWRWYWx1ZVsxXSAtIGZvcmNlZEV4cG9uZW50KSA6IC1mb3JjZWRFeHBvbmVudCkpKTtcbiAgLy8gU2hpZnQgYmFja1xuICBmb3JjZWRWYWx1ZSA9IGZvcmNlZFZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJ2UnKTtcbiAgcmV0dXJuICsoZm9yY2VkVmFsdWVbMF0gKyAnZScgKyAoZm9yY2VkVmFsdWVbMV0gPyAoK2ZvcmNlZFZhbHVlWzFdICsgZm9yY2VkRXhwb25lbnQpIDogZm9yY2VkRXhwb25lbnQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kMTAodmFsdWUsIGV4cCkge1xuICByZXR1cm4gZGVjaW1hbEFkanVzdCgncm91bmQnLCB2YWx1ZSwgZXhwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsb29yMTAodmFsdWUsIGV4cCkge1xuICByZXR1cm4gZGVjaW1hbEFkanVzdCgnZmxvb3InLCB2YWx1ZSwgZXhwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNlaWwxMCh2YWx1ZSwgZXhwKSB7XG4gIHJldHVybiBkZWNpbWFsQWRqdXN0KCdjZWlsJywgdmFsdWUsIGV4cCk7XG59XG5cblxuIiwiLypcbiBDb3B5cmlnaHQgMjAxNyBNaWNoYWVsIEh1Z2hlc1xuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogVGhlc2UgYXJlIHNtYWxsIHV0aWxpdHkgZnVuY3Rpb25zIGltcGxlbWVudGluZyBhbGdvcml0aG1zXG4gKiBvcmlnaW5hbGx5IGRlc2lnbiBieSBHdXN0YXZvIE5pZW1leWVyLiBBbGwgZnVuY3Rpb25zIHRoYXQgZGVhbCB3aXRoIGxhdGl0dWRlIGFuZFxuICogbG9uZ2l0dWRlIGFzc3VtZSB0aGUgV0dTODQgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2dlb2hhc2gub3JnL3xHZW9oYXNofSBjb252ZXJ0ZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dlb2hhc2h8QWxnb3JpdGhtfSBkZXNjcmlwdGlvblxuICpcbiAqIEBtb2R1bGVcbiAqL1xuZXhwb3J0IGNvbnN0IG5hbWUgPSAnR2VvSGFzaCc7XG5jb25zdCBnZW9oYXNoQmFzZTMySW5kaWNlcyA9IFtcbiAgJzAnLFxuICAnMScsXG4gICcyJyxcbiAgJzMnLFxuICAnNCcsXG4gICc1JyxcbiAgJzYnLFxuICAnNycsXG4gICc4JyxcbiAgJzknLFxuICAnYicsXG4gICdjJyxcbiAgJ2QnLFxuICAnZScsXG4gICdmJyxcbiAgJ2cnLFxuICAnaCcsXG4gICdqJyxcbiAgJ2snLFxuICAnbScsXG4gICduJyxcbiAgJ3AnLFxuICAncScsXG4gICdyJyxcbiAgJ3MnLFxuICAndCcsXG4gICd1JyxcbiAgJ3YnLFxuICAndycsXG4gICd4JyxcbiAgJ3knLFxuICAneicsXG5dO1xuXG4vKlxuSSB3aWxsIGFkbWl0LCB0aGlzIGxvb2tzIHJlYWxseSBzdHVwaWQsIGJ1dCBpdCBkb2VzIHNhdmUgdXMgZnJvbVxuZXhlY3V0aW5nICNpbmRleE9mIG9yIHNpbWlsYXIgbWFueSB0aW1lcyBhZ2FpbnN0IGdlb2hhc2hCYXNlMzJJbmRpY2VzXG53aGVuIGNvbnZlcnRpbmcgZnJvbSBhIGdlb2hhc2guXG4gKi9cbmNvbnN0IGdlb2hhc2hCYXNlMzJDaGFyTWFwID0gZ2VvaGFzaEJhc2UzMkluZGljZXMucmVkdWNlKChhY2N1bXVsYXRvciwgdmFsLCBpZHgpID0+IHtcbiAgLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiAwICovXG4gIGFjY3VtdWxhdG9yW3ZhbF0gPSBpZHg7XG4gIHJldHVybiBhY2N1bXVsYXRvcjtcbn0sIHt9KTtcblxuY29uc3QgbWF4TGF0aXR1ZGVCb3VuZCA9IDkwO1xuY29uc3QgbWF4TG9uZ2l0dWRlQm91bmQgPSAxODA7XG5jb25zdCBlbmNvZGVCaXRzID0gNTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgZ2VvaGFzaCBzdHJpbmcgYnVpbHQgZnJvbSBhIFdHUzg0IGxhdGl0dWRlIGxvbmdpdHVkZSBwYWlyXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0aXR1ZGUgQSBXR1M4NCBsYXRpdHVkZVxuICogQHBhcmFtIHtudW1iZXJ9IGxvbmdpdHVkZSBBIFdHUzg0IGxvbmdpdHVkZVxuICogQHBhcmFtIHtudW1iZXJ9IFtwcmVjaXNpb249MTJdIFRoZSBsZXZlbCBvZiBwcmVjaXNpb24gdG8gZW5jb2RlLCBkZWZhdWx0cyB0byAxMiBjaGFyYWN0ZXJzXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBBIGdlb2hhc2ggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW9oYXNoRnJvbUxhdExuZyhsYXRpdHVkZSwgbG9uZ2l0dWRlLCBwcmVjaXNpb24gPSAxMikge1xuICBpZiAocHJlY2lzaW9uIDwgMSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJlY2lzaW9uIHZhbHVlIG11c3QgYmUgMSBvciBncmVhdGVyJyk7XG4gIH1cbiAgbGV0IGRvRXZlbiA9IHRydWU7XG4gIGxldCBsb3dlckxhdGl0dWRlQm91bmQgPSBtYXhMYXRpdHVkZUJvdW5kICogLTE7XG4gIGxldCBsb3dlckxvbmdpdHVkZUJvdW5kID0gbWF4TG9uZ2l0dWRlQm91bmQgKiAtMTtcbiAgbGV0IHVwcGVyTGF0aXR1ZGVCb3VuZCA9IG1heExhdGl0dWRlQm91bmQ7XG4gIGxldCB1cHBlckxvbmdpdHVkZUJvdW5kID0gbWF4TG9uZ2l0dWRlQm91bmQ7XG4gIGNvbnN0IGZpdmVCaXRSZXN1bHQgPSBbXTtcbiAgY29uc3QgZW5jb2RlZFJlc3VsdCA9IFtdO1xuXG4gIC8qIE5COiBUaGlzIGxvb3AgaXMgMS1pbmRleGVkIHNvIHdlIGRvbid0IHRvIGFkZCBvbmUgZWFjaCB0aW1lIHdlIGNoZWNrIHRvIHNlZVxuICAgKiBpZiBhIGJhc2UzMiBjaGFyYWN0ZXIgbmVlZHMgdG8gYmUgZW5jb2RlZC5cbiAgICovXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IHByZWNpc2lvbiAqIGVuY29kZUJpdHM7IGkgKz0gMSkge1xuICAgIGNvbnN0IG1pZExvbmdpdHVkZSA9IChsb3dlckxvbmdpdHVkZUJvdW5kICsgdXBwZXJMb25naXR1ZGVCb3VuZCkgLyAyO1xuICAgIGNvbnN0IG1pZExhdGl0dWRlID0gKGxvd2VyTGF0aXR1ZGVCb3VuZCArIHVwcGVyTGF0aXR1ZGVCb3VuZCkgLyAyO1xuXG4gICAgaWYgKGRvRXZlbikgeyAvLyBldmVucyBhcmUgZm9yIGxvbmdpdHVkZVxuICAgICAgY29uc3QgcG9zaXRpb24gPSAobG9uZ2l0dWRlIDwgbWlkTG9uZ2l0dWRlKSA/IDAgOiAxO1xuICAgICAgZml2ZUJpdFJlc3VsdC5wdXNoKHBvc2l0aW9uLnRvU3RyaW5nKCkpO1xuICAgICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICAgIGxvd2VyTG9uZ2l0dWRlQm91bmQgPSBtaWRMb25naXR1ZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cHBlckxvbmdpdHVkZUJvdW5kID0gbWlkTG9uZ2l0dWRlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IChsYXRpdHVkZSA8IG1pZExhdGl0dWRlKSA/IDAgOiAxO1xuICAgICAgZml2ZUJpdFJlc3VsdC5wdXNoKHBvc2l0aW9uLnRvU3RyaW5nKCkpO1xuICAgICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICAgIGxvd2VyTGF0aXR1ZGVCb3VuZCA9IG1pZExhdGl0dWRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXBwZXJMYXRpdHVkZUJvdW5kID0gbWlkTGF0aXR1ZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgJSBlbmNvZGVCaXRzID09PSAwKSB7XG4gICAgICAvKiBQbGVhc2UgbGV0IG1lIGtub3cgaWYgdGhlcmUgaXMgYmV0dGVyIEpTIHRyaWNrZXJ5IHRvIGdldCBmcm9tXG4gICAgICAgKiBhbiBhcnJheSBvZiAxLzBzIGluIGJhc2UgMiB0byBhIGJhc2UgMTAgbnVtYmVyXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGNoYXJWYWwgPSBOdW1iZXIucGFyc2VJbnQoZml2ZUJpdFJlc3VsdC5qb2luKCcnKSwgMik7XG4gICAgICBpZiAoY2hhclZhbCA8IDAgfHwgY2hhclZhbCA+IDMxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyc2luZyBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIHJlc3VsdGVkIGluIGludmFsaWQgYmFzZTMyIHZhbHVlJyk7XG4gICAgICB9XG4gICAgICBlbmNvZGVkUmVzdWx0LnB1c2goZ2VvaGFzaEJhc2UzMkluZGljZXNbY2hhclZhbF0pO1xuICAgICAgZml2ZUJpdFJlc3VsdC5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGRvRXZlbiA9ICFkb0V2ZW47XG4gIH1cblxuICByZXR1cm4gZW5jb2RlZFJlc3VsdC5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFwcHJveGltYXRlIFdHUzg0IHBvaW50IGJhc2VkIG9uIGEgZ2l2ZW4gZ2VvaGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGdlb2hhc2ggQSBnZW9oYXNoIHRvIGRlY29kZSBpbnRvIGFuIGFwcHJveGltYXRlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGVcbiAqIEByZXR1cm5zIHtvYmplY3R9IFRoZSBhcHByb3hpbWF0ZSBwb2ludCByZXByZXNlbnRlZCBieSB0aGUgZ2VvaGFzaFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF0TG5nRnJvbUdlb2hhc2goZ2VvaGFzaCkge1xuICBpZiAoZ2VvaGFzaCA9PT0gbnVsbCB8fCBnZW9oYXNoLmxlbmd0aCA8IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VtcHR5IGdlb2hhc2ggaXMgbm90IHZhbGlkLicpO1xuICB9XG4gIGxldCBkb0V2ZW4gPSB0cnVlO1xuICBsZXQgbG93ZXJMYXRpdHVkZUJvdW5kID0gbWF4TGF0aXR1ZGVCb3VuZCAqIC0xO1xuICBsZXQgbG93ZXJMb25naXR1ZGVCb3VuZCA9IG1heExvbmdpdHVkZUJvdW5kICogLTE7XG4gIGxldCB1cHBlckxhdGl0dWRlQm91bmQgPSBtYXhMYXRpdHVkZUJvdW5kO1xuICBsZXQgdXBwZXJMb25naXR1ZGVCb3VuZCA9IG1heExvbmdpdHVkZUJvdW5kO1xuICBsZXQgbWlkTG9uZ2l0dWRlID0gKGxvd2VyTG9uZ2l0dWRlQm91bmQgKyB1cHBlckxvbmdpdHVkZUJvdW5kKSAvIDI7XG4gIGxldCBtaWRMYXRpdHVkZSA9IChsb3dlckxhdGl0dWRlQm91bmQgKyB1cHBlckxhdGl0dWRlQm91bmQpIC8gMjtcblxuICBmb3IgKGNvbnN0IGNoYXIgb2YgZ2VvaGFzaCkge1xuICAgIGNvbnN0IGJhc2VUZW5FbmNvZGVkID0gZ2VvaGFzaEJhc2UzMkNoYXJNYXBbY2hhcl07XG4gICAgaWYgKGJhc2VUZW5FbmNvZGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjaGFyYWN0ZXIgaW4gZ2VvaGFzaCwgY2Fubm90IGNvbnZlcnQgJHtjaGFyfWApO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogd2h5PyBiZWNhdXNlIHN0cmluZ3MgYW5kIGJpbmFyeSBkb24ndCBtaXggd2VsbCBhbmQgd2UgbmVlZCBsZWZ0XG4gICAgICogcGFkZGluZyB6ZXJvcyBpbiBvcmRlciBmb3Igb3VyIGNhbGN1bGF0aW9uc1xuICAgICAqIHRvIHdvcmtcbiAgICAqL1xuICAgIGNvbnN0IGJhc2VUd29FbmNvZGVkID0gKGAwMDAwJHtiYXNlVGVuRW5jb2RlZC50b1N0cmluZygyKX1gKS5zbGljZSgtNSk7XG4gICAgZm9yIChjb25zdCBiaW5hcnlDaGFyIG9mIGJhc2VUd29FbmNvZGVkKSB7XG4gICAgICBpZiAoZG9FdmVuICYmIGJpbmFyeUNoYXIgPT09ICcxJykge1xuICAgICAgICBsb3dlckxvbmdpdHVkZUJvdW5kID0gbWlkTG9uZ2l0dWRlO1xuICAgICAgfSBlbHNlIGlmIChkb0V2ZW4pIHtcbiAgICAgICAgdXBwZXJMb25naXR1ZGVCb3VuZCA9IG1pZExvbmdpdHVkZTtcbiAgICAgIH0gZWxzZSBpZiAoYmluYXJ5Q2hhciA9PT0gJzAnKSB7XG4gICAgICAgIHVwcGVyTGF0aXR1ZGVCb3VuZCA9IG1pZExhdGl0dWRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG93ZXJMYXRpdHVkZUJvdW5kID0gbWlkTGF0aXR1ZGU7XG4gICAgICB9XG5cbiAgICAgIG1pZExvbmdpdHVkZSA9IChsb3dlckxvbmdpdHVkZUJvdW5kICsgdXBwZXJMb25naXR1ZGVCb3VuZCkgLyAyO1xuICAgICAgbWlkTGF0aXR1ZGUgPSAobG93ZXJMYXRpdHVkZUJvdW5kICsgdXBwZXJMYXRpdHVkZUJvdW5kKSAvIDI7XG4gICAgICBkb0V2ZW4gPSAhZG9FdmVuO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGF0aXR1ZGU6IG1pZExhdGl0dWRlLFxuICAgIGxvbmdpdHVkZTogbWlkTG9uZ2l0dWRlLFxuICB9O1xufVxuIiwiLypcbkNvcHlyaWdodCAyMDE3IE1pY2hhZWwgSHVnaGVzXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIHF1YWRzIGZyb20gJy4vR2VvUmVmUHJlY2lzaW9uJztcbmltcG9ydCB7IHJvdW5kMTAgfSBmcm9tICcuL0RlY2ltYWxSb3VuZGluZyc7XG5cbi8qKlxuICogU21hbGwgdXRpbGl0eSBmdW5jdGlvbnMgdGhhdCBpbXBsZW1lbnQgdGhlIFdvcmxkIEdlb2dyYXBoaWMgUmVmZXJlbmNlIFN5c3RlbSAoR0VPUkVGKS4gR0VPUkVGXG4gKiB3YXMgZGV2ZWxvcGVkIGJ5IHRoZSBVbml0ZWQgU3RhdGUgR292dC4gZm9yIGRlZmVuc2UgYW5kIHN0cmF0ZWdpYyBhaXIgb3BlcmF0aW9ucy5cbiAqIENvbnZlbmllbnRseSwgaXNcbiAqIGl0IGFsc28gYSB1c2VmdWwgd2F5IG9mIGRlc2NyaWJpbmcgdGhlIGdlbmVyYWwgbG9jYXRpb24gb2Ygc29tZXRoaW5nLiBUaGlzIG1vZHVsZSBzdXBwb3J0c1xuICogcHJlY2lzaW9uIHRvIDAuMDFcbiAqIGFyYyBtaW51dGVzIGJ5IHVzZSBvZiAxMiBjaGFyYWN0ZXIgR0VPUkVGIHN0cmluZ3MuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2VhcnRoLWluZm8ubmdhLm1pbC9HYW5kRy9wdWJsaWNhdGlvbnMvdG04MzU4LjEvdHI4MzU4MWMuaHRtbCNaWjM4fEhlcmV9IGZvclxuICAqIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogQG1vZHVsZVxuICovXG5leHBvcnQgY29uc3QgbmFtZSA9ICdHZW9SZWYnO1xuXG4vLyBJIGFuZCBPIGFyZSByZW1vdmVkIGZvciBjbGFyaXR5XG5jb25zdCBjbGVhbmVkQWxwaGFiZXQgPSBbXG4gICdBJyxcbiAgJ0InLFxuICAnQycsXG4gICdEJyxcbiAgJ0UnLFxuICAnRicsXG4gICdHJyxcbiAgJ0gnLFxuICAnSicsXG4gICdLJyxcbiAgJ0wnLFxuICAnTScsXG4gICdOJyxcbiAgJ1AnLFxuICAnUScsXG4gICdSJyxcbiAgJ1MnLFxuICAnVCcsXG4gICdVJyxcbiAgJ1YnLFxuICAnVycsXG4gICdYJyxcbiAgJ1knLFxuICAnWicsXG5dO1xuXG4vKlxuIEp1c3QgbGlrZSB3ZSBkaWQgZm9yIHRoZSBnZW9oYXNoIG1vZHVsZSwgd2UgaW5jbHVkZSBhIGZpeGVkIHJldmVyc2UgbG9vayB1cCBtYXAgaW4gZW5zdXJlXG4gdGhhdCB3ZSdyZSBub3QgaXRlcmF0aW5nIHRoZSBjbGVhbkFscGhhYmV0IGFycmF5IG1hbnksIG1hbnksIHRpbWVzLlxuICovXG5jb25zdCBnZW9yZWZDaGFyTWFwID0gY2xlYW5lZEFscGhhYmV0LnJlZHVjZSgoYWNjdW11bGF0b3IsIHZhbCwgaWR4KSA9PiB7XG4gIC8qIGVzbGludCBuby1wYXJhbS1yZWFzc2lnbjogMCAqL1xuICBhY2N1bXVsYXRvclt2YWxdID0gaWR4O1xuICByZXR1cm4gYWNjdW11bGF0b3I7XG59LHt9KTtcblxuY29uc3Qgc3RhcnRpbmdMb25naXR1ZGUgPSAtMTgwO1xuY29uc3Qgc3RhcnRpbmdMYXRpdHVkZSA9IC05MDtcbmNvbnN0IGZpcnN0UXVhZFdpZHRoID0gMTU7XG5jb25zdCBkZWdyZWVBcmNNaW51dGVzID0gNjA7XG5jb25zdCB0ZW50aERlZ3JlZUFyY01pbnV0ZXMgPSBkZWdyZWVBcmNNaW51dGVzICogMTA7XG5jb25zdCBodW5kcmV0aERlZ3JlZUFyY01pbnV0ZXMgPSBkZWdyZWVBcmNNaW51dGVzICogMTAwO1xuXG4vKipcbiAqIFJldHVybnMgYSBHRU9SRUYgc3RyaW5nIGJhc2VkIG9uIHRoZSBnaXZlbiBXR1M4NCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCBhbmQgcHJlY2lzaW9uXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0aXR1ZGUgQSBkZWNpbWFsIGxhdGl0dWRlXG4gKiBAcGFyYW0ge251bWJlcn0gbG9uZ2l0dWRlIEEgZGVjaW1hbCBsb25naXR1ZGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc3BhY2VkIEluZGljYXRlcyB3aGV0aGVyIHRvIHJldHVybiBHRU9SRUYgc3RyaW5ncyB3aXRoIHNwYWNlcyBiZXR3ZWVuXG4gKiBsYXQtbG5nIGNoYXJhY3RlcnMtLWRlZmF1bHRzIHRvIHRydWVcbiAqIEBwYXJhbSB7UXVhZFNpemV9IHByZWNpc2lvbiBUaGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgaW4gdGhlIHJldHVybmVkIEdFT1JFRiBzdHJpbmcsIGFsbG93ZWRcbiAqIHZhbHVlcyBhcmUgMiA8PSBwcmVjaXNpb24gPD0gMTIgYW5kIG11c3QgYmUgb25lIG9mIHZhbHVlcyBleHBvcnRlZCBieSBHZW9SZWZQcmVjaXNpb25cbiAqIEByZXR1cm5zIHtzdHJpbmd9IEEgR0VPUkVGIHN0cmluZyBiYXNlZCBvbiB0aGUgZ2l2ZW4gdmFsdWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW9yZWZGcm9tTGF0TG5nKGxhdGl0dWRlLCBsb25naXR1ZGUsIHNwYWNlZCA9IHRydWUsIHByZWNpc2lvbiA9IDgpIHtcbiAgaWYgKHByZWNpc2lvbiA8IDIgfHwgcHJlY2lzaW9uID4gMTIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEdFT1JFRiBwcmVjaXNpb24gb2YgJHtwcmVjaXNpb259IGlzIG91dCBvZiBib3VuZHNgKTtcbiAgfSBlbHNlIGlmIChwcmVjaXNpb24gIT09IHF1YWRzLkZpZnRlZW5EZWdyZWVRdWFkICYmIHByZWNpc2lvbiAhPT0gcXVhZHMuT25lQXJjTWludXRlUXVhZCAmJlxuICAgIHByZWNpc2lvbiAhPT0gcXVhZHMuT25lRGVncmVlUXVhZCAmJiBwcmVjaXNpb24gIT09IHF1YWRzLk9uZUh1bmRyZXRoQXJjTWludXRlUXVhZCAmJlxuICAgIHByZWNpc2lvbiAhPT0gcXVhZHMuT25lVGVudGhBcmNNaW51dGVRdWFkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHRU9SRUYgcHJlY2lzaW9uIG9mICR7cHJlY2lzaW9ufSBpcyBub3QgYW4gYWNjZXB0YWJsZSB2YWx1ZSBmcm9tYCArXG4gICAgICAnIEdlb1JlZlByZWNpc2lvbicpO1xuICB9XG4gIGNvbnN0IGNoYXJhY3RlcnMgPSBbXTtcbiAgbGV0IGxhc3RMZWZ0TG9uZ2l0dWRlRWRnZSA9IHN0YXJ0aW5nTG9uZ2l0dWRlO1xuICBsZXQgbGFzdExvd2VyTGF0aXR1ZGVFZGdlID0gc3RhcnRpbmdMYXRpdHVkZTtcblxuICAvLyBDcmVhdGUgMTUgZGVncmVlIGJvdW5kaW5nIGJveFxuICBsZXQgcXVhZElkID0gTWF0aC5mbG9vcigobG9uZ2l0dWRlIC0gbGFzdExlZnRMb25naXR1ZGVFZGdlKSAvIGZpcnN0UXVhZFdpZHRoKTtcbiAgbGFzdExlZnRMb25naXR1ZGVFZGdlICs9IHF1YWRJZCAqIGZpcnN0UXVhZFdpZHRoO1xuICBib3VuZENoZWNrQW5kQWRkKHF1YWRJZCwgY2hhcmFjdGVycyk7XG4gIHF1YWRJZCA9IE1hdGguZmxvb3IoKGxhdGl0dWRlIC0gbGFzdExvd2VyTGF0aXR1ZGVFZGdlKSAvIGZpcnN0UXVhZFdpZHRoKTtcbiAgbGFzdExvd2VyTGF0aXR1ZGVFZGdlICs9IHF1YWRJZCAqIGZpcnN0UXVhZFdpZHRoO1xuICBib3VuZENoZWNrQW5kQWRkKHF1YWRJZCwgY2hhcmFjdGVycyk7XG4gIGlmIChzcGFjZWQgJiYgcHJlY2lzaW9uID4gcXVhZHMuRmlmdGVlbkRlZ3JlZVF1YWQpIHtcbiAgICBjaGFyYWN0ZXJzLnB1c2goJyAnKTtcbiAgfSBlbHNlIGlmIChwcmVjaXNpb24gPD0gcXVhZHMuRmlmdGVlbkRlZ3JlZVF1YWQpIHtcbiAgICByZXR1cm4gY2hhcmFjdGVycy5qb2luKCcnKTtcbiAgfVxuICAvLyBFbmQgMTUgZGVncmVlIGJvdW5kaW5nIGJveFxuICAvLyBDcmVhdGUgb25lICgxKSBkZWdyZWUgYm91bmQgYm94XG4gIHF1YWRJZCA9IE1hdGguZmxvb3IobG9uZ2l0dWRlIC0gbGFzdExlZnRMb25naXR1ZGVFZGdlKTtcbiAgYm91bmRDaGVja0FuZEFkZChxdWFkSWQsIGNoYXJhY3RlcnMpO1xuICBxdWFkSWQgPSBNYXRoLmZsb29yKGxhdGl0dWRlIC0gbGFzdExvd2VyTGF0aXR1ZGVFZGdlKTtcbiAgYm91bmRDaGVja0FuZEFkZChxdWFkSWQsIGNoYXJhY3RlcnMpO1xuICBpZiAoc3BhY2VkICYmIHByZWNpc2lvbiA+IHF1YWRzLk9uZURlZ3JlZVF1YWQpIHtcbiAgICBjaGFyYWN0ZXJzLnB1c2goJyAnKTtcbiAgfSBlbHNlIGlmIChwcmVjaXNpb24gPD0gcXVhZHMuT25lRGVncmVlUXVhZCkge1xuICAgIHJldHVybiBjaGFyYWN0ZXJzLmpvaW4oJycpO1xuICB9XG4gIC8vIEVuZCBvbmUgKDEpIGRlZ3JlZSBib3VuZGluZyBib3hcbiAgLyogRm9yIHdoYXQgaXQncyB3b3J0aCB3ZSB0cnkgdG8gcmVkdWNlIHRoZSBhbW91bnQgb2YgZXJyb3IgaW50cm9kdWNlZCBieSBmbG9hdGluZyBwb2ludFxuICAgICBjYWxjdWxhdGlvbnMgaW4gdGhlIGZvbGxvd2luZyBzZWN0aW9ucyBieSAqbm90KiByZXVzaW5nIGNlcnRhaW4gcmVzdWx0cy4gSSBzaG91bGQgcHJvYmFibHlcbiAgICAgcnVuIGEgdGVzdCBvciB0d28gdG8gdmVyaWZ5IGlmIHRoaXMgaXMgYWN0dWFsbHkgd29ydGh3aGlsZS5cbiAgICovXG4gIGNvbnN0IGZsb29yZWRMb25naXR1ZGUgPSBNYXRoLmFicyhsb25naXR1ZGUgLSBNYXRoLmZsb29yKGxvbmdpdHVkZSkpO1xuICBjb25zdCBmbG9vcmVkTGF0aXR1ZGUgPSBNYXRoLmFicyhsYXRpdHVkZSAtIE1hdGguZmxvb3IobGF0aXR1ZGUpKTtcbiAgY29uc3QgbG9uZ2l0dWRlQXJjTWludXRlcyA9IGZsb29yZWRMb25naXR1ZGUgKiBkZWdyZWVBcmNNaW51dGVzO1xuICBjb25zdCBsYXRpdHVkZUFyY01pbnV0ZXMgPSBmbG9vcmVkTGF0aXR1ZGUgKiBkZWdyZWVBcmNNaW51dGVzO1xuICBzd2l0Y2ggKHByZWNpc2lvbikge1xuICAgIGNhc2UgcXVhZHMuT25lQXJjTWludXRlUXVhZDoge1xuICAgICAgY2hhcmFjdGVycy5wdXNoKGAwJHtNYXRoLnJvdW5kKGxvbmdpdHVkZUFyY01pbnV0ZXMpLnRvU3RyaW5nKCl9YC5zbGljZSgtMikpO1xuICAgICAgaWYgKHNwYWNlZCkge1xuICAgICAgICBjaGFyYWN0ZXJzLnB1c2goJyAnKTtcbiAgICAgIH1cbiAgICAgIGNoYXJhY3RlcnMucHVzaChgMCR7TWF0aC5yb3VuZChsYXRpdHVkZUFyY01pbnV0ZXMpLnRvU3RyaW5nKCl9YC5zbGljZSgtMikpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgcXVhZHMuT25lVGVudGhBcmNNaW51dGVRdWFkOiB7XG4gICAgICAvLyA2MCBBcmNNaW51dGVzIHRvIGEgZGVncmVlID0+IHVwIHRvIDYwMCAxLzEwIGFyY21pbnV0ZXMsIGEgdGhyZWUgZGlnaXQgbnVtYmVyXG4gICAgICBjaGFyYWN0ZXJzLnB1c2goYDAwJHtNYXRoLnJvdW5kKGxvbmdpdHVkZUFyY01pbnV0ZXMgKiAxMCkudG9TdHJpbmcoKX1gLnNsaWNlKC0zKSk7XG4gICAgICBpZiAoc3BhY2VkKSB7XG4gICAgICAgIGNoYXJhY3RlcnMucHVzaCgnICcpO1xuICAgICAgfVxuICAgICAgY2hhcmFjdGVycy5wdXNoKGAwMCR7TWF0aC5yb3VuZChsYXRpdHVkZUFyY01pbnV0ZXMgKiAxMCkudG9TdHJpbmcoKX1gLnNsaWNlKC0zKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSBxdWFkcy5PbmVIdW5kcmV0aEFyY01pbnV0ZVF1YWQ6IHtcbiAgICAgIC8vIDYwIEFyY01pbnV0ZXMgdG8gYSBkZWdyZWUgPT4gdXAgdG8gNjAwMCAxLzEwMCBhcmNtaW51dGVzLCBhIGZvdXIgZGlnaXQgbnVtYmVyXG4gICAgICBjaGFyYWN0ZXJzLnB1c2goYDAwMCR7TWF0aC5yb3VuZChsb25naXR1ZGVBcmNNaW51dGVzICogMTAwKS50b1N0cmluZygpfWAuc2xpY2UoLTQpKTtcbiAgICAgIGlmIChzcGFjZWQpIHtcbiAgICAgICAgY2hhcmFjdGVycy5wdXNoKCcgJyk7XG4gICAgICB9XG4gICAgICBjaGFyYWN0ZXJzLnB1c2goYDAwMCR7TWF0aC5yb3VuZChsYXRpdHVkZUFyY01pbnV0ZXMgKiAxMDApLnRvU3RyaW5nKCl9YC5zbGljZSgtNCkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgR0VPUkVGIHByZWNpc2lvbiAke3ByZWNpc2lvbn0gZGlkbid0IG1hdGNoIHByZWRlZmluZWQgdmFsdWVkYCk7XG4gIH1cblxuICByZXR1cm4gY2hhcmFjdGVycy5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gYm91bmRDaGVja0FuZEFkZChxdWFkSWQsIGNoYXJhY3RlcnMpIHtcbiAgaWYgKHF1YWRJZCA+PSBjbGVhbmVkQWxwaGFiZXQubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBMYXRpdHVkZSBvciBMb25naXR1ZGUgdmFsdWU6ICR7cXVhZElkfSB3YXMgb3V0IG9mIHJhbmdlYCk7XG4gIH1cbiAgY2hhcmFjdGVycy5wdXNoKGNsZWFuZWRBbHBoYWJldFtxdWFkSWRdKTtcbn1cblxuZnVuY3Rpb24gYm91bmRDaGVja0FuZFJldHJpZXZlKGNoYXJhY3Rlcikge1xuICBpZiAoZ2VvcmVmQ2hhck1hcFtjaGFyYWN0ZXJdID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY2hhcmFjdGVyICR7Y2hhcmFjdGVyfSB1c2VkIGluIEdFT1JFRiBzdHJpbmdgKTtcbiAgfVxuXG4gIHJldHVybiBnZW9yZWZDaGFyTWFwW2NoYXJhY3Rlcl07XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcHByb3hpbWF0ZSBsYXRpdHVkZSwgbG9uZ2l0dWRlIHBhaXIgZ2l2ZW4gYSB2YWxpZCBHRU9SRUYgc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gZ2VvcmVmIEEgdmFsaWQgZ2VvcmVmIHN0cmluZywgbnVsbCB2YWx1ZXMgb3IgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGwgY2F1c2UgYW5cbiAqIGVycm9yIHRvIGJlIHRocm93blxuICogQHJldHVybnMge29iamVjdH0gQSBsYXRpdHVkZSwgbG9uZ2l0dWRlIHBvaW50IHRoYXQgcmVwcmVzZW50cyB0aGUgYXZlcmFnZSBsb2NhdGlvbiBvZiB0aGVcbiAqIGdpdmVuIEdFT1JFRiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhdExuZ0Zyb21HZW9yZWYoZ2VvcmVmKSB7XG4gIGlmICghZ2VvcmVmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFbXB0eSBHRU9SRUYgc3RyaW5ncyBhcmUgaW52YWxpZCcpO1xuICB9IGVsc2UgaWYgKGdlb3JlZi5sZW5ndGggPCAyIHx8IGdlb3JlZi5sZW5ndGggPiAxMikge1xuICAgIHRocm93IG5ldyBFcnJvcihgR0VPUkVGIG9mICR7Z2VvcmVmLmxlbmd0aH0gaXMgb3V0IG9mIGJvdW5kc2ApO1xuICB9IGVsc2UgaWYgKGdlb3JlZi5sZW5ndGggIT09IHF1YWRzLkZpZnRlZW5EZWdyZWVRdWFkICYmXG4gICAgZ2VvcmVmLmxlbmd0aCAhPT0gcXVhZHMuT25lQXJjTWludXRlUXVhZCAmJiBnZW9yZWYubGVuZ3RoICE9PSBxdWFkcy5PbmVEZWdyZWVRdWFkICYmXG4gICAgZ2VvcmVmLmxlbmd0aCAhPT0gcXVhZHMuT25lSHVuZHJldGhBcmNNaW51dGVRdWFkICYmXG4gICAgZ2VvcmVmLmxlbmd0aCAhPT0gcXVhZHMuT25lVGVudGhBcmNNaW51dGVRdWFkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHRU9SRUYgZ2VvcmVmIG9mICR7Z2VvcmVmfSBpcyBub3QgYW4gYWNjZXB0YWJsZSB2YWx1ZSBmcm9tYCArXG4gICAgICAnIEdlb1JlZlByZWNpc2lvbicpO1xuICB9XG4gIHJldHVybiBnZXRMYXRMbmdGcm9tR2VvcmVmKGdlb3JlZiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGdldExhdExuZ0Zyb21HZW9yZWYoZ2VvcmVmLCBpc1NtYWxsZXN0UXVhZCA9IGZhbHNlKSB7XG4gIHN3aXRjaCAoZ2VvcmVmLmxlbmd0aCkge1xuICAgIGNhc2UgcXVhZHMuRmlmdGVlbkRlZ3JlZVF1YWQ6IHtcbiAgICAgIGNvbnN0IHBvaW50ID0ge1xuICAgICAgICBsYXRpdHVkZTogc3RhcnRpbmdMYXRpdHVkZSArIChib3VuZENoZWNrQW5kUmV0cmlldmUoZ2VvcmVmWzFdKSAqIGZpcnN0UXVhZFdpZHRoKSxcbiAgICAgICAgbG9uZ2l0dWRlOiBzdGFydGluZ0xvbmdpdHVkZSArIChib3VuZENoZWNrQW5kUmV0cmlldmUoZ2VvcmVmWzBdKSAqIGZpcnN0UXVhZFdpZHRoKSxcbiAgICAgIH07XG4gICAgICBpZiAoaXNTbWFsbGVzdFF1YWQpIHtcbiAgICAgICAgcG9pbnQubGF0aXR1ZGUgPSBNYXRoLnRydW5jKChmaXJzdFF1YWRXaWR0aCAvIDIpICsgcG9pbnQubGF0aXR1ZGUpO1xuICAgICAgICBwb2ludC5sb25naXR1ZGUgPSBNYXRoLnRydW5jKChmaXJzdFF1YWRXaWR0aCAvIDIpICsgcG9pbnQubG9uZ2l0dWRlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwb2ludDtcbiAgICB9XG4gICAgY2FzZSBxdWFkcy5PbmVBcmNNaW51dGVRdWFkOiB7XG4gICAgICBjb25zdCBwb2ludCA9IGdldExhdExuZ0Zyb21HZW9yZWYoZ2VvcmVmLnN1YnN0cigwLCA0KSk7XG4gICAgICBjb25zdCBlYXN0aW5nID0gTnVtYmVyLnBhcnNlSW50KGdlb3JlZi5zdWJzdHIoLTQsIDIpLCAxMCk7XG4gICAgICBjb25zdCBub3J0aGluZyA9IE51bWJlci5wYXJzZUludChnZW9yZWYuc3Vic3RyKC0yLCAyKSwgMTApO1xuICAgICAgcG9pbnQubGF0aXR1ZGUgKz0gKG5vcnRoaW5nICsgKGlzU21hbGxlc3RRdWFkID8gMC41IDogMCkpIC8gZGVncmVlQXJjTWludXRlcztcbiAgICAgIHBvaW50LmxvbmdpdHVkZSArPSAoZWFzdGluZyArIChpc1NtYWxsZXN0UXVhZCA/IDAuNSA6IDApKSAvIGRlZ3JlZUFyY01pbnV0ZXM7XG4gICAgICBpZiAoaXNTbWFsbGVzdFF1YWQpIHtcbiAgICAgICAgcG9pbnQubGF0aXR1ZGUgPSByb3VuZDEwKHBvaW50LmxhdGl0dWRlLCAtMSk7XG4gICAgICAgIHBvaW50LmxvbmdpdHVkZSA9IHJvdW5kMTAocG9pbnQubG9uZ2l0dWRlLCAtMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9pbnQ7XG4gICAgfVxuICAgIGNhc2UgcXVhZHMuT25lRGVncmVlUXVhZDoge1xuICAgICAgY29uc3QgcG9pbnQgPSBnZXRMYXRMbmdGcm9tR2VvcmVmKGdlb3JlZi5zdWJzdHIoMCwgMikpO1xuICAgICAgcG9pbnQubGF0aXR1ZGUgKz0gYm91bmRDaGVja0FuZFJldHJpZXZlKGdlb3JlZlszXSk7XG4gICAgICBwb2ludC5sb25naXR1ZGUgKz0gYm91bmRDaGVja0FuZFJldHJpZXZlKGdlb3JlZlsyXSk7XG4gICAgICBpZiAoaXNTbWFsbGVzdFF1YWQpIHtcbiAgICAgICAgcG9pbnQubGF0aXR1ZGUgPSByb3VuZDEwKHBvaW50LmxhdGl0dWRlICsgMC41LCAwKTtcbiAgICAgICAgcG9pbnQubG9uZ2l0dWRlID0gcm91bmQxMChwb2ludC5sb25naXR1ZGUgKyAwLjUsIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBvaW50O1xuICAgIH1cbiAgICBjYXNlIHF1YWRzLk9uZUh1bmRyZXRoQXJjTWludXRlUXVhZDoge1xuICAgICAgY29uc3QgcG9pbnQgPSBnZXRMYXRMbmdGcm9tR2VvcmVmKGdlb3JlZi5zdWJzdHIoMCwgNCkpO1xuICAgICAgY29uc3QgZWFzdGluZyA9IE51bWJlci5wYXJzZUludChnZW9yZWYuc3Vic3RyKC04LCA0KSwgMTApO1xuICAgICAgY29uc3Qgbm9ydGhpbmcgPSBOdW1iZXIucGFyc2VJbnQoZ2VvcmVmLnN1YnN0cigtNCwgNCksIDEwKTtcbiAgICAgIHBvaW50LmxhdGl0dWRlICs9IChub3J0aGluZyArIChpc1NtYWxsZXN0UXVhZCA/IDAuMDA1IDogMCkpIC8gaHVuZHJldGhEZWdyZWVBcmNNaW51dGVzO1xuICAgICAgcG9pbnQubG9uZ2l0dWRlICs9IChlYXN0aW5nICsgKGlzU21hbGxlc3RRdWFkID8gMC4wMDUgOiAwKSkgLyBodW5kcmV0aERlZ3JlZUFyY01pbnV0ZXM7XG4gICAgICBpZiAoaXNTbWFsbGVzdFF1YWQpIHtcbiAgICAgICAgcG9pbnQubGF0aXR1ZGUgPSByb3VuZDEwKHBvaW50LmxhdGl0dWRlLCAtMyk7XG4gICAgICAgIHBvaW50LmxvbmdpdHVkZSA9IHJvdW5kMTAocG9pbnQubG9uZ2l0dWRlLCAtMyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9pbnQ7XG4gICAgfVxuICAgIGNhc2UgcXVhZHMuT25lVGVudGhBcmNNaW51dGVRdWFkOiB7XG4gICAgICBjb25zdCBwb2ludCA9IGdldExhdExuZ0Zyb21HZW9yZWYoZ2VvcmVmLnN1YnN0cigwLCA0KSk7XG4gICAgICBjb25zdCBlYXN0aW5nID0gTnVtYmVyLnBhcnNlSW50KGdlb3JlZi5zdWJzdHIoLTYsIDMpLCAxMCk7XG4gICAgICBjb25zdCBub3J0aGluZyA9IE51bWJlci5wYXJzZUludChnZW9yZWYuc3Vic3RyKC0zLCAzKSwgMTApO1xuICAgICAgcG9pbnQubGF0aXR1ZGUgKz0gKG5vcnRoaW5nICsgKGlzU21hbGxlc3RRdWFkID8gMC4wNSA6IDApKSAvIHRlbnRoRGVncmVlQXJjTWludXRlcztcbiAgICAgIHBvaW50LmxvbmdpdHVkZSArPSAoZWFzdGluZyArIChpc1NtYWxsZXN0UXVhZCA/IDAuMDUgOiAwKSkgLyB0ZW50aERlZ3JlZUFyY01pbnV0ZXM7XG4gICAgICBpZiAoaXNTbWFsbGVzdFF1YWQpIHtcbiAgICAgICAgcG9pbnQubGF0aXR1ZGUgPSByb3VuZDEwKHBvaW50LmxhdGl0dWRlLCAtMik7XG4gICAgICAgIHBvaW50LmxvbmdpdHVkZSA9IHJvdW5kMTAocG9pbnQubG9uZ2l0dWRlLCAtMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9pbnQ7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIEdFT1JFRiBsZW5ndGggJHtnZW9yZWYubGVuZ3RofWApO1xuICAgIH1cbiAgfVxufVxuIiwiLypcbiBDb3B5cmlnaHQgMjAxNyBNaWNoYWVsIEh1Z2hlc1xuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuIERlZmluZXMgZnJpZW5kbHkgbmFtZXMgZm9yIGRpZmZlcmVudCBsZXZlbHMgb2YgR2VvcmVmIHByZWNpc2lvblxuIEBtb2R1bGVcbiAqL1xuXG4vKipcbiAqIFRoZSBzaXplL3R5cGUgb2YgYSBHZW9yZWYgcXVhZHJhbmdsZVxuICogQHR5cGVkZWYge251bWJlcn0gUXVhZFNpemVcbiAqL1xuXG4vKipcbiAqIEB0eXBlIHtRdWFkU2l6ZX1cbiAqL1xuZXhwb3J0IGNvbnN0IEZpZnRlZW5EZWdyZWVRdWFkID0gMjtcbi8qKlxuICogQHR5cGUge1F1YWRTaXplfVxuICovXG5leHBvcnQgY29uc3QgT25lRGVncmVlUXVhZCA9IDQ7XG4vKipcbiAqIEB0eXBlIHtRdWFkU2l6ZX1cbiAqL1xuZXhwb3J0IGNvbnN0IE9uZUFyY01pbnV0ZVF1YWQgPSA4O1xuLyoqXG4gKiBAdHlwZSB7UXVhZFNpemV9XG4gKi9cbmV4cG9ydCBjb25zdCBPbmVUZW50aEFyY01pbnV0ZVF1YWQgPSAxMDtcbi8qKlxuICogQHR5cGUge1F1YWRTaXplfVxuICovXG5leHBvcnQgY29uc3QgT25lSHVuZHJldGhBcmNNaW51dGVRdWFkID0gMTI7XG4iLCIvKlxuIENvcHlyaWdodCAyMDE3IE1pY2hhZWwgSHVnaGVzXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgYm91bmRDaGVja0FuZEFkZCwgYm91bmRDaGVja0FuZFJldHJpZXZlIH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgcm91bmQxMCB9IGZyb20gJy4vRGVjaW1hbFJvdW5kaW5nJztcblxuLyoqXG4gKiBJbXBsZW1lbnRzIGZ1bmN0aW9ucyBmb3IgY29udmVydGluZyB0by9mcm9tIGEgTWFpZGVuaGVhZCBMb2NhdG9yIHVzaW5nIFdHUzg0IGxhdGl0dWRlIGFuZFxuICogbG9uZ2l0dWRlXG4gKiBjb29yZGluYXRlcy4gUGxlYXNlIG5vdGUgdGhhdCBpbXBsZW1lbnRlZCBsaWJyYXJ5IGZ1bmN0aW9ucyBvbmx5IGltcGxlbWVudCBzdWJzcXVhcmUgcHJlY2lzaW9uLFxuICogdGhhdCBpcyB1cCB0byA2IGNoYXJhY3RlcnMgYXJlIGhhbmRsZWQuXG4gKlxuICogT3JpZ2luYWwgZGVzY3JpcHRpb24gb2Ygc3lzdGVtIGJ5IEBzZWUge0BsaW5rIGh0dHA6Ly93d3cuYXJybC5vcmcvZ3JpZC1zcXVhcmVzfEFSUkx9XG4gKiBAbW9kdWxlXG4gKi9cbmV4cG9ydCBjb25zdCBuYW1lID0gJ01haWRlbmhlYWQnO1xuXG5jb25zdCBmaXJzdExldmVsRGl2aXNpb25zID0gMTg7XG5jb25zdCBmaXJzdExldmVsTG9uZ2l0dWRlRGl2aXNpb24gPSAzNjAgLyBmaXJzdExldmVsRGl2aXNpb25zO1xuY29uc3QgZmlyc3RMZXZlbExhdGl0dWRlRGl2aXNpb24gPSAxODAgLyBmaXJzdExldmVsRGl2aXNpb25zO1xuY29uc3QgdGhpcmRMZXZlbERpdmlzaW9ucyA9IDI0O1xuY29uc3QgZGVncmVlQXJjTWludXRlcyA9IDYwO1xuY29uc3QgdGhpcmRMZXZlbExvbmdpdHVkZURpdmlzaW9ucyA9ICgyICogZGVncmVlQXJjTWludXRlcykgLyB0aGlyZExldmVsRGl2aXNpb25zO1xuY29uc3QgdGhpcmRMZXZlbExhdGl0dWRlRGl2aXNpb25zID0gZGVncmVlQXJjTWludXRlcyAvIHRoaXJkTGV2ZWxEaXZpc2lvbnM7XG5jb25zdCBzdGFydGluZ0xvbmdpdHVkZSA9IC0xODA7XG5jb25zdCBzdGFydGluZ0xhdGl0dWRlID0gLTkwO1xuXG5jb25zdCBhbHBoYWJldCA9IFtcbiAgJ2EnLFxuICAnYicsXG4gICdjJyxcbiAgJ2QnLFxuICAnZScsXG4gICdmJyxcbiAgJ2cnLFxuICAnaCcsXG4gICdpJyxcbiAgJ2onLFxuICAnaycsXG4gICdsJyxcbiAgJ20nLFxuICAnbicsXG4gICdvJyxcbiAgJ3AnLFxuICAncScsXG4gICdyJyxcbiAgJ3MnLFxuICAndCcsXG4gICd1JyxcbiAgJ3YnLFxuICAndycsXG4gICd4Jyxcbl07XG5cbmNvbnN0IGNoYXJNYXAgPSBhbHBoYWJldC5yZWR1Y2UoKGFjY3VtdWxhdG9yLCB2YWwsIGlkeCkgPT4ge1xuICAvKiBlc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246IDAgKi9cbiAgYWNjdW11bGF0b3JbdmFsXSA9IGlkeDtcbiAgcmV0dXJuIGFjY3VtdWxhdG9yO1xufSwge30pO1xuXG5cbi8qKlxuICogQ29udmVydHMgdG8gYSBNYWlkZW5oZWFkIExvY2F0b3IgU3F1YXJlIGZyb20gYSBXR1M4NCBkZWNpbWFsIGxhdGl0dWRlLCBsb25naXR1ZGUgcGFpclxuICogQHBhcmFtIHtudW1iZXJ9IGxhdGl0dWRlIEEgV0dTODQgZGVjaW1hbCBsYXRpdHVkZVxuICogQHBhcmFtIHtudW1iZXJ9IGxvbmdpdHVkZSBBIFdHUzg0IGRlY2ltYWwgbG9uZ2l0dWRlXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEEgTWFpZGVuaGVhZCBMb2NhdG9yIFNxdWFyZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWhMb2NhdG9yRnJvbUxhdExuZyhsYXRpdHVkZSwgbG9uZ2l0dWRlKSB7XG4gIGlmIChsYXRpdHVkZSA8IC05MCB8fCBsYXRpdHVkZSA+IDE4MCB8fCBsb25naXR1ZGUgPCAtMTgwIHx8IGxvbmdpdHVkZSA+IDE4MCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtsYXRpdHVkZX0sJHtsb25naXR1ZGV9IHdhcyBub3QgYSB2YWxpZCBkZWNpbWFsIFdHUzg0IHBhaXJgKTtcbiAgfVxuICBjb25zdCBjaGFyYWN0ZXJzID0gW107XG5cbiAgLy8gSW4gbWFpZGVuaGVhZCBsb2NhdG9ycyBhcmUgY2FsY3VsYXRlZCBhcyBlYXN0aW5nIGFuZCBub3J0aGluZyBmcm9tIC05MCBTIGFuZCAtMTgwIFdcbiAgY29uc3QgZWFzdGluZyA9IGxvbmdpdHVkZSAtIHN0YXJ0aW5nTG9uZ2l0dWRlO1xuICBjb25zdCBub3J0aGluZyA9IGxhdGl0dWRlIC0gc3RhcnRpbmdMYXRpdHVkZTtcblxuICAvLyBGaXJzdCBsZXZlbCBjYWxjdWxhdGlvbnNcbiAgbGV0IHdlc3RMb25naXR1ZGVCb3hCb3VuZGFyeSA9IE1hdGguZmxvb3IoZWFzdGluZyAvIGZpcnN0TGV2ZWxMb25naXR1ZGVEaXZpc2lvbik7XG4gIGJvdW5kQ2hlY2tBbmRBZGQod2VzdExvbmdpdHVkZUJveEJvdW5kYXJ5LCBjaGFyYWN0ZXJzLCBhbHBoYWJldCk7XG4gIGxldCBzb3V0aExhdGl0dWRlQm94Qm91bmRhcnkgPSBNYXRoLmZsb29yKG5vcnRoaW5nIC8gZmlyc3RMZXZlbExhdGl0dWRlRGl2aXNpb24pO1xuICBib3VuZENoZWNrQW5kQWRkKHNvdXRoTGF0aXR1ZGVCb3hCb3VuZGFyeSwgY2hhcmFjdGVycywgYWxwaGFiZXQpO1xuICAvLyBPbmx5IHRoZSB0b3AgbGV2ZWwgc3F1YXJlIGNoYXJhY3RlcnMgYXJlIHVwcGVyIGNhc2VcbiAgY2hhcmFjdGVyc1swXSA9IGNoYXJhY3RlcnNbMF0udG9VcHBlckNhc2UoKTtcbiAgY2hhcmFjdGVyc1sxXSA9IGNoYXJhY3RlcnNbMV0udG9VcHBlckNhc2UoKTtcbiAgLy8gRW5kIGZpcnN0IGxldmVsIGNhbGN1bGF0aW9uc1xuXG4gIC8vIFNlY29uZCBsZXZlbCwgJ3NxdWFyZScsIGNhbGN1bGF0aW9uc1xuICB3ZXN0TG9uZ2l0dWRlQm94Qm91bmRhcnkgPSBNYXRoLmZsb29yKChlYXN0aW5nICUgZmlyc3RMZXZlbExvbmdpdHVkZURpdmlzaW9uKSAvIDIpO1xuICBzb3V0aExhdGl0dWRlQm94Qm91bmRhcnkgPSBNYXRoLmZsb29yKG5vcnRoaW5nICUgZmlyc3RMZXZlbExhdGl0dWRlRGl2aXNpb24pO1xuICBjaGFyYWN0ZXJzLnB1c2god2VzdExvbmdpdHVkZUJveEJvdW5kYXJ5LnRvU3RyaW5nKCkpO1xuICBjaGFyYWN0ZXJzLnB1c2goc291dGhMYXRpdHVkZUJveEJvdW5kYXJ5LnRvU3RyaW5nKCkpO1xuICAvLyBFbmQgc2Vjb25kIGxldmVsIGNhbGN1bGF0aW9uc1xuXG4gIC8vIFRoaXJkIGxldmVsLCAnc3Vic3F1YXJlcycsIGNhbGN1bGF0aW9uc1xuICB3ZXN0TG9uZ2l0dWRlQm94Qm91bmRhcnkgPVxuICAgIE1hdGguZmxvb3IoKChlYXN0aW5nICUgMikgKiBkZWdyZWVBcmNNaW51dGVzKSAvIHRoaXJkTGV2ZWxMb25naXR1ZGVEaXZpc2lvbnMpO1xuICBzb3V0aExhdGl0dWRlQm94Qm91bmRhcnkgPVxuICAgIE1hdGguZmxvb3IoKChub3J0aGluZyAlIDEpICogZGVncmVlQXJjTWludXRlcykgLyB0aGlyZExldmVsTGF0aXR1ZGVEaXZpc2lvbnMpO1xuICBib3VuZENoZWNrQW5kQWRkKHdlc3RMb25naXR1ZGVCb3hCb3VuZGFyeSwgY2hhcmFjdGVycywgYWxwaGFiZXQpO1xuICBib3VuZENoZWNrQW5kQWRkKHNvdXRoTGF0aXR1ZGVCb3hCb3VuZGFyeSwgY2hhcmFjdGVycywgYWxwaGFiZXQpO1xuXG5cbiAgcmV0dXJuIGNoYXJhY3RlcnMuam9pbignJyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdG8gYSBkZWNpbWFsIFdHUzg0IGxhdGl0dWRlLCBsb25naXR1ZGUgcGFpciBmcm9tIGEgTWFpZGVuaGVhZCBMb2NhdG9yIFNxdWFyZVxuICogQHBhcmFtIHtzdHJpbmd9IG1oTG9jYXRvciBBIE1haWRlbiBMb2NhdG9yIFNxdWFyZVxuICogQHJldHVybiB7b2JqZWN0fSBBIHBvaW50IG9iamVjdCB3aXRoIGxhdGl0dWRlIGFuZCBsb25naXR1ZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhdExuZ0Zyb21NaExvY2F0b3IobWhMb2NhdG9yKSB7XG4gIGlmICghbWhMb2NhdG9yIHx8IG1oTG9jYXRvci5sZW5ndGggJSAyICE9PSAwIHx8IG1oTG9jYXRvci5sZW5ndGggPCAyIHx8IG1oTG9jYXRvci5sZW5ndGggPiA2KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBMb2NhdG9yLCAke21oTG9jYXRvcn0sIGlzIGJhZGx5IGZvcm1lZCBieSBsZW5ndGhgKTtcbiAgfVxuXG4gIHJldHVybiBnZXRMYXRMbmdGcm9tTWhMb2NhdG9yKG1oTG9jYXRvci5zcGxpdCgnJyksIHRydWUpO1xufVxuXG5mdW5jdGlvbiBnZXRMYXRMbmdGcm9tTWhMb2NhdG9yKGxvY2F0b3JDaGFycywgbGFzdCA9IGZhbHNlKSB7XG4gIHN3aXRjaCAobG9jYXRvckNoYXJzLmxlbmd0aCkge1xuICAgIGNhc2UgMjoge1xuICAgICAgY29uc3QgcG9pbnQgPSB7XG4gICAgICAgIGxhdGl0dWRlOiBzdGFydGluZ0xhdGl0dWRlLFxuICAgICAgICBsb25naXR1ZGU6IHN0YXJ0aW5nTG9uZ2l0dWRlLFxuICAgICAgfTtcbiAgICAgIGxldCBpZHggPSBib3VuZENoZWNrQW5kUmV0cmlldmUobG9jYXRvckNoYXJzWzBdLnRvTG93ZXJDYXNlKCksIGNoYXJNYXApO1xuICAgICAgcG9pbnQubG9uZ2l0dWRlICs9IGlkeCAqIGZpcnN0TGV2ZWxMb25naXR1ZGVEaXZpc2lvbjtcbiAgICAgIGlkeCA9IGJvdW5kQ2hlY2tBbmRSZXRyaWV2ZShsb2NhdG9yQ2hhcnNbMV0udG9Mb3dlckNhc2UoKSwgY2hhck1hcCk7XG4gICAgICBwb2ludC5sYXRpdHVkZSArPSBpZHggKiBmaXJzdExldmVsTGF0aXR1ZGVEaXZpc2lvbjtcbiAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgIHBvaW50LmxvbmdpdHVkZSA9IHJvdW5kMTAoKGZpcnN0TGV2ZWxMb25naXR1ZGVEaXZpc2lvbiAvIDIpICsgcG9pbnQubG9uZ2l0dWRlLCAwKTtcbiAgICAgICAgcG9pbnQubGF0aXR1ZGUgPSByb3VuZDEwKChmaXJzdExldmVsTGF0aXR1ZGVEaXZpc2lvbiAvIDIpICsgcG9pbnQubGF0aXR1ZGUsIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBvaW50O1xuICAgIH1cbiAgICBjYXNlIDQ6IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gZ2V0TGF0TG5nRnJvbU1oTG9jYXRvcihsb2NhdG9yQ2hhcnMuc2xpY2UoMCwgMikpO1xuICAgICAgbGV0IGxuZztcbiAgICAgIGxldCBsYXQ7XG4gICAgICB0cnkge1xuICAgICAgICBsbmcgPSBwYXJzZUludChsb2NhdG9yQ2hhcnNbMl0sIDEwKSAqIDI7XG4gICAgICAgIGxhdCA9IHBhcnNlSW50KGxvY2F0b3JDaGFyc1szXSwgMTApO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY2hhcmFjdGVycyBmb3VuZCBpbiBsb2NhdG9yLCB3YXMgZWl0aGVyICR7bG9jYXRvckNoYXJzWzJdfSBvclxuICAgICAgICAke2xvY2F0b3JDaGFyc1szXX1gKTtcbiAgICAgIH1cbiAgICAgIHBvaW50LmxvbmdpdHVkZSArPSBsbmc7XG4gICAgICBwb2ludC5sYXRpdHVkZSArPSBsYXQ7XG4gICAgICBpZiAobGFzdCkge1xuICAgICAgICBwb2ludC5sb25naXR1ZGUgPSByb3VuZDEwKChwb2ludC5sb25naXR1ZGUgKyAxKSwgLTEpO1xuICAgICAgICBwb2ludC5sYXRpdHVkZSA9IHJvdW5kMTAoKHBvaW50LmxhdGl0dWRlICsgMC41KSwgLTEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBvaW50O1xuICAgIH1cbiAgICBjYXNlIDY6IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gZ2V0TGF0TG5nRnJvbU1oTG9jYXRvcihsb2NhdG9yQ2hhcnMuc2xpY2UoMCwgNCkpO1xuICAgICAgY29uc3QgTG5nSWR4ID0gYm91bmRDaGVja0FuZFJldHJpZXZlKGxvY2F0b3JDaGFyc1s0XS50b0xvd2VyQ2FzZSgpLCBjaGFyTWFwKTtcbiAgICAgIGNvbnN0IExhdElkeCA9IGJvdW5kQ2hlY2tBbmRSZXRyaWV2ZShsb2NhdG9yQ2hhcnNbNV0udG9Mb3dlckNhc2UoKSwgY2hhck1hcCk7XG4gICAgICBwb2ludC5sb25naXR1ZGUgKz0gKChMbmdJZHggKiB0aGlyZExldmVsTG9uZ2l0dWRlRGl2aXNpb25zKSArIChsYXN0ID8gMi41IDogMCkpXG4gICAgICAgIC8gZGVncmVlQXJjTWludXRlcztcbiAgICAgIHBvaW50LmxhdGl0dWRlICs9ICgoTGF0SWR4ICogdGhpcmRMZXZlbExhdGl0dWRlRGl2aXNpb25zKSArIChsYXN0ID8gMS4yNSA6IDApKVxuICAgICAgICAvIGRlZ3JlZUFyY01pbnV0ZXM7XG4gICAgICBpZiAobGFzdCkge1xuICAgICAgICBwb2ludC5sb25naXR1ZGUgPSByb3VuZDEwKHBvaW50LmxvbmdpdHVkZSwgLTEpO1xuICAgICAgICBwb2ludC5sYXRpdHVkZSA9IHJvdW5kMTAocG9pbnQubGF0aXR1ZGUsIC0xKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwb2ludDtcbiAgICB9XG4gICAgZGVmYXVsdDoge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG51bWJlciBvZiBNYWlkZW5oZWFkIExvY2F0b3IgY2hhcmFjdGVycyAke2xvY2F0b3JDaGFycy5sZW5ndGh9YCk7XG4gICAgfVxuICB9XG59XG4iXX0=
