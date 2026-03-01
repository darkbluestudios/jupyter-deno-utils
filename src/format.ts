/* eslint-disable max-len */

import { Domain } from "node:domain";

/**
 * Utility methods for printing and formatting values
 * 
 * * Printing Values to String
 *   * {@link module:format.printValue|format.printValue} - Prints any type of value to string
 *   * {@link module:format#.DATE_FORMAT|format.DATE_FORMAT} - Options for printValue Date Formats (see {@link module:array.printValue|array.printValue(value, options)})
 * @module format
 * @exports format
 */

/**
 * Print a number and zero fill it until it is len long.
 * 
 * @param {Number} num - Number to be converted
 * @param {Number} [len = 3] - the length of the string
 * @param {String} [fill = '0'] - the value to pad with 
 * @returns {String}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart|MDN - Pad Start} - for padding strings at the start
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd|MDN - Pad End} - for padding strings at the end
 * @example
 * utils.format.zeroFill(23)         // '023';
 * utils.format.zeroFill(23, 5)      // '00023';
 * utils.format.zeroFill(23, 5, ' ') // '   23'
 */
export function zeroFill(num:number, len = 3, fill = '0'):string {
  return String(num).padStart(len, fill);
};

/**
 * Interface for a number with a remainder
 */
export interface Remainder {
  integer:number;
  remainder:number;
}

/**
 * Divide a number and get the integer value and remainder
 * @param {Number} numerator - number to be divided
 * @param {Number} denominator - number to divide with
 * @returns {Object} - ({value, remainder}) 
 * @example
 * utils.format.divideR(5, 3)
 * // ({ value: 1, remainder: 2 })
 */
export function divideWithRemainder(numerator:number, denominator:number): Remainder {
  return ({
    integer: Math.trunc(numerator / denominator),
    remainder: numerator % denominator
  });
};

/**
 * @typedef {Object} Duration
 * @property {Number} days -
 * @property {Number} hours -
 * @property {Number} minutes -
 * @property {Number} seconds -
 * @property {Number} milliseconds -
 * @property {Number} epoch - the total duration in milliseconds
 */
export interface Duration {
    days:number;
    hours:number;
    minutes:number;
    seconds:number;
    milliseconds:number;
    epoch:number;
}

/**
 * Describes the duration in milliseconds for a given time period.
 */
export const DURATION = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 1000 * 60,
  HOUR: 1000 * 60 * 60,
  DAY: 1000 * 60 * 60 * 24
};

/**
 * Determines the length of time that a number of milliseconds take in duration
 * @param {Number} milliseconds - Number of millisecond duration
 * @returns {Duration}
 * @example
 * d1 = new Date(Date.UTC(2022, 2, 8, 22, 55, 12));
 * // 2022-03-08T22:55:14.775Z
 * d2 = new Date(Date.UTC(2022, 2, 8, 23, 00, 0));
 * // 2022-03-08T23:02:18.040Z
 * 
 * utils.format.millisecondDuration(d2.getTime() - d1.getTime())
 * // {
 * //   days: 0,
 * //   hours: 0,
 * //   minutes: 4,
 * //   seconds: 48,
 * //   milliseconds: 0,
 * //   epoch: 288000
 * // }
 */
export function millisecondDuration(milliseconds:number):Duration {
  const result:Duration = { days:0, hours:0, minutes:0, seconds:0, milliseconds:0, epoch:0 };
  let division = divideWithRemainder(milliseconds, DURATION.DAY);
  result.days = division.integer;
  division = divideWithRemainder(division.remainder, DURATION.HOUR);
  result.hours = division.integer;
  division = divideWithRemainder(division.remainder, DURATION.MINUTE);
  result.minutes = division.integer;
  division = divideWithRemainder(division.remainder, DURATION.SECOND);
  result.seconds = division.integer;
  result.milliseconds = division.remainder;
  result.epoch = milliseconds;

  return result;
};

/**
 * Ellipsis unicode character `…`
 * @type {String}
 * @private
 * @example
 * utils.format.ellipsis('supercalifragilisticexpialidocious', 5)
 * // super…
 */
export const ELLIPSIS = '…';

/**
 * Ellipsifies a string (but only if it is longer than maxLen)
 * 
 * @param {String} str - string to be ellipsified
 * @param {Integer} [maxLen = 50] - the maximum length of str before getting ellipsified
 * @returns {String}
 * @see https://docs.deno.com/api/deno/~/Deno.inspect
 * @example
 * utils.format.ellipsify('longName') // 'longName' (as maxLen is 50)
 * utils.format.ellipsify('longName', 8) // 'longName' (as maxLen is 8)
 * utils.format.ellipsify('longName', 4) // 'long…' (as str is longer than maxLen)
 */
export function ellipsify(str:any, maxLen:number = 50):string {
  const cleanStr = !str
    ? ''
    : typeof str === 'string'
      ? str
      : JSON.stringify(str);
  
  const cleanLen = maxLen > 0 ? maxLen : 50;

  if (cleanStr.length > cleanLen) {
    return `${cleanStr.substring(0, cleanLen)}…`;
  }
  return cleanStr;
};

export type DomainRange = [number, number];

/**
 * projects a value from a domain of expected values to a range of output values, ex: 10% of 2 Pi.
 * 
 * This is SUPER helpful in normalizing values, or converting values from one "range" of values to another.
 * 
 * @param {Number} val - value to be mapped
 * @param {Array} domain - [min, max] - domain of possible input values
 * @param {Array} domain.domainMin - minimum input value (anything at or below maps to rangeMin)
 * @param {Array} domain.domainMax - maximum input value (anything at or above maps to rangeMax)
 * @param {Array} range - [min, max] - range of values to map to
 * @param {Array} range.rangeMin - minimum output value
 * @param {Array} range.rangeMax - maximum output value
 * @returns Number
 * @see {@link module:format.clampDomain|clampDomain(value, [min, max])}
 * @example
 * 
 * utils.format.mapDomain(-2, [0, 10], [0, 1])
 * // 0   - since it is below the minimum value
 * utils.format.mapDomain(0, [0, 10], [0, 1])
 * // 0   - since it is the minimum value
 * utils.format.mapDomain(5, [0, 10], [0, 1])
 * // 0.5 - since it is 5/10
 * utils.format.mapDomain(12, [0, 10], [0, 1])
 * // 1   - since it is above the maximum value
 * 
 * utils.format.mapDomain(0.5, [0, 1], [0, 10])
 * // 5 - since it is half of 0-1, and half of 1-10
 * utils.format.mapDomain(0.5, [0, 1], [0, Math.PI + Math.PI])
 * // 3.1415 or Math.PI - since it is half of 2 PI
 */
export function mapDomain(val:number, [domainMin, domainMax]:DomainRange, [rangeMin = 0, rangeMax = 1]):number {
  if (val < domainMin) {
    return rangeMin;
  } else if (val > domainMax) {
    return rangeMax;
  }
  // domainMin / val / domainMax = rangeMin / result / rangeMax
  // (val - domainMin) / (domainMax - domainMin) = (result - rangeMin) / (rangeMax - rangeMin)
  // (val - domainMin) * (rangeMax - rangeMin) / (domainMax - domainMin) = result - rangeMin;
  // (val - domainMin) * (rangeMax - rangeMin) / (domainMax - domainMin) + rangeMin = result
  return (((val - domainMin) * (rangeMax - rangeMin)) / (domainMax - domainMin)) + rangeMin;
};
