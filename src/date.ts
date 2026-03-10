/**
 * Utility methods for working with dates and date ranges.
 *
 * * Validate
 *   * {@link isValid} - whether the date provided is a valid date (not an Invalid Date instance)
 * * Parse
 *   * {@link parse} - parse a date and throw an exception if it is not a valid date
 * * Timezones
 *   * {@link toLocalISO} - prints in 8601 format with timezone offset based on a tz entry - like america/chicago
 *   * {@link localISOFormatter} - prints in 8601 format - slightly improved performance for large scale use
 *   * {@link getTimezoneOffset} - gets the number of milliseconds offset for a given timezone
 *   * {@link correctForTimezone} - meant to correct a date already off from UTC to the correct time
 *   * {@link epochShift} - offsets a date from UTC to a given time amount
 *   - knowing some methods might behave incorrectly
 * * Add
 *   * {@link add} - shift a date by a given amount
 *   * {@link endOfDay} - finds the end of day UTC for a given date
 *   * {@link startOfDay} - finds the start of day UTC for a given date
 * * Overwrite
 *   * {@link overwrite} - overwrite the value inside a Date
 *   * {@link clone} - clone the value of a Date, so it is not modified
 * * Print
 *   * {@link durationLong} - displays duration in legible form: `D days, H hours, M minutes, S.MMM seconds`
 *   * {@link durationISO} - displays duration in condensed form: `D:HH:MM:SS.MMM`
 * * Generate Date Sequence
 *   * {@link arrange} - create a sequence of dates by continually adding to them
 *   * {@link generateDateSequence} - create a sequence of dates by continually adding between dates
 *   * {@link DateRange.fromList} - pass a sequence of dates to create a list of DateRanges
 *
 * --------
 *
 * See other libraries for more complete functionality:
 *
 * * [Luxon](https://moment.github.io/luxon/index.html) - successor to [Moment.js](https://momentjs.com/)
 * * [date-fns-tz](https://github.com/marnusw/date-fns-tz) extension for [date-fns](https://date-fns.org/)
 *
 * also watch the [TC39 Temporal Proposal](https://github.com/tc39/proposal-temporal)
 * - also found under caniuse: https://caniuse.com/temporal
 *
 * --------
 *
 * List of timezone supported is based on the version of javascript used.
 *
 * Please see:
 * * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat|Intl.DateTimeFormat from MDN}
 * * {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones|wikipedia list of tz database names}
 *
 * @see {@link https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone}
 * @see {@link https://www.youtube.com/watch?v=2rnIHsqABfM&t=750s|epochShifting}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTimezones|MDN Timezone Names}
 */

