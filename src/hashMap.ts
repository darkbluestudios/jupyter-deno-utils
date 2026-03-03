/**
 * Library for working with JavaScript Maps.
 *
 * @module hashMap
 */

import FormatUtils from "./format.ts";

export function add<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
  map.set(key, value);
  return map;
}

export type GetSetFunctor<V> = (
  value: V | undefined,
  key: unknown,
  map: Map<unknown, unknown>
) => V;

export function getSet<K, V>(
  map: Map<K, V>,
  key: K,
  functor: GetSetFunctor<V>
): Map<K, V> {
  const currentValue = map.has(key) ? map.get(key) : undefined;
  map.set(key, functor(currentValue as V | undefined, key, map as Map<unknown, unknown>));
  return map;
}

export function clone<K, V>(target: Map<K, V>): Map<K, V> {
  if (!(target instanceof Map)) {
    throw new Error("hashMap.clone(targetMap): targetMap must be a Map");
  }
  return new Map(target.entries()) as Map<K, V>;
}

export function union<K, V>(
  targetMap: Map<K, V> | null | undefined,
  additionalMap: Map<K, V> | null | undefined,
  allowOverwrite: boolean = false
): Map<K, V> {
  if (!(targetMap instanceof Map)) {
    return clone(additionalMap as Map<K, V>);
  }
  const result = new Map(targetMap.entries());
  if (!(additionalMap instanceof Map)) {
    return result;
  }
  for (const key of additionalMap.keys()) {
    if (!result.has(key) || allowOverwrite) {
      result.set(key, additionalMap.get(key) as V);
    }
  }
  return result;
}

export function stringify(map: Map<unknown, unknown>, indentation?: number): string {
  return JSON.stringify(map, FormatUtils.mapReplacer, indentation);
}

export function toObject<K extends string | number, V>(
  target: Map<K, V> | null | undefined
): Record<K, V> {
  const results: Record<string, V> = {};
  if (!target) {
    // no-op
  } else if (!(target instanceof Map)) {
    throw new Error("hashMap.toObject(map): must be passed a Map");
  } else {
    [...target.keys()].forEach((key) => {
      results[String(key)] = target.get(key) as V;
    });
  }
  return results as Record<K, V>;
}

export function fromObject(target: Record<string, unknown> | { dataType: string; value: [unknown, unknown][] }): Map<unknown, unknown> {
  if (typeof target !== "object") {
    throw new Error("hashMap.fromObject(object): must be passed an object");
  }
  if (
    "dataType" in target &&
    target.dataType === "Map" &&
    Array.isArray((target as { value: [unknown, unknown][] }).value)
  ) {
    return new Map((target as { value: [unknown, unknown][] }).value);
  }
  return [...Object.keys(target)].reduce(
    (result, key) => add(result, key, (target as Record<string, unknown>)[key]),
    new Map()
  );
}

export function mappingFn<K, V>(
  map: Map<K, V>,
  defaultValue: V | string = "" as V
): (key: K) => V {
  return function mappingFnImpl(key: K): V {
    if (map.has(key)) {
      return map.get(key) as V;
    }
    return defaultValue as V;
  };
}

export function reverse<K, V>(map: Map<K, V>): Map<V, K> {
  return new Map([...map.entries()].map(([key, value]) => [value, key]));
}

const HashMapUtil = {
  add,
  getSet,
  update: getSet,
  clone,
  union,
  stringify,
  toObject,
  fromObject,
  mappingFn,
  reverse
};

export default HashMapUtil;
