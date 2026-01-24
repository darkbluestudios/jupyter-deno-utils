import _chain from './chain.ts';

export const chain = _chain;

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log('see the main documentation: here');
}
