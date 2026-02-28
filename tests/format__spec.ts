import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import * as FormatUtils from '../src/format.ts';

describe('format', () => {
  describe('zeroFill', () => {
    it('pads a normal number', () => {
      const expected = '003';
      const results = FormatUtils.zeroFill(3);
      expect(results).toBe(expected);
    });
    it('zeroFill(23, 5)', () => {
      const expected = '00023';
      const results = FormatUtils.zeroFill(23, 5);
      expect(results).toBe(expected);
    });
    it('add spaces beforehand with zeroFill(23, 5, " ")', () => {
      const expected = '   23';
      const results = FormatUtils.zeroFill(23, 5, ' ');
      expect(results).toBe(expected);
    });
  });
});
