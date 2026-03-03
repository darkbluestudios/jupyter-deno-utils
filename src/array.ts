/**
 * Utility Methods for working with Arrays / Lists
 *
 * similar to {@link module:group}, this is not meant to be exhaustive,
 * only the ones commonly used.
 *
 * @module array
 * @exports array
 */

/** Options for picking rows and/or columns from a 2d array */
export interface PickOptions {
  rows?: number[] | null;
  columns?: number[] | null;
}

/** Result entry from indexify() */
export interface IndexifyEntry {
  entry: unknown;
  section: number[];
  subIndex: number;
}

type SortComparator = (a: unknown, b: unknown) => number;

const SORT_ASCENDING: SortComparator = (a, b) =>
  a === b ? 0 : (a as number) > (b as number) ? 1 : -1;
const SORT_DESCENDING: SortComparator = (a, b) =>
  a === b ? 0 : (a as number) > (b as number) ? -1 : 1;

function createSort(...fields: string[]): SortComparator {
  if (fields.length < 1) {
    return SORT_ASCENDING;
  }
  if (fields.length === 1) {
    if (!fields[0]) {
      return SORT_ASCENDING;
    }
    if (fields[0] === "-") {
      return SORT_DESCENDING;
    }
  }

  const sortFunctions = fields.map((field) => {
    if (field && field.length > 0) {
      if (field[0] === "-") {
        const newField = field.slice(1);
        return (a: Record<string, unknown>, b: Record<string, unknown>) =>
          SORT_DESCENDING(a[newField], b[newField]);
      }
      return (a: Record<string, unknown>, b: Record<string, unknown>) =>
        SORT_ASCENDING(a[field], b[field]);
    }
    return (_a: unknown, _b: unknown) => 0;
  });

  return (a: unknown, b: unknown) => {
    for (const sortFunction of sortFunctions) {
      const sortResult = sortFunction(a as Record<string, unknown>, b as Record<string, unknown>);
      if (sortResult) return sortResult;
    }
    return 0;
  };
}

function peekFirst<T>(targetArray: T[] | null | undefined, defaultVal: T | null = null): T | null {
  return Array.isArray(targetArray) && targetArray.length > 0 ? targetArray[0] : defaultVal;
}

function peekLast<T>(targetArray: T[] | null | undefined, defaultVal: T | null = null): T | null {
  return Array.isArray(targetArray) && targetArray.length > 0
    ? targetArray[targetArray.length - 1]
    : defaultVal;
}

function pickRows(array2d: unknown[][], ...rowIndices: (number | number[])[]): unknown[][] {
  const cleanRowIndices =
    rowIndices.length > 0 && Array.isArray(rowIndices[0]) ? rowIndices[0] : (rowIndices as number[]);
  return cleanRowIndices.map((index) => array2d[index]);
}

function pickColumns(array2d: unknown[][], ...columns: (number | number[])[]): unknown[][] {
  const cleanColumns =
    columns.length > 0 && Array.isArray(columns[0]) ? columns[0] : (columns as number[]);
  return array2d.map((row) => cleanColumns.map((columnIndex) => row[columnIndex]));
}

function pick(array2d: unknown[][], options?: PickOptions | null): unknown[][] {
  const cleanOptions = options || {};
  const { rows = null, columns = null } = cleanOptions;
  let results: unknown[][] = array2d;
  if (rows) {
    results = pickRows(results, rows);
  }
  if (columns) {
    results = pickColumns(results, columns);
  }
  return results;
}

