/* eslint-disable max-classes-per-file, class-methods-use-this */

import FormatUtils from "./format.ts";
import ObjectUtils from "./object.ts";

/**
 * Options for how series are described.
 */
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
 * @class
 */
class SeriesDescription {
  what: string | null;
  type: string;
  count: number = 0;
  min: unknown = null;
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

  reset(): void {
    this.count = 0;
    this.max = null;
    this.min = null;
  }

  /**
   * Validates a value is the type expected, or throws if wrong type, or returns false if empty.
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

  checkMinMax(value: number): void {
    if (this.min === null || value < (this.min as number)) {
      this.min = value;
    }
    if (this.max === null || value > (this.max as number)) {
      this.max = value;
    }
  }

  finalize(): SeriesDescriptionResult {
    const result = { ...this } as unknown as SeriesDescriptionResult;
    return result;
  }
}

/**
 * Describes a series of Boolean Values
 */
class BooleanDescription extends SeriesDescription {
  mean: number = 0.0;

  constructor(what: string | null, options?: DescribeOptions) {
    super(what, "boolean", options);
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.mean = 0.0;
  }

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
class NumberDescription extends SeriesDescription {
  mean: number = 0.0;
  m2: number = 0.0;
  stdDeviation: number = 0.0;

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

  static matchesType(value: unknown): boolean {
    return typeof value === "number";
  }

  override check(value: unknown): boolean | void {
    const ok = super.check(value, "number");
    if (!ok) return;
    super.checkMinMax(value as number);

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
class StringDescription extends SeriesDescription {
  uniqueMap: Map<string, number> | null = null;
  unique: number | null = null;
  top: string | null = null;
  topFrequency: number | null = null;

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
  mean: number | null = null;

  constructor(what: string | null, options?: DescribeOptions) {
    super(what, "Date", options);
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.mean = null;
  }

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

    const oldMean = this.mean;
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
 * Describes a collection of objects (one description per property).
 *
 * @param collection - Collection of objects to be described (or single object)
 * @param options - include, exclude, overridePropertyType, maxRows
 * @returns Array of description results, one per property
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
 * Describes a series of strings.
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
 * Describes a series of numbers.
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
 * Describes a series of boolean values (accepts boolean, string, number).
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
 * Describes a series of Date / Epoch numbers.
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
 * Standard deviation of a series of numbers (for testing / sanity check).
 */
export function stdDeviation(series: number[]): number {
  if (series.length < 2) return 0.0;

  const sum = series.reduce((result, val) => result + val, 0);
  const avg = sum / series.length;
  const s1 = series.reduce((result, val) => result + (val - avg) ** 2, 0);
  return Math.sqrt(s1 / series.length);
}

/** Default export: object with all describe APIs (for backward compatibility). */
const DescribeUtil = {
  describeObjects,
  describeStrings,
  describeNumbers,
  describeBoolean,
  describeDates,
  stdDeviation,
  NumberDescription,
  StringDescription,
};

export default DescribeUtil;
