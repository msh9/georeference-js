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