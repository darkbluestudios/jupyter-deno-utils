/**
 * Utilities that provide a reduced value from a collection.
 *
 * @module aggregate
 */

import percentile from "percentile";
import ArrayUtils from "./array.ts";
import ObjectUtils from "./object.ts";
import FormatUtils from "./format.ts";

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

function property<T>(
  objectArray: T[] | null | undefined | unknown,
  propertyOrFn?: Accessor<T>
): unknown[] {
  return ObjectUtils.propertyFromList(
    Array.isArray(objectArray) ? objectArray : [],
    propertyOrFn as Parameters<typeof ObjectUtils.propertyFromList>[1]
  );
}

function deferCollection<T, A extends unknown[]>(
  aggregateFn: (collection: T[], ...args: A) => unknown,
  ...rest: A
): (collection: T[]) => unknown {
  if (typeof aggregateFn !== "function") {
    throw Error("deferCollection:aggregateFn should be a function");
  }
  return (collection: T[]) => aggregateFn.apply(undefined, [collection, ...rest]);
}

function extent<T>(collection: T[], accessor?: Accessor<T>): { min: unknown; max: unknown } {
  return {
    min: min(collection, accessor),
    max: max(collection, accessor),
  };
}

function min<T>(collection: T[], accessor?: Accessor<T>): unknown {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return collection.reduce((current: unknown, val: T) => {
    const valEval = (cleanedFunc as (r: T) => unknown)(val);
    return (valEval as number) < (current as number) ? valEval : current;
  }, (cleanedFunc as (r: T) => unknown)(collection[0]));
}

function max<T>(collection: T[], accessor?: Accessor<T>): unknown {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return collection.reduce((current: unknown, val: T) => {
    const valEval = (cleanedFunc as (r: T) => unknown)(val);
    return (valEval as number) > (current as number) ? valEval : current;
  }, (cleanedFunc as (r: T) => unknown)(collection[0]));
}

function sum<T>(collection: T[], accessor?: Accessor<T>): number {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return collection.reduce((current: number, val: T) => current + ((cleanedFunc as (r: T) => unknown)(val) as number), 0);
}

function coalesceDefaultEvaluationFn(
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

function coalesce(
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

function difference<T>(collection: T[], accessor?: Accessor<T>): number {
  const range = extent(collection, accessor);
  return (range.max as number) - (range.min as number);
}

function avgMean<T>(collection: T[], accessor?: Accessor<T>): number {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  return (
    collection.reduce((current: number, val: T) => current + ((cleanedFunc as (r: T) => unknown)(val) as number), 0) /
    collection.length
  );
}

function avgMedian<T>(collection: T[], accessor?: Accessor<T>): number {
  const cleanedFunc = ObjectUtils.evaluateFunctionOrProperty(accessor as Parameters<typeof ObjectUtils.evaluateFunctionOrProperty>[0]);
  const results = (collection.map(cleanedFunc as (r: T) => unknown) as number[]).sort((a, b) => a - b);
  const middle = Math.floor(collection.length / 2);
  return collection.length % 2 === 0
    ? (results[middle - 1] + results[middle]) / 2
    : results[middle];
}

function first<T>(collection: T[], accessor?: Accessor<T>): unknown {
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

function length(collection: unknown[]): number {
  return collection.length;
}

function unique<T>(
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

function distinct<T>(collection: T[], accessor?: Accessor<T>, uniquifierFn?: (v: unknown) => unknown): number {
  return (unique(collection, accessor, uniquifierFn) as unknown[]).length;
}

function countMap<T>(
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

function count<T>(
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

function duplicates<T>(
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

function notIn<T>(collection: T[], accessor: Accessor<T>, targetIterator: Iterable<unknown>): Set<unknown> {
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

function isUnique<T>(collection: T[], accessor?: Accessor<T>): boolean {
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

function percentileFn<T>(
  collection: T[] | null | undefined | unknown,
  accessor: Accessor<T> | undefined,
  pct: number
): number | undefined {
  const list = Array.isArray(collection) ? collection : [];
  const values = ObjectUtils.propertyFromList(list, accessor as Parameters<typeof ObjectUtils.propertyFromList>[1]);
  const cleanPercentile = pct > 0 && pct < 1 ? pct * 100 : pct;
  return (percentile as (p: number, v: number[]) => number)(cleanPercentile, values as number[]);
}

function percentile_01<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 1);
}
function percentile_05<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 5);
}
function percentile_10<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 10);
}
function percentile_25<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 25);
}
function percentile_50<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 50);
}
function percentile_75<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 75);
}
function percentile_90<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 90);
}
function percentile_95<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 95);
}
function percentile_99<T>(collection: T[], accessor?: Accessor<T>): number | undefined {
  return percentileFn(collection, accessor, 99);
}

function topValues<T>(
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

const AggregateUtils = {
  property,
  deferCollection,
  defer: deferCollection,
  extent,
  min,
  max,
  sum,
  coalesceDefaultEvaluationFn,
  coalesce,
  difference,
  avgMean,
  avgMedian,
  first,
  length,
  unique,
  distinct,
  countMap,
  count,
  duplicates,
  notIn,
  isUnique,
  percentile: percentileFn,
  percentile_01,
  percentile_05,
  percentile_10,
  percentile_25,
  percentile_50,
  percentile_75,
  percentile_90,
  percentile_95,
  percentile_99,
  topValues,
};

export default AggregateUtils;