function applyArrayValue(
  collection: Record<string, unknown>[] | Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown>[] | Record<string, unknown> {
  if (!collection) return collection;
  if (!path) return collection;
  const cleanPath = String(path)
    .replace(/\[/g, ".")
    .replace(/\]/g, ".")
    .replace(/[.]+/g, ".")
    .replace(/^[.]+/, "")
    .replace(/[.]$/, "");
  const splitPath = cleanPath.split(".");
  const terminalIndex = splitPath.length - 1;
  splitPath.reduce(
    (currentVal: Record<string, unknown>, prop, currentIndex) => {
      const isLeaf = currentIndex === terminalIndex;
      if (isLeaf) {
        (currentVal as Record<string, unknown>)[prop] = value;
        return collection as unknown as Record<string, unknown>;
      }
      if (!currentVal[prop]) {
        currentVal[prop] = {};
      }
      return currentVal[prop] as Record<string, unknown>;
    },
    collection as unknown as Record<string, unknown>
  );
  return collection;
}

function applyArrayValues(
  collection: Record<string, unknown>[] | Record<string, unknown>,
  path: string,
  valueList: unknown[] | unknown
): Record<string, unknown>[] | Record<string, unknown> {
  if (!collection || !path) {
    return collection;
  }
  const cleanCollection = Array.isArray(collection) ? collection : [collection];
  const cleanValueList = Array.isArray(valueList)
    ? valueList
    : Array(cleanCollection.length).fill(valueList);
  const minLength = Math.min(cleanCollection.length, cleanValueList.length);
  for (let i = 0; i < minLength; i += 1) {
    const obj = cleanCollection[i];
    const val = cleanValueList[i];
    applyArrayValue(obj as Record<string, unknown>, path, val);
  }
  return collection;
}

function size(
  length: number,
  defaultValue?: unknown | ((index: number) => unknown)
): unknown[] {
  if (typeof defaultValue === "function") {
    return new Array(length).fill(null).map((_, index) => (defaultValue as (i: number) => unknown)(index));
  }
  return new Array(length).fill(defaultValue);
}

function arrange(len: number, start = 0, step = 1): number[] {
  return Array.from(new Array(len)).map((_v, i) => i * step + start);
}

function isMultiDimensional(targetArray: unknown): boolean {
  if (!targetArray || !Array.isArray(targetArray)) {
    return false;
  }
  return targetArray.find((v) => Array.isArray(v)) !== undefined;
}

function arrayLength2d(targetArray: unknown[][]): number {
  return (targetArray || []).reduce((max, line) => {
    const len = (line || []).length;
    return len > max ? len : max;
  }, 0);
}

function transpose(matrix: unknown[][] | unknown[]): unknown[][] {
  if (!matrix || !Array.isArray(matrix)) {
    return [];
  }
  if (!Array.isArray(matrix[0])) {
    return (matrix as unknown[]).map((v) => [v]);
  }
  const rows = matrix.length;
  const cols = arrayLength2d(matrix as unknown[][]);
  const result = Array.from(new Array(cols)).map(() => Array.from(new Array(rows)));
  for (let colI = 0; colI < cols; colI += 1) {
    for (let rowI = 0; rowI < rows; rowI += 1) {
      result[colI][rowI] = (matrix as unknown[][])[rowI][colI];
    }
  }
  return result;
}

function reshape(sourceArray: unknown[][] | unknown[], numColumns: number): unknown[][] {
  const results: unknown[][] = [];
  let resultGroup: unknown[] = [];
  const array1d = (sourceArray as unknown[]).flat();
  array1d.forEach((value, index) => {
    const column = index % numColumns;
    if (index > 0 && column === 0) {
      results.push(resultGroup);
      resultGroup = [];
    }
    resultGroup.push(value);
  });
  results.push(resultGroup);
  return results;
}

function clone<T>(target: T): T {
  if (!Array.isArray(target)) return target;
  return target.map((item) => (Array.isArray(item) ? clone(item) : item)) as T;
}

function arrangeMulti(...dimensions: number[]): unknown[] | unknown {
  if (dimensions.length < 1) {
    return [];
  }
  if (dimensions.length === 1) {
    return arrange(dimensions[0]);
  }
  const currentDimension = dimensions[0];
  const remainderDimensions = dimensions.slice(1);
  const childDimensionalValue = arrangeMulti(...remainderDimensions) as unknown[];
  return size(currentDimension, () => clone(childDimensionalValue));
}

function indexify(
  source: unknown[],
  ...sectionIndicatorFunctions: ((entry: unknown) => boolean)[]
): IndexifyEntry[] {
  const functionSignature = "indexify(source, ...sectionIndicatorFunctions)";
  const counters = new Array(sectionIndicatorFunctions.length).fill(0);
  let subIndex = 0;
  if (!Array.isArray(source)) {
    throw new Error(`${functionSignature}: source must be an array`);
  }
  sectionIndicatorFunctions.forEach((fn) => {
    if (typeof fn !== "function") {
      throw new Error(`${functionSignature}: all section indicators passed must be functions`);
    }
  });
  const results = source.map((entry) => {
    let isNewSectionTripped = false;
    sectionIndicatorFunctions.forEach((fn, index) => {
      if (isNewSectionTripped) {
        counters[index] = 0;
      } else {
        isNewSectionTripped = fn(entry) ? true : false;
        if (isNewSectionTripped) {
          counters[index] += 1;
        }
      }
    });
    if (isNewSectionTripped) {
      subIndex = 0;
    } else {
      subIndex += 1;
    }
    return { entry, section: [...counters], subIndex };
  });
  return results;
}

function multiLineSubstr(
  target: string | string[],
  start: number,
  length?: number
): string[] {
  const lines = (() => {
    if (Array.isArray(target)) {
      return target;
    }
    if (typeof target === "string") {
      return target.split(/\n/);
    }
    throw new Error(
      "multiLineSubstr(target, start, length): target is assumed a multi-line string or array of strings"
    );
  })();
  return lines.map((line) => line.substr(start, length));
}

function multiLineSubstring(
  target: string | string[],
  startPosition: number,
  endPosition?: number
): string[] {
  const lines = (() => {
    if (Array.isArray(target)) {
      return target;
    }
    if (typeof target === "string") {
      return target.trim().split(/\n/);
    }
    throw new Error(
      "multiLineSubstring(target, startPosition, endPosition): target is assumed a multi-line string or array of strings"
    );
  })();
  return lines.map((line) => line.substring(startPosition, endPosition));
}

function multiStepReduce<T, U>(
  list: U[],
  fn: (acc: T, val: U, index: number, list: U[]) => T,
  initialValue?: T
): T[] {
  const results: T[] = [initialValue as T];
  let currentResult: T = initialValue as T;
  list.forEach((val, index) => {
    currentResult = fn(currentResult, val, index, list);
    results.push(currentResult);
  });
  return results;
}

function extractFromHardSpacedTable(
  str: string | string[],
  columnWidths: (number | string)[]
): string[][] {
  if (!Array.isArray(columnWidths)) {
    throw new Error("columnWidths passed must be an array of column widths to extract");
  }
  const cleanColumnWidths = columnWidths.map((v: number | string): number => {
    const vType = typeof v;
    if (vType === "string") return (v as string).length;
    if (vType === "number") return v as number;
    throw new Error("Only strings and numbers are accepted as columnWidths");
  });
  const columnStarts = multiStepReduce(cleanColumnWidths, (a: number, b: number) => a + b, 0);
  const columns = cleanColumnWidths.map((value, index) => [columnStarts[index], value]);
  return columns.map(([startPos, columnWidth]) =>
    multiLineSubstr(str, startPos as number, columnWidth as number)
  );
}

/** Iterator that lets you peek ahead without advancing. */
export class PeekableArrayIterator<T> implements Iterator<T> {
  array: T[];
  i: number;
  peek!: Generator<T, undefined, unknown>;

  constructor(source: Iterable<T>, start = -1) {
    this.array = Array.isArray(source) ? source : [...source];
    this.i = start;
  }

  [Symbol.iterator](): this {
    return this;
  }

  next(): IteratorResult<T> {
    const array = this.array;
    const i = this.i;
    this.peek = (function* peek(): Generator<T, undefined, unknown> {
      for (let peekI = i + 2; peekI < array.length; peekI += 1) {
        yield array[peekI];
      }
      return undefined;
    })();
    this.i += 1;
    return { done: this.i >= this.array.length, value: this.array[this.i] };
  }
}

function delayedFn(fn: (...args: unknown[]) => unknown, ...rest: unknown[]): () => unknown {
  return () => {
    const cleanRest = rest.length === 1 && Array.isArray(rest[0]) ? (rest[0] as unknown[]) : rest;
    return fn.apply(undefined, cleanRest);
  };
}

function chainFunctions(
  fn: (...args: unknown[]) => unknown,
  rows: unknown[][]
): Promise<unknown[]> {
  const delayedFunctions = rows.map((val) => delayedFn(fn, val));
  const delayedIterator = delayedFunctions.values();
  const answers: unknown[] = [];
  let isFirstCall = true;
  return new Promise((resolve, reject) => {
    const callNext = (result: unknown) => {
      if (isFirstCall) {
        isFirstCall = false;
      } else {
        answers.push(result);
      }
      try {
        const nextVal = delayedIterator.next();
        const { value: delayedFunction, done } = nextVal;
        if (!done && delayedFunction) {
          const fnResult = (delayedFunction as () => unknown)();
          if (fnResult instanceof Promise) {
            fnResult.then(callNext);
          } else {
            callNext(fnResult);
          }
        } else {
          resolve(answers);
        }
      } catch (err) {
        reject(err);
      }
    };
    callNext(undefined);
  });
}

function asyncWaitThenRun(
  seconds: number,
  fn: (...args: unknown[]) => unknown,
  ...rest: unknown[]
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const results = fn(...rest);
        if (results instanceof Promise) {
          results.then((promiseResults) => resolve(promiseResults));
        } else {
          resolve(results);
        }
      } catch (err) {
        reject(err);
      }
    }, seconds * 1000);
  });
}

