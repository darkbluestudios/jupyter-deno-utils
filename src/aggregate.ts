/**
 * Utilities that provide a reduced value from a collection.
 *
 * @module aggregate
 */

import percentileLib from "percentile";
import * as ArrayUtils from "./array.ts";
import ObjectUtils from "./object.ts";
import FormatUtils from "./format.ts";

/**
 * Utilities that provide a reduced value from a collection.
 * 
 * (Note that this can also map the collection down first)
 * 
 * This can be very helpful with {@link SourceMap#reduce|SourceMap.reduce()}
 * or {@link module:group.by|group.by()} in aggregating a series.
 * 
 * Types of methods:
 * 
 * * Select a single property
 *   * {@link module:aggregate.property|property()} - maps to a single property (often used with other libraries)
 * * Ranges of values
 *   * {@link module:aggregate.extent|extent()} - returns the min and max of range
 *   * {@link module:aggregate.min|min()} - returns the minimum value of the range
 *   * {@link module:aggregate.max|max()} - returns the maximum value of the range
 *   * {@link module:aggregate.difference|difference()} - returns the difference between max and min values
 * * Average values
 *   * {@link module:aggregate.avgMedian|avgMedian()} - finds the median (halfway number in a sorted series)
 *   * {@link module:aggregate.avgMean|avgMean()} - Finds the mean value (sum of all values / # of values)
 * * Unique / Duplicate values
 *   * {@link module:aggregate.duplicates|duplicates()} - returns values found more than once
 *   * {@link module:aggregate.count|count()} - returns count of values in ways easily convertable to string
 *   * {@link module:aggregate.countMap|countMap()} - return count of values in a map
 *   * {@link module:aggregate.unique|unique()} - returns values found only once
 *   * {@link module:aggregate.distinct|distinct()} - returns the number of unique values found (unique.length)
 *   * {@link module:aggregate.notIn|notIn()} - returns which values are not in a superset
 *   * {@link module:aggregate.isUnique|isUnique()} - returns whether the values in the list are unique
 * * Meta / Coalesce
 *   * {@link module:aggregate.length|length()} - Number of records found in the collection
 *   * {@link module:aggregate.first|first()} - returns first non-null/undefined in list
 *   * {@link module:aggregate.sum|sum()} - sum of a collection
 *   * {@link module:aggregate.coalesce|coalesce()} - given a list of objects, creates a single object with first non-null value of all properties
 * * Functional
 *   * {@link module:aggregate.deferCollection|deferCollection(function, bindArg, bindArg, ...)} - bind a function with arguments
 * * Percentile
 *   * {@link module:aggregate.percentile|percentile()} - determines the Nth percentile of a field or value
 *   * {@link module:aggregate.percentile_01|percentile_01()} - 1th percentile
 *   * {@link module:aggregate.percentile_05|percentile_05()} - 5th percentile
 *   * {@link module:aggregate.percentile_10|percentile_10()} - 10th percentile
 *   * {@link module:aggregate.percentile_25|percentile_25()} - 25th percentile
 *   * {@link module:aggregate.percentile_50|percentile_50()} - 50th percentile
 *   * {@link module:aggregate.percentile_75|percentile_75()} - 75th percentile
 *   * {@link module:aggregate.percentile_90|percentile_90()} - 90th percentile
 *   * {@link module:aggregate.percentile_95|percentile_95()} - 95th percentile
 *   * {@link module:aggregate.percentile_99|percentile_99()} - 99th percentile
 * * Top Values
 *   * {@link module:aggregate.topValues|topValues} - top (or bottom) values from a list of objects or literals
 * 
 * Please note, there is nothing special for these functions, such as working with {@link SourceMap#reduce|SourceMap.reduce()}
 * 
 * They simply accept a collection and provide a result,
 * often using the {@link module:aggregate.evaluateFunctionOrProperty|aggregate.evaluateFunctionOrProperty()}
 * with the second argument.
 * 
 * ## Overall Example
 * 
 * Assume we have two tyeps of values:
 * 
 * ```
 * collection = [
 *   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
 *   { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
 *   { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 },
 *   { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
 *   { id: 4, city: 'New York', month: 'Aug', precip: 4.13 },
 *   { id: 5, city: 'New York', month: 'Dec', precip: 3.58 },
 *   { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 },
 *   { id: 8, city: 'Chicago',  month: 'Dec', precip: 2.56 },
 *   { id: 7, city: 'Chicago',  month: 'Aug', precip: 3.98 }
 * ];
 * ```
 * 
 * ```
 * // collection.map(r => r.precip);
 * series = [0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56, 3.98];
 * ```
 * 
 * ## Working with Groups
 * 
 * The expected way this will be used most is with the {@link module:group|group.by(collection, field, ...)} call.
 * 
 * (See also {@link https://observablehq.com/@d3/d3-group|d3-group functionality})
 * 
 * ```
 * utils.group.by(collection, 'city')
 *   .reduce((collection) => ({
 *     monthsReporting: utils.aggregate.unique(collection, 'month'),
 *     avgPrecipitation: utils.aggregate.sum(collection, 'precip'),
 *     numReports: utils.aggregate.length(collection),
 *     minPrecip: utils.aggregate.min(collection, 'precip'),
 *     maxPrecip: utils.aggregate.min(collection, 'precip'),
 *     variancePrecip: utils.aggregate.difference(collection, 'precip'),
 *   }))
 * 
 * providing
 * [
 *   {
 *     city: 'Seattle',
 *     monthsReporting: [ 'Aug', 'Apr', 'Dec' ],
 *     avgPrecipitation: 8.86,
 *     numReports: 3,
 *     minPrecip: 0.87,
 *     maxPrecip: 0.87,
 *     variancePrecip: 4.43999
 *   },
 *   {
 *     city: 'New York',
 *     monthsReporting: [ 'Apr', 'Aug', 'Dec' ],
 *     avgPrecipitation: 11.65,
 *     numReports: 3,
 *     minPrecip: 3.58,
 *     maxPrecip: 3.58,
 *     variancePrecip: 0.54999
 *   },
 *   ...
 * ]
 * ```
 * 
 * ## Using in Tables
 * 
 * ({@link TableGenerator|see TableGenerator})
 * 
 * ```
 * new utils.TableGenerator()
 *     .data(
 *       utils.group.by(collection, 'city')
 *        .reduce((collection) => ({
 *          monthsReporting: utils.aggregate.unique(collection, 'month'),
 *          avgPrecipitation: utils.aggregate.sum(collection, 'precip'),
 *          numReports: utils.aggregate.length(collection),
 *          minPrecip: utils.aggregate.min(collection, 'precip'),
 *          maxPrecip: utils.aggregate.min(collection, 'precip'),
 *          variancePrecip: utils.aggregate.difference(collection, 'precip'),
 *        }))
 *     )
 *     .labels({ monthsReporting: 'Months',
 *              avgPrecipitation: 'Avg. Precip.',
 *              numReports: '# Reports'
 *     })
 *     .render()
 * ```
 * 
 * ![Screenshot](img/PrecipitationAvgTable.png)
 * 
 * ## Using in Vega Charts
 * 
 * ({@link module:vega|see vega module})
 * 
 * ```
 * utils.vega.svg((vl) => vl.markLine()
 *    .data(
 *       utils.group.by(collection, 'city')
 *        .reduceSeparate((collection) => ({
 *          minPrecip: utils.aggregate.min(collection, 'precip'),
 *          maxPrecip: utils.aggregate.max(collection, 'precip'),
 *          avgPrecip: utils.aggregate.avgMean(collection, 'precip'),
 *        }))
 *    )
 *    .title('Precipitation by City')
 *    .width(400)
 *    .encode(
 *         vl.x().fieldN('city'),
 *         vl.y().fieldQ('_aggregateValue').title('Precipitation'),
 *         vl.color().fieldN('_aggregateKey').title('Calculation')
 *    )
 * );
 * ```
 * 
 * ![Screenshot](img/PrecipitationAvgChart.png)
 * 
 * ## Working with Simple Arrays
 * 
 * Simple arrays do not need a mapping function or property,
 * we can simply pass null (or no second argument at all).
 * 
 * ```
 * series = [0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56, 3.98];
 * utils.aggregate.min(series, null);
 * // provides 0.87
 * ```
 * 
 * This is the same as `series.sort(utils.array.SORT_ASCENDING)[0]`
 * 
 * ## Working with Mapping Functions
 * 
 * If we want a specific value, we can pass a mapping function first.
 * 
 * ```
 * collection = [
 *   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
 *   { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
 *   ...
 * ];
 * 
 * utils.aggregate.min(collection, (r) => r.precip);
 * // provides 0.87
 * ```
 * 
 * This is the same as:
 * 
 * ```
 * collection.map(r => r precip)
 *    .sort(utils.array.SORT_ASCENDING)[0]
 * ```
 * 
 * ## Working with Object Properties
 * 
 * If we have a specific property (or key) in our 2d collection,
 * then we can just pass that instead.
 * 
 * ```
 * collection = [
 *   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
 *   { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
 *   ...
 * ];
 * 
 * utils.aggregate.min(collection, 'precip');
 * // provides 0.87
 * ```
 * 
 * This is the same as:
 * 
 * ```
 * collection.map(r => r precip)
 *    .sort(utils.array.SORT_ASCENDING)[0]
 * ```
 * 
 * @namespace aggregate
 * @module aggregate
 * @exports aggregate
 */

