/**
 * Utilities for collating and grouping records.
 *
 * @module group
 */

import { SourceMap } from "./SourceMap.ts";
import ObjectUtils from "./object.ts";

export type ByProp = string | number;
export type IndexFn<T = unknown> = string | ((item: T, offset: number) => unknown);

function by<T extends Record<string, unknown>>(
  collection: T[],
  prop: ByProp,
  ...rest: ByProp[]
): SourceMap {
  const resultMap = new SourceMap();
  if (!collection || !Array.isArray(collection) || collection.length < 1) {
    throw new Error("Group.By:Collection is not an array");
  }
  resultMap.source = String(prop);

  collection.forEach((item) => {
    let val: unknown = item[prop as string];
    if (val instanceof Date) {
      val = val.toISOString();
    }
    if (!resultMap.has(val)) {
      resultMap.set(val, [item]);
    } else {
      (resultMap.get(val) as T[]).push(item);
    }
  });

  if (rest.length > 0) {
    const [nextProp, ...remaining] = rest;
    [...resultMap.keys()].forEach((key) => {
      const newCollection = resultMap.get(key) as T[];
      resultMap.set(key, by(newCollection, nextProp, ...remaining));
    });
  }
  return resultMap;
}

function rollup<T extends Record<string, unknown>, R>(
  collection: T[],
  reducer: (arr: T[]) => R,
  prop: ByProp,
  ...fields: ByProp[]
): SourceMap {
  return by(collection, prop, ...fields).map(reducer as (arr: unknown[]) => R);
}

function separateByFields<T extends Record<string, unknown>>(
  collection: T[],
  ...fields: string[]
): Array<T & { key: string; value: unknown }> {
  if (!collection || !Array.isArray(collection)) {
    throw new Error("SeparateByFields: collection should be an array");
  }
  if (!fields || fields.length < 1) {
    throw new Error("separateByFields: fields are expected");
  }
  return fields.flatMap((field) =>
    collection.map((obj) => ({ ...obj, key: field, value: obj[field] }))
  ) as Array<T & { key: string; value: unknown }>;
}

function index<T extends Record<string, unknown>>(
  collection: T[],
  indexFn: IndexFn<T>
): Map<unknown, T> {
  const resultMap = new Map<unknown, T>();
  if (!collection || !Array.isArray(collection) || collection.length < 1) {
    throw new Error("group.index: Collection is not an array");
  }
  const cleanedIndexFn = ObjectUtils.evaluateFunctionOrProperty(indexFn) as (
    item: T,
    offset: number
  ) => unknown;

  collection.forEach((item, offset) => {
    let val = cleanedIndexFn(item, offset);
    if (val instanceof Date) {
      val = val.toISOString();
    }
    if (resultMap.has(val)) {
      throw new Error(
        `group.index: found duplicate item with index:${val} \n ${JSON.stringify(resultMap.get(val))}`
      );
    }
    resultMap.set(val, item);
  });
  return resultMap;
}

const GroupUtils = {
  by,
  rollup,
  separateByFields,
  index
};

export { SourceMap };
export default GroupUtils;
