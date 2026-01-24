import { describe, it, afterEach, beforeEach } from '@std/testing/bdd';
import { expect } from '@std/expect';
import * as main from "../src/main.ts";

describe('main exports', () => {
  it('has chain', () => {
    const expected = 'function';
    const result = typeof main.chain;
    expect(result).toStrictEqual(expected);
  });
});