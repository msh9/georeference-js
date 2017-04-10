/* eslint-env jest */

import { georefFromLatLng, latLngFromgeoref } from './GeoRef';

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

  test('reject out of range latitude', () => {
    expect(() => {
      georefFromLatLng(370, 120);
    }).toThrow();
  });

  test('correctly converts the major, minimal, coordinates of the UK', () => {
    expect(georefFromLatLng(51.064900, -1.797288, true, 2)).toBe('MK');
  });

  test('correctly converts the eight character precision GEOREF of the Salisbury Cathedral', () => {
    expect(georefFromLatLng(51.064900, -1.797288, true, 8)).toBe('MK PG 12 04');
  });

  test('correctly converts the eight character precision GEOREF of the Salisbury Cathedral with' +
    ' no spaces', () => {
    expect(georefFromLatLng(51.064900, -1.797288, false, 8)).toBe('MKPG1204');
  });
});

describe('Convert to latitude and longitude from georef', () => {
  test('rejects empty strings', () => {
    expect(() => {
      latLngFromgeoref('');
    }).toThrow();
  });

  test('rejects leading invalid characters', () => {
    expect(() => {
      latLngFromgeoref('0A');
    }).toThrow();
  });
});