/** Options for adding time to a date (years, months, days, hours, minutes, seconds, milliseconds). */
export interface AddOptions {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export type DateInput = Date | number;

/**
 * Timezone entry with formatters and offset info.
 * - tz: the name of the timezone
 * - formatter: formats a date to that local timezone
 * - epoch: the difference in milliseconds from that tz to UTC
 * - offset: ISO format for how many hours and minutes offset to UTC '+|-' HH:MM
 * - toLocalISO: formatter function that formats a date to local ISO
 * - toLocalISOWeekday: formatter function that formats a date to local ISO + weekday
 * - getWeekday: formatter function that determines the day of week for a date
 */
export interface TimezoneEntry {
  tz: string;
  formatter: (date: DateInput) => string;
  epoch: number;
  offset: string;
  toLocalISO: (date: DateInput) => string;
  toLocalISOWeekday: (date: DateInput) => string;
  getWeekday: (date: DateInput) => string;
}

/** Divides value by denominator, returns { value: quotient, remainder }. */
export const divideRemainder = (
  val: number,
  denominator: number
): { value: number; remainder: number } => ({
  value: Math.floor(val / denominator),
  remainder: val % denominator
});

/** Collection of time durations in milliseconds (MILLI, SECOND, MINUTE, HOUR, DAY). */
export const TIME: {
  MILLI: number;
  SECOND: number;
  MINUTE: number;
  HOUR: number;
  DAY: number;
} = {
  MILLI: 1,
  SECOND: 0,
  MINUTE: 0,
  HOUR: 0,
  DAY: 0
};
TIME.SECOND = TIME.MILLI * 1000;
TIME.MINUTE = TIME.SECOND * 60;
TIME.HOUR = TIME.MINUTE * 60;
TIME.DAY = TIME.HOUR * 24;

/** Pads a number with leading zeros to the given size. */
export function padTime(num: number, size: number = 2): string {
  return String(num).padStart(size, "0");
}

/**
 * Simple check on whether the a JavaScript Date object is - or is not - an 'Invalid Date' instance.
 *
 * ```
 * d = new Date('2024-12-1');
 * utils.date.isValid(d); // true
 *
 * d = new Date('2024-12-1T');
 * utils.date.isValid(d); // false
 *
 * d = new Date('some string');
 * utils.date.isValid(d); // false
 * ```
 *
 * @param testDate - JavaScript date to validate
 * @returns whether the Date object is an 'invalid date' instance
 */
export function isValid(testDate: unknown): boolean {
  if (!testDate) return false;
  if (!(testDate instanceof Date)) return false;
  return !Number.isNaN(testDate.getTime());
}

/**
 * Harshly parses a JavaScript Date.
 *
 * If the testValue is null, undefined then the same value is returned.
 *
 * if the testValue is a valid Date - then the parsed Date object is returned.
 *
 * If the testValue is not a valid Date, then throws an Error.
 *
 * ```
 * d = utils.date.parse('2024-12-01'); // returns Date object
 * d = utils.date.parse(0); // returns Date object
 *
 * d = utils.date.parse(null); // returns null
 * ```
 *
 * @param dateStr - value passed to Date.parse
 * @returns parsed Date or null/undefined
 * @see {@link isValid} - in checking for invalid dates
 */
export function parse(dateStr: string | number | null | undefined): Date | null | undefined {
  if (dateStr === undefined || dateStr === null) return dateStr;
  const result = new Date(Date.parse(String(dateStr)));
  if (!isValid(result)) {
    throw new Error(`Could not parse date: ${dateStr}`);
  }
  return result;
}

/**
 * Prints the duration in ISO format: `D:HH:MM:SS.MMM`
 *
 * ```
 * start = new Date(Date.UTC(2024, 12, 26, 12, 0, 0));
 * end = new Date(Date.UTC(2024, 12, 26, 13, 0, 0));
 *
 * duration = end.getTime() - start.getTime();
 *
 * utils.date.durationISO(duration); // '0:01:00:00.000'
 * ```
 *
 * @param epochDifference - difference in milliseconds between two dates
 * @returns `D:HH:MM:SS.MMM`
 * @see {@link DateRange.duration}
 */
export function durationISO(epochDifference: number): string {
  const signStr = epochDifference < 0 ? "-" : "";
  let result = divideRemainder(Math.abs(epochDifference), TIME.DAY);
  const days = String(result.value);
  result = divideRemainder(result.remainder, TIME.HOUR);
  const hours = String(result.value).padStart(2, "0");
  result = divideRemainder(result.remainder, TIME.MINUTE);
  const minutes = String(result.value).padStart(2, "0");
  result = divideRemainder(result.remainder, TIME.SECOND);
  const seconds = String(result.value).padStart(2, "0");
  const milli = String(result.remainder).padStart(3, "0");
  return `${signStr}${days}:${hours}:${minutes}:${seconds}.${milli}`;
}

/**
 * Prints the duration in long format: `D days, H hours, M minutes, S.MMM seconds`
 *
 * ```
 * start = new Date(Date.UTC(2024, 12, 26, 12, 0, 0));
 * end = new Date(Date.UTC(2024, 12, 27, 13, 0, 0));
 *
 * duration = end.getTime() - start.getTime();
 *
 * utils.date.durationLong(duration); // '1 days, 1 hours, 0 minutes, 0.00 seconds'
 * ```
 *
 * @param epochDifference - difference in milliseconds between two dates
 * @returns `D days, H hours, M minutes, S.MMM seconds`
 * @see {@link DateRange.duration}
 */
export function durationLong(epochDifference: number): string {
  const signStr = epochDifference < 0 ? "-" : "";
  let result = divideRemainder(Math.abs(epochDifference), TIME.DAY);
  const days = result.value;
  result = divideRemainder(result.remainder, TIME.HOUR);
  const hours = result.value;
  result = divideRemainder(result.remainder, TIME.MINUTE);
  const minutes = result.value;
  result = divideRemainder(result.remainder, TIME.SECOND);
  const seconds = result.value;
  const milli = result.remainder;
  return `${signStr}${days} days, ${hours} hours, ${minutes} minutes, ${seconds}.${milli} seconds`;
}

/** Collection of TimezoneEntries by the tz string (cached for reuse). */
export const timezoneOffsetMap: Map<string, TimezoneEntry> = new Map<string, TimezoneEntry>();

/** Fetches or creates a TimezoneEntry for the given timezone string. */
export function getTimezoneEntry(timezoneStr: string): TimezoneEntry {
  const cleanTz = String(timezoneStr).toLowerCase();
  const cached = timezoneOffsetMap.get(cleanTz);
  if (cached) return cached;

  const d = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));
  const dtFormat = new Intl.DateTimeFormat("en-us", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    fractionalSecondDigits: 3,
    timeZone: cleanTz
  });
  const dayOfWeekFormat = new Intl.DateTimeFormat("en-us", {
    weekday: "short",
    timeZone: cleanTz
  });
  const getWeekday = (date: DateInput) =>
    dayOfWeekFormat.format(typeof date === "number" ? new Date(date) : date);

  type PartsRecord = Record<string, string | number>;
  const getOffset = (dateValue: DateInput): Date => {
    const d = typeof dateValue === "number" ? new Date(dateValue) : dateValue;
    const dm = dtFormat
      .formatToParts(d)
      .filter((p) => p.type !== "literal")
      .reduce<PartsRecord>((result, { type, value }) => {
        result[type] = value;
        return result;
      }, {});
    return new Date(
      Date.UTC(
        Number(dm.year),
        Number(dm.month) - 1,
        Number(dm.day),
        Number(dm.hour),
        Number(dm.minute),
        Number(dm.second),
        Number(dm.fractionalSecond ?? 0)
      )
    );
  };

  const formatter = (dateValue: DateInput): string => {
    const d = typeof dateValue === "number" ? new Date(dateValue) : dateValue;
    const dm = dtFormat
      .formatToParts(d)
      .filter((p) => p.type !== "literal")
      .reduce<PartsRecord>((result, { type, value }) => {
        result[type] = value;
        return result;
      }, {});
    const dateStr = `${dm.year}-${padTime(Number(dm.month))}-${padTime(Number(dm.day))}T${padTime(Number(dm.hour) % 24)}:${padTime(Number(dm.minute))}:${padTime(Number(dm.second))}.${padTime(Number(dm.fractionalSecond ?? 0), 3)}`;
    return dateStr;
  };

  const impactedDate = getOffset(d);
  const diff =
    (d.getTime() - impactedDate.getTime()) % 86400000;
  const diffSign = diff > 0 ? "-" : "+";
  let remainder = divideRemainder(Math.abs(diff), TIME.HOUR);
  const diffHours = remainder.value;
  remainder = divideRemainder(remainder.remainder, TIME.MINUTE);
  const diffMinutes = remainder.value;
  const offset = `${diffSign}${padTime(diffHours)}:${padTime(diffMinutes)}`;
  const toLocalISO = (date: DateInput) => `${formatter(date)}${offset}`;
  const toLocalISOWeekday = (date: DateInput) =>
    `${formatter(date)}${offset} - ${getWeekday(date)}`;
  const result: TimezoneEntry = {
    tz: cleanTz,
    formatter,
    toLocalISO,
    toLocalISOWeekday,
    getWeekday,
    epoch: diff,
    offset
  };
  timezoneOffsetMap.set(cleanTz, result);
  return result;
}

