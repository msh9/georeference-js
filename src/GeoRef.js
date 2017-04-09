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

/**
 * Returns a GEOREF string based on the given WGS84 latitude, longitude, and precision
 * @param {number} latitude A WGS84 latitude
 * @param {number} longitude A WGS84 longitude
 * @param {number} precision The number of characters in the returned GEOREF string, allow
 * values are 2 <= precision <= 12
 * @returns {string} A GEOREF string based on the given values
 */
export function georefFromLatLng(latitude, longitude, precision = 12) {
  if (precision < 2 || precision > 12) {
    throw new Error(`GEOREF precision of ${precision} is out of bounds, 2 <= precision <= 12`);
  }

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
