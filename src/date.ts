/**
 * Utility methods for working with dates and date ranges.
 *
 * @module date
 */

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

export interface TimezoneEntry {
  tz: string;
  formatter: (date: DateInput) => string;
  epoch: number;
  offset: string;
  toLocalISO: (date: DateInput) => string;
  toLocalISOWeekday: (date: DateInput) => string;
  getWeekday: (date: DateInput) => string;
}

const divideRemainder = (
  val: number,
  denominator: number
): { value: number; remainder: number } => ({
  value: Math.floor(val / denominator),
  remainder: val % denominator
});

const TIME: {
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

function padTime(num: number, size: number = 2): string {
  return String(num).padStart(size, "0");
}

function isValid(testDate: unknown): boolean {
  if (!testDate) return false;
  if (!(testDate instanceof Date)) return false;
  return !Number.isNaN(testDate.getTime());
}

function parse(dateStr: string | number | null | undefined): Date | null | undefined {
  if (dateStr === undefined || dateStr === null) return dateStr;
  const result = new Date(Date.parse(String(dateStr)));
  if (!isValid(result)) {
    throw new Error(`Could not parse date: ${dateStr}`);
  }
  return result;
}

function durationISO(epochDifference: number): string {
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

function durationLong(epochDifference: number): string {
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

const timezoneOffsetMap = new Map<string, TimezoneEntry>();

function getTimezoneEntry(timezoneStr: string): TimezoneEntry {
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

function getTimezoneOffset(timezoneStr: string): number {
  return getTimezoneEntry(timezoneStr).epoch;
}

function correctForTimezone(date: Date, localTimezoneStr: string): Date {
  const { epoch } = getTimezoneEntry(localTimezoneStr);
  return new Date(date.getTime() - epoch);
}

function correctForOtherTimezone(
  date: Date,
  sourceTimezone: string,
  localTimezone: string
): Date {
  return correctForTimezone(epochShift(date, sourceTimezone), localTimezone);
}

function epochShift(date: Date, timezoneStr: string): Date {
  const { epoch } = getTimezoneEntry(timezoneStr);
  return new Date(date.getTime() + epoch);
}

function toLocalISO(
  date: DateInput,
  timezoneStr: string,
  includeWeekday: boolean = false
): string {
  const entry = getTimezoneEntry(timezoneStr);
  return includeWeekday ? entry.toLocalISOWeekday(date) : entry.toLocalISO(date);
}

function localISOFormatter(
  timezoneStr: string,
  includeWeekday: boolean = false
): (date: DateInput) => string {
  const entry = getTimezoneEntry(timezoneStr);
  return includeWeekday ? entry.toLocalISOWeekday : entry.toLocalISO;
}

function getWeekday(date: DateInput, timezoneStr: string): string {
  return getTimezoneEntry(timezoneStr).getWeekday(date);
}

function toIsoStringNoTimezone(date: Date): string {
  return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}T${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}.${padTime(date.getMilliseconds(), 3)}`;
}

function toIsoStringUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${padTime(date.getUTCMonth() + 1)}-${padTime(date.getUTCDate())}T${padTime(date.getUTCHours())}:${padTime(date.getUTCMinutes())}:${padTime(date.getUTCSeconds())}.${padTime(date.getUTCMilliseconds(), 3)}`;
}

function toEpochShiftedISO(date: Date, timezoneStr: string): string {
  const { offset } = getTimezoneEntry(timezoneStr);
  return `${toIsoStringUTC(date)}${offset}`;
}

function clone(targetDate: Date): Date {
  return new Date(targetDate.getTime());
}

function overwrite(
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

function add(
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

function endOfDay(dateValue: Date): Date {
  const startDate =
    Math.floor(dateValue.getTime() / TIME.DAY) * TIME.DAY;
  return new Date(startDate + TIME.DAY - 1);
}

function startOfDay(dateValue: Date): Date {
  const startDate =
    Math.floor(dateValue.getTime() / TIME.DAY) * TIME.DAY;
  return new Date(startDate);
}

function arrange(
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

function generateDateSequence(
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

export class DateRange {
  startDate!: Date;
  endDate!: Date;
  data!: unknown;

  constructor(
    startDate: Date | string,
    endDate: Date | string,
    data: unknown = null
  ) {
    this.reinitialize(startDate, endDate, data);
  }

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

  static startAndEndOfDay(targetDate: Date): DateRange {
    return new DateRange(startOfDay(targetDate), endOfDay(targetDate));
  }

  overlaps(targetDateRange: DateRange): boolean {
    return (
      this.endDate > targetDateRange.startDate &&
      this.startDate < targetDateRange.endDate
    );
  }

  contains(dateToCheck: Date): boolean {
    const testTime = dateToCheck.getTime();
    return (
      testTime >= this.startDate.getTime() &&
      testTime <= this.endDate.getTime()
    );
  }

  shiftStart(options: AddOptions, inPlace: boolean = false): DateRange {
    if (inPlace) {
      overwrite(this.startDate, add(this.startDate, options));
      return this;
    }
    return new DateRange(add(this.startDate, options), this.endDate);
  }

  shiftEnd(options: AddOptions, inPlace: boolean = false): DateRange {
    if (inPlace) {
      overwrite(this.endDate, add(this.endDate, options));
      return this;
    }
    return new DateRange(this.startDate, add(this.endDate, options));
  }

  duration(): number {
    return this.endDate.getTime() - this.startDate.getTime();
  }

  durationString(): string {
    return durationLong(this.duration());
  }

  durationISO(): string {
    return durationISO(this.duration());
  }

  isValid(): boolean {
    return isValid(this.startDate) && isValid(this.endDate);
  }

  toString(): string {
    return `${this.startDate.toISOString()} to ${this.endDate.toISOString()}`;
  }

  toLocaleString(): string {
    return `${this.startDate.toLocaleString()} to ${this.endDate.toLocaleString()}`;
  }
}

const DateUtils = {
  TIME,
  divideRemainder,
  padTime,
  isValid,
  parse,
  durationISO,
  durationLong,
  timezoneOffsetMap,
  getTimezoneEntry,
  getTimezoneOffset,
  correctForTimezone,
  correctForOtherTimezone,
  epochShift,
  toLocalISO,
  localISOFormatter,
  getWeekday,
  toIsoStringNoTimezone,
  toEpochShiftedISO,
  clone,
  overwrite,
  add,
  endOfDay,
  startOfDay,
  arrange,
  generateDateSequence,
  DateRange
};

export default DateUtils;
