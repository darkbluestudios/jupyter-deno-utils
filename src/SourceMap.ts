/**
 * Simple class that extends Map - to include a source and toString fixes.
 * Specifically generated from group.by(collection, ...).
 *
 * @module SourceMap
 */

const addObjectProperty = <T extends Record<string, unknown>>(
  obj: T,
  property: string,
  value: unknown
): T => {
  (obj as Record<string, unknown>)[property] = value;
  return obj;
};

export type ReduceFn<T = unknown, R = Record<string, unknown>> = (
  collection: T[],
  props: Record<string, unknown>
) => R;

export class SourceMap extends Map<unknown, unknown> {
  declare source: string;

  setSource(source: string): void {
    this.source = source;
  }

  getSource(): string {
    return this.source;
  }

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

  override toString(): string {
    return JSON.stringify(this, SourceMap.stringifyReducer);
  }

  toJSON(): Record<string, unknown> {
    return {
      dataType: "SourceMap",
      source: this.source,
      data: Array.from(this.entries())
    };
  }

  reduce<R = Record<string, unknown>>(reduceFn: ReduceFn<unknown, R>): R[] {
    return SourceMap.reduceGroup(this, reduceFn, {}) as R[];
  }

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

  reduceSeparate<R extends Record<string, unknown>>(
    reduceFn: ReduceFn<unknown, R>
  ): Array<Record<string, unknown> & { _aggregateKey: string; _aggregateValue: unknown }> {
    return SourceMap.reduceGroupSeparate(this, reduceFn, {});
  }

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

  objectReduce(reductionObject: Record<string, (collection: unknown[]) => unknown>): unknown[] {
    return SourceMap.objectReduce(this, reductionObject);
  }

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

  map<R>(mapFn: (collection: unknown[], currentObj?: Record<string, unknown>) => R): SourceMap {
    return SourceMap.mapCollection(this, mapFn);
  }

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