/** Accessor: property name, or function (record) => value, or null/undefined for identity on raw values */
export type Accessor<T = unknown> =
  | string
  | ((r: T) => unknown)
  | null
  | undefined;

/** Coalesce evaluation: (entryValue, currentCoalescedValue, entryPropName, entry) => whether to use this value */
export type CoalesceEvalFn = (
  entryValue: unknown,
  currentCoalescedValue: unknown,
  entryPropName: string,
  entry: Record<string, unknown>
) => boolean;

/**
 * Maps an array of values to a single property.
 * 
 * For example:
 * 
 * ```
 * const data = [{ record: 'jobA', val: 1 }, { record: 'jobA', val: 2 },
 *  { record: 'jobA', val: 3 }, { record: 'jobA', val: 4 },
 *  { record: 'jobA', val: 5 }, { record: 'jobA', val: 6 },
 *  { record: 'jobA', val: 7 }, { record: 'jobA', val: 8 },
 *  { record: 'jobA', val: 9 }, { record: 'jobA', val: 10 }
 * ];
 * 
 * utils.object.propertyFromList(data, 'val')
 * //-- [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * 
 * utils.object.propertyFromList(data, (r) => r.val);
 * //-- [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * ```
 * 
 * @param {Object[]} objectArray - Array of Objects to be mapped to a single property / value
 * @param {Function | String} propertyOrFn - Name of the property or Function to return a value
 * @returns {Array} - Array of values
 **/
