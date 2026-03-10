/* eslint-disable max-classes-per-file, class-methods-use-this */

import * as FormatUtils from "./format.ts";
import * as ObjectUtils from "./object.ts";

/**
 * Module to describe objects or sets of data
 *
 * Describe an array of objects
 *  * {@link describeObjects} - given a list of objects, describes each of the fields
 * Describe an array of values (assuming all are the same type)
 *  * {@link describeBoolean} - describes a series of booleans
 *  * {@link describeStrings} - describes a series of strings
 *  * {@link describeNumbers} - describes a series of numbers
 *  * {@link describeDates} - describes a series of dates
 *
 * Most commonly, {@link describeObjects} is used -
 * as it describes with the appropriate type for each property.
 *
 * Note, if there are multiple child objects within the collection, object.flatten()
 * will bring those values down through dot notation (similar to arrow format) - so they can be better described.
 */

/** Options for how series are described. uniqueStrings - whether unique strings / frequency should be captured */
export interface DescribeOptions {
  uniqueStrings?: boolean;
}

/**
 * Result shape returned by SeriesDescription.finalize() and describe functions.
 */
export interface SeriesDescriptionResult {
  what: string | null;
  type: string;
  count: number;
  min: unknown;
  max: unknown;
  [key: string]: unknown;
}

/**
 * Options for describeObjects().
 */
export interface DescribeObjectsOptions {
  include?: string[];
  exclude?: string[];
  overridePropertyType?: Record<string, string>;
  maxRows?: number;
}

/** Internal options with normalized fields (built from DescribeObjectsOptions). */
interface DescribeObjectsOptionsInternal {
  include: Set<string> | null;
  exclude: Set<string>;
  maxRows: number;
  overridePropertyType?: Record<string, string>;
}

/**
 * Base Description for a series of values
 */
class SeriesDescription {
  /** What is being described */
  what: string | null;
  /** The type of thing being described */
  type: string;
  /** The number of entries reviewed */
  count: number = 0;
  /** The minimum value found */
  min: unknown = null;
  /** The maximum value found */
  max: unknown = null;

  /**
   * @param what - description of what is being described
   * @param type - the type of thing being described
   * @param _options - options for how things are described (reserved)
   */
  constructor(what: string | null, type: string, _options?: DescribeOptions) {
    this.reset();
    this.what = what;
    this.type = type;
  }

  /**
   * Resets the Description to the initial state
   */
  reset(): void {
    this.count = 0;
    this.max = null;
    this.min = null;
  }

  /**
   * Validates a value is the type expected
   * or throws an error if the type is not
   * or returns false if the value is 'empty'
   *
   * @param value - value to be checked
   * @param expectedType - the type of the value
   * @returns true if found and the right type, false if empty
   * @throws Error if the value is the wrong type
   */
  check(value: unknown, expectedType?: string): boolean | void {
    if (FormatUtils.isEmptyValue(value)) {
      return false;
    }

    const valueType = typeof value;
    if (expectedType && valueType !== expectedType) {
      throw Error(`describe: Value passed(${value}) expected to be:${expectedType}, but was: ${valueType}`);
    }

    this.count += 1;
    return true;
  }

  /**
   * Checks for minimum and maximum values
   * @param value - value to compare
   */
  checkMinMax(value: number): void {
    if (this.min === null || value < (this.min as number)) {
      this.min = value;
    }
    if (this.max === null || value > (this.max as number)) {
      this.max = value;
    }
  }

  /**
   * Finalizes the review
   */
  finalize(): SeriesDescriptionResult {
    const result = { ...this } as unknown as SeriesDescriptionResult;
    return result;
  }
}

/**
 * Describes a series of Boolean Values
 */
class BooleanDescription extends SeriesDescription {
  /** Mean sum as expressed */
  mean: number = 0.0;

  /**
   * @param what - what is being described
   * @param options - options used for describing
   */
  constructor(what: string | null, options?: DescribeOptions) {
    super(what, "boolean", options);
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.mean = 0.0;
  }

  /**
   * Whether the value can be described with this
   * @param value - value to check
   * @returns true if the value matches
   */
  static matchesType(value: unknown): boolean {
    return FormatUtils.isBoolean(value);
  }

  override check(value: unknown): boolean | void {
    if (FormatUtils.isEmptyValue(value)) return;

    this.count += 1;
    const cleanValue = FormatUtils.parseBoolean(value) ? 1 : 0;

    const oldMean = this.mean;
    this.mean += (cleanValue - oldMean) / this.count;

    if (this.max === null && cleanValue === 1) this.max = 1;
    if (this.min === null && cleanValue === 0) this.min = 0;
  }

