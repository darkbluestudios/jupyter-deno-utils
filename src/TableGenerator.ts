//-- TODO: review stringbuilder for large datasets
//-- review the api from observable
//-- https://observablehq.com/@observablehq/input-table

import * as FormatUtils from "./format.ts";
import * as ObjectUtils from "./object.ts";
import * as ArrayUtils from "./array.ts";
import * as jupyter from './jupyter.ts';
import { type JupyterRenderObject, type JupyterRichContent, JupyterDisplaySymbol } from "./types/jupyter.ts";

const printValue = FormatUtils.printValue;

export interface ContextObj {
  renderSymbol(mimeType:string, value:string): JupyterRenderObject;
  console(msg:string):void;
  html(htmlText:string):JupyterRenderObject;
  markdown(markdownText:string):JupyterRenderObject;
}

export const CONTEXT:ContextObj = {
  renderSymbol(mimeType: string, value: string) {
    return jupyter.renderMimeType(mimeType, value);
  },
  console(msg: unknown) {
    const g = typeof globalThis !== "undefined" ? (globalThis as unknown as { console?: { log?: (m: unknown) => void } }) : null;
    const c = g?.console;
    if (c && typeof c.log === "function") c.log(msg);
  },
  html(htmlText: string) {
    return jupyter.html(htmlText);
  },
  markdown(markdownText: string) {
    return jupyter.markdown(markdownText);
  }
};

/** Result of prepare() / generateArray(): headers and rows. */
export interface TableData {
  headers: string[];
  data: unknown[][];
}

/** Context passed to formatter and style callbacks. */
export interface FormatterContext {
  value: unknown;
  columnIndex: number;
  property: string;
  rowIndex: number;
  record: Record<string, unknown>;
}

/** Context for styleColumn: (value, context) => css string. */
export interface StyleColumnContext {
  value: unknown;
  columnHeader: string;
  columnIndex: number;
  rowIndex: number;
  row: unknown[];
  record: Record<string, unknown>;
}

/** Context for styleRow / styleCell. */
export interface StyleRowContext {
  rowIndex: number;
  row: unknown[];
  record: Record<string, unknown>;
  columnIndex?: number;
}

export interface StyleCellContext extends FormatterContext {
  columnHeader: string;
  row: unknown[];
}

export type PrintOptions = Parameters<typeof printValue>[1];

type AugmentFn = (record: Record<string, unknown>) => Record<string, unknown>;
type FilterFn = (row: Record<string, unknown>) => boolean;
type FormatterFn = (ctx: FormatterContext) => unknown;
type StyleRowFn = (ctx: StyleRowContext) => string;
type StyleCellFn = (ctx: StyleCellContext) => string;
type StyleColumnMap = Record<string, (value: unknown, context: StyleColumnContext) => string>;

/**
 * Generates and or Renders Tables (Markdown, CSS, HTML, or plain arrays)
 *
 * NOTE: `utils.table(...)` is the same as `new utils.TableGenerator(...)`
 *
 * For example:
 *
 * ```
 * utils.table(cars).limit(2).render();
 * ```
 *
 * With many options: sort, limit, augment, columns, format, labels, styleColumn, styleRow, render
 *
 * Note that sticky headers are available when using {@link render}. By default, height is `50vh` - configurable via {@link height}.
 *
 * # Types of calls:
 *
 * * constructor - new TableGenerator(object[])
 * * change the columns and headers - columns(), columnsToExclude(), labels()
 * * augment and change the values - format(), formatterFn(), printOptions(), augment()
 * * sort and limit - filter(), limit(), offset(), sortFn(), sort()
 * * transpose - transpose()
 * * style - styleTable(), styleHeader(), styleRow(), styleColumn(), styleCell(), border(), height()
 * * generate output - generateHTML(), generateMarkdown(), generateCSV(), generateTSV(), generateArray(), generateArray2(), generateObjectCollection(), generateDataFrameObject()
 * * render in jupyter - render(), renderCSV(), renderTSV(), renderMarkdown()
 */
