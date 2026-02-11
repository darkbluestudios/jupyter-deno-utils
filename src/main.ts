import _chain from './chain.ts';
// import _importFresh from './importFresh.ts';
import _importFresh2 from './importFresh.ts';

export const chain = _chain;
export const importFresh = _importFresh2;

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// deno-coverage-ignore-start
if (import.meta.main) {
  console.log('see the main documentation: here');
}
// deno-coverage-ignore-stop
