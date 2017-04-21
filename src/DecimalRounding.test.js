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

import * as rounding from './DecimalRounding';

describe('Round to a specific decimal place', () => {
  describe('rounding to nearest value', () => {
    test('integer rounding', () => {
      expect(rounding.round10(51.1, 0)).toBe(51);
    });

    test('negative tenth position rounding', () => {
      expect(rounding.round10(-51.28, -1)).toBe(-51.3);
    });

    test('positive hundreth position rounding', () => {
      expect(rounding.round10(234.235, -2)).toBe(234.24);
    });

    test('positive thousandth position rounding', () => {
       expect(rounding.round10(234.2367, -3)).toBe(234.237);
    });
  });
});