export function property<T>(
  objectArray: T[] | null | undefined | unknown,
  propertyOrFn?: Accessor<T>
): unknown[] {
  return ObjectUtils.propertyFromList(
    Array.isArray(objectArray) ? objectArray : [],
    propertyOrFn as Parameters<typeof ObjectUtils.propertyFromList>[1]
  );
}

/**
 * Converts an aggregate function to two functions -
 * one that takes all arguments except the collection
 * and one that takes only the collection.
 * 
 * For example:
 * 
 * ```
 * utils.aggregate.unique(collection, (r) => r.city))
 * //-- all unique city values in the collection
 * // ['Chicago', 'New York', 'Seattle', 'Amsterdam']
 * ```
 * 
 * but what if we know we want the city properties,
 * but don't have the collection yet?
 * 
 * ```
 * const uniqueCity = utils.aggregate.deferCollection(utils.aggregate.unique, (r) => r.city);
 * ...
 * uniqueCity(collection)
 * //-- all the unique city values in the collection
 * // ['Chicago', 'New York', 'Seattle', 'Amsterdam']
 * ```
 * 
 * note that this is also available under an alias `defer`
 * 
 * ```
 * const uniqueCity = utils.agg.defer(utils.agg.unique, 'city');
 * ...
 * uniqueCity(collection)
 * //-- all the unique city values in the collection
 * // ['Chicago', 'New York', 'Seattle', 'Amsterdam']
 * ```
 * 
 * @param {Function} aggregateFn
 * @param {...any} [rest] - any arguments past the collection argument
 * @returns {Function} - (collection) => aggregateFn.apply(this, [collection, ...rest])
 **/
export function deferCollection<T, A extends unknown[]>(
  aggregateFn: (collection: T[], ...args: A) => unknown,
  ...rest: A
): (collection: T[]) => unknown {
  if (typeof aggregateFn !== "function") {
    throw Error("deferCollection:aggregateFn should be a function");
  }
  return (collection: T[]) => aggregateFn.apply(undefined, [collection, ...rest]);
}

/**
 * Identifies the min and max of values of a collection
 * @param {Array} collection - 
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @returns {Object}- structure of ({ min, max })
 * @example 
 * utils.aggregate.extent([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // { min: 0.87, max: 5.31 }
 **/
export function extent<T>(collection: T[], accessor?: Accessor<T>): { min: unknown; max: unknown } {
  return {
    min: min(collection, accessor),
    max: max(collection, accessor),
  };
}

