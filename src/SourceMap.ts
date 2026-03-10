/**
 * Simple class that extends Map - to include a source and toString fixes.
 *
 * Specifically generated from {@link group.by|group.by(collection, ...)}
 *
 * * Reduce Group Magic
 *   * {@link SourceMap.reduce} - Reduce the groups held within to objects - for reports
 *   * {@link SourceMap.reduceSeparate} - Reduce the groups to objects - for charts
 *   * {@link SourceMap.map} - Map the leaf (array) collection to allow for sorting, filtering, reducing, etc.
 * * Source functionality
 *   * {@link SourceMap.getSource} - get the source of how the group was made
 *   * {@link SourceMap.setSource} - specify the source of how the group was made
 * * Fixing Map toString / JSON.stringify common issues
 *   * {@link SourceMap.stringifyReducer} - JSON.stringify(map, reducer) - to allow maps to convert
 *   * {@link SourceMap.toJSON} - Corrected toJSON functionality, so it works as expected
 *   * {@link SourceMap.toString} - Corrected toString functionality, so it works as expected
 */

const addObjectProperty = <T extends Record<string, unknown>>(
  obj: T,
  property: string,
  value: unknown
): T => {
  (obj as Record<string, unknown>)[property] = value;
  return obj;
};

/** Function type for reduce: (collection, props) => Object */
export type ReduceFn<T = unknown, R = Record<string, unknown>> = (
  collection: T[],
  props: Record<string, unknown>
) => R;

export class SourceMap extends Map<unknown, unknown> {
  /** The property the map was sourced from */
  declare source: string;

  /**
   * Specify the source
   * @param source - the source property name
   */
  setSource(source: string): void {
    this.source = source;
  }

  /**
   * Getter for the source
   * @returns the source property name
   */
  getSource(): string {
    return this.source;
  }

  /**
   * Use this for a reducer for Maps if ever needed.
   *
   * (NOTE: SourceMap already uses this where needed, you only would use this for normal maps)
   *
   * `JSON.stringify(new Map())` doesn't work well, it just returns `Map()`
   * - regardless of what it contains
   *
   * instead use something like this:
   *
   * ```
   * const toBeStringified = { value: 'a', map: new Map() };
   * const stringifyReducer = utils.SourceMap.stringifyReducer;
   * JSON.stringify(toBeStringified, stringifyReducer);
   * // returns {"value":"a","map":{"dataType":"Map","value":[["A",1],["B",2]]}}
   *
   * const standardMap = new Map([['a', 1], ['b', 2]]);
   * JSON.stringify(standardMap, stringifyReducer);
   * // returns {"dataType":"Map","value":[["a",1],["b",2]]}
   * ```
   *
   * @param _key - the name of the property
   * @param value - the value
   * @returns serializable object for Map/SourceMap, or value for other types
   */
  static stringifyReducer(_key: string, value: unknown): unknown {
    if (value instanceof SourceMap) {
      return {
        dataType: "SourceMap",
        source: value.source,
        data: Array.from(value.entries())
      };
    }
    if (value instanceof Map) {
      return {
        dataType: "Map",
        value: Array.from(value.entries())
      };
    }
    return value;
  }

  /**
   * toString() override to use the stringify reducer.
   *
   * Now you can use `String(sourceMapInstance)` and it will work correctly.
   *
   * @returns JSON string representation
   */
  override toString(): string {
    return JSON.stringify(this, SourceMap.stringifyReducer);
  }

  /**
   * toJSON() override.
   *
   * Now you can use `JSON.stringify(sourceMapInstance)` and it will work correctly
   * or within Jupyter / iJavaScript: `$$.json(sourceMapInstance)` to explore values in collapsing folders.
   *
   * @returns object with dataType, source, and data
   */
  toJSON(): Record<string, unknown> {
    return {
      dataType: "SourceMap",
      source: this.source,
      data: Array.from(this.entries())
    };
  }

  /**
   * Reduces a SourceMap by groups, to a collection of objects that can be printed.
   *
   * Note that the ReduceFn is called at the grouped collection of records level,
   * not the entire collection.
   *
   * This can be very helpful when working with tables.
   *
   * @param reduceFn - (collection, props) => Object - Function that reduces the collection to an object
   * @returns Array of objects merged with the parent group attributes and reduceFn result
   * @see {@link reduceSeparate} - for separate objects - useful for vega charts
   */
  reduce<R = Record<string, unknown>>(reduceFn: ReduceFn<unknown, R>): R[] {
    return SourceMap.reduceGroup(this, reduceFn, {}) as R[];
  }

  /**
   * Reduces a SourceMap by groups - static implementation.
   *
   * @param sourceMap - SourceMap or array to reduce
   * @param reduceFn - (collection, currentObj) => Object
   * @param currentObj - accumulated props from parent levels
   * @returns Array of reduced objects
   */
  static reduceGroup<T, R>(
    sourceMap: SourceMap | unknown[],
    reduceFn: (collection: unknown[], currentObj: Record<string, unknown>) => R,
    currentObj: Record<string, unknown> = {}
  ): R[] {
    if (sourceMap instanceof SourceMap) {
      return Array.from(sourceMap.entries()).flatMap(([key, values]) =>
        SourceMap.reduceGroup(
          values as SourceMap | unknown[],
          reduceFn,
          addObjectProperty(
            { ...currentObj },
            sourceMap.source,
            key
          )
        )
      ) as R[];
    }
    if (!Array.isArray(sourceMap)) {
      throw new Error("reduceGroups only works on arrays or sourceMaps");
    }
    return [{ ...currentObj, ...reduceFn(sourceMap, currentObj) }] as R[];
  }

