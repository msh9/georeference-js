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
import { round10 } from './DecimalRounding';

/**
 * Implements functions for converting to/from a Maidenhead Locator using WGS84 latitude and
 * longitude
 * coordinates. Please note that implemented library functions only implement subsquare precision,
 * that is up to 6 characters are handled.
 *
 * Original description of system by @see {@link http://www.arrl.org/grid-squares|ARRL}
 * @module
 */

const firstLevelDivisions = 18;
const firstLevelLongitudeDivision = 360 / firstLevelDivisions;
const firstLevelLatitudeDivision = 180 / firstLevelDivisions;
const thirdLevelDivisions = 24;
const degreeArcMinutes = 60;
const thirdLevelLongitudeDivisions = (2 * degreeArcMinutes) / thirdLevelDivisions;
const thirdLevelLatitudeDivisions = degreeArcMinutes / thirdLevelDivisions;
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
  'x',
];

const charMap = alphabet.reduce((accumulator, val, idx) => {
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
export function mhLocatorFromLatLng(latitude, longitude) {
  if (latitude < -90 || latitude > 180 || longitude < -180 || longitude > 180) {
    throw new Error(`${latitude},${longitude} was not a valid decimal WGS84 pair`);
  }
  const characters = [];

  // In maidenhead locators are calculated as easting and northing from -90 S and -180 W
  const easting = longitude - startingLongitude;
  const northing = latitude - startingLatitude;

  // First level calculations
  let westLongitudeBoxBoundary = Math.floor(easting / firstLevelLongitudeDivision);
  boundCheckAndAdd(westLongitudeBoxBoundary, characters, alphabet);
  let southLatitudeBoxBoundary = Math.floor(northing / firstLevelLatitudeDivision);
  boundCheckAndAdd(southLatitudeBoxBoundary, characters, alphabet);
  // Only the top level square characters are upper case
  characters[0] = characters[0].toUpperCase();
  characters[1] = characters[1].toUpperCase();
  // End first level calculations

  // Second level, 'square', calculations
  westLongitudeBoxBoundary = Math.floor((easting % firstLevelLongitudeDivision) / 2);
  southLatitudeBoxBoundary = Math.floor(northing % firstLevelLatitudeDivision);
  characters.push(westLongitudeBoxBoundary.toString());
  characters.push(southLatitudeBoxBoundary.toString());
  // End second level calculations

  // Third level, 'subsquares', calculations
  westLongitudeBoxBoundary =
    Math.floor(((easting % 2) * degreeArcMinutes) / thirdLevelLongitudeDivisions);
  southLatitudeBoxBoundary =
    Math.floor(((northing % 1) * degreeArcMinutes) / thirdLevelLatitudeDivisions);
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
  if (!mhLocator || mhLocator.length % 2 !== 0 || mhLocator.length < 2 || mhLocator.length > 6) {
    throw new Error(`Locator, ${mhLocator}, is badly formed by length`);
  }

  return getLatLngFromMhLocator(mhLocator.split(''), true);
}

function getLatLngFromMhLocator(locatorChars, last = false) {
  switch (locatorChars.length) {
    case 2: {
      const point = {
        latitude: startingLatitude,
        longitude: startingLongitude,
      };
      let idx = boundCheckAndRetrieve(locatorChars[0].toLowerCase(), charMap);
      point.longitude += idx * firstLevelLongitudeDivision;
      idx = boundCheckAndRetrieve(locatorChars[1].toLowerCase(), charMap);
      point.latitude += idx * firstLevelLatitudeDivision;
      if (last) {
        point.longitude = round10((firstLevelLongitudeDivision / 2) + point.longitude, 0);
        point.latitude = round10((firstLevelLatitudeDivision / 2) + point.latitude, 0);
      }
      return point;
    }
    case 4: {
      const point = getLatLngFromMhLocator(locatorChars.slice(0, 2));
      let lng;
      let lat;
      try {
        lng = parseInt(locatorChars[2], 10) * 2;
        lat = parseInt(locatorChars[3], 10);
      } catch (e) {
        throw new Error(`Invalid characters found in locator, was either ${locatorChars[2]} or
        ${locatorChars[3]}`);
      }
      point.longitude += lng;
      point.latitude += lat;
      if (last) {
        point.longitude = round10((point.longitude + 1), -1);
        point.latitude = round10((point.latitude + 0.5), -1);
      }
      return point;
    }
    case 6: {
      const point = getLatLngFromMhLocator(locatorChars.slice(0, 4));
      const LngIdx = boundCheckAndRetrieve(locatorChars[4].toLowerCase(), charMap);
      const LatIdx = boundCheckAndRetrieve(locatorChars[5].toLowerCase(), charMap);
      point.longitude += ((LngIdx * thirdLevelLongitudeDivisions) + last ? 2.5 : 0)
        / degreeArcMinutes;
      point.latitude += ((LatIdx * thirdLevelLatitudeDivisions) + last ? 1.25 : 0)
        / degreeArcMinutes;
      if (last) {
        point.longitude = round10(point.longitude, -1);
        point.latitude = round10(point.latitude, -1);
      }
      return point;
    }
    default: {
      throw new Error(`Invalid number of Maidenhead Locator characters ${locatorChars.length}`);
    }
  }
}
