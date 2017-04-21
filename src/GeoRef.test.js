/* eslint-env jest */
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
import { georefFromLatLng, latLngFromGeoref } from './GeoRef';

describe('Convert to georef from latitude and longitude', () => {
  test('rejects precision less than 2', () => {
    expect(() => {
      georefFromLatLng(1.0, 1.0, true, 1);
    }).toThrow();
  });

  test('rejects precision greater than 12', () => {
    expect(() => {
      georefFromLatLng(1.0, 1.0, true, 13);
    }).toThrow();
  });

  test('rejects precision that is not divisible by two', () => {
    expect(() => {
      georefFromLatLng(1.0, 1.0, true, 3);
    }).toThrow();
  });

  test('reject out of range latitude', () => {
    expect(() => {
      georefFromLatLng(370, 120);
    }).toThrow();
  });

  test('correctly converts the major, minimal, coordinates of the UK', () => {
    expect(georefFromLatLng(51.064900, -1.797288, true, quads.FifteenDegreeQuad)).toBe('MK');
  });

  test('correctly converts the eight character precision GEOREF of the Salisbury Cathedral', () => {
    expect(georefFromLatLng(51.064900, -1.797288, true, quads.OneArcMinuteQuad)).toBe('MK PG 12 04');
  });

  test('correctly converts the eight character precision GEOREF of the Salisbury Cathedral with' +
    ' no spaces', () => {
    expect(georefFromLatLng(51.064900, -1.797288, false, quads.OneArcMinuteQuad)).toBe('MKPG1204');
  });

  test('correctly converts the ten character precision GEOREF of the Salisbury Cathedral with' +
    ' no spaces', () => {
    expect(georefFromLatLng(51.064900, -1.797288, false, quads.OneTenthArcMinuteQuad)).toBe('MKPG122039');
  });

  test('correctly converts the eight character precision GEOREF of the Naval Air Station Patuxent' +
    ' River', () => {
    expect(georefFromLatLng(38.286108, -76.4291704, false, quads.OneArcMinuteQuad)).toBe('GJPJ3417');
  });

  test('correctly converts the ten character position of the Naval Air Station Patuxent River', () => {
    expect(georefFromLatLng(38.286108, -76.4291704, false, quads.OneTenthArcMinuteQuad)).toBe('GJPJ342172');
  });

  test('correctly converts the twelve character precision GEOREF of the Salisbury Cathedral with' +
    ' no spaces', () => {
    expect(georefFromLatLng(51.064900, -1.797288, false, quads.OneHundrethArcMinuteQuad)).toBe('MKPG12160389');
  });

  test('correctly converts the twelve character position of the Naval Air Station Patuxent River', () => {
    expect(georefFromLatLng(38.286108, -76.4291704, false, quads.OneHundrethArcMinuteQuad)).toBe('GJPJ34251717');
  });
});

describe('Convert to latitude and longitude from georef', () => {
  test('rejects empty strings', () => {
    expect(() => {
      latLngFromGeoref('');
    }).toThrow();
  });

  test('rejects leading invalid characters', () => {
    expect(() => {
      latLngFromGeoref('0A');
    }).toThrow();
  });

  test('rejects invalid length of string', () => {
    expect(() => {
      latLngFromGeoref('AAAA01');
    }).toThrow();
  });

  test('correctly averages position of MKPG1204', () => {
    expect(latLngFromGeoref('MKPG1204')).toMatchObject({ latitude: 51.1, longitude: -1.8 });
  });

  test('correctly averages position of GJPJ34251717', () => {
    expect(latLngFromGeoref('GJPJ34251717')).toMatchObject({ latitude: 38.286, longitude: -76.429 });
  });

  test('correctly averages position of GPPJ', () => {
    expect(latLngFromGeoref('GJPJ')).toMatchObject({ latitude: 39, longitude: -76 });
  });

  test('correctly averages position of AA', () => {
    expect(latLngFromGeoref('AA')).toMatchObject({ latitude: -82, longitude: -172 });
  });

  test('correctly averages position of ZM', () => {
    expect(latLngFromGeoref('ZM')).toMatchObject({ latitude: 82, longitude: 172 });
  });
});