/**
 * Determines the number of milliseconds difference between
 * a given timezone and UTC.
 *
 * (Note: these values are cached, and optimized for repeated use on the same value)
 *
 * See {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones|the list of TZ database time zones}
 * for the full list of options.
 *
 * @param timezoneStr - a timezone string like "America/Toronto"
 * @returns the number of milliseconds between UTC and that timezone
 */
export function getTimezoneOffset(timezoneStr: string): number {
  return getTimezoneEntry(timezoneStr).epoch;
}

/**
 * CorrectForTimezone is the opposite of {@link epochShift}.
 * (This subtracts the timezone offset to a date, where the other adds the offset)
 *
 * Use this when a date string is read by javascript, BUT the timezone is not sent or passed.
 *
 * For example, something VERY IMPORTANT happened at '2/1/2025, 2:15:41 PM EST', ISO '2025-02-01T20:15:41.000Z', epoch: 1738440941000.
 *
 * But the dates from the database don't include the timezone.
 * (Note that `Z` is conceptually equivalent of +0000)
 *
 * If I create a date in javaScript WITHOUT the timezone, it assumes my local timezone.
 *
 * ```
 * dTest = new Date('2025-02-01T20:15:41.000'); // -- DID NOT INCLUDE Timezone, so it assumes local timezone
 * ({ epoch: dTest.getTime(), iso: dTest.toISOString(), local: dTest.toLocaleString() });
 *
 * //-- time is INCORRECT, what should be the ISO time, is the local time.
 * //  local: '2/1/2025, 8:15:41 PM', iso: '2025-02-02T02:15:41.000Z', epoch: 1738440941000
 * ```
 *
 * It assumed that the local time was 8pm instead of that as the ISO / GMT time.
 *
 * To correct this, I just call epoch shift
 *
 * ```
 * dTest = new Date('2025-02-01T20:15:41.000'); // -- DID NOT INCLUDE Timezone, so it assumes local timezone
 * dTest2 = utils.date.epochShift(dTest, 'us/central');  //-- correct for my local timezone
 * ({ epoch: dTest2.getTime(), iso: dTest.toISOString(), local: dTest.toLocaleString() });
 *
 * //-- time is CORRECT
 * // local: '2/1/2025, 2:15:41 PM', iso: '2025-02-01T20:15:41.000Z', epoch: 1738440941000
 * ```
 *
 * See {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones|the list of TZ database time zones}
 * for the full list of timezone options.
 *
 * @param date - the date to be corrected in a new instance
 * @param localTimezoneStr - tz database name for YOUR current machine's timezone
 * @returns new instance of a corrected date back to UTC
 * @see {@link correctForOtherTimezone} - if the date given is "local" but for another timezone
 * @see {@link toLocalISO} - if you want to print a date to another timezone
 */
export function correctForTimezone(date: Date, localTimezoneStr: string): Date {
  const { epoch } = getTimezoneEntry(localTimezoneStr);
  return new Date(date.getTime() - epoch);
}

/**
 * This helps you correct a "local date" from another timezone.
 *
 * For example, if you got '2:15 PM' from a machine that is in eastern.
 *
 * Combination of {@link correctForTimezone} and {@link epochShift}
 *
 * For example, say you got a timezone string like this: `2024-12-27 13:30:00`
 *
 * You know the timezone of the source is in `us/eastern`, but you are in `us/central`.
 *
 * If you just use `Date.parse(dateString), it assumes `1:30 Central` - not `1:30 Eastern`
 *
 * We can correct it like this:
 *
 * ```
 * dateStr = '2024-12-27 13:30:00';
 * d = new Date(Date.parse(dateStr));
 *
 * //-- the source was from 'us/eastern' timezone (-0500)
 * sourceTimezone = 'us/eastern';
 *
 * //-- we are currently in 'us/central' timezone (-0600)
 * //-- this matters because of the Date.parse() done before
 * localTimezone = 'us/central'; // (change if yours is different)
 *
 * utils.date.correctForOtherTimezone( d, sourceTimezone, localTimezone);
 *
 * //-- correctly converted it to the correct local time
 * // 2024-12-27T18:30:00.000Z
 * ```
 *
 * @param date - the date to be corrected in a new instance
 * @param sourceTimezone - the timezone of the source information
 * @param localTimezone - the timezone of this local machine
 * @returns new date that is corrected to UTC
 * @see {@link toLocalISO} - if you want to print a date to another timezone
 */
export function correctForOtherTimezone(
  date: Date,
  sourceTimezone: string,
  localTimezone: string
): Date {
  return correctForTimezone(epochShift(date, sourceTimezone), localTimezone);
}