/**
 * Identifies the smallest value in a collection of values.
 * 
 * (Note that this works with anything comparable with <)
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @returns {any} - smallest value where result < any other value in collection
 * @example 
 * utils.aggregate.min([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // 0.87
 **/
export function min<T>(collection: T[], accessor?: Accessor<T>): unknown {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return collection.reduce((current: unknown, val: T) => {
    const valEval = (cleanedFunc as (r: T) => unknown)(val);
    return (valEval as number) < (current as number) ? valEval : current;
  }, (cleanedFunc as (r: T) => unknown)(collection[0]));
}

/**
 * Identifies the largest value in a collection of values.
 * 
 * (Note that this works with anything comparable with > )
 * 
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @returns {any} - largest value where result > any other value in collection
 * @example 
 * utils.aggregate.max([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // 5.31
 **/
export function max<T>(collection: T[], accessor?: Accessor<T>): unknown {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return collection.reduce((current: unknown, val: T) => {
    const valEval = (cleanedFunc as (r: T) => unknown)(val);
    return (valEval as number) > (current as number) ? valEval : current;
  }, (cleanedFunc as (r: T) => unknown)(collection[0]));
}

/**
 * Sum of the values.
 * 
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @returns {any} - largest value where result > any other value in collection
 * @example 
 * utils.aggregate.sum([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // 26.69
 **/
export function sum<T>(collection: T[], accessor?: Accessor<T>): number {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return collection.reduce((current: number, val: T) => current + ((cleanedFunc as (r: T) => unknown)(val) as number), 0);
}

export function coalesceDefaultEvaluationFn(
  entryValue: unknown,
  currentCoalescedValue?: unknown,
  _entryPropName?: string,
  _entry?: Record<string, unknown>
): boolean {
  if (currentCoalescedValue) return false;
  if (entryValue == null) return false;
  if (entryValue === 0) return false;
  if (Array.isArray(entryValue) && entryValue.length === 0) return false;
  if (entryValue instanceof Date && entryValue.getTime() === 0) return false;
  return true;
}

/**
 * Coalesces a collection of objects to return a single object that has the first non-null value
 * of all unique properties found in the collection.
 * 
 * example:
 * 
 * ```
 * collection = [
 *  { first: 'john' },
 *  { last: 'doe' },
 *  { age: 23 }
 * ];
 * utils.agg.coalesce(collection);
 * // { first: 'john', last: 'doe', age: 23 };
 * ```
 * 
 * this also works to show example values for a large number of objects
 * 
 * ```
 * collection = [
 *   { first: 'john', last: 'doe', age: 23, failedClass: null },
 *   { first: 'jane', last: 'doe', favouriteColor: 'blue', failedClass: null },
 *   null,
 *   { first: 'bill', favouriteColor: 'red', failedClass: 'asbx-dx2' }
 * ];
 * utils.agg.coalesce(collection);
 * //-- now we can understand the types of values we got for each property type
 * // { first: 'john', last: 'doe', age: 23, favouriteColor: 'blue', failedClass: 'asbx-dx2' }
 * ```
 * 
 * Note - an optional evaluationFn can be provided, that can be used to determine
 * if a value is collected.
 * 
 * ```
 * collection = [{ val: null }, { val: 23 }, { val: 2 }, { val: 100 }];
 * maxCoalesce = (val, current) => val && (!current || val > current);
 * utils.agg.coalesce(collection, maxCoalesce);
 * // { val: 100 }
 * ```
 * 
 * @param {Array} collection - 
 * @param {Function} [evaluationFn] - optional function that defines the value collected
 *  - function(entryValue:any, currentCoalescedValue:any, entryPropName:string, entry:Object):Boolean
 * @returns {Object} - Object with all properties found, and the first 
 * @see {@link module:describe.describeObjects|describe.describeObjects(collection, options)} - to better understand values found
 ***/
export function coalesce(
  collection: Record<string, unknown>[] | null | undefined | unknown,
  evaluationFn?: CoalesceEvalFn
): Record<string, unknown> | null | undefined {
  if (!Array.isArray(collection)) return collection as undefined;
  const arr = collection as Record<string, unknown>[];
  const cleanEvalFn = evaluationFn ?? coalesceDefaultEvaluationFn;
  const result: Record<string, unknown> = {};
  arr.forEach((entry) => {
    if (ObjectUtils.isObject(entry)) {
      Object.keys(entry).forEach((key) => {
        const entryValue = entry[key];
        const currentCoalescedValue = result[key];
        if (cleanEvalFn(entryValue, currentCoalescedValue, key, entry as Record<string, unknown>)) {
          result[key] = entryValue;
        }
      });
    }
  });
  return result;
}

