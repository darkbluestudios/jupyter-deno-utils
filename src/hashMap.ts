/**
 * Library for working with JavaScript hashmaps.
 *
 * * Modifying
 *   * {@link add} - Add a value to a map and return the Map
 *   * {@link getSet} / {@link update} - use a function to get/set a value on a map
 *   * {@link union} - merges two maps and ignores or overwrites with conflicts
 * * Cloning
 *   * {@link clone} - Clones a given Map
 * * Conversion
 *   * {@link stringify} - converts a Map to a string representation
 *   * {@link toObject} - converts a hashMap to an Object
 *   * {@link fromObject} - converts an object's properties to hashMap keys
 *   * {@link reverse} - swaps the key and value in the resulting map
 *
 * Note: JavaScript Maps can sometimes be faster than using Objects,
 * and sometimes slower.
 *
 * (Current understanding is that Maps do better with more updates made)
 *
 * There are many searches such as `javascript map vs object performance`
 * with many interesting links to come across.
 */

import * as FormatUtils from "./format.ts";

/**
 * Set a Map in a functional manner (adding a value and returning the map)
 *
 * @param map - the map to be updated
 * @param key - the key to set
 * @param value - the value to set
 * @returns the updated map
 * @example
 * const objectToMap = { key1: 1, key2: 2, key3: 3 };
 * const keys = [...Object.keys(objectToMap)];
 * // ['key1', 'key2', 'key3'];
 *
 * keys.reduce(
 *  (result, key) => utils.hashMap.add(result, key, objectToMap[key]),
 *  new Map()
 * );
 * // Map([[ 'key1',1 ], ['key2', 2], ['key3', 3]]);
 */
export function add<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
  map.set(key, value);
  return map;
}

/** Functor type for getSet/update: (value, key, map) => newValue */
export type GetSetFunctor<V> = (
  value: V | undefined,
  key: unknown,
  map: Map<unknown, unknown>
) => V;

/**
 * Use this for times where you want to update a value
 *
 * ```
 * key = 'somethingToIncrement';
 * defaultValue = null;
 *
 * const initialMap = new Map([
 *   [key, defaultValue]
 * ]);
 * // Map([[ 'somethingToIncrement', null ]]);
 *
 * const functor = (value) => {
 *   if (!value) return 1;
 *   return value + 1;
 * };
 *
 * utils.hashMap.getSet(initialMap, key, functor);
 * utils.hashMap.getSet(initialMap, key, functor);
 * utils.hashMap.getSet(initialMap, key, functor);
 * utils.hashMap.getSet(initialMap, key, functor);
 * utils.hashMap.getSet(initialMap, key, functor);
 *
 * initialMap.get(key); // 5
 * ```
 *
 * @param map - map to get and set values from
 * @param key - the key to GET and SET the value
 * @param functor - the function called with (value, key, map) - returning the value to set
 * @returns the map
 */
export function getSet<K, V>(
  map: Map<K, V>,
  key: K,
  functor: GetSetFunctor<V>
): Map<K, V> {
  const currentValue = map.has(key) ? map.get(key) : undefined;
  map.set(key, functor(currentValue as V | undefined, key, map as Map<unknown, unknown>));
  return map;
}

/** Alias for {@link getSet} */
export const update = getSet;

/**
 * Clones a Map
 *
 * @param target - Map to clone
 * @returns clone of the target map
 * @example
 * const sourceMap = new Map();
 * sourceMap.set('first', 1);
 * const mapClone = utils.hashMap.clone(sourceMap);
 * mapClone.has('first'); // true
 */
export function clone<K, V>(target: Map<K, V>): Map<K, V> {
  if (!(target instanceof Map)) {
    throw new Error("hashMap.clone(targetMap): targetMap must be a Map");
  }
  return new Map(target.entries()) as Map<K, V>;
}