/**
 * EpochShift is the opposite of {@link correctForTimezone}.
 * (This adds the timezone offset, where the other subtracts the offset)
 *
 * Use this if you somehow have a date that needs to be shifted by the timezone offset.
 *
 * For example, if you have a time that is already in GMT, and want the date shifted by a timezone.
 *
 * This is used internally for {@link correctForOtherTimezone}
 * if local dates are provided - but for a different timezone you yourself are not in.
 *
 * ---
 *
 * Epoch shift changes the internals of a JavaScript date, so the utcDate is no longer correct,
 * but many other functions behave closer to expected.
 *
 * Once you epoch shift the date, then time stored in the date is incorrect (because it always points to GMT)
 *
 * For example, using `.toIsoString()` or anything with Intl.DateTimeFormat etc - will all give you incorrect results.
 *
 * See {@link https://stackoverflow.com/a/15171030|here why this might not be what you want}
 *
 * * {@link correctForTimezone} or
 * * {@link correctForOtherTimezone}.
 *
 * @param date - date to shift
 * @param timezoneStr - the tz database name of the timezone
 * @returns new Date with epoch shifted
 * @see {@link toEpochShiftedISO} - this will print the "local time" of an epoch shifted date.
 * @see {@link toLocalISO} - consider as an alternative. This prints the correct time, without updating the date object.
 * @see {@link correctForTimezone} - once shifted, this allows you to shift a date back to GMT time.
 */
export function epochShift(date: Date, timezoneStr: string): Date {
  const { epoch } = getTimezoneEntry(timezoneStr);
  return new Date(date.getTime() + epoch);
}

/**
 * Prints a date in 8601 format to a timezone (with +H:MM offset) using
 * [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
 *
 * The date accepted here is assumed to already have the internal clock set to GMT.
 *
 * If you do epochShift, then use {@link toEpochShiftedISO}
 * and pass the timezone the timezone the date is epoch shifted to.
 *
 * ```
 * d = Date.parse('2024-12-27 13:30:00');
 *
 * utils.date.toLocalISO(d, 'america/Chicago'); // '2024-12-27T07:30:00.000-06:00'
 * utils.date.toLocalISO(d, 'europe/paris'); //    '2024-12-27T14:30:00.000+01:00'
 * ```
 *
 * Sometimes it is helpful to have the weekday to make sense of things
 *
 * ```
 * utils.date.toLocalISO(d, 'america/Chicago', true); // '2024-12-27T07:30:00.000-06:00 FRI'
 * utils.date.toLocalISO(d, 'europe/paris', true); //    '2024-12-27T14:30:00.000+01:00 FRI'
 * ```
 *
 * @param date - date to print
 * @param timezoneStr - the tz database name of the timezone
 * @param includeWeekday - whether to include the weekday (default false)
 * @returns ISO format with timezone offset
 * @see {@link localISOFormatter} - if you're converting to string frequently
 */
export function toLocalISO(
  date: DateInput,
  timezoneStr: string,
  includeWeekday: boolean = false
): string {
  const entry = getTimezoneEntry(timezoneStr);
  return includeWeekday ? entry.toLocalISOWeekday(date) : entry.toLocalISO(date);
}

/**
 * If repeatedly asking for a local time, use this method instead.
 *
 * ```
 * myDate = new Date('2025-01-15T06:00:00.000Z');
 * centralFormatter = utils.date.localISOFormatter('us/central');
 * centralFormatter(myDate); // '2025-01-15T00:00:00.000Z'
 * ```
 *
 * as opposed to
 *
 * ```
 * myDate = new Date('2025-01-15T06:00:00.000Z');
 * utils.date.toLocalISO(myDate, 'us/central'); // '2025-01-15T00:00:00.000Z'
 * ```
 *
 * @param timezoneStr - tz database name for the timezone
 * @param includeWeekday - whether to include the weekday (default false)
 * @returns (date) => string - 'yyyy-mm-ddThh:mm:ss.MMM[+-]TZOFFSET'
 * @see {@link toLocalISO}
 */
export function localISOFormatter(
  timezoneStr: string,
  includeWeekday: boolean = false
): (date: DateInput) => string {
  const entry = getTimezoneEntry(timezoneStr);
  return includeWeekday ? entry.toLocalISOWeekday : entry.toLocalISO;
}

/**
 * Determines the weekday of a date
 *
 * @param date - date to print
 * @param timezoneStr - the tz database name of the timezone
 * @returns Currently returns `en-us` formatted day of week of a date
 * @see {@link toLocalISO}
 * @example
 * date = new Date('2025-01-15T06:00:00.000Z');
 * utils.date.getWeekday(date, 'us/pacific'); // Tue
 * utils.date.getWeekday(date, 'us/eastern'); // Wed
 */
export function getWeekday(date: DateInput, timezoneStr: string): string {
  return getTimezoneEntry(timezoneStr).getWeekday(date);
}

/** Returns ISO-like string using local date components (no timezone offset). */
export function toIsoStringNoTimezone(date: Date): string {
  return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}T${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}.${padTime(date.getMilliseconds(), 3)}`;
}

function toIsoStringUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${padTime(date.getUTCMonth() + 1)}-${padTime(date.getUTCDate())}T${padTime(date.getUTCHours())}:${padTime(date.getUTCMinutes())}:${padTime(date.getUTCSeconds())}.${padTime(date.getUTCMilliseconds(), 3)}`;
}

