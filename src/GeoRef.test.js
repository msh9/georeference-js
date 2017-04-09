/* eslint-env jest */

import { georefFromLatLng, latLngFromgeoref } from './GeoRef';

describe('Convert to georef from latitude and longitude', () => {
  test('rejects precision less than 2', () => {
    expect(() => {
      georefFromLatLng(1.0, 1.0, 1);
    }).toThrow();
  });

  test('rejects precision greater than 12', () => {
    expect(() => {
      georefFromLatLng(1.0, 1.0, 13);
    }).toThrow();
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
