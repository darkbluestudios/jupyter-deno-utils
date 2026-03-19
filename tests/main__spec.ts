import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import * as main from "../src/main.ts";

import { importFresh } from '../src/main.ts';

describe('main exports', () => {
  it('has chain', () => {
    const expected = 'function';
    const result = typeof main.chain;
    expect(result).toStrictEqual(expected);
  });
});

describe('importFresh2', () => {
  it('is a function', () => {
    expect(typeof importFresh).toBe('function');
  });
  describe('must include parts', () => {
    it('can mangle an import', () => {
      const basePath = '../src/main.ts';
      const result = importFresh(basePath);
      expect(result).not.toBe(basePath);
    });
    it('can mangle an import', () => {
      const basePath = '../src/main.ts';
      const result = importFresh(basePath);
      expect(result).toContain(basePath);
    });
    it('to include some cache_bypass', () => {
      const basePath = '../src/main.ts';
      const expected = 'cache_bypass'
      const result = importFresh(basePath);
      expect(result).toContain(expected);
    });
  });
});