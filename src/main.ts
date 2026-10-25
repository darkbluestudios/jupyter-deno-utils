/**
 * Root module for the application.
 * 
 * There are many things you can do with this library.
 * 
 * @module
 */

/**
 * Library for aggregating values from a collection.
 */
export * as aggregate from "./aggregate.ts";

/**
 * Alias for {@link aggregate}.
 */
export * as agg from "./aggregate.ts";

/**
 * Library for working with arrays.
 */
export * as array from "./array.ts";

/**
 * Library for working with base64 strings.
 */
export * as base64 from "./base64.ts";

/**
 * Library for chaining functions.
 */
export { default as chain } from "./chain.ts";

/**
 * Library for working with colors.
 */
export * as color from "./color.ts";

/**
 * Library for working with dates.
 */
export * as date from "./date.ts";

/**
 * Library for describing data and objects.
 */
export * as describe from "./describe.ts";

/**
 * Library for working with date ranges.
 */
export { DateRange } from "./date.ts";

/**
 * Library for working with files.
 */
export * as file from "./file.ts";

/**
 * Library for working with formatting values.
 */
export * as format from "./format.ts";

/**
 * Library for working with groups of values.
 */
export * as group from "./group.ts";

/**
 * Library for working with hash maps.
 */
export * as hashMap from "./hashMap.ts";

/**
 * Library for working with local modules (and bypassing the cache)
 */
export { importFresh2 as importFresh } from "./importFresh.ts";

/**
 * Rendersing within jupyter for deno
 */
export * as jupyter from "./jupyter.ts";

/**
 * Library for working with and manipulating objects.
 */
export * as object from "./object.ts";

/**
 * Library for working with plantuml.
 * The exported value is a {@link PlantUMLController} singleton.
 */
export { default as plantuml, PlantUMLController } from "./plantuml.ts";

/**
 * Library for working with sets.
 */
export * as set from "./set.ts";

/**
 * Convenience function for creating a table.
 */
export { default as TableGenerator } from "./TableGenerator.ts";

/**
 * Library for converting data to and from tables.
 */
export { table } from "./TableGenerator.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// deno-coverage-ignore-start
if ((import.meta as ImportMeta & { main?: boolean }).main) {
  console.log('see the main documentation: here');
}
// deno-coverage-ignore-stop
