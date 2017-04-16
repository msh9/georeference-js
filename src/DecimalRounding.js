/**
 * Original code from Mozilla Developer Network; logic was subsequently modified to fit into an es6 module.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Decimal_rounding|Decimal Rounding}
 * Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
 */

/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Number} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  let forcedValue = +value;
  const forcedExponent = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(forcedValue) || !(typeof forcedExponent === 'number' && forcedExponent % 1 === 0)) {
    return NaN;
  }
  // If the value is negative...
  if (forcedValue < 0) {
    return -decimalAdjust(type, -forcedValue, forcedExponent);
  }
  // Shift
  forcedValue = forcedValue.toString().split('e');
  forcedValue = Math[type](+(forcedValue[0] + 'e' + (forcedValue[1] ? (+forcedValue[1] - forcedExponent) : -forcedExponent)));
  // Shift back
  forcedValue = forcedValue.toString().split('e');
  return +(forcedValue[0] + 'e' + (forcedValue[1] ? (+forcedValue[1] + forcedExponent) : forcedExponent));
}

export function round10(value, exp) {
  return decimalAdjust('round', value, exp);
}

export function floor10(value, exp) {
  return decimalAdjust('floor', value, exp);
}

export function ceil10(value, exp) {
  return decimalAdjust('ceil', value, exp);
}