  override finalize(): SeriesDescriptionResult {
    return super.finalize();
  }
}

/**
 * Describes a series of Numbers
 */
export class NumberDescription extends SeriesDescription {
  /** Mean sum as expressed */
  mean: number = 0.0;
  /** M2 - sum of squared deviation (Welford's algorithm) */
  m2: number = 0.0;
  /** Standard deviation of the numbers */
  stdDeviation: number = 0.0;

  /**
   * @param what - What is being described
   * @param options - options for describing
   */
  constructor(what: string | null, options?: DescribeOptions) {
    super(what, "number", options);
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.mean = 0.0;
    this.m2 = 0.0;
    this.stdDeviation = 0.0;
  }

  /**
   * Whether the value can be described with this
   * @param value - value to check
   * @returns true if the value matches
   */
  static matchesType(value: unknown): boolean {
    return typeof value === "number";
  }

  override check(value: unknown): boolean | void {
    const ok = super.check(value, "number");
    if (!ok) return;
    super.checkMinMax(value as number);

    /*
    @see Welford's algorithm
    @see https://stackoverflow.com/a/1348615
    @see https://lingpipe-blog.com/2009/03/19/computing-sample-mean-variance-online-one-pass/
    @see https://lingpipe-blog.com/2009/07/07/welford-s-algorithm-delete-online-mean-variance-deviation/
    @see https://www.calculator.net/standard-deviation-calculator.html
    */
    const oldMean = this.mean;
    this.mean += ((value as number) - oldMean) / this.count;
    this.m2 += ((value as number) - oldMean) * ((value as number) - this.mean);
  }

  override finalize(): SeriesDescriptionResult {
    const newDeviation = this.count > 1 ? Math.sqrt(this.m2 / this.count) : 0.0;
    this.stdDeviation = newDeviation;

    const result = super.finalize();
    delete result.m2;
    return result;
  }
}

/**
 * Describes a series of string values
 */
export class StringDescription extends SeriesDescription {
  /** Map of unique values */
  uniqueMap: Map<string, number> | null = null;
  /** Number of unique values */
  unique: number | null = null;
  /** The most common string */
  top: string | null = null;
  /** The frequency of the most common string */
  topFrequency: number | null = null;

  /**
   * @param what - What is being described
   * @param options - options for describing
   */
  constructor(what: string | null, options?: DescribeOptions) {
    super(what, "string", options);
    this.uniqueMap = null;
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.uniqueMap = new Map();
    this.unique = null;
    this.top = null;
    this.topFrequency = null;
  }

  /**
   * Whether the value can be described with this
   * @param value - value to check
   * @returns true if the value matches
   */
  static matchesType(value: unknown): boolean {
    return typeof value === "string";
  }

  override check(value: unknown): boolean | void {
    if (!super.check(value, "string")) return;

    const str = value as string;
    if (this.uniqueMap!.has(str)) {
      this.uniqueMap!.set(str, this.uniqueMap!.get(str)! + 1);
      return;
    }

    this.uniqueMap!.set(str, 1);

    const len = str.length;
    if (this.min === null || len < (this.min as string).length) this.min = str;
    if (this.max === null || len > (this.max as string).length) this.max = str;
  }

  override finalize(): SeriesDescriptionResult {
    super.finalize();

    let currentTop: string | null = null;
    let currentTopFrequency: number | null = null;
    for (const [key, count] of this.uniqueMap!.entries()) {
      if (currentTopFrequency == null || count > currentTopFrequency) {
        currentTop = key;
        currentTopFrequency = count;
      }
    }
    this.top = currentTop;
    this.topFrequency = currentTopFrequency;
    this.unique = this.uniqueMap!.size;

    this.uniqueMap = null;

    const result = super.finalize();
    delete result.uniqueMap;
    return result;
  }
}

/**
 * Describes a series of Dates
 */
class DateDescription extends SeriesDescription {
  /** Mean sum as expressed (epoch) */
  mean: number | null = null;

  /**
   * @param what - What is being described
   * @param options - options for describing
   */
  constructor(what: string | null, options?: DescribeOptions) {
    super(what, "Date", options);
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.mean = null;
  }

  /**
   * Whether the value can be described with this
   * @param value - value to check
   * @returns true if the value matches
   */
  static matchesType(value: unknown): boolean {
    return value instanceof Date;
  }

