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

import { mhLocatorFromLatLng, latLngFromMhLocator } from './MaidenheadLocator';

describe('Convert from latitude and longitude to Maidenhead Locator Square', () => {
  test('correctly handles top level locator square of 0, 0', () => {
    expect(mhLocatorFromLatLng(0, 0)).toBe('JJ');
  });

  test('correctly handles top level locator square of Newington Connecticut to 4 characters', () => {
    expect(mhLocatorFromLatLng(41.71463, -72.72713)).toBe('FN31pr');
  });

  test('correctly handles the extended square of Paris, France', () => {
    //TODO: Calculate extended square and add to test
    expect(mhLocatorFromLatLng(48.85207, 2.3909)).toBe('JN18EU');
  });
});

describe('Convert from Maidenhead Locator Square to averaged latitude longitude', () => {
  test('correctly averages location of AA', () => {

  });

  test('correctly averages location of XX', () => {

  });

  test('correctly averages location of FN31pr', () => {

  });
});