/**
 * Creates a new map that includes all entries of targetMap, and all entries of additionalMap.
 *
 * If allowOverwrite is true, then values found in additionalMap will take priority in case of conflicts.
 *
 * ```
 * const targetMap = new Map([['first', 'John'], ['amount', 100]]);
 * const additionalMap = new Map([['last', 'Doe'], ['amount', 200]]);
 *
 * utils.hashMap.union(targetMap, additionalMap, true);
 * // Map([['first', 'John'], ['last', 'Doe'], ['amount', 200]]);
 * ```
 *
 * If allowOverwrite is false, then values found in targetMap will take priority in case of conflicts.
 *
 * ```
 * const targetMap = new Map([['first', 'John'], ['amount', 100]]);
 * const additionalMap = new Map([['last', 'Doe'], ['amount', 200]]);
 *
 * utils.hashMap.union(targetMap, additionalMap);
 * utils.hashMap.union(targetMap, additionalMap, false);
 * // Map([['first', 'John'], ['last', 'Doe'], ['amount', 100]]);
 * ```
 *
 * @param targetMap - base map
 * @param additionalMap - map to merge in
 * @param allowOverwrite - whether targetMap is prioritized (false) or additional prioritized (true). Default false.
 * @returns new Map with merged entries
 */
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

/**
 * Serializes a hashMap (plain javascript Map) to a string
 *
 * ```
 * const target = new Map([['first', 1], ['second', 2]]);
 * utils.hashMap.stringify(target);
 * // '{"dataType":"Map","value":[["first",1],["second",2]]}'
 * ```
 *
 * Note, that passing indent will make the results much more legible.
 *
 * ```
 * {
 *   "dataType": "Map",
 *   "value": [
 *     ["first", 1],
 *     ["second", 2]
 *   ]
 * }
 * ```
 *
 * @param map - the Map to be serialized
 * @param indentation - the indentation passed to JSON.stringify
 * @returns JSON.stringify string for the map
 */
export function stringify(map: Map<unknown, unknown>, indentation?: number): string {
  return JSON.stringify(map, FormatUtils.mapReplacer, indentation);
}

/**
 * Converts a map to an object
 *
 * For example, say we have a Map:
 *
 * ```
 * const targetMap = new Map([['first', 1], ['second', 2], ['third', 3]]);
 * ```
 *
 * We can convert it to an Object as follows:
 *
 * ```
 * utils.hashMap.toObject(targetMap)
 * // { first: 1, second: 2, third: 3 };
 * ```
 *
 * @param target - map to be converted
 * @returns object with the properties as the target map's keys
 * @see {@link fromObject} - to reverse the process
 */
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

/**
 * Creates a Map from the properties of an Object
 *
 * For example, say we have an object:
 *
 * ```
 * const targetObject = { first: 1, second: 2, third: 3 };
 * ```
 *
 * We can convert it to a Map as follows:
 *
 * ```
 * utils.hashMap.fromObject(targetObject)
 * // new Map([['first', 1], ['second', 2], ['third', 3]]);
 * ```
 *
 * @param target - target object with properties that should be considered keys
 * @returns converted properties as keys in a new map
 * @see {@link toObject} - to reverse the process
 */
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

/**
 * Simple and safe Map accessing function.
 *
 * ```
 * styleMap = new Map([['1', 'background-color: #FF0000'], ['2', 'background-color: #00FF00']]);
 * styleFn = utils.hashMap.mappingFn(styleMap, 'background-color: #aaaaaa');
 *
 * styleFn('1'); // 'background-color: #FF0000';
 * styleFn('2'); // 'background-color: #00FF00';
 * styleFn('somethingElse'); // 'background-color: #aaaaaa' - because it was not found
 * ```
 *
 * @param map - map to use when checking the subsequent function
 * @param defaultValue - default value to return if key is not found (default '')
 * @returns (key) => map.get(key) || defaultValue
 */
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

/**
 * Flip the key and value of the map
 *
 * ```
 * encodingMap = new Map([[' ', '%20'],['\\n', '%0A'],['\\t', '%09']]);
 * encodingMap.get(' '); // '%20'
 *
 * decodingMap = utils.hashMap.reverse(encodingMap);
 * decodingMap.get('%20'); // ' '
 * ```
 *
 * @param map - map to reverse
 * @returns new map with the keys and values reversed
 */
export function reverse<K, V>(map: Map<K, V>): Map<V, K> {
  return new Map([...map.entries()].map(([key, value]) => [value, key]));
}