  override check(value: unknown): boolean | void {
    if (FormatUtils.isEmptyValue(value)) return;

    let cleanValue: number;
    if (value instanceof Date) {
      cleanValue = value.getTime();
    } else if (typeof value === "number") {
      cleanValue = value;
    } else {
      throw Error(`describe: Value passed(${value}) - expected to be type:Date`);
    }

    this.count += 1;

    // const oldMean = this.mean;
    this.mean = this.mean == null ? cleanValue : this.mean + (cleanValue - this.mean) / this.count;

    super.checkMinMax(cleanValue);
  }

  override finalize(): SeriesDescriptionResult {
    const result = super.finalize();
    if (!FormatUtils.isEmptyValue(this.min)) result.min = new Date(this.min as number);
    if (!FormatUtils.isEmptyValue(this.max)) result.max = new Date(this.max as number);
    if (!FormatUtils.isEmptyValue(this.mean)) result.mean = new Date(this.mean as number);
    return result;
  }
}

/**
 * Describes a collection of objects.
 *
 * For example, given the following collection:
 *
 * ```
 *  collection = [{
 *      first: 'john',
 *      last: 'doe',
 *      age: 23,
 *      enrolled: new Date('2022-01-01')
 *    }, {
 *      first: 'john',
 *      last: 'doe',
 *      age: 24,
 *      enrolled: new Date('2022-01-03')
 *    }, {
 *      first: 'jan',
 *      last: 'doe',
 *      age: 25,
 *      enrolled: new Date('2022-01-05')
 *    }];
 *  ```
 *
 * Running `utils.describe.describeObjects(collection);` gives:
 *
 *  ```
 *  [{
 *      "count": 3,
 *      "max": "john",
 *      "min": "jan",
 *      "top": "john",
 *      "topFrequency": 2,
 *      "type": "string",
 *      "unique": 2,
 *      "what": "first"
 *    }, {
 *      "count": 3,
 *      "max": "doe",
 *      "min": "doe",
 *      "top": "doe",
 *      "topFrequency": 3,
 *      "type": "string",
 *      "unique": 1,
 *      "what": "last"
 *    }, {
 *      "count": 3,
 *      "max": 25,
 *      "min": 23,
 *      "mean": 24,
 *      "stdDeviation": 0.816496580927726,
 *      "type": "number",
 *      "what": "age"
 *    }, {
 *      "count": 3,
 *      "max": "2022-01-05T00:00:00.000Z",
 *      "min": "2022-01-01T00:00:00.000Z",
 *      "mean": "2022-01-03T00:00:00.000Z",
 *      "type": "Date",
 *      "what": "enrolled"
 *  }]
 *  ```
 *
 *  Or Rendered to a table: `utils.table(results).render()`:
 *
 *  what    |type  |count|max                     |min                     |mean                    |top |topFrequency|unique
 *  --      |--    |--   |--                      |--                      |--                      |--  |--          |--
 *  first   |string|3    |john                    |jan                     |                        |john|2           |2
 *  last    |string|3    |doe                     |doe                     |                        |doe |3           |1
 *  age     |number|3    |25                      |23                      |24                      |    |            |
 *  enrolled|Date  |3    |2022-01-05T00:00:00.000Z|2022-01-01T00:00:00.000Z|2022-01-03T00:00:00.000Z|    |            |
 *
 * Note, if there are multiple child objects within the collection, object.flatten()
 * will bring those values down through dot notation (similar to arrow format) - so they can be better described.
 *
 * @param collection - Collection of objects to be described (or single object)
 * @param options - options to be used
 * @param options.include - string list of fields to include in the description
 * @param options.exclude - string list of fields to exclude in the description
 * @param options.overridePropertyType - object with property:type values (string|number|date|boolean) that will override how that property is parsed
 * @param options.maxRows - max rows to consider before halting
 * @returns collection of descriptions - one for each property
 */
type AnySeriesDescription =
  | SeriesDescription
  | BooleanDescription
  | NumberDescription
  | StringDescription
  | DateDescription;

