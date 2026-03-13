// import _importFresh from './importFresh.ts';
import { importFresh2 } from './importFresh.ts';
import * as _Aggregate from './aggregate.ts';
import * as _ArrayUtils from './array.ts';
import _Base64 from './base64.ts';
import _chain from './chain.ts';
import * as _Color from './color.ts';
import * as _Describe from './describe.ts';
import * as _Date from './date.ts';
import * as _File from './file.ts';
import * as _Format from './format.ts';
import * as _Group from './group.ts';
import * as _HashMap from './hashMap.ts';
import * as _Jupyter from './jupyter.ts';
import * as _Object from './object.ts';
import _PlantUML from './plantuml.ts';
import * as _Set from './set.ts';
import _TableGenerator from './TableGenerator.ts';
import { table as _newTable } from './TableGenerator.ts';

/**
 * Root module for the application.
 * 
 * There are many things you can do with this library.
 * 
 * @module
 */

/**
 * Library for aggregating values from a collection.
 * @see {@link module:aggregate|aggregate}
 * @see {@link }
 */
export const aggregate = _Aggregate;

export const agg = _Aggregate;

/**
 * Library for working with arrays.
 * @see {@link module:array|array}
 */
export const array = _ArrayUtils;

/**
 * Library for working with base64 strings.
 * @see {@link module:base64|base64}
 */
export const base64 = _Base64;

/**
 * Library for chaining functions.
 * @see {@link module:chain|chain}
 */
export const chain = _chain;

/**
 * Library for working with colors.
 * @see {@link module:color|color}
 */
export const color = _Color;

/**
 * Library for working with dates.
 * @see {@link module:date|date}
 */
export const date = _Date;

/**
 * Library for describing data and objects.
 * @see {@link module:describe|describe}
 */
export const describe = _Describe;

/**
 * Library for working with date ranges.
 * @see {@link module:date.DateRange|date.DateRange}
 */
export const DateRange = _Date.DateRange;


/**
 * Library for working with files.
 * @see {@link module:file|file}
 */
export const file = _File;

/**
 * Library for working with formatting values.
 * @see {@link module:format|format}
 */
export const format = _Format;

/**
 * Library for working with groups of values.
 * @see {@link module:group|group}
 */
export const group = _Group;

/**
 * Library for working with hash maps.
 * @see {@link module:hashMap|hashMap}
 */
export const hashMap = _HashMap;

/**
 * Library for working with local modules (and bypassing the cache)
 * @see {@link module:importFresh|importFresh}
 */
export const importFresh = importFresh2;

/**
 * Rendersing within jupyter for deno
 * @see {@link module:jupyter|jupyter}
 */
export const jupyter = _Jupyter;

/**
 * Library for working with and manipulating objects.
 * @see {@link module:object|object}
 */
export const object = _Object;

/**
 * Library for working with plantuml.
 * @see {@link module:plantuml|plantuml}
 */
export const plantUML = _PlantUML;

/**
 * Library for working with sets.
 * @see {@link module:set|set}
 */
export const set = _Set;

/**
 * Convenience function for creating a table.
 * @see {@link module:table|table}
 */
export const TableGenerator = _TableGenerator;

/**
 * Library for converting data to and from tables.
 * @see {@link module:TableGenerator|tableGenerator}
 */
export const table = _newTable;

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// deno-coverage-ignore-start
if ((import.meta as ImportMeta & { main?: boolean }).main) {
  console.log('see the main documentation: here');
}
// deno-coverage-ignore-stop