/**
 * Print a date that has been epoch shifted.
 *
 * Dates in JavaScript are always stored in GMT, although you can format it to different times with
 * [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
 *
 * Once you epoch shift the date, then time stored in the date is incorrect (because it always points to GMT)
 *
 * For example, using `.toIsoString()` or anything with Intl.DateTimeFormat etc - will all give you incorrect results.
 *
 * If you want an ISO format for an epoch shifted date, you'll need something like this.
 *
 * @param date - Date to Print
 * @param timezoneStr - the tz database name of the timezone the date is shifted to
 * @returns date in the format of `YYYY-MM-DDTHH:mm:SS.MMMM[+-]TZ`
 * @see {@link correctForTimezone} - to shift the date back to GMT
 * @see {@link toLocalISO} - if the date is not epoch shifted as this uses Intl.DateTimeFormat
 */
export function toEpochShiftedISO(date: Date, timezoneStr: string): string {
  const { offset } = getTimezoneEntry(timezoneStr);
  return `${toIsoStringUTC(date)}${offset}`;
}

/**
 * Clones a date.
 *
 * (Doesn't seem needed currently)
 *
 * (NOTE: the timezone information is lost)
 *
 * @param targetDate - the date to be cloned
 * @returns new Date with same epoch
 */
export function clone(targetDate: Date): Date {
  return new Date(targetDate.getTime());
}

/**
 * Overwrite the internal time for a date object.
 *
 * ```
 * const targetDate = new Date('2025-01-01');
 * utils.date.overwrite(targetDate, new Date('2025-02-01'));
 *
 * targetDate.toISOString(); // 2025-02-01T00:00:00.000Z
 * ```
 *
 * @param dateToUpdate - date object to modify the time in-place
 * @param newDateEpoch - the new time in epoch, Date, or parseable string
 * @returns dateToUpdate but with the internal date aligned to newDateEpoch
 */
export function overwrite(
  dateToUpdate: Date,
  newDateEpoch: number | Date | string
): Date {
  if (!(dateToUpdate instanceof Date)) {
    throw new Error(`date.overwrite: dateToUpdate is not a date:${dateToUpdate}`);
  }
  let cleanEpoch: number;
  if (newDateEpoch === undefined || newDateEpoch === null) {
    throw new Error(
      `date.overwrite: cannot set to an invalid date:${newDateEpoch}`
    );
  } else if (typeof newDateEpoch === "number") {
    cleanEpoch = newDateEpoch;
  } else if (newDateEpoch instanceof Date) {
    cleanEpoch = newDateEpoch.getTime();
  } else if (typeof newDateEpoch === "string") {
    cleanEpoch = Date.parse(newDateEpoch);
  } else {
    throw new Error(
      `cannot overwrite date:${dateToUpdate.toISOString()}, unknown newDateEpoch: ${newDateEpoch}`
    );
  }
  dateToUpdate.setTime(cleanEpoch);
  return dateToUpdate;
}

/**
 * Adds an amount to a date: days, hours, minutes, seconds
 *
 * ```
 * d = new Date('2024-12-26 6:00:00');
 * d30 = utils.date.add(d, { minutes: 30 }); // Date('2024-12-26 6:30:00')
 * ```
 *
 * @param dateValue - date to add to
 * @param options - options of what to add
 * @param options.years - increments the calendar year (as opposed to adding 365.25 days)
 * @param options.months - increments the calendar month (as opposed to adding in 30 days)
 * @param options.days - number of days to add
 * @param options.minutes - number of minutes to add
 * @param options.hours - number of hours to add
 * @param options.seconds - number of seconds to add
 * @param options.milliseconds - number of milliseconds to add
 * @returns Date with the interval added in
 */
export function add(
  dateValue: Date,
  options: AddOptions | null = null
): Date {
  if (!options) return dateValue;
  const {
    days = 0,
    minutes = 0,
    hours = 0,
    seconds = 0,
    milliseconds = 0
  } = options;
  const result = new Date(
    dateValue.getTime() +
      TIME.DAY * days +
      TIME.HOUR * hours +
      TIME.MINUTE * minutes +
      TIME.SECOND * seconds +
      TIME.MILLI * milliseconds
  );
  if (Object.hasOwn(options, "years")) {
    result.setFullYear(result.getFullYear() + (options.years ?? 0));
  }
  if (Object.hasOwn(options, "months")) {
    result.setMonth(result.getMonth() + (options.months ?? 0));
  }
  return result;
}

/**
 * Creates a new date that is at the end of the day (in UTC)
 *
 * ```
 * d = new Date('2024-12-26 6:00:00');
 * dEnd = utils.date.endOfDay(d); // Date('2024-12-26 23:59:59.999')
 * ```
 *
 * @param dateValue - Date where only the year,month,day is used
 * @returns new date set to the end of the day for dateValue's date
 */
export function endOfDay(dateValue: Date): Date {
  const startDate =
    Math.floor(dateValue.getTime() / TIME.DAY) * TIME.DAY;
  return new Date(startDate + TIME.DAY - 1);
}

/**
 * Creates a new date that is at the start of the day (in UTC)
 *
 * ```
 * d = new Date('2024-12-26 6:00:00');
 * dEnd = utils.date.startOfDay(d); // Date('2024-12-26 0:00:00.000')
 * ```
 *
 * @param dateValue - Date where only the year,month,day is used
 * @returns new date set to the start of the day for dateValue's date
 */
export function startOfDay(dateValue: Date): Date {
  const startDate =
    Math.floor(dateValue.getTime() / TIME.DAY) * TIME.DAY;
  return new Date(startDate);
}

