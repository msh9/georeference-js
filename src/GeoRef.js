/**
 * Small utility functions that implement the World Geographic Reference System (GEOREF). GEOREF
 * was developed by United State Govt. for defence and strategic air operations. Conveniently, is
 * it also a useful way of describing the general location of something. The system, as described,
 * supports arbitrary precision by subdivision of areas. This module supports precision to 0.01
 * minutes by use of 12 character GEOREF strings.
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

const startingLongitude = -180;
const startingLatitude = -90;
const firstQuadWidth = 15;
const degreeArcSeconds = 3600;
const degreeArcMinutes = 60;
const degreeArcSecondsPerMinutes = 60;

/**
 * Returns a GEOREF string based on the given WGS84 latitude, longitude, and precision
 * @param {number} latitude A decimal latitude
 * @param {number} longitude A decimal longitude
 * @param {boolean} spaced Indicates whether to return GEOREF strings with spaces between
 * lat-lng characters--defaults to true
 * @param {number} precision The number of characters in the returned GEOREF string, allowed
 * values are 2 <= precision <= 12 and must be divisible by two--defaults to 12
 * @returns {string} A GEOREF string based on the given values
 */
export function georefFromLatLng(latitude, longitude, spaced = true, precision = 12) {
  if (precision < 2 || precision > 12 || precision % 2 !== 0) {
    throw new Error(`GEOREF precision of ${precision} is out of bounds, 2 <= precision <= 12 or is not divisible by two`);
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
  if (spaced && precision > 2) {
    characters.push(' ');
  } else if (precision <= 2) {
    return characters.join('');
  }
  // End 15 degree bounding box
  // Create one (1) degree bound box
  quadId = Math.floor(longitude - lastLeftLongitudeEdge);
  boundCheckAndAdd(quadId, characters);
  quadId = Math.floor(latitude - lastLowerLatitudeEdge);
  boundCheckAndAdd(quadId, characters);
  if (spaced && precision > 4) {
    characters.push(' ');
  } else if (precision <= 4) {
    return characters.join('');
  }
  // End one (1) degree bounding box
  /* For what it's worth we try to reduce the amount of error introduced by floating point
     calculations in the following sections by *not* reusing certain results. I should probably
     run a test or two to verify if this is actually worthwhile.
   */
  // Begin one ArcMinute bounding box
  const flooredLongitude = Math.abs(longitude - Math.floor(longitude));
  const flooredLatitude = Math.abs(latitude - Math.floor(latitude));
  const longitudeArcMinutes = Math.round(flooredLongitude * degreeArcMinutes);
  const latitudeArcMinutes = Math.round(flooredLatitude * degreeArcMinutes);
  characters.push(`0${longitudeArcMinutes.toString()}`.slice(-2));
  if (spaced && precision > 6) {
    characters.push(' ');
  } else if (precision <= 6) {
    return characters.join('');
  }
  characters.push(`0${latitudeArcMinutes.toString()}`.slice(-2));
  if (spaced && precision > 8) {
    characters.push(' ');
  } else if (precision <= 8) {
    return characters.join('');
  }
  // End one ArcMinute bounding box
  // Being one ArcSecond bounding box
  const longitudeArcSeconds =
    Math.round(flooredLongitude * degreeArcSeconds) % degreeArcSecondsPerMinutes;
  const latitudeArcSeconds =
    Math.round(flooredLatitude * degreeArcSeconds) % degreeArcSecondsPerMinutes;
  characters.push(`0${longitudeArcSeconds.toString()}`.slice(-2));
  if (spaced && precision > 10) {
    characters.push(' ');
  } else if (precision <= 10) {
    return characters.join('');
  }
  characters.push(`0${latitudeArcSeconds.toString()}`.slice(-2));
  if (spaced && precision > 12) {
    characters.push(' ');
  } else if (precision <= 12) {
    return characters.join('');
  }
  // End one ArcSecond bounding box

  return characters.join('');
}

function boundCheckAndAdd(quadId, characters) {
  if (quadId >= cleanedAlphabet.length) {
    throw new Error(`Lat or Long value: ${quadId} was out of range`);
  }
  characters.push(cleanedAlphabet[quadId]);
}

/**
 * Returns an approximate latitude, longitude pair given a valid GEOREF string
 * @param {string} georef A valid georef string, null values or invalid characters will cause an
 * error to be thrown
 * @returns {object} A latitude, longitude point that represents the average location of the
 * given GEOREF string
 */
export function latLngFromgeoref(georef) {
  if (!georef) {
    throw new Error('Empty GEOREF strings are invalid');
  }
}