export function describeObjects(
  collection: Record<string, unknown>[] | Record<string, unknown>,
  options?: DescribeObjectsOptions
): SeriesDescriptionResult[] {
  const cleanCollection = Array.isArray(collection) ? collection : [collection];
  const cleanOptions: DescribeObjectsOptionsInternal = {
    include: options?.include ? new Set(options.include) : null,
    exclude: new Set(options?.exclude || []),
    maxRows: options?.maxRows ?? -1,
    overridePropertyType: options?.overridePropertyType,
  };

  const results: Record<string, AnySeriesDescription> = {};
  const describeOpts: DescribeOptions | undefined = undefined;

  if (cleanOptions.overridePropertyType) {
    ObjectUtils.keys(cleanOptions.overridePropertyType).forEach((key) => {
      const keyValue = cleanOptions.overridePropertyType![key];
      if (keyValue === "string") {
        results[key] = new StringDescription(key, describeOpts);
      } else if (keyValue === "number") {
        results[key] = new NumberDescription(key, describeOpts);
      } else if (keyValue === "date") {
        results[key] = new DateDescription(key, describeOpts);
      } else if (keyValue === "boolean" || keyValue === "bool") {
        results[key] = new StringDescription(key, describeOpts);
      }
    });
  }

  cleanCollection.every((obj, index) => {
    if (cleanOptions.maxRows > 0 && index >= cleanOptions.maxRows) {
      return false;
    }
    ObjectUtils.keys(obj).forEach((key) => {
      const val = obj[key];

      if (cleanOptions.include && !cleanOptions.include.has(key)) {
        // ignore
      } else if (cleanOptions.exclude.has(key)) {
        // ignore
      } else if (FormatUtils.isEmptyValue(val)) {
        // do nothing
      } else {
        if (Object.prototype.hasOwnProperty.call(results, key)) {
          // describer already found
        } else if (StringDescription.matchesType(val)) {
          results[key] = new StringDescription(key);
        } else if (DateDescription.matchesType(val)) {
          results[key] = new DateDescription(key);
        } else if (NumberDescription.matchesType(val)) {
          results[key] = new NumberDescription(key);
        } else if (BooleanDescription.matchesType(val)) {
          results[key] = new BooleanDescription(key);
        } else {
          results[key] = new SeriesDescription(key, typeof val);
        }
        results[key].check(val);
      }
    });
    return true;
  });

  const resultArray = ObjectUtils.keys(results).map((key) => results[key].finalize());
  return resultArray;
}

/**
 * Describes a series of strings
 *
 * @param collection - collection of string values to describe
 * @param options - options for describing strings
 * @returns Description of the list of strings
 */
export function describeStrings(
  collection: string[] | string | (string | null | undefined)[],
  options?: DescribeOptions
): SeriesDescriptionResult {
  const cleanCollection = Array.isArray(collection) ? collection : [collection];
  const result = new StringDescription(null, options);
  cleanCollection.forEach((value) => result.check(value));
  return result.finalize();
}

/**
 * Describes a series of numbers
 *
 * @param collection - Array of numbers
 * @param options - options for describing numbers
 * @returns NumberDescription result
 */
export function describeNumbers(
  collection: number[] | number | (number | null | undefined)[],
  options?: DescribeOptions
): SeriesDescriptionResult {
  const cleanCollection = Array.isArray(collection) ? collection : [collection];
  const result = new NumberDescription(null, options);
  cleanCollection.forEach((value) => result.check(value));
  return result.finalize();
}

/**
 * Describes a series of boolean values.
 *
 * Note, that the following are considered TRUE:
 *
 * * Boolean true
 * * Number 1
 * * String TRUE
 * * String True
 * * String true
 *
 * @param collection - Array of Boolean Values (boolean, string, or number)
 * @param options - options for describing boolean values
 * @returns BooleanDescription result
 * @see format.parseBoolean
 */
export function describeBoolean(
  collection: (boolean | string | number | null | undefined)[] | boolean | string | number,
  options?: DescribeOptions
): SeriesDescriptionResult {
  const cleanCollection = Array.isArray(collection) ? collection : [collection];
  const result = new BooleanDescription(null, options);
  cleanCollection.forEach((value) => result.check(value));
  return result.finalize();
}

/**
 * Describes a series of Date / Epoch Numbers
 *
 * @param collection - Array of Dates / Epoch Numbers
 * @param options - options for describing dates
 * @returns DateDescription result
 */
export function describeDates(
  collection: (Date | number | null | undefined)[] | Date | number,
  options?: DescribeOptions
): SeriesDescriptionResult {
  const cleanCollection = Array.isArray(collection) ? collection : [collection];
  const result = new DateDescription(null, options);
  cleanCollection.forEach((value) => result.check(value));
  return result.finalize();
}

/**
 * Sanity check for standard deviation
 *
 * @param series - collection of numbers
 * @returns standard deviation of the numbers
 */
export function stdDeviation(series: number[]): number {
  if (series.length < 2) return 0.0;

  const sum = series.reduce((result, val) => result + val, 0);
  const avg = sum / series.length;
  const s1 = series.reduce((result, val) => result + (val - avg) ** 2, 0);
  return Math.sqrt(s1 / series.length);
}

