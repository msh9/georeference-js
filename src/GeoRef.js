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

import * as quads from './GeoRefPrecision';
import { round10 } from './DecimalRounding';

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

// I and O are removed for clarity
const cleanedAlphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

/*
 Just like we did for the geohash module, we include a fixed reverse look up map in ensure
 that we're not iterating the cleanAlphabet array many, many, times.
 */
const georefCharMap = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  J: 8,
  K: 9,
  L: 10,
  M: 11,
  N: 12,
  P: 13,
  Q: 14,
  R: 15,
  S: 16,
  T: 17,
  U: 18,
  V: 19,
  W: 20,
  X: 21,
  Y: 22,
  Z: 23,
};

const startingLongitude = -180;
const startingLatitude = -90;
const firstQuadWidth = 15;
const degreeArcMinutes = 60;
const tenthDegreeArcMinutes = degreeArcMinutes * 10;
const hundrethDegreeArcMinutes = degreeArcMinutes * 100;

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
export function georefFromLatLng(latitude, longitude, spaced = true, precision = 8) {
  if (precision < 2 || precision > 12) {
    throw new Error(`GEOREF precision of ${precision} is out of bounds`);
  } else if (precision !== quads.FifteenDegreeQuad && precision !== quads.OneArcMinuteQuad &&
    precision !== quads.OneDegreeQuad && precision !== quads.OneHundrethArcMinuteQuad &&
    precision !== quads.OneTenthArcMinuteQuad) {
    throw new Error(`GEOREF precision of ${precision} is not an acceptable value from` +
      ' GeoRefPrecision');
  }
  const characters = [];
  let lastLeftLongitudeEdge = startingLongitude;
  let lastLowerLatitudeEdge = startingLatitude;

  // Create 15 degree bounding box
  let quadId = Math.floor((longitude - lastLeftLongitudeEdge) / firstQuadWidth);
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
  const flooredLongitude = Math.abs(longitude - Math.floor(longitude));
  const flooredLatitude = Math.abs(latitude - Math.floor(latitude));
  const longitudeArcMinutes = flooredLongitude * degreeArcMinutes;
  const latitudeArcMinutes = flooredLatitude * degreeArcMinutes;
  switch (precision) {
    case quads.OneArcMinuteQuad: {
      characters.push(`0${Math.round(longitudeArcMinutes).toString()}`.slice(-2));
      if (spaced) {
        characters.push(' ');
      }
      characters.push(`0${Math.round(latitudeArcMinutes).toString()}`.slice(-2));
      break;
    }
    case quads.OneTenthArcMinuteQuad: {
      // 60 ArcMinutes to a degree => up to 600 1/10 arcminutes, a three digit number
      characters.push(`00${Math.round(longitudeArcMinutes * 10).toString()}`.slice(-3));
      if (spaced) {
        characters.push(' ');
      }
      characters.push(`00${Math.round(latitudeArcMinutes * 10).toString()}`.slice(-3));
      break;
    }
    case quads.OneHundrethArcMinuteQuad: {
      // 60 ArcMinutes to a degree => up to 6000 1/100 arcminutes, a four digit number
      characters.push(`000${Math.round(longitudeArcMinutes * 100).toString()}`.slice(-4));
      if (spaced) {
        characters.push(' ');
      }
      characters.push(`000${Math.round(latitudeArcMinutes * 100).toString()}`.slice(-4));
      break;
    }
    default: throw new Error(`GEOREF precision ${precision} didn't match predefined valued`);
  }

  return characters.join('');
}

function boundCheckAndAdd(quadId, characters) {
  if (quadId >= cleanedAlphabet.length) {
    throw new Error(`Latitude or Longitude value: ${quadId} was out of range`);
  }
  characters.push(cleanedAlphabet[quadId]);
}