/**
 * Creates an array of dates, starting with the startDate,
 * and adding in the options count number of times.
 *
 * ```
 * const startDate = new Date('2025-02-02');
 * utils.date.arrange(startDate, 6, { days: 1 });
 * //   ['2025-02-02 00:00:00')
 * //   ['2025-02-03 00:00:00')
 * //   ['2025-02-04 00:00:00')
 * //   ['2025-02-05 00:00:00')
 * //   ['2025-02-06 00:00:00')
 * //   ['2025-02-07 00:00:00')
 * //   ['2025-02-08 00:00:00')
 * // ]
 * ```
 *
 * @param startDate - startingDate to compare to
 * @param count - Number of times to add the options
 * @param options - options similar to {@link add}
 * @param options.days - how many days to add each check
 * @param options.hours - how many hours to add each check
 * @param options.minutes - how many minutes to add each check
 * @param options.seconds - how many seconds to add each check
 * @param options.years - increments the calendar year (as opposed to adding 365.25 days)
 * @param options.months - increments the calendar month (as opposed to adding in 30 days)
 * @returns collection of dates (count + 1 long)
 * @see {@link add}
 * @see {@link generateDateSequence} - finish at an endingDate instead of # of iterations
 * @see {@link DateRange.fromList} - to create Date Ranges from these dates.
 */
export function arrange(
  startDate: Date,
  count: number,
  options: AddOptions
): Date[] {
  if (!isValid(startDate)) {
    throw new Error(`Invalid start date:${startDate}`);
  }
  const results: Date[] = new Array(count + 1);
  results[0] = startDate;
  let currentDate = startDate;
  for (let i = 0; i < count; i += 1) {
    currentDate = add(currentDate, options);
    results[i + 1] = currentDate;
  }
  return results;
}

/**
 * Creates an array of dates, beginning at startDate,
 * and adding time until EndDate is reached.
 *
 * ```
 * const startDate = new Date('2025-02-02');
 * const endDate = new Date('2025-02-09 23:59:59.000+0');
 * // alternative
 * // endDate = utils.date.endOfDay(utils.date.add(startDate, { days: 7 }));
 *
 * utils.date.generateDateSequence(startDate, endDate, { days: 1 });
 * //   ['2025-02-02 00:00:00.000'],
 * //   ['2025-02-03 00:00:00.000'],
 * //   ['2025-02-04 00:00:00.000'],
 * //   ['2025-02-05 00:00:00.000'],
 * //   ['2025-02-06 00:00:00.000'],
 * //   ['2025-02-07 00:00:00.000'],
 * //   ['2025-02-08 00:00:00.000'],
 * //   ['2025-02-09 00:00:00.000'],
 * //   ['2025-02-09 23:59:59.999']
 * // ]
 * ```
 *
 * @param startDate - starting date
 * @param endDate - ending date
 * @param options - options similar to {@link add}
 * @param options.days - how many days to add each check
 * @param options.hours - how many hours to add each check
 * @param options.minutes - how many minutes to add each check
 * @param options.seconds - how many seconds to add each check
 * @param options.years - increments the calendar year (as opposed to adding 365.25 days)
 * @param options.months - increments the calendar month (as opposed to adding in 30 days)
 * @returns sequence of dates from startDate to endDate
 * @see {@link add}
 * @see {@link arrange} - run a set of iterations instead of stopping at endDate
 * @see {@link DateRange.fromList} - to create Date Ranges from these dates.
 */
export function generateDateSequence(
  startDate: Date,
  endDate: Date,
  options: AddOptions
): Date[] {
  const results: Date[] = [];
  if (!isValid(startDate)) {
    throw new Error(`Invalid start date:${startDate}`);
  }
  if (!isValid(endDate)) {
    throw new Error(`Invalid end date:${endDate}`);
  }
  const endTime = endDate.getTime();
  for (
    let currentDate = startDate;
    isValid(currentDate) && currentDate.getTime() < endTime;
    currentDate = add(currentDate, options)
  ) {
    results.push(currentDate);
  }
  results.push(endDate);
  return results;
}

/**
 * Represents a Range between two timestamps.
 *
 * * Creating Date Range
 *   * {@link DateRange.fromList} - given a list of dates, make range bins for those dates.
 *   * {@link DateRange.reinitialize} - initialize the dateRange in-place with new start/end dates
 *   * {@link DateRange.shiftStart} - shifts the start of the range by hours,minutes,years, etc.
 *   * {@link DateRange.shiftEnd} - shifts the end of the range by hours,minutes,years, etc.
 *
 * * Understanding the Date Range
 *   * {@link DateRange.contains} - if a date is within this range.
 *   * {@link DateRange.startDate} - the starting date of the range
 *   * {@link DateRange.endDate} - the ending date of the range
 *   * {@link DateRange.startAndEndOfDay} - Creates a DateRange covering the start and end of a day
 *   * {@link DateRange.overlaps} - whether this DateRange overlaps another DateRange
 *   * {@link DateRange.isValid} - Whether the start and end times of this range are both valid dates
 * * Durations
 *   * {@link DateRange.duration} - Epoch duration (milliseconds) between the start and end timestamps
 *   * {@link DateRange.durationString} - creates a long duration description
 *   * {@link DateRange.durationISO} - returns the duration as a string formatted '0:01:00:00.0000'
 * * String Representation
 *   * {@link DateRange.toString} - String conversion of the DateRange
 *   * {@link DateRange.toLocaleString} - Creates a locale string describing the DateRange
 */
export class DateRange {
  /** The starting date */
  startDate!: Date;
  /** The ending date */
  endDate!: Date;
  /** Data attached to the DateRange */
  data!: unknown;

