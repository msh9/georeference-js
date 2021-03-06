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
export const name = 'GeoHash';
const geohashBase32Indices = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'j',
  'k',
  'm',
  'n',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

/*
I will admit, this looks really stupid, but it does save us from
executing #indexOf or similar many times against geohashBase32Indices
when converting from a geohash.
 */
const geohashBase32CharMap = geohashBase32Indices.reduce((accumulator, val, idx) => {
  /* eslint no-param-reassign: 0 */
  accumulator[val] = idx;
  return accumulator;
}, {});

const maxLatitudeBound = 90;
const maxLongitudeBound = 180;
const encodeBits = 5;

/**
 * Returns a geohash string built from a WGS84 latitude longitude pair
 * @param {number} latitude A WGS84 latitude
 * @param {number} longitude A WGS84 longitude
 * @param {number} [precision=12] The level of precision to encode, defaults to 12 characters
 * @returns {string} A geohash string
 */
export function geohashFromLatLng(latitude, longitude, precision = 12) {
  if (precision < 1) {
    throw new Error('Precision value must be 1 or greater');
  }
  let doEven = true;
  let lowerLatitudeBound = maxLatitudeBound * -1;
  let lowerLongitudeBound = maxLongitudeBound * -1;
  let upperLatitudeBound = maxLatitudeBound;
  let upperLongitudeBound = maxLongitudeBound;
  const fiveBitResult = [];
  const encodedResult = [];

  /* NB: This loop is 1-indexed so we don't to add one each time we check to see
   * if a base32 character needs to be encoded.
   */
  for (let i = 1; i <= precision * encodeBits; i += 1) {
    const midLongitude = (lowerLongitudeBound + upperLongitudeBound) / 2;
    const midLatitude = (lowerLatitudeBound + upperLatitudeBound) / 2;

    if (doEven) { // evens are for longitude
      const position = (longitude < midLongitude) ? 0 : 1;
      fiveBitResult.push(position.toString());
      if (position) {
        lowerLongitudeBound = midLongitude;
      } else {
        upperLongitudeBound = midLongitude;
      }
    } else {
      const position = (latitude < midLatitude) ? 0 : 1;
      fiveBitResult.push(position.toString());
      if (position) {
        lowerLatitudeBound = midLatitude;
      } else {
        upperLatitudeBound = midLatitude;
      }
    }

    if (i % encodeBits === 0) {
      /* Please let me know if there is better JS trickery to get from
       * an array of 1/0s in base 2 to a base 10 number
       */
      const charVal = Number.parseInt(fiveBitResult.join(''), 2);
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
export function latLngFromGeohash(geohash) {
  if (geohash === null || geohash.length < 1) {
    throw new Error('Empty geohash is not valid.');
  }
  let doEven = true;
  let lowerLatitudeBound = maxLatitudeBound * -1;
  let lowerLongitudeBound = maxLongitudeBound * -1;
  let upperLatitudeBound = maxLatitudeBound;
  let upperLongitudeBound = maxLongitudeBound;
  let midLongitude = (lowerLongitudeBound + upperLongitudeBound) / 2;
  let midLatitude = (lowerLatitudeBound + upperLatitudeBound) / 2;

  for (const char of geohash) {
    const baseTenEncoded = geohashBase32CharMap[char];
    if (baseTenEncoded === undefined) {
      throw new Error(`Invalid character in geohash, cannot convert ${char}`);
    }

    /*
     * why? because strings and binary don't mix well and we need left
     * padding zeros in order for our calculations
     * to work
    */
    const baseTwoEncoded = (`0000${baseTenEncoded.toString(2)}`).slice(-5);
    for (const binaryChar of baseTwoEncoded) {
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
  }

  return {
    latitude: midLatitude,
    longitude: midLongitude,
  };
}