class TableGenerator {
  #data: Record<string, unknown>[] = [];
  #augmentFn: AugmentFn | null = null;
  #borderCSS = "";
  #columns: string[] | null = null;
  #columnsToExclude: string[] = [];
  #fetch: Record<string, string> | null = null;
  #filterFn: FilterFn | null = null;
  #formatterFn: FormatterFn | null = null;
  #height = "50vh";
  #labels: Record<string, string> = {};
  #limit = 0;
  #offset = 0;
  #printOptions: PrintOptions | null = null;
  #sortFn: ((a: unknown, b: unknown) => number) | null = null;
  #styleTable = "";
  #styleHeader = "";
  #styleRow: StyleRowFn | null = null;
  #styleColumn: StyleColumnMap | null = null;
  #styleCell: StyleCellFn | null = null;
  #isTransposed = false;

  /**
   * @param data - collection of objects (or DataFrame-style object with 1d arrays per property)
   */
  constructor(data?: Record<string, unknown>[] | Record<string, unknown[]> | null) {
    this.reset();
    if (data) {
      this.data(data);
    }
  }

  /** Resets the generator to initial state */
  reset(): this {
    this.#data = [];
    this.#augmentFn = null;
    this.#borderCSS = "";
    this.#columns = null;
    this.#columnsToExclude = [];
    this.#fetch = null;
    this.#filterFn = null;
    this.#formatterFn = null;
    this.#height = "50vh";
    this.#labels = {};
    this.#limit = 0;
    this.#offset = 0;
    this.#printOptions = null;
    this.#sortFn = null;
    this.#styleTable = "";
    this.#styleHeader = "";
    this.#styleRow = null;
    this.#styleColumn = null;
    this.#styleCell = null;
    this.#isTransposed = false;
    return this;
  }

  /**
   * Assigns the data to be used in generating the table.
   * @param col - collection of objects
   * @returns chainable instance
   */
  data(col?: Record<string, unknown>[] | Record<string, unknown[]> | null): this {
    this.#data = Array.isArray(col) ? col : [];
    return this;
  }

  /**
   * Assigns the data by importing a collection of objects.
   * Syntactic sugar - data is expected as a collection of objects.
   * @param data - collection of objects
   * @returns chainable instance
   */
  fromObjectCollection(data: Record<string, unknown>[]): this {
    this.data(data);
    return this;
  }

  /**
   * Assigns the data by importing a 2 dimensional array.
   * If headers are not provided, the first row is assumed to be headers.
   * @param arrayCollection - 2d array
   * @param headers - optional header row (if provided, first row of data is not used as headers)
   * @returns chainable instance
   */
  fromArray(arrayCollection?: unknown[][] | null, headers?: string[] | null): this {
    if (!arrayCollection) {
      this.data(null);
      return this;
    }
    this.data(ObjectUtils.objectCollectionFromArray(arrayCollection, headers) as Record<string, unknown>[]);
    return this;
  }

  /**
   * Assigns the data from a single 1 dimensional array.
   * Syntactic sugar - wraps the 1d array into a 2d array with '_' as the column.
   * @param array1d - 1d array of values
   * @returns chainable instance
   */
  fromList(array1d?: unknown[] | null): this {
    if (!array1d) {
      this.data(null);
      return this;
    }
    this.data(array1d.map((v) => ({ _: v })) as Record<string, unknown>[]);
    return this;
  }

  /**
   * Initializes the data with an object holding 1d tensor properties (Danfo.js compatible).
   * Each property is an array of values for that column.
   * @param dataFrameObject - object with property: array of values
   * @returns chainable instance
   */
  fromDataFrameObject(dataFrameObject?: Record<string, unknown[]> | null): this {
    if (!dataFrameObject) {
      this.data(null);
      return this;
    }
    this.data(ObjectUtils.objectCollectionFromDataFrameObject(
      dataFrameObject as Record<string, unknown[]>
    ) as Record<string, unknown>[]);
    return this;
  }

