import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import DateUtils from "../src/date.ts";

describe("Date", () => {
  describe("isValid", () => {
    describe("can detect a valid date", () => {
      it("if sent a YYYY-MM-DD", () => {
        const test = new Date("2024-12-26");
        const expected = true;
        const result = DateUtils.isValid(test);
        expect(result).toBe(expected);
      });
      it("if sent 0 wrapped date", () => {
        const test = new Date(0);
        const expected = true;
        const result = DateUtils.isValid(test);
        expect(result).toBe(expected);
      });
    });
    describe("can detect an invalid date", () => {
      it("if sent null instead of a date", () => {
        const test = null;
        const expected = false;
        const result = DateUtils.isValid(test);
        expect(result).toBe(expected);
      });
      it("if sent undefined instead of a date", () => {
        const test = undefined;
        const expected = false;
        const result = DateUtils.isValid(test);
        expect(result).toBe(expected);
      });
      it("if sent a POJO instead of a date", () => {
        const test = {};
        const expected = false;
        const result = DateUtils.isValid(test);
        expect(result).toBe(expected);
      });
      it("if sent undefined wrapped date", () => {
        const test = new Date(undefined as unknown as string);
        const expected = false;
        const result = DateUtils.isValid(test);
        expect(result).toBe(expected);
      });
      it("if sent a bad string", () => {
        const test = new Date("cuca");
        const expected = false;
        const result = DateUtils.isValid(test);
        expect(result).toBe(expected);
      });
    });
  });

  describe("parse", () => {
    describe("can parse", () => {
      it("if sent a YYYY-MM-DD", () => {
        const test = "2024-12-26";
        const expected = new Date("2024-12-26");
        const result = DateUtils.parse(test);
        expect(result).toEqual(expected);
      });
    });
    describe("cannot parse", () => {
      it("if sent undefined", () => {
        const test = undefined;
        const expected = undefined;
        const result = DateUtils.parse(test);
        expect(result).toBe(expected);
      });
      it("if sent null", () => {
        const test = null;
        const expected = null;
        const result = DateUtils.parse(test);
        expect(result).toBe(expected);
      });
      it("if sent a bad string", () => {
        const test = "cuca";
        const expected = "Could not parse date: cuca";
        expect(() => {
          DateUtils.parse(test);
        }).toThrow(expected);
      });
    });
  });

  describe("getTimezoneOffset", () => {
    describe("can get timezone", () => {
      it("for america/chicago", () => {
        const testValue = "america/chicago";
        const expected = 21600000;
        const results = DateUtils.getTimezoneOffset(testValue);
        expect(results).toBe(expected);
      });
      it("for america/los_angeles", () => {
        const testValue = "america/los_angeles";
        const expected = 28800000;
        const results = DateUtils.getTimezoneOffset(testValue);
        expect(results).toBe(expected);
      });
    });
    describe("cannot get timezone", () => {
      it("for invalid datetimes", () => {
        const testValue = "cuca";
        expect(() => {
          DateUtils.getTimezoneOffset(testValue);
        }).toThrow();
      });
    });
  });

  describe("correct for timezone", () => {
    describe("can correct for timezone", () => {
      it("america/chicago", () => {
        const originalDate = new Date(Date.UTC(2024, 11, 26, 17, 0, 0));
        const timezone = "america/chicago";
        const expected = new Date(Date.UTC(2024, 11, 26, 11, 0, 0));
        const results = DateUtils.correctForTimezone(originalDate, timezone);
        expect(results).toEqual(expected);
      });
      it("us/pacific", () => {
        const originalDate = new Date(Date.UTC(2024, 11, 26, 19, 0, 0));
        const timezone = "us/pacific";
        const expected = new Date(Date.UTC(2024, 11, 26, 11, 0, 0));
        const results = DateUtils.correctForTimezone(originalDate, timezone);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("correctForOtherTimezone", () => {
    describe("can correct for an other timezone", () => {
      it("us/central + us/eastern", () => {
        const d = new Date(Date.UTC(2025, 1, 1, 15, 15, 0));
        const sourceTimezone = "us/eastern";
        const localTimezone = "us/central";
        const expected = new Date(Date.UTC(2025, 1, 1, 14, 15, 0));
        const result = DateUtils.correctForOtherTimezone(
          d,
          sourceTimezone,
          localTimezone
        );
        expect(result).toEqual(expected);
      });
    });
    describe("can correct from a parse", () => {
      it("converts correctly", () => {
        // Use UTC instant so result is deterministic regardless of runner TZ
        const d = new Date(Date.UTC(2024, 11, 27, 13, 30, 0));
        const sourceTimezone = "us/eastern";
        const localTimezone = "us/central";
        const expected = new Date(Date.UTC(2024, 11, 27, 12, 30, 0));
        const result = DateUtils.correctForOtherTimezone(
          d,
          sourceTimezone,
          localTimezone
        );
        expect(result).toEqual(expected);
      });
    });
  });

  describe("epochShift", () => {
    describe("can correct for timezone", () => {
      it("america/chicago", () => {
        const originalDate = new Date(Date.UTC(2024, 11, 26, 11, 0, 0));
        const timezone = "america/chicago";
        const expected = new Date(Date.UTC(2024, 11, 26, 17, 0, 0));
        const results = DateUtils.epochShift(originalDate, timezone);
        expect(results).toEqual(expected);
      });
      it("us/pacific", () => {
        const originalDate = new Date(Date.UTC(2024, 11, 26, 11, 0, 0));
        const timezone = "us/pacific";
        const expected = new Date(Date.UTC(2024, 11, 26, 19, 0, 0));
        const results = DateUtils.epochShift(originalDate, timezone);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("add", () => {
    describe("can add", () => {
      it("an empty object", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const options = {};
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("null gives the same time", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const results = DateUtils.add(originalTime);
        expect(results).toEqual(expected);
      });
      it("1 day", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 27, 12, 0, 0));
        const options = { days: 1 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("3 day", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 28, 12, 0, 0));
        const options = { days: 2 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("1 hour", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
        const options = { hours: 1 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("1 minute", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 26, 12, 1, 0));
        const options = { minutes: 1 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("1 second", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 26, 12, 0, 1));
        const options = { seconds: 1 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("5 milliseconds", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 26, 12, 0, 0, 500));
        const options = { milliseconds: 500 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("1 year", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2025, 11, 26, 12, 0, 0));
        const options = { years: 1 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
      it("1 month", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2025, 0, 26, 12, 0, 0));
        const options = { months: 1 };
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
    });
    describe("cannot add", () => {
      it("a null", () => {
        const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const expected = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
        const options = null;
        const results = DateUtils.add(originalTime, options);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("endOfDay", () => {
    it("can find the end of day", () => {
      const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const expected = new Date(Date.UTC(2024, 11, 26, 23, 59, 59, 999));
      const results = DateUtils.endOfDay(originalTime);
      expect(results).toEqual(expected);
    });
  });

  describe("startOfDay", () => {
    it("can find the start of day", () => {
      const originalTime = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const expected = new Date(Date.UTC(2024, 11, 26, 0, 0, 0));
      const results = DateUtils.startOfDay(originalTime);
      expect(results).toEqual(expected);
    });
  });

  describe("durationString", () => {
    it("simple example", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "0 days, 1 hours, 0 minutes, 0.0 seconds";
      const results = DateUtils.durationLong(range);
      expect(results).toEqual(expected);
    });
    it("day", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 27, 12, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "1 days, 0 hours, 0 minutes, 0.0 seconds";
      const results = DateUtils.durationLong(range);
      expect(results).toEqual(expected);
    });
    it("hours", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "0 days, 2 hours, 0 minutes, 0.0 seconds";
      const results = DateUtils.durationLong(range);
      expect(results).toEqual(expected);
    });
    it("minutes", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 30, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "0 days, 0 hours, 30 minutes, 0.0 seconds";
      const results = DateUtils.durationLong(range);
      expect(results).toEqual(expected);
    });
    it("negative example", () => {
      const durationA = new Date(Date.UTC(2024, 11, 27, 13, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "-1 days, 1 hours, 0 minutes, 0.0 seconds";
      const results = DateUtils.durationLong(range);
      expect(results).toEqual(expected);
    });
  });

  describe("durationISO", () => {
    it("simple example", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "0:01:00:00.000";
      const results = DateUtils.durationISO(range);
      expect(results).toEqual(expected);
    });
    it("day", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 27, 12, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "1:00:00:00.000";
      const results = DateUtils.durationISO(range);
      expect(results).toEqual(expected);
    });
    it("hours", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "0:02:00:00.000";
      const results = DateUtils.durationISO(range);
      expect(results).toEqual(expected);
    });
    it("minutes", () => {
      const durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 30, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "0:00:30:00.000";
      const results = DateUtils.durationISO(range);
      expect(results).toEqual(expected);
    });
    it("negative example", () => {
      const durationA = new Date(Date.UTC(2024, 11, 27, 13, 30, 0));
      const durationB = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
      const range = durationB.getTime() - durationA.getTime();
      const expected = "-1:01:30:00.000";
      const results = DateUtils.durationISO(range);
      expect(results).toEqual(expected);
    });
  });

  describe("toLocalISO", () => {
    // Use UTC instant so expected strings are deterministic regardless of runner TZ
    const dateA = new Date(Date.UTC(2024, 11, 27, 13, 30, 0));
    describe("without weekdays", () => {
      it("can convert a date to america/Chicago", () => {
        const expected = "2024-12-27T07:30:00.000-06:00";
        const results = DateUtils.toLocalISO(dateA, "america/Chicago");
        expect(results).toEqual(expected);
      });
      it("can convert a date to america/los_angeles", () => {
        const expected = "2024-12-27T05:30:00.000-08:00";
        const results = DateUtils.toLocalISO(dateA, "america/Los_Angeles");
        expect(results).toEqual(expected);
      });
      it("can convert a date to europe/paris", () => {
        const expected = "2024-12-27T14:30:00.000+01:00";
        const results = DateUtils.toLocalISO(dateA, "europe/paris");
        expect(results).toEqual(expected);
      });
    });
    describe("explicitly without weekdays", () => {
      it("can convert a date to america/Chicago", () => {
        const expected = "2024-12-27T07:30:00.000-06:00";
        const results = DateUtils.toLocalISO(dateA, "america/Chicago", false);
        expect(results).toEqual(expected);
      });
      it("can convert a date to america/los_angeles", () => {
        const expected = "2024-12-27T05:30:00.000-08:00";
        const results = DateUtils.toLocalISO(dateA, "america/Los_Angeles", false);
        expect(results).toEqual(expected);
      });
      it("can convert a date to europe/paris", () => {
        const expected = "2024-12-27T14:30:00.000+01:00";
        const results = DateUtils.toLocalISO(dateA, "europe/paris", false);
        expect(results).toEqual(expected);
      });
    });
    describe("explicitly with weekdays", () => {
      it("can convert a date to america/Chicago", () => {
        const expected = "2024-12-27T07:30:00.000-06:00 - Fri";
        const results = DateUtils.toLocalISO(dateA, "america/Chicago", true);
        expect(results).toEqual(expected);
      });
      it("can convert a date to america/los_angeles", () => {
        const expected = "2024-12-27T05:30:00.000-08:00 - Fri";
        const results = DateUtils.toLocalISO(dateA, "america/Los_Angeles", true);
        expect(results).toEqual(expected);
      });
      it("can convert a date to europe/paris", () => {
        const expected = "2024-12-27T14:30:00.000+01:00 - Fri";
        const results = DateUtils.toLocalISO(dateA, "europe/paris", true);
        expect(results).toEqual(expected);
      });
    });
    describe("GMT", () => {
      it("can convert a date to GMT", () => {
        const expected = "2024-12-27T13:30:00.000+00:00 - Fri";
        const results = DateUtils.toLocalISO(dateA, "GMT", true);
        expect(results).toEqual(expected);
      });
      it("can convert a midnight date to GMT", () => {
        const midnight = new Date(Date.UTC(2024, 11, 27, 0, 30, 0));
        const expected = "2024-12-27T00:30:00.000+00:00 - Fri";
        const results = DateUtils.toLocalISO(midnight, "GMT", true);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("localISOFormatter", () => {
    const dateA = new Date(Date.UTC(2024, 11, 27, 13, 30, 0));
    describe("without weekdays", () => {
      it("can convert a date to america/Chicago", () => {
        const expected = "2024-12-27T07:30:00.000-06:00";
        const formatter = DateUtils.localISOFormatter("america/Chicago");
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
      it("can convert a date to america/los_angeles", () => {
        const expected = "2024-12-27T05:30:00.000-08:00";
        const formatter = DateUtils.localISOFormatter("america/Los_Angeles");
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
      it("can convert a date to europe/paris", () => {
        const expected = "2024-12-27T14:30:00.000+01:00";
        const formatter = DateUtils.localISOFormatter("europe/paris");
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
    });
    describe("explicitly without weekdays", () => {
      it("can convert a date to america/Chicago", () => {
        const expected = "2024-12-27T07:30:00.000-06:00";
        const formatter = DateUtils.localISOFormatter("america/Chicago", false);
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
      it("can convert a date to america/los_angeles", () => {
        const expected = "2024-12-27T05:30:00.000-08:00";
        const formatter = DateUtils.localISOFormatter("america/Los_Angeles", false);
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
      it("can convert a date to europe/paris", () => {
        const expected = "2024-12-27T14:30:00.000+01:00";
        const formatter = DateUtils.localISOFormatter("europe/paris", false);
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
    });
    describe("explicitly with weekdays", () => {
      it("can convert a date to america/Chicago", () => {
        const expected = "2024-12-27T07:30:00.000-06:00 - Fri";
        const formatter = DateUtils.localISOFormatter("america/Chicago", true);
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
      it("can convert a date to america/los_angeles", () => {
        const expected = "2024-12-27T05:30:00.000-08:00 - Fri";
        const formatter = DateUtils.localISOFormatter("america/Los_Angeles", true);
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
      it("can convert a date to europe/paris", () => {
        const expected = "2024-12-27T14:30:00.000+01:00 - Fri";
        const formatter = DateUtils.localISOFormatter("europe/paris", true);
        const results = formatter(dateA);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("getWeekday", () => {
    it("can get the date", () => {
      const date = new Date("2025-01-15T06:00:00.000Z");
      const expected = "Wed";
      const result = DateUtils.getWeekday(date, "us/eastern");
      expect(result).toBe(expected);
    });
    it("can get the date crossing date border", () => {
      const date = new Date("2025-01-15T06:00:00.000Z");
      const expected = "Tue";
      const result = DateUtils.getWeekday(date, "us/pacific");
      expect(result).toBe(expected);
    });
  });

  describe("toEpochShiftedISO", () => {
    describe("iso date parsing works as expected", () => {
      it("produces expected ISO string", () => {
        const d = new Date(Date.UTC(2025, 1, 1, 15, 22));
        const expected = "2025-02-01T15:22:00.000Z";
        const results = d.toISOString();
        expect(results).toBe(expected);
      });
    });
    describe("us/central", () => {
      it("formats with offset", () => {
        const d = new Date(Date.UTC(2025, 1, 1, 15, 22));
        const timezone = "us/central";
        const expected = "2025-02-01T15:22:00.000-06:00";
        const results = DateUtils.toEpochShiftedISO(d, timezone);
        expect(results).toBe(expected);
      });
    });
    describe("us/eastern", () => {
      it("formats with offset", () => {
        const d = new Date(Date.UTC(2025, 1, 1, 15, 22));
        const timezone = "us/eastern";
        const expected = "2025-02-01T15:22:00.000-05:00";
        const results = DateUtils.toEpochShiftedISO(d, timezone);
        expect(results).toBe(expected);
      });
    });
  });

  describe("shiftStart", () => {
    const createDateRange = () =>
      new DateUtils.DateRange(
        new Date(Date.UTC(2025, 0, 1, 12, 0, 0)),
        new Date(Date.UTC(2025, 0, 2, 12, 0, 0))
      );

    describe("can shift", () => {
      it("simple example", () => {
        const myRange = createDateRange();
        const result = myRange.shiftStart({ days: 1 });
        const expected = new Date(Date.UTC(2025, 0, 2, 12, 0, 0));
        const resultStart = result.startDate;
        expect(resultStart).toEqual(expected);
      });
      it("is not the same object", () => {
        const myRange = createDateRange();
        const result = myRange.shiftStart({ days: 1 });
        const myRangeStart = myRange.startDate;
        const resultStart = result.startDate;
        expect(resultStart).not.toEqual(myRangeStart);
      });
    });
    describe("can shift in place", () => {
      it("simple example", () => {
        const myRange = createDateRange();
        const result = myRange.shiftStart({ days: 1 }, true);
        const expected = new Date(Date.UTC(2025, 0, 2, 12, 0, 0));
        const resultStart = result.startDate;
        expect(resultStart).toEqual(expected);
      });
      it("is the same object", () => {
        const myRange = createDateRange();
        const result = myRange.shiftStart({ days: 1 }, true);
        const myRangeStart = myRange.startDate;
        const resultStart = result.startDate;
        expect(resultStart).toEqual(myRangeStart);
      });
    });
  });

  describe("shiftEnd", () => {
    const createDateRange = () =>
      new DateUtils.DateRange(
        new Date(Date.UTC(2025, 0, 1, 12, 0, 0)),
        new Date(Date.UTC(2025, 0, 2, 12, 0, 0))
      );

    describe("can shift", () => {
      it("simple example", () => {
        const myRange = createDateRange();
        const result = myRange.shiftEnd({ days: 1 });
        const expected = new Date(Date.UTC(2025, 0, 3, 12, 0, 0));
        const resultEnd = result.endDate;
        expect(resultEnd).toEqual(expected);
      });
      it("is not the same object", () => {
        const myRange = createDateRange();
        const result = myRange.shiftEnd({ days: 1 });
        const myRangeEnd = myRange.endDate;
        const resultEnd = result.endDate;
        expect(resultEnd).not.toEqual(myRangeEnd);
      });
    });
    describe("can shift in place", () => {
      it("simple example", () => {
        const myRange = createDateRange();
        const result = myRange.shiftEnd({ days: 1 }, true);
        const expected = new Date(Date.UTC(2025, 0, 3, 12, 0, 0));
        const resultEnd = result.endDate;
        expect(resultEnd).toEqual(expected);
      });
      it("is the same object", () => {
        const myRange = createDateRange();
        const result = myRange.shiftEnd({ days: 1 }, true);
        const myRangeEnd = myRange.endDate;
        const resultEnd = result.endDate;
        expect(resultEnd).toEqual(myRangeEnd);
      });
    });
  });

  describe("fromList", () => {
    it("can make a list", () => {
      const dates = [
        new Date("2025-01-01"),
        new Date("2025-02-01"),
        new Date("2025-03-01"),
        new Date("2025-04-01")
      ];
      const results = DateUtils.DateRange.fromList(dates);
      const expected = [
        new DateUtils.DateRange(dates[0], dates[1]),
        new DateUtils.DateRange(dates[1], dates[2]),
        new DateUtils.DateRange(dates[2], dates[3])
      ];
      expect(results.length).toBe(expected.length);
      for (let i = 0; i < results.length; i++) {
        expect(results[i].startDate.getTime()).toBe(expected[i].startDate.getTime());
        expect(results[i].endDate.getTime()).toBe(expected[i].endDate.getTime());
      }
    });
    it("can initialize data", () => {
      const dates = [
        new Date("2025-01-01"),
        new Date("2025-02-01"),
        new Date("2025-03-01"),
        new Date("2025-04-01")
      ];
      const dataGenerator = () => [] as unknown[];
      const results = DateUtils.DateRange.fromList(dates, dataGenerator);
      for (let i = 0; i < results.length; i += 1) {
        expect(results[i].data).not.toBeNull();
        expect(Array.isArray(results[i].data)).toBe(true);
      }
    });
    it("count matches", () => {
      const dates = [
        new Date("2025-01-01"),
        new Date("2025-02-01"),
        new Date("2025-03-01"),
        new Date("2025-04-01")
      ];
      const dataGenerator = () => [] as unknown[];
      const results = DateUtils.DateRange.fromList(dates, dataGenerator);
      dates.forEach((date) => {
        (results.find((rl) => rl.contains(date))!.data as unknown[]).push(
          date
        );
      });
      expect((results[0].data as unknown[]).length).toBe(2);
      expect((results[1].data as unknown[]).length).toBe(1);
      expect((results[2].data as unknown[]).length).toBe(1);
    });
    it("count matches doc example", () => {
      const dates = [
        new Date("2025-01-01"),
        new Date("2025-02-01"),
        new Date("2025-03-01"),
        new Date("2025-04-01")
      ];
      const dataGenerator = () => [] as unknown[];
      const results = DateUtils.DateRange.fromList(dates, dataGenerator);
      dates.forEach((date) =>
        (results.find((rl) => rl.contains(date))!.data as unknown[]).push(date)
      );
      const expected = `2025-01-01T00:00:00.000Z to 2025-02-01T00:00:00.000Z: has 2
2025-02-01T00:00:00.000Z to 2025-03-01T00:00:00.000Z: has 1
2025-03-01T00:00:00.000Z to 2025-04-01T00:00:00.000Z: has 1`;
      const resultsStr = results
        .map((rl) => `${rl.toString()}: has ${(rl.data as unknown[]).length}`)
        .join("\n");
      expect(resultsStr).toEqual(expected);
    });
    it("cannot create a list from an empty list", () => {
      const dates: Date[] = [];
      const results = DateUtils.DateRange.fromList(dates);
      expect(results).toEqual([]);
    });
    it("cannot create a list from a list with one date", () => {
      const dates = [new Date("2025-02-01")];
      const results = DateUtils.DateRange.fromList(dates);
      expect(results).toEqual([]);
    });
  });

  describe("generateDateSequence", () => {
    it("example for one hour", () => {
      const start = new Date("2025-01-01 01:00:00");
      const end = new Date("2025-01-01 02:00:00");
      const results = DateUtils.generateDateSequence(start, end, {
        minutes: 30
      });
      const expected = [
        start,
        new Date("2025-01-01 01:30:00"),
        end
      ];
      expect(results).toEqual(expected);
    });
    it("if not a valid start date", () => {
      const start = "string" as unknown as Date;
      const end = new Date("2025-01-01 02:00:00");
      const expected = "Invalid start date:string";
      expect(() => {
        DateUtils.generateDateSequence(start, end, { minutes: 30 });
      }).toThrow(expected);
    });
    it("if not a valid end date", () => {
      const start = new Date("2025-01-01 02:00:00");
      const end = "string" as unknown as Date;
      const expected = "Invalid end date:string";
      expect(() => {
        DateUtils.generateDateSequence(start, end, { minutes: 30 });
      }).toThrow(expected);
    });
  });

  describe("arrange", () => {
    it("example for one hour", () => {
      const start = new Date("2025-01-01 01:00:00");
      const count = 1;
      const options = { hours: 1 };
      const results = DateUtils.arrange(start, count, options);
      const expected = [
        new Date("2025-01-01 01:00:00"),
        new Date("2025-01-01 02:00:00")
      ];
      expect(results).toEqual(expected);
    });
    it("example for four weeks", () => {
      const start = new Date("2025-01-01 01:00:00");
      const count = 4;
      const options = { days: 7 };
      const results = DateUtils.arrange(start, count, options);
      const expected = [
        new Date("2025-01-01 01:00:00"),
        new Date("2025-01-08 01:00:00"),
        new Date("2025-01-15 01:00:00"),
        new Date("2025-01-22 01:00:00"),
        new Date("2025-01-29 01:00:00")
      ];
      expect(results).toEqual(expected);
    });
    it("example for four weeks + 1 hour", () => {
      const start = new Date("2025-01-01 01:00:00");
      const count = 4;
      const options = { days: 7, hours: 1 };
      const results = DateUtils.arrange(start, count, options);
      const expected = [
        new Date("2025-01-01 01:00:00"),
        new Date("2025-01-08 02:00:00"),
        new Date("2025-01-15 03:00:00"),
        new Date("2025-01-22 04:00:00"),
        new Date("2025-01-29 05:00:00")
      ];
      expect(results).toEqual(expected);
    });
    it("if not a valid start date", () => {
      const start = "string" as unknown as Date;
      const count = 1;
      const options = { hours: 1 };
      const expected = "Invalid start date:string";
      expect(() => {
        DateUtils.arrange(start, count, options);
      }).toThrow(expected);
    });
  });

  describe("overwrite", () => {
    describe("can", () => {
      it("overwrite a date with a date", () => {
        const dateToUpdate = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
        const newDate = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
        const expected = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
        const result = DateUtils.overwrite(dateToUpdate, newDate);
        expect(result).toEqual(expected);
      });
      it("overwrite a date with a string", () => {
        const dateToUpdate = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
        const newDate = "2025-01-01T13:30:00.000Z";
        const expected = new Date(Date.UTC(2025, 0, 1, 13, 30, 0));
        const result = DateUtils.overwrite(dateToUpdate, newDate);
        expect(result).toEqual(expected);
      });
      it("overwrite a date with an epoch", () => {
        const dateToUpdate = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
        const newDate = new Date(Date.UTC(2025, 0, 1, 13, 30, 0)).getTime();
        const expected = new Date(Date.UTC(2025, 0, 1, 13, 30, 0));
        const result = DateUtils.overwrite(dateToUpdate, newDate);
        expect(result).toEqual(expected);
      });
    });
    describe("cannot", () => {
      it("update if dateToUpdate is not a date", () => {
        const dateToUpdate = null as unknown as Date;
        const newDate = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
        const expected = "date.overwrite: dateToUpdate is not a date:null";
        expect(() => {
          DateUtils.overwrite(dateToUpdate, newDate);
        }).toThrow(expected);
      });
      it("update if dateToUpdate is something weird", () => {
        const dateToUpdate = {} as unknown as Date;
        const newDate = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
        const expected =
          "date.overwrite: dateToUpdate is not a date:[object Object]";
        expect(() => {
          DateUtils.overwrite(dateToUpdate, newDate);
        }).toThrow(expected);
      });
      it("update if newDate is not a date", () => {
        const dateToUpdate = new Date(Date.UTC(2024, 0, 1, 6, 0, 0));
        const newDate = null as unknown as number;
        const expected =
          "date.overwrite: cannot set to an invalid date:null";
        expect(() => {
          DateUtils.overwrite(dateToUpdate, newDate);
        }).toThrow(expected);
      });
      it("update if newDate is something weird", () => {
        const dateToUpdate = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
        const newDate = {} as unknown as number;
        const expected =
          "cannot overwrite date:2025-01-01T12:00:00.000Z, unknown newDateEpoch: [object Object]";
        expect(() => {
          DateUtils.overwrite(dateToUpdate, newDate);
        }).toThrow(expected);
      });
    });
  });

  describe("clone", () => {
    it("can clone a value with the same time", () => {
      const originalDate = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
      const result = DateUtils.clone(originalDate);
      expect(result).toEqual(originalDate);
    });
    it("does not modify the original date", () => {
      const originalDate = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
      const result = DateUtils.clone(originalDate);
      const expected = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
      originalDate.setFullYear(1900);
      expect(result).toEqual(expected);
    });
  });
});
