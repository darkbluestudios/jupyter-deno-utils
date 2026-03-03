import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import GroupUtils from "../src/group.ts";
import { SourceMap } from "../src/SourceMap.ts";

// Use Date.UTC so dateTime keys are timezone-independent (ISO midnight)
const initializeWeather = () => [
  {
    id: 1,
    city: "Seattle",
    month: "Aug",
    precip: 0.87,
    dateTime: new Date(Date.UTC(2020, 7, 1)),
    year: 2020
  },
  {
    id: 0,
    city: "Seattle",
    month: "Apr",
    precip: 2.68,
    dateTime: new Date(Date.UTC(2021, 3, 1)),
    year: 2021
  },
  {
    id: 2,
    city: "Seattle",
    month: "Dec",
    precip: 5.31,
    dateTime: new Date(Date.UTC(2020, 11, 1)),
    year: 2020
  },
  {
    id: 3,
    city: "New York",
    month: "Apr",
    precip: 3.94,
    dateTime: new Date(Date.UTC(2021, 3, 1)),
    year: 2021
  },
  {
    id: 4,
    city: "New York",
    month: "Aug",
    precip: 4.13,
    dateTime: new Date(Date.UTC(2020, 7, 1)),
    year: 2020
  },
  {
    id: 5,
    city: "New York",
    month: "Dec",
    precip: 3.58,
    dateTime: new Date(Date.UTC(2020, 11, 1)),
    year: 2020
  },
  {
    id: 6,
    city: "Chicago",
    month: "Apr",
    precip: 3.62,
    dateTime: new Date(Date.UTC(2021, 3, 1)),
    year: 2021
  },
  {
    id: 8,
    city: "Chicago",
    month: "Dec",
    precip: 2.56,
    dateTime: new Date(Date.UTC(2020, 11, 1)),
    year: 2020
  },
  {
    id: 7,
    city: "Chicago",
    month: "Aug",
    precip: 3.98,
    dateTime: new Date(Date.UTC(2020, 7, 1)),
    year: 2020
  }
];

