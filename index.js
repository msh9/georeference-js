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

import * as MH from './src/MaidenheadLocator';
import * as GR from './src/GeoRef';
import * as GH from './src/GeoHash';

/**
 * Defines fixed names for implemented georeference systems.
 */
export const referenceNames = {
  GeoRef: GR.name,
  GeoHash: GH.name,
  Maidenhead: MH.name,
};

/**
 * Converts from a WGS84 lat,lng to a string calculated using the given system.
 * @param {string} referenceName The name of the geo reference system to use
 * @param {number} latitude The latitude to convert from
 * @param {number} longitude The longitde to convert from
 * @returns {string} The result of the geo reference system calculation
 */
export function fromLatLng(referenceName, latitude, longitude) {
  switch (referenceName) {
    case GR.name: {
      return GR.georefFromLatLng(latitude, longitude);
    }
    case GH.name: {
      return GH.geohashFromLatLng(latitude, longitude);
    }
    case MH.name: {
      return MH.mhLocatorFromLatLng(latitude, longitude);
    }
    default: throw new Error(`Unsupported system name ${referenceName}`);
  }
}

/**
 * toLatLng returns an averaged location for the string in the given geo reference system
 * @param {string} referenceName The name of the geo reference system to use
 * @param {string} reference The reference to average into a lat,lng point
 */
export function toLatLng(referenceName, reference) {
  switch (referenceName) {
    case GR.name: {
      return GR.latLngFromGeoref(reference);
    }
    case GH.name: {
      return GH.latLngFromGeohash(reference);
    }
    case MH.name: {
      return MH.latLngFromMhLocator(reference);
    }
    default: throw new Error(`Unsupported system name ${referenceName}`);
  }
}
