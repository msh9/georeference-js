/* eslint-env jest */
import { geohashFromLatLng, latLngFromGeohash } from './GeoHash';

describe('Convert to geohash from latitude and longitude', () => {
  test('Rejects precision less than 1', () => {
    expect(() => {
      geohashFromLatLng(12.1, 12.1, 0);
    }).toThrow();
  });
  test('Encode the first longitude and latitude bits correctly', () => {
    expect(geohashFromLatLng(89, 91, 1)).toBe('y');
  });
  test('Encode the first 12 characters correctly', () => {
    expect(geohashFromLatLng(-25.382708, -49.265506, 12)).toBe('6gkzwgjzn820');
  });
  test('Equals to mid-point yields 1 bit', () => {
    expect(geohashFromLatLng(0, 0, 4)).toBe('s000');
  });
  test('A value just west and south of 0,0 yields leading zeros then ones', () => {
    expect(geohashFromLatLng(-0.01, -0.01, 1)).toBe('7');
  });
});
describe('Convert to latitude and longitude from geohash', () => {
  test('Rejects empty geohash string', () => {
    expect(() => {
      latLngFromGeohash('');
    }).toThrow();
  });
  test('Rejects a geohash with an invalid character', () => {
    expect(() => {
      latLngFromGeohash('-');
    }).toThrow();
  });
  test('accurately decodes a single character geohash', () => {
    expect(latLngFromGeohash('y')).toMatchObject({ latitude: 67.5, longitude: 112.5 });
  });
  test('accurately decides a five character geohash', () => {
    expect(latLngFromGeohash('ezs42')).toMatchObject({ latitude: 42.60498046875, longitude: -5.60302734375 });
  });
  test('accurately decodes a 12 character geohash', () => {
    expect(latLngFromGeohash('6gkzwgjzn820')).toMatchObject({ latitude: -25.38270807825029, longitude: -49.265506099909544 });
  });
});
test('conversion round-tripping works as expected', () => {
  expect(latLngFromGeohash(
    geohashFromLatLng(-25.38270807825029,
      -49.265506099909544,
      12))).toMatchObject({ latitude: -25.38270807825029, longitude: -49.265506099909544});
});
