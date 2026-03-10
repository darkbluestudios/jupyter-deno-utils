/**
 * Utilities for collating and grouping records
 *
 * * Creating Groups of records
 *   * {@link by} - group arrays by common values - for further reduction, etc.
 *   * {@link separateByFields} - duplicate collections by fields (useful for charting)
 * * Indexing records by a unique key
 *   * {@link index} - create a map of records by a unique field (helpful for joining records)
 * * Reducing Collections of records
 *   * {@link rollup} - group and "reduce" to aggregate a collection of records
 *
 * Please also see:
 *
 * * {@link SourceMap} - as it is the result from {@link by}
 * * {@link module:aggregate|aggregate} - a collection of utilities to aggregate / reduce records.
 *
 * See {@link https://stackoverflow.com/questions/31412537/numpy-like-package-for-node|this stackoverflow}
 * for someone asking why couldn't {@link https://numpy.org/doc/stable/user/quickstart.html|Numpy} be written in JavaScript;
 *
 * * D3, specifically: [group / rollup / index](https://observablehq.com/@d3/d3-group)
 * and [flatGroup / flatRollup](https://observablehq.com/@d3/d3-flatgroup)
 *
 * * {@link https://danfo.jsdata.org/|DanfoJS} - a js library heavily inspired by
 * {@link https://pandas.pydata.org/pandas-docs/stable/index.html|Pandas}
 * so someone familiar with Pandas can get up to speed very quickly
 *
 * * {@link https://gmousse.gitbooks.io/dataframe-js/|dataframe-js} -
 * provides an immutable data structure for DataFrames
 * which allows to work on rows and columns with a sql
 * and functional programming inspired api.
 *
 * * {@link https://github.com/stdlib-js/stdlib|StdLib} -
 * is a great library that compiles down to C/C++ level to provide speeds comparable to Numpy.
 *
 * * {@link https://www.npmjs.com/package/numjs|NumJS}
 * is also a great number processing library.
 * It may not be as fast as StdLib, but it can sometimes be easier to use.
 */

import { SourceMap } from "./SourceMap.ts";
import * as ObjectUtils from "./object.ts";

export type ByProp = string | number;
export type IndexFn<T = unknown> = string | ((item: T, offset: number) => unknown);

/**
 * Group a collection into multiple levels of maps.
 *
 * @param collection - Array of objects or two dimensional array
 * @param prop - the key to group the collection by
 * @param rest - the additional keys to group the collection by
 * @returns SourceMap - collection of results with the source as the key used for that level
 *
 * For example:
 *
 * ```
 * initializeWeather = () => [
 *   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
 *   { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
 *   ...
 * ];
 * weather = initializeWeather();
 *
 * utils.group.by(weather, 'city')
 * ```
 *
 * // provides
 *
 * ```
 * SourceMap(3) [Map] {
 *   'Seattle' => [ {...}, {...}, {...} ],
 *   'New York' => [ {...}, {...}, {...} ],
 *   'Chicago' => [ {...}, {...}, {...} ],
 *   source: 'city'
 * }
 * ```
 *
 * or using multiple groups:
 * `utils.group.by(weather, 'month', 'city')`
 *
 * provides nested SourceMaps by month, then city.
 */