function asyncWaitAndChain(
  seconds: number,
  fn: (...args: unknown[]) => unknown,
  rows: unknown[][]
): Promise<unknown[]> {
  const delayedFunctions = rows.map((val) => delayedFn(fn, val));
  const delayedIterator = delayedFunctions.values();
  const answers: unknown[] = [];
  let isFirstCall = true;
  return new Promise((resolve, reject) => {
    const callNext = (result: unknown) => {
      if (isFirstCall) {
        isFirstCall = false;
      } else {
        answers.push(result);
      }
      const nextVal = delayedIterator.next();
      const { value: delayedFunction, done } = nextVal;
      if (!done && delayedFunction) {
        asyncWaitThenRun(seconds, delayedFunction as () => unknown)
          .then(callNext)
          .catch((err) => reject(err));
      } else {
        resolve(answers);
      }
    };
    callNext(undefined);
  });
}

function resize<T>(
  sourceList: T[] | null | undefined,
  length: number,
  defaultValue?: T
): T[] {
  if (!sourceList || !Array.isArray(sourceList)) return [];
  if (length < 1 || sourceList.length < 1) return [];
  const result = new Array(length).fill(defaultValue) as T[];
  sourceList.forEach((val, index) => {
    if (index < length) {
      result[index] = val;
    }
  });
  return result;
}

