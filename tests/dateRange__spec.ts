import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { DateRange } from "../src/date.ts";

describe('DateRange', () => {
  describe('initializes', () => {
    it('the start and end times', () => {
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const endTime = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const results = new DateRange(startTime, endTime);

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(endTime);
    });
    it('always has the starting time first', () => {
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const endTime = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const results = new DateRange(endTime, startTime);

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(endTime);
    });
    it('still works if the same time is sent for both', () => {
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const results = new DateRange(startTime, startTime);

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(startTime);
    });
    it('can set data in constructor', () => {
      const data = { first: 'last' };
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const results = new DateRange(startTime, startTime, data);

      const expected = { first: 'last' };

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(startTime);
      expect(results.data).toEqual(expected);
    });
    it('can set data in constructor but not transformed', () => {
      const data = { first: 'last' };
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const results = new DateRange(startTime, startTime, data);

      const expected = { first: 'last' };

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(startTime);
      
      //-- is structured the same
      expect(results.data).toEqual(expected);
      //-- but is the same object reference
      expect(results.data).toBe(data);
      expect(results.data).not.toBe(expected);
    });
  });

  describe('reinitialize', () => {
    it('the start and end times', () => {
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const endTime = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const results = new DateRange(startTime, endTime);

      const newStart = new Date(Date.UTC(2024, 11, 28, 12, 0, 0));
      const newEnd   = new Date(Date.UTC(2024, 11, 28, 12, 0, 0));

      results.reinitialize(newStart, newEnd);

      expect(results.startDate).toEqual(newStart);
      expect(results.endDate).toEqual(newEnd);
    });
    it('can re-initialize from a stringy', () => {
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const endTime = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const results = new DateRange(startTime, endTime);

      const newStartStr = '2024-12-28T12:00:00.000Z';
      const newEndStr = '2024-12-28T12:00:00.000Z';

      const newStart = new Date(Date.UTC(2024, 11, 28, 12, 0, 0));
      const newEnd   = new Date(Date.UTC(2024, 11, 28, 12, 0, 0));

      results.reinitialize(newStartStr, newEndStr);

      expect(results.startDate).toEqual(newStart);
      expect(results.endDate).toEqual(newEnd);
    });
    it('always has the starting time first', () => {
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const endTime = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const results = new DateRange(endTime, startTime);

      const newStart = new Date(Date.UTC(2024, 11, 28, 12, 0, 0));
      const newEnd   = new Date(Date.UTC(2024, 11, 28, 12, 0, 0));

      results.reinitialize(newEnd, newStart);

      expect(results.startDate).toEqual(newStart);
      expect(results.endDate).toEqual(newEnd);
    });
    it('can set data', () => {
      const data = { first: 'first' };
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const results = new DateRange(startTime, startTime, data);
      
      const data2 = { first: 'last' };
      results.reinitialize(startTime, startTime, data2);

      const expected = { first: 'last' };

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(startTime);
      expect(results.data).toEqual(expected);
    });
    it('can set data but not transformed', () => {
      const data = { first: 'first' };
      const startTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const results = new DateRange(startTime, startTime, data);
      
      const data2 = { first: 'last' };
      results.reinitialize(startTime, startTime, data2);

      const expected = { first: 'last' };

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(startTime);
      
      //-- is structured the same
      expect(results.data).toEqual(expected);
      //-- but is the same object reference
      expect(results.data).not.toBe(data);
      expect(results.data).toBe(data2);
      expect(results.data).not.toBe(expected);
    });
  });

  describe('can create a date range from a day', () => {
    it('first attempt', () => {
      const targetDate = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const startTime = new Date(Date.UTC(2024, 11, 26, 0, 0, 0));
      const endTime = new Date(Date.UTC(2024, 11, 26, 23, 59, 59, 999));

      const results = DateRange.startAndEndOfDay(targetDate);

      expect(results.startDate).toEqual(startTime);
      expect(results.endDate).toEqual(endTime);
    });
  });

  describe('overlaps', () => {
    const overlapA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
    const overlapB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
    const overlapC = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
    const overlapD = new Date(Date.UTC(2024, 11, 26, 15, 0, 0));

    describe('can detect an overlap', () => {
      it('forwards', () => {
        const rangeA = new DateRange(overlapA, overlapC);
        const rangeB = new DateRange(overlapB, overlapD);

        const expected = true;
        const results = rangeA.overlaps(rangeB);

        expect(results).toBe(expected);
      });
      it('backwards', () => {
        const rangeA = new DateRange(overlapA, overlapC);
        const rangeB = new DateRange(overlapB, overlapD);
  
        const expected = true;
        const results = rangeB.overlaps(rangeA);
  
        expect(results).toBe(expected);
      });
    });

    describe('has no overlap if the last millisecond is the same', () => {
      it('forwards', () => {
        const rangeA = new DateRange(overlapA, overlapB);
        const rangeB = new DateRange(overlapB, overlapC);

        const expected = false;
        const results = rangeA.overlaps(rangeB);

        expect(results).toBe(expected);
      });
      it('backwards', () => {
        const rangeA = new DateRange(overlapA, overlapB);
        const rangeB = new DateRange(overlapB, overlapC);

        const expected = false;
        const results = rangeB.overlaps(rangeA);
  
        expect(results).toBe(expected);
      });
    });

    describe('has no overlap if there is a gap between', () => {
      it('forwards', () => {
        const rangeA = new DateRange(overlapA, overlapB);
        const rangeB = new DateRange(overlapC, overlapD);

        const expected = false;
        const results = rangeA.overlaps(rangeB);

        expect(results).toBe(expected);
      });
      it('backwards', () => {
        const rangeA = new DateRange(overlapA, overlapB);
        const rangeB = new DateRange(overlapC, overlapD);

        const expected = false;
        const results = rangeB.overlaps(rangeA);
  
        expect(results).toBe(expected);
      });
    });
  });

  describe('contains detects a date', () => {
    const withinA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
    const withinB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
    const withinC = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
    const withinD = new Date(Date.UTC(2024, 11, 26, 15, 0, 0));
    const withinE = new Date(Date.UTC(2024, 11, 26, 16, 0, 0));

    it('can detect a date within the range', () => {
      const testDate = withinC;
      const range = new DateRange(withinB, withinD);

      const expected = true;
      const results = range.contains(testDate);

      expect(results).toEqual(expected);
    });
    it('can detect a date at the exact start', () => {
      const testDate = withinB;
      const range = new DateRange(withinB, withinD);

      const expected = true;
      const results = range.contains(testDate);

      expect(results).toEqual(expected);
    });
    it('can detect a date at the exact end', () => {
      const testDate = withinD;
      const range = new DateRange(withinB, withinD);

      const expected = true;
      const results = range.contains(testDate);

      expect(results).toEqual(expected);
    });
    it('does not have a date before', () => {
      const testDate = withinA;
      const range = new DateRange(withinB, withinD);

      const expected = false;
      const results = range.contains(testDate);

      expect(results).toEqual(expected);
    });
    it('does not have a date after', () => {
      const testDate = withinE;
      const range = new DateRange(withinB, withinD);

      const expected = false;
      const results = range.contains(testDate);

      expect(results).toEqual(expected);
    });
  });

  describe('duration', () => {
    it('simple example', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = 1000 * 60 * 60;
      const results = range.duration();
      expect(results).toEqual(expected);
    });
    it('day', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 27, 12, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = 1000 * 60 * 60 * 24;
      const results = range.duration();
      expect(results).toEqual(expected);
    });
    it('hours', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = 1000 * 60 * 60 * 2;
      const results = range.duration();
      expect(results).toEqual(expected);
    });
    it('minutes', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 30, 0));
      const range = new DateRange(durationA, durationB);
      const expected = 1000 * 60 * 30;
      const results = range.duration();
      expect(results).toEqual(expected);
    });
  });

  describe('durationString', () => {
    it('simple example', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '0 days, 1 hours, 0 minutes, 0.0 seconds';
      const results = range.durationString();
      expect(results).toEqual(expected);
    });
    it('day', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 27, 12, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '1 days, 0 hours, 0 minutes, 0.0 seconds';
      const results = range.durationString();
      expect(results).toEqual(expected);
    });
    it('hours', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '0 days, 2 hours, 0 minutes, 0.0 seconds';
      const results = range.durationString();
      expect(results).toEqual(expected);
    });
    it('minutes', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 30, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '0 days, 0 hours, 30 minutes, 0.0 seconds';
      const results = range.durationString();
      expect(results).toEqual(expected);
    });
    it('negative example', () => {
      const durationA = new Date(Date.UTC(2024, 11, 27, 13, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '1 days, 1 hours, 0 minutes, 0.0 seconds';
      const results = range.durationString();
      expect(results).toEqual(expected);
    });
  });

  describe('durationISO', () => {
    it('simple example', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '0:01:00:00.000';
      const results = range.durationISO();
      expect(results).toEqual(expected);
    });
    it('day', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 27, 12, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '1:00:00:00.000';
      const results = range.durationISO();
      expect(results).toEqual(expected);
    });
    it('hours', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '0:02:00:00.000';
      const results = range.durationISO();
      expect(results).toEqual(expected);
    });
    it('minutes', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 30, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '0:00:30:00.000';
      const results = range.durationISO();
      expect(results).toEqual(expected);
    });
    it('negative example', () => {
      const durationA = new Date(Date.UTC(2024, 11, 27, 13, 30, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '1:01:30:00.000';
      const results = range.durationISO();
      expect(results).toEqual(expected);
    });
  });

  describe('isValid', () => {
    const isValidA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
    const isValidB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
    const invalidDate = new Date('cuca');
    it('can detect if neither are invalid', () => {
      const range = new DateRange(isValidA, isValidB);
      const expected = true;
      const results = range.isValid();
      expect(results).toBe(expected);
    });
    it('can detect if start is invalid', () => {
      const range = new DateRange(invalidDate, isValidB);
      const expected = false;
      const results = range.isValid();
      expect(results).toBe(expected);
    });
    it('can detect if end is invalid', () => {
      const range = new DateRange(isValidA, invalidDate);
      const expected = false;
      const results = range.isValid();
      expect(results).toBe(expected);
    });
    it('can detect if both are invalid', () => {
      const range = new DateRange(invalidDate, invalidDate);
      const expected = false;
      const results = range.isValid();
      expect(results).toBe(expected);
    });
  });

  describe('toString', () => {
    it('simple example', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '2024-12-26T12:00:00.000Z to 2024-12-26T13:00:00.000Z';
      const results = range.toString();
      expect(results).toEqual(expected);
    });
    it('day', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 27, 12, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '2024-12-26T12:00:00.000Z to 2024-12-27T12:00:00.000Z';
      const results = range.toString();
      expect(results).toEqual(expected);
    });
    it('hours', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '2024-12-26T12:00:00.000Z to 2024-12-26T14:00:00.000Z';
      const results = range.toString();
      expect(results).toEqual(expected);
    });
    it('minutes', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 30, 0));
      const range = new DateRange(durationA, durationB);
      const expected = '2024-12-26T12:00:00.000Z to 2024-12-26T12:30:00.000Z';
      const results = range.toString();
      expect(results).toEqual(expected);
    });
  });

  describe('toLocaleString', () => {
    it('simple example', () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const range = new DateRange(durationA, durationB);
      const results = range.toLocaleString();
      expect(results).toBeTruthy();

      // const expected = '2024-12-26T12:00:00.000Z to 2024-12-26T13:00:00.000Z';
      // expect(results).toEqual(expected);
    });
  });
});