function boundCheckAndRetrieve(character) {
  if (georefCharMap[character] === undefined) {
    throw new Error(`Invalid character ${character} used in GEOREF string`);
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
export function latLngFromGeoref(georef) {
  if (!georef) {
    throw new Error('Empty GEOREF strings are invalid');
  } else if (georef.length < 2 || georef.length > 12) {
    throw new Error(`GEOREF of ${georef.length} is out of bounds`);
  } else if (georef.length !== quads.FifteenDegreeQuad &&
    georef.length !== quads.OneArcMinuteQuad && georef.length !== quads.OneDegreeQuad &&
    georef.length !== quads.OneHundrethArcMinuteQuad &&
    georef.length !== quads.OneTenthArcMinuteQuad) {
    throw new Error(`GEOREF georef of ${georef} is not an acceptable value from` +
      ' GeoRefPrecision');
  }
  return getLatLngFromGeoref(georef, true);
}

function getLatLngFromGeoref(georef, isSmallestQuad = false) {
  switch (georef.length) {
    case quads.FifteenDegreeQuad: {
      const point = {
        latitude: startingLatitude + (boundCheckAndRetrieve(georef[1]) * firstQuadWidth),
        longitude: startingLongitude + (boundCheckAndRetrieve(georef[0]) * firstQuadWidth),
      };
      if (isSmallestQuad) {
        point.latitude = Math.trunc((firstQuadWidth / 2) + point.latitude);
        point.longitude = Math.trunc((firstQuadWidth / 2) + point.longitude);
      }
      return point;
    }
    case quads.OneArcMinuteQuad: {
      const point = getLatLngFromGeoref(georef.substr(0, 4));
      const easting = Number.parseInt(georef.substr(-3, 2), 10);
      const northing = Number.parseInt(georef.substr(-1, 2), 10);
      point.latitude += (northing + isSmallestQuad ? 0.5 : 0) / degreeArcMinutes;
      point.longitude += (easting + isSmallestQuad ? 0.5 : 0) / degreeArcMinutes;
      if (isSmallestQuad) {
        point.latitude = round10(point.latitude, -1);
        point.latitude = round10(point.latitude, -1);
      }
      return point;
    }
    case quads.OneDegreeQuad: {
      const point = getLatLngFromGeoref(georef.substr(0, 2));
      point.latitude += boundCheckAndRetrieve(georef[3]);
      point.longitude += boundCheckAndRetrieve(georef[2]);
      if (isSmallestQuad) {
        point.latitude += 0.5;
        point.longitude += 0.5;
      }
      return point;
    }
    case quads.OneHundrethArcMinuteQuad: {
      const point = getLatLngFromGeoref(georef.substr(0, 4));
      const easting = Number.parseInt(georef.substr(-7, 4), 10);
      const northing = Number.parseInt(georef.substr(-3, 4), 10);
      point.latitude += (northing + isSmallestQuad ? 0.005 : 0) / hundrethDegreeArcMinutes;
      point.longitude += (easting + isSmallestQuad ? 0.005 : 0) / hundrethDegreeArcMinutes;
      if (isSmallestQuad) {
        point.latitude = round10(point.latitude, -3);
        point.longitude = round10(point.longitude, -3);
      }
      return point;
    }
    case quads.OneTenthArcMinuteQuad: {
      const point = getLatLngFromGeoref(georef.substr(0, 4));
      const easting = Number.parseInt(georef.substr(-4, 3), 10);
      const northing = Number.parseInt(georef.substr(-2, 3), 10);
      point.latitude += (northing + isSmallestQuad ? 0.05 : 0) / tenthDegreeArcMinutes;
      point.longitude += (easting + isSmallestQuad ? 0.05 : 0) / tenthDegreeArcMinutes;
      if (isSmallestQuad) {
        point.latitude = round10(point.latitude, -2);
        point.longitude = round10(point.longitude, -2);
      }
      return point;
    }
    default: {
      throw new Error(`Unrecognized GEOREF length ${georef.length}`);
    }
  }
}