function zip(
  arrayLeft: Iterable<unknown>,
  arrayRight: Iterable<unknown>,
  ...rest: Iterable<unknown>[]
): unknown[][] {
  if (!arrayLeft || typeof (arrayLeft as { [Symbol.iterator]?: unknown })[Symbol.iterator] !== "function") {
    throw new Error("zip: left must be iterable");
  }
  if (!arrayRight || typeof (arrayRight as { [Symbol.iterator]?: unknown })[Symbol.iterator] !== "function") {
    throw new Error("zip: right must be iterable");
  }
  const cleanLeft = Array.isArray(arrayLeft) ? arrayLeft : [...arrayLeft];
  const cleanRight = Array.isArray(arrayRight) ? arrayRight : [...arrayRight];
  let result: unknown[][];
  if (cleanLeft.length === 0 && cleanRight.length === 0) {
    result = [[]];
  } else if (cleanLeft.length === 0) {
    result = cleanRight.map((val) =>
      Array.isArray(val) ? val : typeof val === "string" ? [val] : [...val]
    );
  } else if (cleanRight.length === 0) {
    result = cleanLeft.map((val) =>
      Array.isArray(val) ? val : typeof val === "string" ? [val] : [...val]
    );
  } else {
    const zipLen = Math.min(cleanLeft.length, cleanRight.length);
    result = new Array(zipLen).fill(0) as unknown[][];
    for (let i = 0; i < zipLen; i += 1) {
      const leftVal = cleanLeft[i];
      const rightVal = cleanRight[i];
      const leftValArray = Array.isArray(leftVal);
      const rightValArray = Array.isArray(rightVal);
      if (leftValArray && rightValArray) {
        result[i] = [...leftVal, ...rightVal];
      } else if (leftValArray) {
        result[i] = [...leftVal, rightVal];
      } else if (rightValArray) {
        result[i] = [leftVal, ...rightVal];
      } else {
        result[i] = [leftVal, rightVal];
      }
    }
  }
  if (rest && rest.length > 0) {
    const [newRight, ...newRest] = rest;
    result = zip(result, newRight, ...newRest);
  }
  return result;
}

const ArrayUtils = {
  SORT_ASCENDING,
  SORT_DESCENDING,
  createSort,
  peekFirst,
  peekLast,
  pickRows,
  pickColumns,
  pick,
  extract: pick,
  applyArrayValue,
  applyArrayValues,
  size,
  arrange,
  arange: arrange,
  isMultiDimensional,
  arrayLength2d,
  transpose,
  reshape,
  clone,
  arrangeMulti,
  arangeMulti: arrangeMulti,
  indexify,
  multiLineSubstr,
  multiLineSubstring,
  multiStepReduce,
  extractFromHardSpacedTable,
  PeekableArrayIterator,
  delayedFn,
  chainFunctions,
  asyncWaitAndChain,
  resize,
  zip,
};

export { createSort };
export default ArrayUtils;