/**
 * The difference between the lowest and the highest values in the collection
 * 
 * @param {Array} collection 
 * @param {*} accessor 
 * @returns {Number} -
 * @example
 * utils.aggregate.difference([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // 4.44  (max: 5.31 - min: 0.87 = 4.4)
 **/
export function difference<T>(collection: T[], accessor?: Accessor<T>): number {
  const range = extent(collection, accessor);
  return (range.max as number) - (range.min as number);
}

/**
 * Finds the mean value (sum of all values / # of values)
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @returns {Number} - mean average
 * @example 
 * utils.aggregate.avgMean([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // 3.41
 **/
export function avgMean<T>(collection: T[], accessor?: Accessor<T>): number {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return (
    collection.reduce((current: number, val: T) => current + ((cleanedFunc as (r: T) => unknown)(val) as number), 0) /
    collection.length
  );
}

/**
 * Finds the median (halfway number in a sorted series)
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @returns {Number} - median number from the series
 * @example
 * utils.aggregate.avgMedian([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // [0.87,2.56,2.68,3.58,3.62,3.94,3.98,4.13,5.31]
 * //                      3.62
 **/
export function avgMedian<T>(collection: T[], accessor?: Accessor<T>): number {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  const results = (collection.map(cleanedFunc as (r: T) => unknown) as number[]).sort((a, b) => a - b);
  const middle = Math.floor(collection.length / 2);
  return collection.length % 2 === 0
    ? (results[middle - 1] + results[middle]) / 2
    : results[middle];
}

/**
 * Finds the first value in a list.
 * 
 * `NOTE: this short circuits and can be helpful if the values are all identical`
 * 
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @returns {any} - the first non undefined || null value found
 * @example
 * utils.aggregate.first([null, undefined, 0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // 0.87
 **/
export function first<T>(collection: T[], accessor?: Accessor<T>): unknown {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  let result: unknown = null;
  for (let i = 0; i < collection.length; i += 1) {
    result = (cleanedFunc as (r: T) => unknown)(collection[i]);
    if (result !== undefined && result !== null) {
      return result;
    }
  }
  return null;
}

/**
 * Number of records found in the collection
 * @param {Array} collection -
 * @returns {Number}
 * @example
 * utils.aggregate.length([0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56]);
 * // 8
 **/
export function length(collection: unknown[]): number {
  return collection.length;
}

/**
 * Identifies the unique values from the collection.
 * 
 * Note that this includes an additional bucketing function - useful for objects.
 * (As String('A') !== String('A)' - because
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators|
 * because checking equality of Objects is only true if the operands reference the same Object.})
 * 
 * See {@link module:aggregate.count} for more
 * 
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @param {Function} [uniquifierFn] - optional function to make values unique
 * @returns {Array} - unique values
 * @example
 * utils.aggregate.unique(['apple', 'orange', 'apple', 'banana']);
 * // [ 'apple', 'orange', 'banana' ]
 **/
export function unique<T>(
  collection: T[],
  accessor?: Accessor<T>,
  uniquifierFn?: (v: unknown) => unknown
): unknown[] {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  if (uniquifierFn) {
    return Array.from(new Set(collection.map((v) => uniquifierFn((cleanedFunc as (r: T) => unknown)(v)))));
  }
  return Array.from(
    new Set(
      collection
        .map((cleanedFunc as (r: T) => unknown))
        .reduce(
          (result: unknown[], val: unknown) =>
            val instanceof Set || Array.isArray(val) ? [...result, ...(val as unknown[])] : [...result, val],
          []
        )
    )
  );
}

/**
 * Counts the unique values.
 * 
 * Note that this includes an additional bucketing function - useful for objects.
 * (As String('A') !== String('A)' - because
 * 
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators|
 * because checking equality of Objects is only true if the operands reference the same Object.})
 * 
 * See {@link module:aggregate.count} for more
 * 
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @param {Function} [uniquifierFn] - optional function to make values unique
 * @returns {Number} - unique values
 * @example
 * utils.aggregate.unique(['apple', 'orange', 'apple', 'banana']);
 * // 3 - e.g [ 'apple', 'orange', 'banana' ].length
 **/