  /**
   * Reduces, but puts each aggregate value on a separate record.
   *
   * **This is particularly useful for charting vega, as series must be on separate objects.**
   *
   * Each object then made per group leaf collection, preserving the groups used to make it.
   *
   * @param reduceFn - (collection, props) => Object - Function that reduces the collection to an object
   * @returns Array of objects with _aggregateKey and _aggregateValue
   * @see {@link reduce} - for a compact object with multiple aggregate values, useful for tables
   */
  reduceSeparate<R extends Record<string, unknown>>(
    reduceFn: ReduceFn<unknown, R>
  ): Array<Record<string, unknown> & { _aggregateKey: string; _aggregateValue: unknown }> {
    return SourceMap.reduceGroupSeparate(this, reduceFn, {});
  }

  /**
   * Reduces, but puts each aggregate value on a separate record - static implementation.
   *
   * This is particularly useful for charting vega, as series must be on separate objects.
   *
   * @param sourceMap - SourceMap or array to reduce
   * @param reduceFn - (collection, currentObj) => Object
   * @param currentObj - values to inject into the results
   * @returns Array of objects with _aggregateKey and _aggregateValue
   */
  static reduceGroupSeparate(
    sourceMap: SourceMap | unknown[],
    reduceFn: ReduceFn,
    currentObj: Record<string, unknown> = {}
  ): Array<Record<string, unknown> & { _aggregateKey: string; _aggregateValue: unknown }> {
    if (sourceMap instanceof SourceMap) {
      return Array.from(sourceMap.entries()).flatMap(([key, values]) =>
        SourceMap.reduceGroupSeparate(
          values as SourceMap | unknown[],
          reduceFn,
          addObjectProperty({ ...currentObj }, sourceMap.source, key)
        )
      );
    }
    if (!Array.isArray(sourceMap)) {
      throw new Error("reduceGroups only works on arrays or sourceMaps");
    }
    return Object.entries(reduceFn(sourceMap, currentObj)).map(
      ([_aggregateKey, _aggregateValue]) => ({
        ...currentObj,
        _aggregateKey,
        _aggregateValue
      })
    );
  }

  /**
   * Convenience function for reduceGroup.
   *
   * Instead of providing a function to reduce, provide an object with each property as (collection) => result
   *
   * @param reductionObject - each property as {(collection) => result}
   * @returns Array of objects merged with the parent group attributes and reduceFn result
   * @see SourceMap.reduceGroup
   * @deprecated - not as much of a convenience, and causes confusion
   */
  objectReduce(reductionObject: Record<string, (collection: unknown[]) => unknown>): unknown[] {
    return SourceMap.objectReduce(this, reductionObject);
  }

  /**
   * Convenience function for reduceGroup - static implementation.
   *
   * Instead of providing a function to reduce, provide an object with each property as (collection) => result
   *
   * @param sourceMap - source to be reduced by group
   * @param obj - each property as {(collection) => result}
   * @returns Array of objects merged with the parent group attributes and reduceFn result
   * @see SourceMap.reduceGroup
   * @deprecated - not as much of a convenience, and causes confusion
   */
  static objectReduce(
    sourceMap: SourceMap,
    obj: Record<string, (collection: unknown[]) => unknown>
  ): unknown[] {
    if (typeof obj !== "object") {
      throw new Error("reducerObject: Expecting an object as the argument");
    }
    const entities = Object.entries(obj).filter(([_, val]) => {
      if (typeof val === "function") return true;
      throw new Error(
        "generateObjectFn: all properties should be {(collection) => result}"
      );
    });
    const reduceFn = (collection: unknown[]) =>
      Object.fromEntries(entities.map(([key, fn]) => [key, fn(collection)]));
    return SourceMap.reduceGroup(sourceMap, reduceFn);
  }

  /**
   * Maps a collection within the sourceMap by a function.
   *
   * Note that this only maps the leaf collection of values, not the intermediary levels.
   *
   * This can be useful for: sorting the leaf collections, filtering results,
   * reducing values, or combinations of the three or more.
   *
   * @param mapFn - (array, collectionProps?) => any - Function to apply to the leaf collections (arrays)
   * @returns New SourceMap with the leaf collections updated to the results from mapFn
   *
   * @example
   * utils.group.by(weather, 'city').map(collection => collection.length);
   * // SourceMap { 'Seattle' => 3, 'New York' => 3, 'Chicago' => 3, source: 'city' }
   *
   * utils.group.by(weather, 'city')
   *   .map(collection => collection.filter(r => r.year === 2020))
   *   .map(collection => collection.length);
   * // SourceMap { 'Seattle' => 2, 'New York' => 2, 'Chicago' => 2, source: 'city' }
   */
  map<R>(mapFn: (collection: unknown[], currentObj?: Record<string, unknown>) => R): SourceMap {
    return SourceMap.mapCollection(this, mapFn);
  }

  /**
   * Implementation for map - recursively maps leaf collections.
   *
   * @param sourceMap - SourceMap to map
   * @param mapFn - function to apply to leaf arrays
   * @param currentObj - accumulated props from parent levels
   * @returns new SourceMap with mapped values
   */
  static mapCollection(
    sourceMap: SourceMap,
    mapFn: (collection: unknown[], currentObj?: Record<string, unknown>) => unknown,
    currentObj: Record<string, unknown> = {}
  ): SourceMap {
    const result = new SourceMap();
    result.source = sourceMap.source;
    for (const [key, value] of sourceMap.entries()) {
      if (value instanceof Map) {
        result.set(
          key,
          SourceMap.mapCollection(
            value as SourceMap,
            mapFn,
            addObjectProperty({ ...currentObj }, result.source, key)
          )
        );
      } else {
        result.set(key, mapFn(value as unknown[], currentObj));
      }
    }
    return result;
  }
}
