/**
 * Module for standard functionality, such as Array.forEach, Array.filter, Array.map, etc.
 */

/**
 * Type for the function passed in the standard Array.forEach method
 */
export type ForEachFn = ((value: any, value2: any, set: Set<any>) => void)
    & ((value: any, key: any, map: Map<any, any>) => void)
    & ((value: any, index: number, array: any[]) => void)
    & ((value: any) => void);

/**
 * Type for the function passed in the standard Array.filter method
 */
export type FilterFn = ((value: any, value2: any, set: Set<any>) => boolean)
    & ((value: any, key: any, map: Map<any, any>) => boolean)
    & ((value: any, index: number, array: any[]) => boolean)
    & ((value: any) => boolean);

/**
 * Type for the function passed in the standard Array.map method
 */
export type MappableFn = ((value: any, value2: any, set: Set<any>) => any)
    & ((value: any, key: any, map: Map<any, any>) => any)
    & ((value: any, index: number, array: any[]) => any)
    & ((value: any) => any);

/**
 * Function passed to a ReducableFn
 * @ignore
 */
export type ReducableFnFunctor = (accumulator: any, currentValue: any, currentIndex: number, array:any[]) => any

/**
 * Type for functions passed in a standard Array.reduce method
 */
export type ReducableFn = (fn:ReducableFnFunctor, initialValue:any) => any;