export function distinct<T>(collection: T[], accessor?: Accessor<T>, uniquifierFn?: (v: unknown) => unknown): number {
  return (unique(collection, accessor, uniquifierFn) as unknown[]).length;
}

/**
 * Identifies how frequently something has occurred as a value.
 * 
 * Note that this also includes a function to make the value unique,
 * so Objects can be compared,
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators|
 * because checking equality of Objects is only true if the operands reference the same Object.})
 * 
 * See {@link module:aggregate.count} for more
 * 
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @param {Function} [uniquifierFn] - optional function to make values unique
 * @returns {Map} - unique values -> count of how often it was identified
 * @see .count - for an object that convert to string easier
 * @example
 * const source = [
 *   { city: 'Chicago' }, { city: 'Seattle' }, { city: 'New York' },
 *   { city: 'Chicago' }, { city: 'Seattle' }, { city: 'AmsterDam' }
 * ];
 * utils.aggregate.count(source, 'city');
 * // Map([['Chicago', 2], ['Seattle', 2], ['New York', 1], ['Amsterdam'], 1])
 * utils.aggregate.countMap(source, 'city').get('Chicago')
 * // 2
 **/
export function countMap<T>(
  collection: T[],
  accessor?: Accessor<T>,
  uniquifierFn?: (v: unknown) => unknown
): Map<unknown, number> {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  const resultMap = new Map<unknown, number>();
  collection.forEach((val) => {
    let result: unknown = (cleanedFunc as (r: T) => unknown)(val);
    if (uniquifierFn) result = uniquifierFn(result);
    if (result === undefined) result = null;
    if (!resultMap.has(result)) {
      resultMap.set(result, 1);
    } else {
      resultMap.set(result, resultMap.get(result)! + 1);
    }
  });
  return resultMap;
}

/**
 * Identifies how frequently something has occurred as a value.
 * 
 * Note that this also includes a function to make the value unique,
 * so Objects can be compared,
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators|
 * because checking equality of Objects is only true if the operands reference the same Object.})
 * 
 * See {@link module:aggregate.unique} for more
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @param {Function} [uniquifierFn] - optional function to make values unique
 * @returns {Object} - with unique values as props, and counts as values
 * @see .countMap - for a map of results that are not converted to string
 * @example
 * const source = [
 *   { city: 'Chicago' }, { city: 'Seattle' }, { city: 'New York' },
 *   { city: 'Chicago' }, { city: 'Seattle' }, { city: 'AmsterDam' }
 * ];
 * utils.aggregate.count(source, 'city');
 * // { Chicago: 2, Seattle: 2, 'New York': 1, Amsterdam: 1 };
 * utils.aggregate.count(source, 'city').Chicago
 * // 2
 * 
 * series = [
 *   { station: 'A', timestamp: new Date(2022, 0, 1, 9) },
 *   { station: 'B', timestamp: new Date(2022, 0, 1, 9, 30) },
 *   { station: 'A', timestamp: new Date(2022, 0, 1, 10, 0) },
 *   { station: 'B', timestamp: new Date(2022, 0, 2, 9) },
 *   { station: 'A', timestamp: new Date(2022, 0, 2, 9, 30) },
 *   { station: 'B', timestamp: new Date(2022, 0, 2, 10, 0) },
 *   { station: 'A', timestamp: new Date(2022, 0, 3, 10, 0) },
 *   { station: 'B', timestamp: new Date(2022, 0, 3, 10, 0) }
 * ]
 * utils.aggregate.count(series, 'timestamp', (d) => d.toISOString().slice(0, 10))
 * // { '2022-01-01': 3, '2022-01-02': 2, '2022-01-03': 2 }
 **/
export function count<T>(
  collection: T[],
  accessor?: Accessor<T>,
  uniquifierFn?: (v: unknown) => unknown
): Record<string, number> {
  const countResults = countMap(collection, accessor, uniquifierFn);
  const entries = Array.from(countResults.entries()).map(([key, value]) => [
    FormatUtils.printValue(key),
    value,
  ]) as [string, number][];
  return Object.fromEntries(entries);
}

