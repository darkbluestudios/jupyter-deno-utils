import {add} from './simple.ts';
import _chain from './chain.ts';

export const chain = _chain;

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const val1 = 1;
  const val2 = 2;
  console.log(`Add ${val1} + ${val2} =`, add(val1, val2));
}
