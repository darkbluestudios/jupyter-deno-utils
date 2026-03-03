//-- TODO: review stringbuilder for large datasets
//-- review the api from observable
//-- https://observablehq.com/@observablehq/input-table

import FormatUtils from "./format.ts";
import ObjectUtils from "./object.ts";
import ArrayUtils, { createSort } from "./array.ts";
import type { JupyterDisplayContext } from "./types/jupyter.ts";

const printValue = FormatUtils.printValue;

const JUPYTER_DISPLAY = Symbol.for("Jupyter.display");
const CONTEXT = {
  renderSymbol(mimeType: string, value: unknown) {
    return {
      [JUPYTER_DISPLAY]() {
        const obj: Record<string, unknown> = {};
        obj[mimeType] = value;
      }
    };
  },
  console(msg: unknown) {
    const g = typeof globalThis !== "undefined" ? (globalThis as unknown as { console?: { log?: (m: unknown) => void } }) : null;
    const c = g?.console;
    if (c && typeof c.log === "function") c.log(msg);
  },
  html(htmlText: string) {
    return CONTEXT.renderSymbol("text/html", htmlText);
  },
  markdown(markdownText: string) {
    return CONTEXT.renderSymbol("text/markdown", markdownText);
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
  #printOptions: PrintOptions = null;
  #sortFn: ((a: unknown, b: unknown) => number) | null = null;
  #styleTable = "";
  #styleHeader = "";
  #styleRow: StyleRowFn | null = null;
  #styleColumn: StyleColumnMap | null = null;
  #styleCell: StyleCellFn | null = null;
  #isTransposed = false;

  constructor(data?: Record<string, unknown>[] | Record<string, unknown[]> | null) {
    this.reset();
    if (data) {
      this.data(data);
    }
  }

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

  data(col?: Record<string, unknown>[] | Record<string, unknown[]> | null): this {
    this.#data = Array.isArray(col) ? col : [];
    return this;
  }

  fromObjectCollection(data: Record<string, unknown>[]): this {
    this.data(data);
    return this;
  }

  fromArray(arrayCollection?: unknown[][] | null, headers?: string[] | null): this {
    if (!arrayCollection) {
      this.data(null);
      return this;
    }
    this.data(ObjectUtils.objectCollectionFromArray(arrayCollection, headers) as Record<string, unknown>[]);
    return this;
  }

  fromList(array1d?: unknown[] | null): this {
    if (!array1d) {
      this.data(null);
      return this;
    }
    this.data(array1d.map((v) => ({ _: v })) as Record<string, unknown>[]);
    return this;
  }

  fromDataFrameObject(dataFrameObject?: Record<string, unknown[]> | null): this {
    if (!dataFrameObject) {
      this.data(null);
      return this;
    }
    this.data(ObjectUtils.objectCollectionFromDataFrameObject(dataFrameObject as Record<string, unknown>) as Record<string, unknown>[]);
    return this;
  }

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

  filter(filterFn: FilterFn): this {
    this.#filterFn = filterFn;
    return this;
  }

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

  formatter(obj: Record<string, unknown> | null): this {
    return this.format(obj);
  }

  formatterFn(fn: FormatterFn): this {
    this.#formatterFn = fn;
    return this;
  }

  height(maxHeightCSS: string): this {
    this.#height = maxHeightCSS;
    return this;
  }

  limit(limitRecords: number): this {
    this.#limit = limitRecords;
    return this;
  }

  offset(offsetRecords: number): this {
    this.#offset = offsetRecords;
    return this;
  }

  labels(labelsObj: Record<string, string>): this {
    this.#labels = labelsObj;
    return this;
  }

  printOptions(options: PrintOptions): this {
    this.#printOptions = options;
    return this;
  }

  sortFn(fn: (a: unknown, b: unknown) => number): this {
    this.#sortFn = fn;
    return this;
  }

  sort(...rest: string[]): this {
    return this.sortFn(createSort(...rest));
  }

  styleTable(value: string | null): this {
    this.#styleTable = value ?? "";
    return this;
  }

  styleHeader(value: string | null): this {
    this.#styleHeader = value ?? "";
    return this;
  }

  styleRow(styleFn: StyleRowFn | null): this {
    this.#styleRow = styleFn;
    return this;
  }

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

  styleCell(styleFn: StyleCellFn | null): this {
    this.#styleCell = styleFn;
    return this;
  }

  transpose(): this {
    this.#isTransposed = true;
    return this;
  }

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

  generateMarkdown(options?: { align?: boolean }): string {
    const { align = true } = options ?? {};
    const printOptions = this.#printOptions;
    let { headers, data } = this.prepare();
    data.unshift(headers.map(() => "--"));
    data.unshift(headers as unknown[]);
    const maxWidths = new Array((data[0] as unknown[]).length).fill(0);
    data = data.map((row, _rowIndex) =>
      (row as unknown[]).map((value, columnIndex) => {
        const cleanedValue = printValue(value, printOptions);
        if (align) {
          const valueLen = String(cleanedValue).length;
          if (maxWidths[columnIndex] < valueLen) {
            maxWidths[columnIndex] = valueLen;
          }
        }
        return cleanedValue;
      }) as unknown[][]
    ) as unknown[][];
    if (align) {
      data = data.map((row) =>
        (row as string[]).map((value, columnIndex) =>
          value.padEnd(maxWidths[columnIndex], " ")
        )
      ) as unknown[][];
    }
    return (data as string[][]).map((row) => row.join("|")).join("\n");
  }

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

  generateTSV(): string {
    const results = this.prepare();
    const printOptions = this.#printOptions;
    const escapeString = (val: unknown) =>
      `"${String(printValue(val, printOptions)).replace(/"/g, '""')}"`;
    const tsvify = (a: unknown[]) => a.map(escapeString).join("\t");
    return tsvify(results.headers) + "\n" + results.data.map((dataRow) => tsvify(dataRow)).join("\n");
  }

  generateArray(_returnUnifiedArray = false): TableData {
    return this.prepare();
  }

  generateArray2(): unknown[][] {
    const results = this.prepare();
    return [results.headers, ...results.data];
  }

  generateObjectCollection(): Record<string, unknown>[] {
    return ObjectUtils.objectCollectionFromArray(this.generateArray2()) as Record<string, unknown>[];
  }

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

  render(): void {
    const g = globalThis as unknown as {
      context?: JupyterDisplayContext;
      $$?: JupyterDisplayContext;
    };
    const ctx = g.context ?? g.$$;
    if (!ctx?.html) {
      throw new Error("TableGenerator.render() requires a Jupyter display context (global context or $$) with .html()");
    }
    const stickyCss = `<span class="sticky-table-marker" ></span>
<style type='text/css'>
.sticky-table table { text-align: left; position: relative; border-collapse: collapse; }
.sticky-table td { border: 1px solid #cccccc; }
.sticky-table th { background: #676c87; color: white; position: sticky; top: 0; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4); }
</style>
`;
    const inlineCss = stickyCss;
    TableGenerator.hasRenderedCSS = true;
    ctx.html(
      `${inlineCss}<div class="sticky-table" style="max-height: ${this.#height}">\n${this.generateHTML()}\n</div>`
    );
  }

  renderMarkdown(): void {
    CONTEXT.console(this.generateMarkdown());
  }

  renderCSV(): void {
    CONTEXT.console(this.generateCSV());
  }

  renderTSV(): void {
    CONTEXT.console(this.generateTSV());
  }
}

export default TableGenerator;

export const newTable = function table(...rest) {
  return new TableGenerator(...rest);
}
