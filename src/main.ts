// import _importFresh from './importFresh.ts';
import { importFresh2 } from './importFresh.ts';
import _Aggregate from './aggregate.ts';
import _ArrayUtils from './array.ts';
import _Base64 from './base64.ts';
import _chain from './chain.ts';
import _Color from './color.ts';
import _Describe from './describe.ts';
import _Date from './date.ts';
import _File from './file.ts';
import _Format from './format.ts';
import _Group from './group.ts';
import _HashMap from './hashMap.ts';
import _Object from './object.ts';
import _PlantUML from './plantuml.ts';
import _Set from './set.ts';
import _Table from './TableGenerator.ts';
import { newTable as _newTable } from './TableGenerator.ts';

export const aggregate = _Aggregate;
export const agg = _Aggregate;
export const chain = _chain;
export const importFresh = importFresh2;
export const array = _ArrayUtils;
export const base64 = _Base64;
export const color = _Color;
export const date = _Date;
export const describe = _Describe;
export const DateRange = _Date.DateRange;
export const file = _File;
export const format = _Format;
export const group = _Group;
export const hashMap = _HashMap;
export const object = _Object;
export const plantUML = _PlantUML;
export const set = _Set;
export const TableGenerator = _Table;
export const newTable = _newTable;

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// deno-coverage-ignore-start
if (import.meta.main) {
  console.log('see the main documentation: here');
}
// deno-coverage-ignore-stop
