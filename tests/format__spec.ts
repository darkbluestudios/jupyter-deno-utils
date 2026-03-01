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

  describe('divideR', () => {
    it('divide 5/3', () => {
      const expected = ({ integer: 1, remainder: 2 });
      const result = FormatUtils.divideWithRemainder(5, 3);
      expect(result).toEqual(expected);
    });
    it('divide 0/3', () => {
      const expected = ({ integer: 0, remainder: 0 });
      const result = FormatUtils.divideWithRemainder(0, 3);
      expect(result).toEqual(expected);
    });
    it('divide 3/0', () => {
      const expected = ({ integer: Infinity, remainder: NaN });
      const result = FormatUtils.divideWithRemainder(3, 0);
      expect(result).toEqual(expected);
    });
  });

  describe('millisecondDuration', () => {
    it('duration of 2 seconds', () => {
      const duration = 2000;
      const results = FormatUtils.millisecondDuration(duration);
      const expected = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 2,
        milliseconds: 0,
        epoch: duration
      };
      expect(results).toStrictEqual(expected);
    });
    it('duration of 2 minutes', () => {
      const duration = 1000 * 60 * 2;
      const results = FormatUtils.millisecondDuration(duration);
      const expected = {
        days: 0,
        hours: 0,
        minutes: 2,
        seconds: 0,
        milliseconds: 0,
        epoch: duration
      };
      expect(results).toStrictEqual(expected);
    });
    it('duration of 2 hours', () => {
      const duration = 1000 * 60 * 60 * 2;
      const results = FormatUtils.millisecondDuration(duration);
      const expected = {
        days: 0,
        hours: 2,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        epoch: duration
      };
      expect(results).toStrictEqual(expected);
    });
    it('duration of 2 days', () => {
      const duration = 1000 * 60 * 60 * 24 * 2;
      const results = FormatUtils.millisecondDuration(duration);
      const expected = {
        days: 2,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        epoch: duration
      };
      expect(results).toStrictEqual(expected);
    });
    it('complicated', () => {
      const day1 = new Date(2022, 2, 27, 22, 43, 40);
      const day2 = new Date(2022, 4, 3, 9);
      const duration = day2.getTime() - day1.getTime();
      const results = FormatUtils.millisecondDuration(duration);
      const expected = {
        days: 36,
        hours: 10,
        minutes: 16,
        seconds: 20,
        milliseconds: 0,
        epoch: duration
      };
      expect(results).toStrictEqual(expected);
    });
  });

  describe('ellipsify', () => {
    it('ellipsifies a long string', () => {
      const str = '0123456789';
      const expected = '01234' + FormatUtils.ELLIPSIS; // eslint-disable-line
      const results = FormatUtils.ellipsify(str, 5);
      expect(results).toBe(expected);
    });
    it('does not ellipsify a short enough string', () => {
      const str = '0123456789';
      const expected = '0123456789';
      const results = FormatUtils.ellipsify(str, 20);
      expect(results).toBe(expected);
    });
    it('does not ellipsify a string of exact length', () => {
      const str = '0123456789';
      const expected = '0123456789';
      const results = FormatUtils.ellipsify(str, 10);
      expect(results).toBe(expected);
    });
    it('ellipsifies by default on long strings', () => {
      const str = '012345678901234567890123456789012345678901234567891';
      const expected = `01234567890123456789012345678901234567890123456789${FormatUtils.ELLIPSIS}`;
      const results = FormatUtils.ellipsify(str);
      expect(results).toBe(expected);
    });
    it('can ellipsify on null', () => {
      const str = null;
      const expected = '';
      const results = FormatUtils.ellipsify(str, 10);
      expect(results).toBe(expected);
    });
    it('can ellipsify on undefined', () => {
      const str = undefined;
      const expected = '';
      const results = FormatUtils.ellipsify(str, 10);
      expect(results).toBe(expected);
    });
    it('can ellipsify an object', () => {
      const str = { first: 'name', last: 'name' };
      const expected = '{"first":"…';
      const results = FormatUtils.ellipsify(str, 10);
      expect(results).toBe(expected);
    });
  });
});


