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

/**
 Defines friendly names for different levels of Georef precision
 @module
 */

/**
 * The size/type of a Georef quadrangle
 * @typedef {number} QuadSize
 */

/**
 * @type {QuadSize}
 */
export const FifteenDegreeQuad = 2;
/**
 * @type {QuadSize}
 */
export const OneDegreeQuad = 4;
/**
 * @type {QuadSize}
 */
export const OneArcMinuteQuad = 8;
/**
 * @type {QuadSize}
 */
export const OneTenthArcMinuteQuad = 10;
/**
 * @type {QuadSize}
 */
export const OneHundrethArcMinuteQuad = 12;
