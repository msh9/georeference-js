/**
 * Small utility functions that implement the World Geographic Reference System (GEOREF). GEOREF
 * was developed by United State Govt. for defence and strategic air operations. Conveniently, is
 * it also a useful way of describing the general location of something. The system, as described,
 * supports arbitrary precision by subdivision of areas. This module supports precision to 0.01
 * minutes by use of 12 character GEOREF strings.
 *
 * Please note all latitude and longitude values in this module are assumed to be in WGS84.
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

const startingLogitude = -180;
const startingLatitude = -90;
const twoLevelQuadrangleWidth = 15;

/**
 * Returns a GEOREF string based on the given WGS84 latitude, longitude, and precision
 * @param {number} latitude A WGS84 latitude
 * @param {number} longitude A WGS84 longitude
 * @param {boolean} spaced Indicates whether to return GEOREF strings with spaces between
 * lat-lng characters--defaults to true
 * @param {number} precision The number of characters in the returned GEOREF string, allow
 * values are 2 <= precision <= 12--defaults to true
 * @returns {string} A GEOREF string based on the given values
 */
export function georefFromLatLng(latitude, longitude, spaced = true, precision = 12) {
  if (precision < 2 || precision > 12) {
    throw new Error(`GEOREF precision of ${precision} is out of bounds, 2 <= precision <= 12`);
  }
  const characters = [];
  for (let i = 0; i < precision; i += 1) {
    const longSection = Math.floor(longitude / twoLevelQuadrangleWidth);
    const latSection = Math.floor(latitude / twoLevelQuadrangleWidth);
    if (longSection >= cleanedAlphabet.length || latSection >= cleanedAlphabet.length) {
      throw new Error(`Lat: ${latSection} or Long: ${longSection} was out of range`);
    }
    characters.push(cleanedAlphabet[longSection]);
    characters.push(cleanedAlphabet[latSection]);
  }


  return characters.join('');
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
