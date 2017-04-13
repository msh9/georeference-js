/* eslint-env jest */
import * as quads from './GeoRefPrecision';
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

  test('correctly encodes the ten character position of the Naval Air Station Patuxent River', () => {
    expect(georefFromLatLng(38.286108, -76.4291704, true, quads.OneTenthArcMinuteQuad)).toBe('GJPJ370172');
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