/**
 * Determines the values that were duplicated
 * 
 * Note that this also includes a function to make the value unique,
 * so even Dates, Objects, etc can be compared,
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators|
 * because checking equality of Objects is only true if the operands reference the same Object.})
 * 
 * See {@link module:aggregate.count} for more
 * @param {Array} collection -
 * @param {Function|String} accessor - function to identify the property, string property name or null
 * @param {Function} [uniquifierFn] - optional function to make values unique
 * @returns {Array} - array of the duplicate values
 * @see {@link module:aggregate.count} for the number of times they were duplicated
 * @example
 * const source = [
 *   { city: 'Chicago' }, { city: 'Seattle' }, { city: 'New York' },
 *   { city: 'Chicago' }, { city: 'Seattle' }, { city: 'AmsterDam' }
 * ];
 * utils.aggregate.duplicates(source, 'city');
 * // ['Chicago', 'Seattle']
 **/
export function duplicates<T>(
  collection: T[],
  accessor?: Accessor<T>,
  uniquifierFn?: (v: unknown) => unknown
): unknown[] {
  const countResults = countMap(collection, accessor, uniquifierFn);
  const results: unknown[] = [];
  Array.from(countResults.entries()).forEach(([key, value]) => {
    if (value > 1) results.push(key);
  });
  return results;
}

/**
 * Determines the values in collection that are not in he possibleSuperSet.
 * 
 * This can be helpful in validating a superSet does indeed include all the values.
 * 
 * @param {Array} collection - 
 * @param {Function | String} accessor - function to identify the value or string property name or null if array of values
 * @param {Iteratable} possibleSuperSet - Array or Set that we want to identify which values are not in
 * @returns {Set} - set of values from collection not in the possibleSuperSet
 * 
 * @example
 * const superSet = new Set(['a', 'b', 'c']);
 * const data = [{ val: 'a' }, { val: 'b' }, { val: 'c' }, { val: 'd' }];
 * 
 * utils.aggregate.notIn(data, 'val', superSet);
 * // Set('d')
 **/
export function notIn<T>(collection: T[], accessor: Accessor<T>, targetIterator: Iterable<unknown>): Set<unknown> {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  const targetSet = new Set(targetIterator);
  const results = new Set<unknown>();
  collection.forEach((record) => {
    const recordValue = (cleanedFunc as (r: T) => unknown)(record);
    if (!targetSet.has(recordValue)) {
      results.add(recordValue);
    }
  });
  return results;
}

/**
 * Determines whether the values in the collection are unique.
 * 
 * @param {Array} collection -
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Boolean} - whether the values in the array are truly unique
 * @example
 * let data = [{ val: 1 }, { val: 2 }, { val: 3 }, { val: 1 }];
 * utils.aggregate.isUnique(data, 'val'); // false
 * 
 * let data = [{ val: 1 }, { val: 2 }, { val: 3 }];
 * utils.aggregate.isUnique(data, 'val'); // true
 * 
 * data = ['a', 'b', 'c', 'd'];
 * utils.aggregate.isUnique(data); // true
 **/
export function isUnique<T>(collection: T[], accessor?: Accessor<T>): boolean {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  const uniqueValues = new Set<unknown>();
  const duplicateValue = collection.find((record) => {
    const result = (cleanedFunc as (r: T) => unknown)(record);
    if (result === undefined || result === null) {
      // do nothing
    } else if (!uniqueValues.has(result)) {
      uniqueValues.add(result);
      return false;
    }
    return true;
  });
  return duplicateValue === undefined;
}

/**
 * Returns a given percentile from a list of objects.
 * 
 * **Note: this simply aggregates the values and passes to the [Percentile NPM Package](https://www.npmjs.com/package/percentile)**
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @param {Number} pct - Percentile (either .5 or 50)
 * @returns {Number} - the pct percentile of a property within the collection
 * @example
 * const data = [{ record: 'jobA', val: 1 }, { record: 'jobA', val: 2 },
 *  { record: 'jobA', val: 3 }, { record: 'jobA', val: 4 },
 *  { record: 'jobA', val: 5 }, { record: 'jobA', val: 6 },
 *  { record: 'jobA', val: 7 }, { record: 'jobA', val: 8 },
 *  { record: 'jobA', val: 9 }, { record: 'jobA', val: 10 }
 * ];
 * 
 * utils.aggregate.percentile(data, 'val', 50) //-- returns 5
 * utils.aggregate.percentile(data, (r) => r.val, 70) //-- returns 7
 **/
export function percentile<T>(
  collection: T[] | null | undefined | unknown,
  accessor: Accessor<T> | undefined,
  pct: number
): number | undefined {
  const list = Array.isArray(collection) ? collection : [];
  const values = ObjectUtils.propertyFromList(list, accessor as Parameters<typeof ObjectUtils.propertyFromList>[1]);
  const cleanPercentile = pct > 0 && pct < 1 ? pct * 100 : pct;
  return (percentileLib as (p: number, v: number[]) => number)(cleanPercentile, values as number[]);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_01<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 1);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_05<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 5);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_10<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 10);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_25<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 25);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_50<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 50);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_75<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 75);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_90<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 90);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_95<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 95);
}