export function by<T extends Record<string, unknown>>(
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

/**
 * Group and "Reduce" a collection of records.
 *
 * (Similar to {@link https://observablehq.com/@d3/d3-group|d3 - rollup})
 *
 * @param collection - Collection to be rolled up
 * @param reducer - (Array) => any Function to reduce the group of records down
 * @param prop - The property on the objects to group by
 * @param fields - Additional fields to group by
 * @returns SourceMap - a reduced sourceMap, where only the leaves of the groups are reduced
 * @see {@link SourceMap.map} - Used to reduce or filter records
 * @see {@link by} - to group records
 *
 * @example
 * weather = [
 *   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, dateTime: new Date(2020, 7, 1)  , year: 2020},
 *   ...
 * ];
 *
 * utils.group.rollup(weather, (collection) => collection.length, 'city')
 *
 * // SourceMap(3) [Map] {
 * //   'Seattle' => 3,
 * //   'New York' => 3,
 * //   'Chicago' => 3,
 * //   source: 'city'
 * // }
 *
 * utils.group.rollup(weather, r => r.length, 'city', 'year')
 *
 * //  SourceMap(3) [Map] {
 * //   'Seattle' => SourceMap(2) [Map] { 2020 => 2, 2021 => 1, source: 'year' },
 * //   ...
 * // }
 */
export function rollup<T extends Record<string, unknown>, R>(
  collection: T[],
  reducer: (arr: T[]) => R,
  prop: ByProp,
  ...fields: ByProp[]
): SourceMap {
  return by(collection, prop, ...fields).map(reducer as (arr: unknown[]) => R);
}

/**
 * Vega needs the series on separate objects.
 *
 * Each object then made per group leaf collection, preserving the groups used to make it.
 *
 * The object generated by the function is then merged.
 *
 * See [vega-lite fold transform](https://vega.github.io/vega-lite/docs/fold.html)
 *
 * @example
 * aggregateWeather = utils.group.by(weather, 'city')
 *   .reduce((group) => ({
 *     min: utils.agg.min(group, 'precip'),
 *     max: utils.agg.max(group, 'precip'),
 *     avg: utils.agg.avgMean(group, 'precip')
 *   }));
 *
 * //-- gives
 *
 * [
 *   { city: 'Seattle', min: 0.87, max: 5.31, avg: 2.953 },
 *   { city: 'New York', min: 3.58, max: 4.13, avg: 3.883 },
 *   { city: 'Chicago', min: 2.56, max: 3.98, avg: 3.387 }
 * ]
 *
 * utils.group.separateByFields(aggregateWeather, 'min', 'max', 'avg');
 *
 * //-- gives
 * [
 *   { city: 'Seattle', min: 0.87, max: 5.31, avg: 2.953,  key: 'min', value: 0.87 },
 *   ...
 * ]
 *
 * @param collection - array of objects
 * @param fields - string field name(s) to separate by
 * @returns Array of objects with key and value added for each field
 */
export function separateByFields<T extends Record<string, unknown>>(
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

/**
 * Index a collection of records to a map based on a specific value.
 *
 * Unlike group.by, only one indexing function is accepted.
 *
 * This is very helpful for joining records of two separate groups.
 *
 * @param collection - Collection of objects to index by a specific field or value
 * @param indexFn - the property name or function evaluating to a value for the index
 * @returns Map of index value to record
 *
 * @example
 * athletes = [
 *   {name: "Neymar", sport: "Soccer", nation: "Brazil", earnings: 90},
 *   {name: "LeBron James", sport: "Basketball", nation: "United States",  earnings: 85.5},
 *   {name: "Roger Federer", sport: "Tennis", nation: "Switzerland", earnings: 77.2},
 * ];
 *
 * facts = [
 *   {about: "Neymar", fact: "Neymar is Neymar da Silva Santos Júnior"},
 *   {about: "Roger Federer", fact: "Federer has won 20 Grand Slam men's singles titles"},
 *   {about: "Megan Rapinoe", fact: "Rapinoe was named The Best FIFA Women's Player in 2019"}
 * ];
 *
 * athletesByName = utils.group.index(athletes, 'name');
 * facts.map(({about: name, ...rest}) => ({...rest, name, ...athletesByName.get(name)}));
 *
 * // [
 * //   {
 * //     fact: 'Neymar is Neymar da Silva Santos Júnior',
 * //     name: 'Neymar', sport: 'Soccer', nation: 'Brazil', earnings: 90
 * //   },
 * //   ...
 * // ]
 */
export function index<T extends Record<string, unknown>>(
  collection: T[],
  indexFn: IndexFn<T>
): Map<unknown, T> {
  const resultMap = new Map<unknown, T>();
  if (!collection || !Array.isArray(collection) || collection.length < 1) {
    throw new Error("group.index: Collection is not an array");
  }
  const cleanedIndexFn = ObjectUtils.evaluateFunctionOrProperty(indexFn as ObjectUtils.PropertyOrFn) as (
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

export { SourceMap };
