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

import { boundCheckAndAdd, boundCheckAndRetrieve } from './Common';

/**
 * Implements functions for converting to/from a Maidenhead Locator using WGS84 latitude and longitude
 * coordinates.
 *
 * Original description of system by @see {@link http://www.arrl.org/grid-squares|ARRL}
 * @module
 */

const firstLevelDivisions = 18;
const firstLevelLongitudeDivision = 360 / firstLevelDivisions;
const firstLevelLatitudeDivision = 180 / firstLevelDivisions;
const secondLevelLongitudeDivisions = 2;
const thirdLevelDivisions =  24;
const startingLongitude = -180;
const startingLatitude = -90;

const alphabet = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x'
];

const charMap = alphabet.reduce((accumulator, val, idx) => {
  /* eslint no-param-reassign: 0 */
  accumulator[idx] = val;
  return accumulator;
},{});


/**
 * Converts to a Maidenhead Locator Square from a WGS84 decimal latitude, longitude pair
 * @param {number} latitude A WGS84 decimal latitude
 * @param {number} longitude A WGS84 decimal longitude
 * @return {string} A Maidenhead Locator Square
 */
export function mhLocatorFromLatLng(latitude, longitude) {
  const characters = [];

  // First level calculations
  let westLongitudeBoxBoundary = Math.floor(
    (longitude - startingLongitude) / firstLevelLongitudeDivision);
  boundCheckAndAdd(westLongitudeBoxBoundary, characters, alphabet);
  let southLatitudeBoxBoundary = Math.floor(
    (latitude - startingLatitude) / firstLevelLatitudeDivision);
  boundCheckAndAdd(southLatitudeBoxBoundary, characters, alphabet);
  // Only the top level square characters are upper case
  characters[0] = characters[0].toUpperCase();
  characters[1] = characters[1].toUpperCase();
  // End first level calculations

  // Second level, 'square', calculations
  westLongitudeBoxBoundary = Math.floor((longitude % firstLevelLongitudeDivision) / 2);
  southLatitudeBoxBoundary = Math.floor(latitude % firstLevelLatitudeDivision);
  characters.push(westLongitudeBoxBoundary.toString());
  characters.push(southLatitudeBoxBoundary.toString());
  // End second level calculations

  // Third level, 'subsquares', calculations
  westLongitudeBoxBoundary = Math.floor((longitude % 2) * (120 / 24));
  southLatitudeBoxBoundary = Math.floor((latitude % 1) * (60 / 24));
  boundCheckAndAdd(westLongitudeBoxBoundary, characters, alphabet);
  boundCheckAndAdd(southLatitudeBoxBoundary, characters, alphabet);



  return characters.join('');
}

/**
 * Converts to a decimal WGS84 latitude, longitude pair from a Maidenhead Locator Square
 * @param {string} mhLocator A Maiden Locator Square
 * @return {object} A point object with latitude and longitude
 */
export function latLngFromMhLocator(mhLocator) {

}