  /**
   * @param startDate - the starting date
   * @param endDate - the ending date
   * @param data - any data to store
   */
  constructor(
    startDate: Date | string,
    endDate: Date | string,
    data: unknown = null
  ) {
    this.reinitialize(startDate, endDate, data);
  }

  /**
   * Create a list of DateRanges, from a list of dates.
   *
   * ```
   * dates = [new Date('2025-01-01'),
   *   new Date('2025-02-01'),
   *   new Date('2025-03-01'),
   *   new Date('2025-04-01')];
   *
   * utils.DateRange.fromList(dates);
   * // [{start: 2025-01-01T00:00:00, end: 2025-02-01T00:00:00, },
   * //  {start: 2025-02-01T00:00:00, end: 2025-03-01T00:00:00},
   * //  {start: 2025-03-01T00:00:00, end: 2025-04-01T00:00:00}]
   * ```
   *
   * Often though, we want to remember something about the DateRange,
   * like which dates that it collected.
   *
   * ```
   * arrayGenerator = function() { return [] };
   * rangeList = utils.DateRange.fromList(dates, arrayGenerator);
   * // [{start: 2025-01-01T00:00:00, end: 2025-02-01T00:00:00},
   * //  {start: 2025-02-01T00:00:00, end: 2025-03-01T00:00:00},
   * //  {start: 2025-03-01T00:00:00, end: 2025-04-01T00:00:00}]
   *
   * dates.forEach((date) => rangeList
   *   .find(rl => rl.contains(date))
   *   .data.push(date)
   * );
   *
   * rangeList
   *   .map(rl => `${rl.toString()}: has ${rl.data.length}`)
   *   .join('\n');
   *
   * // 2025-01-01T00:00:00.000Z to 2025-02-01T00:00:00.000Z: has 2
   * // 2025-02-01T00:00:00.000Z to 2025-03-01T00:00:00.000Z: has 1
   * // 2025-03-01T00:00:00.000Z to 2025-04-01T00:00:00.000Z: has 1
   *
   * ```
   *
   * (Note: you can also use {@link arrange} or {@link generateDateSequence}
   * to come up with the list of those dates)
   *
   * (If gaps are desired - ex: April to May and next one June to July,
   * the simplest is to remove the dates from the resulting list.)
   *
   * @param dateSequence - list of dates
   * @param dataCreationFn - optional generator for data to be stored in each DateRange in the sequence
   * @returns list of dateSequence.length-1 dateRanges, where the end of the firstRange is the start of the next.
   * @see {@link arrange} - to create dates by adding a value multiple times
   * @see {@link generateDateSequence} - to create dates between a start and an end date
   */
  static fromList(
    dateSequence: Date[],
    dataCreationFn?: () => unknown
  ): DateRange[] {
    if (dateSequence.length < 2) return [];
    const results = new Array(dateSequence.length - 1);
    if (dataCreationFn) {
      for (let i = 0; i < dateSequence.length - 1; i += 1) {
        results[i] = new DateRange(
          dateSequence[i],
          dateSequence[i + 1],
          dataCreationFn()
        );
      }
    } else {
      for (let i = 0; i < dateSequence.length - 1; i += 1) {
        results[i] = new DateRange(dateSequence[i], dateSequence[i + 1]);
      }
    }
    return results;
  }

  /**
   * Reinitializes the object
   *
   * (Sometimes useful for shifting times after the fact)
   *
   * @param startDate - the starting date
   * @param endDate - the ending date
   * @param data - any data to store
   */
  reinitialize(
    startDate: Date | string,
    endDate: Date | string,
    data: unknown = null
  ): void {
    const cleanStart =
      startDate instanceof Date ? startDate : new Date(Date.parse(startDate));
    const cleanEnd =
      endDate instanceof Date ? endDate : new Date(Date.parse(endDate));
    if (cleanStart > cleanEnd) {
      this.startDate = cleanEnd;
      this.endDate = cleanStart;
    } else {
      this.startDate = cleanStart;
      this.endDate = cleanEnd;
    }
    this.data = data;
  }

  /**
   * Creates a DateRange based on the start and end of the day UTC.
   *
   * This is very useful for determining overlapping dates.
   *
   * (Alternatively, you can define a list of dates, and use
   * {@link DateRange.fromList} to create the bins from those dates)
   *
   * @param targetDate - date to use to find the start and end UTC for
   * @returns DateRange covering the full day
   */
  static startAndEndOfDay(targetDate: Date): DateRange {
    return new DateRange(startOfDay(targetDate), endOfDay(targetDate));
  }

  /**
   * Whether this dateRange overlaps with a target dateRange.
   *
   * @param targetDateRange - dateRange to compare
   * @returns true if ranges overlap
   * @example
   * overlapA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * overlapB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * overlapC = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
   * overlapD = new Date(Date.UTC(2024, 11, 26, 15, 0, 0));
   *
   * rangeBefore = new utils.DateRange(overlapA, overlapB);
   * rangeAfter = new utils.DateRange(overlapC, overlapD);
   *
   * rangeBefore.overlaps(rangeAfter); // false
   * rangeAfter.overlaps(rangeBefore); // false
   *
   * rangeBefore = new utils.DateRange(overlapA, overlapC);
   * rangeAfter = new utils.DateRange(overlapB, overlapD);
   *
   * rangeBefore.overlaps(rangeAfter); // true
   * rangeAfter.overlaps(rangeBefore); // true
   */
  overlaps(targetDateRange: DateRange): boolean {
    return (
      this.endDate > targetDateRange.startDate &&
      this.startDate < targetDateRange.endDate
    );
  }