describe("group", () => {
  describe("by", () => {
    it("single diension", () => {
      const data = initializeWeather();
      const expected = new SourceMap();
      expected.source = "city";
      expected.set("Seattle", data.filter((r) => r.city === "Seattle"));
      expected.set("New York", data.filter((r) => r.city === "New York"));
      expected.set("Chicago", data.filter((r) => r.city === "Chicago"));

      const results = GroupUtils.by(data, "city");

      expect(results).toEqual(expected);
    });
    it("multiple diension", () => {
      const data = initializeWeather();
      const expected = new SourceMap();
      expected.source = "city";
      expected.set("Seattle", new SourceMap());
      (expected.get("Seattle") as SourceMap).source = "month";
      (expected.get("Seattle") as SourceMap).set(
        "Aug",
        data.filter((r) => r.city === "Seattle" && r.month === "Aug")
      );
      (expected.get("Seattle") as SourceMap).set(
        "Apr",
        data.filter((r) => r.city === "Seattle" && r.month === "Apr")
      );
      (expected.get("Seattle") as SourceMap).set(
        "Dec",
        data.filter((r) => r.city === "Seattle" && r.month === "Dec")
      );
      expected.set("New York", new SourceMap());
      (expected.get("New York") as SourceMap).source = "month";
      (expected.get("New York") as SourceMap).set(
        "Aug",
        data.filter((r) => r.city === "New York" && r.month === "Aug")
      );
      (expected.get("New York") as SourceMap).set(
        "Apr",
        data.filter((r) => r.city === "New York" && r.month === "Apr")
      );
      (expected.get("New York") as SourceMap).set(
        "Dec",
        data.filter((r) => r.city === "New York" && r.month === "Dec")
      );
      expected.set("Chicago", new SourceMap());
      (expected.get("Chicago") as SourceMap).source = "month";
      (expected.get("Chicago") as SourceMap).set(
        "Aug",
        data.filter((r) => r.city === "Chicago" && r.month === "Aug")
      );
      (expected.get("Chicago") as SourceMap).set(
        "Apr",
        data.filter((r) => r.city === "Chicago" && r.month === "Apr")
      );
      (expected.get("Chicago") as SourceMap).set(
        "Dec",
        data.filter((r) => r.city === "Chicago" && r.month === "Dec")
      );

      const results = GroupUtils.by(data, "city", "month");

      expect(results).toEqual(expected);
    });
    it("groups by dates", () => {
      const data = initializeWeather();
      const expected = new SourceMap();
      expected.source = "dateTime";
      expected.set(
        "2020-08-01T00:00:00.000Z",
        data.filter((r) => r.month === "Aug")
      );
      expected.set(
        "2021-04-01T00:00:00.000Z",
        data.filter((r) => r.month === "Apr")
      );
      expected.set(
        "2020-12-01T00:00:00.000Z",
        data.filter((r) => r.month === "Dec")
      );

      const results = GroupUtils.by(data, "dateTime");

      expect(JSON.stringify(results)).toBe(JSON.stringify(expected));
      expect(results).toEqual(expected);
    });
    it("throws an error if the collection is not an array", () => {
      expect(() => GroupUtils.by(null as unknown as Record<string, unknown>[], "cuca")).toThrow();
    });
  });

  describe("separateByFields", () => {
    it("throws an error if the collection is not an array", () => {
      expect(() =>
        GroupUtils.separateByFields(null as unknown as Record<string, unknown>[], "name")
      ).toThrow();
    });
    it("throws an error if no fields are requested", () => {
      expect(() => GroupUtils.separateByFields([{ name: "john" }])).toThrow();
    });
    it("separates a series of objects by a single field", () => {
      const data = [
        { city: "Seattle", min: 0.87, max: 5.31 },
        { city: "New York", min: 3.58, max: 4.13 },
        { city: "Chicago", min: 2.56, max: 3.98 }
      ];
      const expected = [
        { city: "Seattle", min: 0.87, max: 5.31, key: "min", value: 0.87 },
        { city: "New York", min: 3.58, max: 4.13, key: "min", value: 3.58 },
        { city: "Chicago", min: 2.56, max: 3.98, key: "min", value: 2.56 },
        { city: "Seattle", min: 0.87, max: 5.31, key: "max", value: 5.31 },
        { city: "New York", min: 3.58, max: 4.13, key: "max", value: 4.13 },
        { city: "Chicago", min: 2.56, max: 3.98, key: "max", value: 3.98 }
      ];
      const results = GroupUtils.separateByFields(data, "min", "max");
      expect(results).toEqual(expected);
    });
  });

  describe("rollup", () => {
    it("can map reduce 1 level", () => {
      const weather = initializeWeather();
      const expected = new SourceMap();
      expected.source = "city";
      expected.set("Seattle", 3);
      expected.set("Chicago", 3);
      expected.set("New York", 3);

      const results = GroupUtils.rollup(weather, (r) => r.length, "city");
      expect(results).toEqual(expected);
    });
    it("can map reduce 2 levels", () => {
      const weather = initializeWeather();
      const expected = new SourceMap();
      expected.source = "city";
      const yearMap = new SourceMap();
      yearMap.source = "year";
      yearMap.set(2020, 2);
      yearMap.set(2021, 1);
      expected.set("Seattle", new SourceMap(yearMap));
      (expected.get("Seattle") as SourceMap).source = "year";
      expected.set("Chicago", new SourceMap(yearMap));
      (expected.get("Chicago") as SourceMap).source = "year";
      expected.set("New York", new SourceMap(yearMap));
      (expected.get("New York") as SourceMap).source = "year";

      const results = GroupUtils.rollup(weather, (r) => r.length, "city", "year");
      expect(results).toEqual(expected);
    });
  });

  describe("index", () => {
    it("can index a unique array", () => {
      const weather = initializeWeather();
      const data: [number, (typeof weather)[0]][] = [
        [1, weather[0]],
        [0, weather[1]],
        [2, weather[2]],
        [3, weather[3]],
        [4, weather[4]],
        [5, weather[5]],
        [6, weather[6]],
        [8, weather[7]],
        [7, weather[8]]
      ];
      const expected = new Map(data);
      const results = GroupUtils.index(weather, "id");
      expect(JSON.stringify(results, SourceMap.stringifyReducer)).toEqual(
        JSON.stringify(expected, SourceMap.stringifyReducer)
      );
      expect(results).toEqual(expected);
    });

    it("uses an iso string for dates", () => {
      const weather = initializeWeather();
      const seattle = weather.filter((r) => r.city === "Seattle");
      const data: [string, (typeof weather)[0]][] = [
        ["2020-08-01T00:00:00.000Z", seattle[0]],
        ["2021-04-01T00:00:00.000Z", seattle[1]],
        ["2020-12-01T00:00:00.000Z", seattle[2]]
      ];
      const expected = new Map(data);
      const results = GroupUtils.index(seattle, "dateTime");

      expect(JSON.stringify(results, SourceMap.stringifyReducer)).toEqual(
        JSON.stringify(expected, SourceMap.stringifyReducer)
      );
      expect(results).toEqual(expected);
    });

    it("throws an error if the collection is not an array", () => {
      expect(() => GroupUtils.index({} as unknown as Record<string, unknown>[], "id")).toThrow();
    });

    it("throws an error if the list is not unique", () => {
      const weather = initializeWeather();
      expect(() => GroupUtils.index(weather, "city")).toThrow();
    });
  });
});