  /**
   * Augments data with additional fields (non-destructively).
   * Each property in obj is a function (row) => value that adds a new column.
   * @param obj - object with newProperty: (record) => value
   * @returns chainable instance
   */
  augment(obj: Record<string, (record: Record<string, unknown>) => unknown> | null): this {
    if (!obj) {
      this.#augmentFn = null;
      return this;
    }
    const augmentKeys = Object.getOwnPropertyNames(obj);
    augmentKeys.forEach((key) => {
      if (typeof (obj as Record<string, unknown>)[key] !== "function") {
        throw Error(`Formatter properties must be functions. [${key}]`);
      }
    });
    this.#augmentFn = (record: Record<string, unknown>) => {
      const newRecord = { ...record };
      augmentKeys.forEach((key) => {
        newRecord[key] = (obj as Record<string, (r: Record<string, unknown>) => unknown>)[key](record);
      });
      return newRecord;
    };
    return this;
  }

  /**
   * Convenience function to set a border on the Data Cells.
   * Only applies when rendering HTML or generating HTML.
   * @param borderCSS - CSS string (e.g. '1px solid #aaa') or true for default
   * @returns chainable instance
   */
  border(borderCSS: string | boolean | null): this {
    let cleanCSS = "";
    if (borderCSS === true) {
      cleanCSS = "border: 1px solid #aaa";
    } else if (borderCSS) {
      cleanCSS = `border: ${borderCSS}`;
    }
    this.#borderCSS = cleanCSS;
    return this;
  }

  /**
   * Applies an optional set of columns / properties to render.
   * If not provided, all fields are rendered. If provided, only listed fields.
   * @param values - array of field names (or first field + rest)
   * @param rest - additional field names
   * @returns chainable instance
   */
  columns(values: string | string[], ...rest: string[]): this {
    if (typeof values === "string") {
      this.#columns = [values, ...rest];
    } else if (Array.isArray(values)) {
      this.#columns = values;
    } else {
      throw new Error("columns expects array of strings");
    }
    return this;
  }

  /**
   * Applies an optional set of columns / properties not to render.
   * @param values - array of field names to exclude
   * @param rest - additional field names
   * @returns chainable instance
   */
  columnsToExclude(values: string | string[], ...rest: string[]): this {
    if (typeof values === "string") {
      this.#columnsToExclude = [values, ...rest];
    } else if (Array.isArray(values)) {
      this.#columnsToExclude = values;
    } else {
      throw new Error("columns to exclude expects array of strings");
    }
    return this;
  }

  /**
   * Filter the dataset. Function returns true to include the row.
   * @param filterFn - (row) => boolean
   * @returns chainable instance
   */
  filter(filterFn: FilterFn): this {
    this.#filterFn = filterFn;
    return this;
  }

  /**
   * Object with translation functions for matching properties.
   * Only matching properties are changed - all others left alone.
   * Supports (value) => result, or 'string'|'number'|'boolean' for type conversion.
   * @param obj - property: (value) => result or 'String'|'Number'|'Boolean'
   * @returns chainable instance
   */
  format(obj: Record<string, unknown> | null): this {
    if (!obj) {
      this.#formatterFn = null;
      return this;
    }
    const cleanedFormatter = FormatUtils.prepareFormatterObject(obj);
    const fnMap = new Map<string, (v: unknown) => unknown>();
    Object.getOwnPropertyNames(cleanedFormatter).forEach((key) => {
      fnMap.set(key, cleanedFormatter[key] as (v: unknown) => unknown);
    });
    this.#formatterFn = ({ value, property }: FormatterContext) =>
      fnMap.has(property) ? fnMap.get(property)!(value) : value;
    return this;
  }

  /** Legacy version of format - delegates to format */
  formatter(obj: Record<string, unknown> | null): this {
    return this.format(obj);
  }

  /**
   * Function that can format a value for a given row, cell.
   * (value, columnIndex, property, rowIndex, record) => newValue
   * @param fn - formatter receiving FormatterContext
   * @returns chainable instance
   */
  formatterFn(fn: FormatterFn): this {
    this.#formatterFn = fn;
    return this;
  }

  /**
   * Set the css max-height of the table when calling render. Defaults to '50vh'.
   * @param maxHeightCSS - css for max-height
   * @returns chainable instance
   */
  height(maxHeightCSS: string): this {
    this.#height = maxHeightCSS;
    return this;
  }

  /**
   * The number of rows to limit. 10 = ascending 10 records. -10 = descending 10 records.
   * @param limitRecords - 0 for all, + for ascending, - for descending
   * @returns chainable instance
   */
  limit(limitRecords: number): this {
    this.#limit = limitRecords;
    return this;
  }

  /**
   * The number of rows to skip before showing results. 10 = skip first 10. -10 = only show last 10.
   * @param offsetRecords - rows to skip
   * @returns chainable instance
   */
  offset(offsetRecords: number): this {
    this.#offset = offsetRecords;
    return this;
  }

  /**
   * Sets alternative labels for column headers.
   * @param labelsObj - property: displayLabel
   * @returns chainable instance
   */
  labels(labelsObj: Record<string, string>): this {
    this.#labels = labelsObj;
    return this;
  }

  /**
   * Options for printValue when rendering (collapseObjects, dateFormat, etc.)
   * @param options - PrintOptions for value rendering
   * @returns chainable instance
   */
  printOptions(options: PrintOptions): this {
    this.#printOptions = options;
    return this;
  }

  /**
   * Applies a standard array sort function to the data.
   * @param fn - sort function (a, b) => number
   * @returns chainable instance
   */
  sortFn(fn: (a: unknown, b: unknown) => number): this {
    this.#sortFn = fn;
    return this;
  }

  /**
   * Convenience: creates a sort based on properties. Prefix with '-' for descending.
   * @param rest - field names (e.g. 'Year', '-Displacement', 'Name')
   * @returns chainable instance
   */
  sort(...rest: string[]): this {
    return this.sortFn(ArrayUtils.createSort(...rest));
  }

  /**
   * Defines the style to render on the table. Only used for render/generateHTML.
   * @param value - css string (e.g. 'border:1px solid #000')
   * @returns chainable instance
   */
  styleTable(value: string | null): this {
    this.#styleTable = value ?? "";
    return this;
  }

  /**
   * Override the styles for the header row. Only used for render/generateHTML.
   * @param value - css string (e.g. 'font-weight: bold')
   * @returns chainable instance
   */
  styleHeader(value: string | null): this {
    this.#styleHeader = value ?? "";
    return this;
  }

  /**
   * Function to apply style to a row. (rowIndex, row, record) => css string
   * @param styleFn - (ctx) => css string
   * @returns chainable instance
   */
  styleRow(styleFn: StyleRowFn | null): this {
    this.#styleRow = styleFn;
    return this;
  }

  /**
   * Function to apply style per column. Object with property: (value, context) => css string
   * @param styleObj - columnHeader: (value, context) => css string
   * @returns chainable instance
   */
  styleColumn(styleObj: StyleColumnMap | null): this {
    if (!styleObj) {
      this.#styleColumn = null;
      return this;
    }
    if (typeof styleObj !== "object") {
      throw Error("styleColumn(styleObj): expects an object with properties matching the column LABELs");
    }
    this.#styleColumn = styleObj;
    return this;
  }

  /**
   * Function to apply style per cell. (value, columnIndex, rowIndex, row, record) => css string
   * @param styleFn - (ctx) => css string
   * @returns chainable instance
   */
  styleCell(styleFn: StyleCellFn | null): this {
    this.#styleCell = styleFn;
    return this;
  }

  /**
   * Transposes (flips along the diagonal) prior to output. Handy for wide, short tables.
   * @returns chainable instance
   */
  transpose(): this {
    this.#isTransposed = true;
    return this;
  }

  /** Prepares the data prior to any rendering (sort, augment, filter, columns, limit, offset, transpose) */
  prepare(): TableData {
    let cleanCollection: Record<string, unknown>[] = this.#data || [];
    if (this.#sortFn) {
      cleanCollection = cleanCollection.sort(this.#sortFn as (a: Record<string, unknown>, b: Record<string, unknown>) => number);
    }
    if (this.#augmentFn) {
      cleanCollection = cleanCollection.map(this.#augmentFn);
    }
    if (this.#filterFn) {
      cleanCollection = cleanCollection.filter(this.#filterFn);
    }
    let keys = this.#columns || (ObjectUtils.keys(cleanCollection) as string[]);
    keys = keys.filter((key) => this.#columnsToExclude.indexOf(key) === -1);
    const cleanFormatter: FormatterFn = this.#formatterFn
      ? this.#formatterFn
      : ({ value }: FormatterContext) => (value === undefined ? "" : value);
    const translateHeader = (key: string) => {
      if (Object.prototype.hasOwnProperty.call(this.#labels, key)) {
        return this.#labels[key];
      }
      return key;
    };
    const translateData = (row: Record<string, unknown>, rowIndex: number) =>
      keys.map((property, columnIndex) =>
        cleanFormatter({
          value: row[keys[columnIndex]],
          columnIndex,
          property,
          rowIndex,
          record: row
        })
      );
    let headers = keys.map(translateHeader);
    let data = cleanCollection.map(translateData);
    if (this.#limit < 0) {
      data = data.reverse().slice(0, -this.#limit);
    } else if (this.#offset < 0) {
      data = data.slice(this.#offset);
    } else if (this.#limit > 0) {
      data = data.slice(this.#offset, this.#offset + this.#limit);
    } else if (this.#offset > 0) {
      data = data.slice(this.#offset);
    }
    if (this.#isTransposed) {
      const transposedResults = ArrayUtils.transpose([headers, ...data] as unknown[][]);
      headers = transposedResults[0] as string[];
      data = transposedResults.slice(1);
    }
    return { headers, data };
  }

  /**
   * Generates an HTML table string
   * @returns HTML string
   * @see render
   */
  generateHTML(): string {
    const results = this.prepare();
    const styleTable = this.#styleTable;
    const styleHeader = this.#styleHeader;
    const styleRowFn = this.#styleRow;
    const styleColumnObj = this.#styleColumn;
    const styleCellFn = this.#styleCell;
    const printOptions = this.#printOptions;
    const borderCSS = this.#borderCSS;
    const printHeader = (headers: string[], _style: string) =>
      "\n<tr " +
      (!styleHeader ? "" : `style="${styleHeader}"`) +
      ">\n\t" +
      headers.map((header) => `<th>${header}</th>`).join("\n\t") +
      "\n</tr>\n";
    const printInlineCSS = (...cssStyles: (string | undefined)[]) => {
      const cleanCSS = cssStyles.filter((style) => (style ? true : false));
      if (cleanCSS.length < 1) return "";
      const cssContents = cleanCSS
        .map((style) => style!.trim())
        .map((style) => (style!.endsWith(";") ? style : `${style};`))
        .join(" ");
      return `style="${cssContents}"`;
    };
    const printBody = (collection: unknown[][]) =>
      collection
        .map((dataRow, rowIndex) => {
          let record: Record<string, unknown>;
          if (this.#filterFn) {
            record = results.headers.reduce(
              (result, header, headerIndex) =>
                ObjectUtils.assign(result, header, dataRow[headerIndex]) as Record<string, unknown>,
              {} as Record<string, unknown>
            );
          } else if (this.#offset) {
            record = this.#data[rowIndex + this.#offset] ?? {};
          } else {
            record = this.#data[rowIndex] ?? {};
          }
          const rowStyle = !styleRowFn ? "" : styleRowFn({ rowIndex, row: dataRow, record }) || "";
          return (
            "<tr " +
            printInlineCSS(rowStyle) +
            ">\n\t" +
            dataRow
              .map((value, columnIndex) => {
                const columnHeader = results.headers[columnIndex];
                const cellData: StyleCellContext = {
                  value,
                  columnIndex,
                  columnHeader,
                  rowIndex,
                  row: dataRow,
                  record,
                  property: columnHeader
                };
                const cellStyle = !styleCellFn ? "" : styleCellFn(cellData);
                const colFn = styleColumnObj?.[columnHeader];
                const columnStyle =
                  !styleColumnObj || !colFn || typeof colFn !== "function"
                    ? ""
                    : colFn(value, cellData);
                return (
                  "<td " +
                  printInlineCSS(borderCSS, cellStyle, columnStyle) +
                  ">" +
                  printValue(value, printOptions) +
                  "</td>"
                );
              })
              .join("\n\t") +
            "\n</tr>"
          );
        })
        .join("\n");
    return (
      `<table cellspacing="0px" ${printInlineCSS(styleTable)}>` +
      printHeader(results.headers, "") +
      printBody(results.data) +
      "\n</table>"
    );
  }

  /**
   * Generates a markdown table
   * @param options - align: true to pad columns
   * @returns markdown string
   * @see renderMarkdown
   */
  generateMarkdown(options?: { align?: boolean }): string {
    const { align = true } = options ?? {};
    const printOptions = this.#printOptions;
    let { headers, data } = this.prepare();
    data.unshift(headers.map(() => "--"));
    data.unshift(headers as unknown[]);
    const maxWidths = new Array((data[0] as unknown[]).length).fill(0);
    data = data.map((row, _rowIndex) => (row as unknown[])
      .map((value, columnIndex) => {
        const cleanedValue = printValue(value, printOptions);
        if (align) {
          const valueLen = String(cleanedValue).length;
          if (maxWidths[columnIndex] < valueLen) {
            maxWidths[columnIndex] = valueLen;
          }
        }
        return cleanedValue;
      }) as string[]
    ) as string[][];
    if (align) {
      data = data.map((row) =>
        (row as string[]).map((value, columnIndex) =>
          value.padEnd(maxWidths[columnIndex], " ")
        )
      ) as unknown[][];
    }
    return (data as string[][]).map((row) => row.join("|")).join("\n");
  }

  /**
   * Generates a CSV table
   * @returns CSV string
   * @see renderCSV
   */
  generateCSV(): string {
    const results = this.prepare();
    const printOptions = this.#printOptions;
    const csvify = (a: unknown[]) => JSON.stringify(a).slice(1).slice(0, -1);
    const printHeader = (headers: string[]) => csvify(headers) + "\n";
    const printBody = (collection: unknown[][]) =>
      collection
        .map((dataRow) =>
          dataRow.map((value) => csvify([printValue(value, printOptions)])).join(",")
        )
        .join("\n");
    return printHeader(results.headers) + printBody(results.data);
  }

  /**
   * Generates a TSV table
   * @returns TSV string
   * @see renderTSV
   */
  generateTSV(): string {
    const results = this.prepare();
    const printOptions = this.#printOptions;
    const escapeString = (val: unknown) =>
      `"${String(printValue(val, printOptions)).replace(/"/g, '""')}"`;
    const tsvify = (a: unknown[]) => a.map(escapeString).join("\t");
    return tsvify(results.headers) + "\n" + results.data.map((dataRow) => tsvify(dataRow)).join("\n");
  }

  /**
   * Generates a result set with headers and data arrays for further processing
   * @returns { headers, data }
   * @see generateArray2
   */
  generateArray(_returnUnifiedArray = false): TableData {
    return this.prepare();
  }

  /**
   * Generates a 2d array with headers as first row, then data rows.
   * Helpful for transpose or further processing.
   * @returns [headers, ...dataRows]
   * @see generateArray
   */
  generateArray2(): unknown[][] {
    const results = this.prepare();
    return [results.headers, ...results.data];
  }

  /**
   * Generates a collection of objects from the result set.
   * @returns array of objects
   * @see generateArray2
   */
  generateObjectCollection(): Record<string, unknown>[] {
    return ObjectUtils.objectCollectionFromArray(this.generateArray2()) as Record<string, unknown>[];
  }

  /**
   * Generates a Danfo.js compatible DataFrame object (each property = 1d array of column values).
   * @returns object with property: array of values
   * @see generateObjectCollection
   */
  generateDataFrameObject(): Record<string, unknown[]> {
    const prepResults = this.prepare();
    const results: Record<string, unknown[]> = {};
    const createFrameList = () => new Array(prepResults.data.length).fill(undefined);
    prepResults.headers.forEach((header) => ObjectUtils.assignIP(results, header, createFrameList()));
    prepResults.data.forEach((row, rowIndex) => {
      row.forEach((value, valIndex) => {
        results[prepResults.headers[valIndex]][rowIndex] = value;
      });
    });
    return results;
  }

  static hasRenderedCSS = false;

  /**
   * Renders the HTML table in the cell results (Jupyter). Uses sticky headers.
   * @see generateHTML
   */
  render(): JupyterRenderObject {
    const ctx = CONTEXT;
    const stickyCss = `<span class="sticky-table-marker" ></span>
<style type='text/css'>
.sticky-table table { text-align: left; position: relative; border-collapse: collapse; }
.sticky-table td { border: 1px solid #cccccc; }
.sticky-table th { background: #676c87; color: white; position: sticky; top: 0; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4); }
</style>
`
    const inlineCss = stickyCss;
    TableGenerator.hasRenderedCSS = true;
    return ctx.html(
      `${inlineCss}<div class="sticky-table" style="max-height: ${this.#height}">\n${this.generateHTML()}\n</div>`
    );
  }

  /**
   * Renders markdown in the cell results (console.log)
   * @see generateMarkdown
   */
  renderMarkdown(): void {
    CONTEXT.console(this.generateMarkdown());
  }

  /**
   * Renders CSV in the cell results (console.log)
   * @see generateCSV
   */
  renderCSV(): void {
    CONTEXT.console(this.generateCSV());
  }

  /**
   * Renders TSV in the cell results (console.log)
   * @see generateTSV
   */
  renderTSV(): void {
    CONTEXT.console(this.generateTSV());
  }

  [JupyterDisplaySymbol](): JupyterRichContent {
    const result = this.render();
    return result[JupyterDisplaySymbol]();
  }
}

export default TableGenerator;

/** Shorthand: utils.table(data) is same as new TableGenerator(data) */
export function table(data?: Record<string, unknown>[] | Record<string, unknown[]> | null): TableGenerator {
  return new TableGenerator(data);
}
