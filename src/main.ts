export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const val1 = 1;
  const val2 = 2;
  console.log(`Add ${val1} + ${val2} =`, add(val1, val2));
}