/**
 * Returns a hard coded percentage
 * 
 * {@link module:aggregate.percentage|See Percentage for more detail}
 * 
 * @param {Object[]} collection - collection of objects
 * @param {Function | String} accessor - function to access the value, string property or null
 * @returns {Number} - the percentile of a property within the collection
 * @see {@link module:aggregate.percentile|percentile} - as this simply hard codes the percentage
 **/
export function percentile_99<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentile(collection, accessor, 99);
}

/**
 * Returns the Top N values from within a collection.
 * 
 * For example, if we have a list of weather records,
 * we can get the month with the greatest rain.
 * 
 * **Note: this can also return the Bottom N values, if sorting in ascending order.
 * ({@link module:array.createSort|see array.createSort() for more.})**
 * 
 * ```
 * collection = [
 *   { id: 0, month: '2021-Sep', precip: 2.68 },
 *   { id: 1, month: '2021-Aug', precip: 0.87 },
 *   { id: 2, month: '2021-Oct', precip: 5.31 },
 *   { id: 3, month: '2021-Nov', precip: 3.94 },
 *   { id: 4, month: '2021-Dec', precip: 4.13 },
 *   { id: 5, month: '2022-Jan', precip: 3.58 },
 *   { id: 6, month: '2022-Feb', precip: 3.62 },
 *   { id: 7, month: '2022-Mar', precip: 3.98 },
 *   { id: 8, month: '2022-Apr', precip: 2.56 }
 * ];
 * 
 * //-- We can get the top 3 months with the highest rainfall
 * utils.aggregate.topValues(collection, 3, 'month', '-precip');
 * // '2021-Oct', '2021-Dec', '2022-Mar'
 * 
 * //-- Or the 3 most recent precipitation values:
 * utils.aggregate.topValues(collection, 3, 'precip', '-id');
 * // 2.56, 3.98, 3.62
 * 
 * //-- Lowest Rainfall is simply sorting in ascending order
 * utils.aggregate.topValues(collection, 5, 'month', 'precip');
 * // 0.87, 2.56, 2.68, 3.58, 3.62
 * 
 * //-- you can also combine values to make the values clearer, by passing a function
 * const monthPrecip = (record) => `${record.month} (${record.precip})`;
 * utils.aggregate.topValues(collection, 3, monthPrecip, '-precip');
 * // '2021-Oct (5.31)', '2021-Dec (4.13)', '2022-Mar (3.98)'
 * ```
 * 
 * Literal values are also supported
 * 
 * ```
 * collection = [ 2.68, 0.87, 5.31, 3.94, 4.13, 3.58, 3.62, 3.98, 2.56 ];
 * 
 * //-- top 5 values
 * utils.aggregate.topValues(collection, 5);
 * utils.aggregate.topValues(collection, 5, null, '-')
 * // [5.31, 4.13, 3.98, 3.94, 3.62]
 * 
 * //-- bottom 5 values
 * utils.aggregate.topValues(collection, 5, null, '');
 * // [0.87, 2.56, 2.68, 3.58, 3.62]
 * ```
 * 
 * @param {Array} collection - Collection of values we want to get the top values from
 * @param {Number} [numValues=5] - the number of values to return
 * @param {string | Function} [fieldOrFn = null] - field of the object to use as the value, <br />
 *    Or the Function to generate the value, <br />
 *    Or null if the value is an array of Comparables (like Number)
 * @param  {...String} sortFields - field in the object to sort by,<br />
 *    Prefixed by '-' if it should be sorted in Descending order
 *    (ex: '-Year', 'Manufacturer')
 * @returns {Array} - array of values
 **/
export function topValues<T>(
  collection: T[] | null | undefined,
  numValues = 5,
  fieldOrFn?: Accessor<T> | null,
  ...sortFields: string[]
): unknown[] {
  let cleanCollection = collection ?? [];
  const cleanSortFields = sortFields.length === 0 ? ["-"] : sortFields;
  cleanCollection = [...cleanCollection].sort(
    ArrayUtils.createSort(...cleanSortFields) as (a: T, b: T) => number
  );
  return property(cleanCollection.slice(0, numValues), fieldOrFn ?? undefined);
}