  /**
   * Determines if a datetime is within the range
   *
   * @param dateToCheck - the value to test if it is within the date range
   * @returns if the value is within the range (true) or not (false)
   *
   * @example
   * withinA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * withinB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * withinC = new Date(Date.UTC(2024, 11, 26, 14, 0, 0));
   * withinD = new Date(Date.UTC(2024, 11, 26, 15, 0, 0));
   *
   * range = new utils.DateRange(withinB, withinD);
   * range.contains(withinA); // false - it was before the range
   *
   * range.contains(withinB); // true
   * range.contains(withinC); // true
   * range.contains(withinD); // true
   */
  contains(dateToCheck: Date): boolean {
    const testTime = dateToCheck.getTime();
    return (
      testTime >= this.startDate.getTime() &&
      testTime <= this.endDate.getTime()
    );
  }

  /**
   * Shifts the start time of the DateRange.
   *
   * ```
   * myRange = new utils.DateRange('2025-01-01', '2025-02-01');
   * myRange.shiftStart({ days: 1 });
   * // { startDate: 2025-01-02, endDate: 2025-02-01 }
   * ```
   *
   * (Note that this defaults to immutable DateRanges,
   * but passing `inPlace=true` will update this instance)
   *
   * @param options - options to shift the dateRange by, similar to {@link add}
   * @param inPlace - if true, updates this instance; if false, returns new DateRange
   * @returns this DateRange if (inPlace=true), a new instance if (inPlace=false)
   */
  shiftStart(options: AddOptions, inPlace: boolean = false): DateRange {
    if (inPlace) {
      overwrite(this.startDate, add(this.startDate, options));
      return this;
    }
    return new DateRange(add(this.startDate, options), this.endDate);
  }

  /**
   * Shifts the ending time of the DateRange.
   *
   * ```
   * myRange = new utils.DateRange('2025-01-01', '2025-02-01');
   * myRange.shiftEnd({ days: 1 });
   * // { startDate: 2025-01-01, endDate: 2025-02-02 }
   * ```
   *
   * (Note that this defaults to immutable DateRanges,
   * but passing `inPlace=true` will update this instance)
   *
   * @param options - options to shift the dateRange by, similar to {@link add}
   * @param inPlace - if true, updates this instance; if false, returns new DateRange
   * @returns this DateRange if (inPlace=true), a new instance if (inPlace=false)
   */
  shiftEnd(options: AddOptions, inPlace: boolean = false): DateRange {
    if (inPlace) {
      overwrite(this.endDate, add(this.endDate, options));
      return this;
    }
    return new DateRange(this.startDate, add(this.endDate, options));
  }

  /**
   * Determines the millisecond duration between the end and start time.
   *
   * ```
   * durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * range = new utils.DateRange(durationA, durationB);
   *
   * range.duration(); // 1 hour in milliseconds; 1000 * 60 * 60; 3600000
   * ```
   *
   * @returns duration in milliseconds
   */
  duration(): number {
    return this.endDate.getTime() - this.startDate.getTime();
  }

  /**
   * Determines the duration in a clear and understandable string;
   *
   * ```
   * durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * range = new utils.DateRange(durationA, durationB);
   *
   * range.durationString(); // '0 days, 1 hours, 0 minutes, 0.0 seconds';
   * ```
   *
   * @returns duration as human-readable string
   */
  durationString(): string {
    return durationLong(this.duration());
  }

  /**
   * Determines the duration in days:hours:minutes:seconds.milliseconds
   *
   * ```
   * durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * range = new utils.DateRange(durationA, durationB);
   *
   * range.durationISO(); // '0:01:00:00.000';
   * ```
   *
   * @returns duration in ISO format
   */
  durationISO(): string {
    return durationISO(this.duration());
  }

  /**
   * Determines if both the startDate and endDate are valid dates.
   *
   * ```
   * durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * invalidDate = new Date(Number.NaN);
   * range = new utils.DateRange(durationA, durationB).isValid();     // true
   * range = new utils.DateRange(invalidDate, durationB).isValid();   // false
   * range = new utils.DateRange(durationA, invalidDate).isValid();   // false
   * range = new utils.DateRange(invalidDate, invalidDate).isValid(); // false
   * ```
   *
   * @returns true if both dates are valid
   */
  isValid(): boolean {
    return isValid(this.startDate) && isValid(this.endDate);
  }

  /**
   * Converts the daterange to a string value
   *
   * ```
   * durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * range = new utils.DateRange(durationA, durationB);
   *
   * range.toString(); // '2025-01-26T12:00:00.000Z to 2025-01-26T13:00:00.000Z';
   * ```
   *
   * @returns ISO string representation of the range
   */
  toString(): string {
    return `${this.startDate.toISOString()} to ${this.endDate.toISOString()}`;
  }

  /**
   * Converts the daterange to a local string value
   *
   * ```
   * durationA = new Date(Date.UTC(2024, 11, 26, 12, 0, 0));
   * durationB = new Date(Date.UTC(2024, 11, 26, 13, 0, 0));
   * range = new utils.DateRange(durationA, durationB);
   *
   * range.toLocaleString(); // '1/26/2025, 12:00:00 PM to 1/26/2025, 1:00:00 PM'
   * ```
   *
   * @returns locale string representation of the range
   */
  toLocaleString(): string {
    return `${this.startDate.toLocaleString()} to ${this.endDate.toLocaleString()}`;
  }
}

