import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { SourceMap } from "../src/SourceMap.ts";

/** One row of precip data in the test fixtures */
interface PrecipRow {
  id: number;
  city: string;
  month: string;
  precip: number;
}

const generateSourceMap = (): SourceMap => {
  const seattleData: [string, PrecipRow[]][] = [
    ["Aug", [{ id: 1, city: "Seattle", month: "Aug", precip: 0.87 }]],
    ["Apr", [{ id: 0, city: "Seattle", month: "Apr", precip: 2.68 }]],
    ["Dec", [{ id: 2, city: "Seattle", month: "Dec", precip: 5.31 }]],
  ];
  const seattle = new SourceMap(seattleData);
  seattle.source = "month";
  return seattle;
};

const generateMultiSourceMap = (): SourceMap => {
  const seattleData: [string, PrecipRow[]][] = [
    ["Aug", [{ id: 1, city: "Seattle", month: "Aug", precip: 0.87 }]],
    ["Apr", [{ id: 0, city: "Seattle", month: "Apr", precip: 2.68 }]],
    ["Dec", [{ id: 2, city: "Seattle", month: "Dec", precip: 5.31 }]],
  ];
  const seattle = new SourceMap(seattleData);
  seattle.source = "month";

  const newYorkData: [string, PrecipRow[]][] = [
    ["Aug", [{ id: 1, city: "Seattle", month: "Aug", precip: 0.87 }]],
    ["Apr", [{ id: 0, city: "Seattle", month: "Apr", precip: 2.68 }]],
    ["Dec", [{ id: 2, city: "Seattle", month: "Dec", precip: 5.31 }]],
  ];
  const newYork = new SourceMap(newYorkData);
  newYork.source = "month";

  const chicagoData: [string, PrecipRow[]][] = [
    ["Aug", [{ id: 1, city: "Seattle", month: "Aug", precip: 0.87 }]],
    ["Apr", [{ id: 0, city: "Seattle", month: "Apr", precip: 2.68 }]],
    ["Dec", [{ id: 2, city: "Seattle", month: "Dec", precip: 5.31 }]],
  ];
  const chicago = new SourceMap(chicagoData);
  chicago.source = "month";

  const resultData: [string, SourceMap][] = [
    ["Seattle", seattle],
    ["New York", newYork],
    ["Chicago", chicago],
  ];
  const result = new SourceMap(resultData);
  result.source = "city";
  return result;
};

const generateLongSourceMap = (): SourceMap => {
  const data: [string, PrecipRow[]][] = [
    [
      "Seattle",
      [
        { id: 1, city: "Seattle", month: "Aug", precip: 0.87 },
        { id: 0, city: "Seattle", month: "Apr", precip: 2.68 },
        { id: 2, city: "Seattle", month: "Dec", precip: 5.31 },
      ],
    ],
    [
      "New York",
      [
        { id: 1, city: "Seattle", month: "Aug", precip: 0.87 },
        { id: 0, city: "Seattle", month: "Apr", precip: 2.68 },
        { id: 2, city: "Seattle", month: "Dec", precip: 5.31 },
      ],
    ],
    [
      "Chicago",
      [
        { id: 1, city: "Seattle", month: "Aug", precip: 0.87 },
        { id: 0, city: "Seattle", month: "Apr", precip: 2.68 },
        { id: 2, city: "Seattle", month: "Dec", precip: 5.31 },
      ],
    ],
  ];
  const results = new SourceMap(data);
  results.source = "city";
  return results;
};

const peek = (a: unknown): unknown =>
  Array.isArray(a) && a.length > 0 ? a[0] : null;

describe("SourceMap", () => {
  describe("constructor", () => {
    it("can be constructed just like a map", () => {
      expect(() => new SourceMap([["A", 1], ["B", 2]])).not.toThrow();
    });
    it("can be constructed without any arguments", () => {
      expect(() => new SourceMap()).not.toThrow();
    });
    it("can run generateSourceMap", () => {
      expect(generateSourceMap).not.toThrow();
    });
    it("generateSourceMap is a valid sourceMap", () => {
      const result = generateSourceMap();
      expect(result.size).toBe(3);
      expect(result.getSource()).toBe("month");
    });
    it("can run generateMultiSourceMap", () => {
      expect(generateMultiSourceMap).not.toThrow();
    });
  });

  describe("source", () => {
    it("can specify the source and get the source", () => {
      const expected = "expected";
      const instance = new SourceMap();
      instance.setSource(expected);

      const result = instance.getSource();

      expect(result).toBe(expected);
    });
  });

  describe("to String", () => {
    it("can stringify a source map through stringifyReducer", () => {
      const instance = generateSourceMap();
      const results = JSON.stringify(instance, SourceMap.stringifyReducer);
      const expected =
        '{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}';
      expect(results).toBe(expected);
    });
    it("can stringify a complex sourceMap", () => {
      const instance = generateMultiSourceMap();
      const results = JSON.stringify(instance, SourceMap.stringifyReducer);
      const expected =
        '{"dataType":"SourceMap","source":"city","data":'
        + '[["Seattle",{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}],'
        + '["New York",{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}],'
        + '["Chicago",{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}]]}';
      expect(results).toBe(expected);
    });
    it("can stringify with a map", () => {
      const instance = new SourceMap();
      instance.setSource("test");
      instance.set("A", new Map());
      const results = JSON.stringify(instance, SourceMap.stringifyReducer);
      const expected =
        '{"dataType":"SourceMap","source":"test","data":'
        + '[["A",{"dataType":"Map","value":[]}]]}';
      expect(results).toBe(expected);
    });
    it("can stringify with a nested sourceMap", () => {
      const instance = new SourceMap();
      instance.setSource("test");
      instance.set("A", new SourceMap());
      const results = JSON.stringify(instance, SourceMap.stringifyReducer);
      const expected =
        '{"dataType":"SourceMap","source":"test","data":'
        + '[["A",{"dataType":"SourceMap","data":[]}]]}';
      expect(results).toBe(expected);
    });

    it("can convert simple instance to string", () => {
      const instance = new SourceMap();
      instance.setSource("test");
      const results = String(instance);
      const expected = '{"dataType":"SourceMap","source":"test","data":[]}';
      expect(results).toBe(expected);
    });
    it("can convert 1d sourcemap to string", () => {
      const instance = generateSourceMap();
      instance.setSource("month");
      const results = String(instance);
      const expected =
        '{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}';
      expect(results).toBe(expected);
    });
    it("can convert 2d sourcemap to string", () => {
      const instance = generateMultiSourceMap();
      instance.setSource("city");
      const results = String(instance);
      const expected =
        '{"dataType":"SourceMap","source":"city","data":'
        + '[["Seattle",{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}],'
        + '["New York",{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}],'
        + '["Chicago",{"dataType":"SourceMap","source":"month","data":'
        + '[["Aug",[{"id":1,"city":"Seattle","month":"Aug","precip":0.87}]],'
        + '["Apr",[{"id":0,"city":"Seattle","month":"Apr","precip":2.68}]],'
        + '["Dec",[{"id":2,"city":"Seattle","month":"Dec","precip":5.31}]]]}]]}';
      expect(results).toBe(expected);
    });
    it("stringifyReducer returns object with data, dataType, source", () => {
      const instance = new SourceMap();
      instance.setSource("test");
      instance.set("A", "Cuca");
      const results = SourceMap.stringifyReducer("", instance);
      const expected = {
        data: [["A", "Cuca"]],
        dataType: "SourceMap",
        source: "test",
      };
      expect(results).toStrictEqual(expected);
    });
  });

  describe("reduce", () => {
    it("can reduce simple", () => {
      const instance = generateSourceMap();

      const results = instance.reduce((records) => ({
        count: records.length,
        count2: records.length,
      }));

      const expected = [
        { month: "Aug", count: 1, count2: 1 },
        { month: "Apr", count: 1, count2: 1 },
        { month: "Dec", count: 1, count2: 1 },
      ];

      expect(results).toEqual(expected);
    });
    it("can reduce complex", () => {
      const instance = generateMultiSourceMap();

      const results = instance.reduce((records) => ({
        count: records.length,
        count2: records.length,
      }));

      const expected = [
        { city: "Seattle", month: "Aug", count: 1, count2: 1 },
        { city: "Seattle", month: "Apr", count: 1, count2: 1 },
        { city: "Seattle", month: "Dec", count: 1, count2: 1 },
        { city: "New York", month: "Aug", count: 1, count2: 1 },
        { city: "New York", month: "Apr", count: 1, count2: 1 },
        { city: "New York", month: "Dec", count: 1, count2: 1 },
        { city: "Chicago", month: "Aug", count: 1, count2: 1 },
        { city: "Chicago", month: "Apr", count: 1, count2: 1 },
        { city: "Chicago", month: "Dec", count: 1, count2: 1 },
      ];

      expect(results).toEqual(expected);
    });
    it("cannot reduce a non sourcemap", () => {
      const reduceFn = (_records: unknown[]) => ({
        count: (_records as unknown[]).length,
        count2: (_records as unknown[]).length,
      });

      expect(() => {
        SourceMap.reduceGroup({} as SourceMap, reduceFn);
      }).toThrow();
    });
  });

  describe("reduceSeparate", () => {
    it("can reduce separate on an empty sourceMap", () => {
      const instance = new SourceMap();
      const reduceFn = (records: unknown[]) => ({
        count: records.length,
        count2: records.length,
      });
      expect(() => instance.reduceSeparate(reduceFn)).not.toThrow();
    });
    it("can reduce a simple map", () => {
      const instance = generateSourceMap();
      const reduceFn = (records: unknown[]) => ({
        count: records.length,
        count2: records.length,
      });
      const results = instance.reduceSeparate(reduceFn);
      const expected = [
        { month: "Aug", _aggregateKey: "count", _aggregateValue: 1 },
        { month: "Aug", _aggregateKey: "count2", _aggregateValue: 1 },
        { month: "Apr", _aggregateKey: "count", _aggregateValue: 1 },
        { month: "Apr", _aggregateKey: "count2", _aggregateValue: 1 },
        { month: "Dec", _aggregateKey: "count", _aggregateValue: 1 },
        { month: "Dec", _aggregateKey: "count2", _aggregateValue: 1 },
      ];

      expect(results).toEqual(expected);
    });
    it("can reduce a complex map", () => {
      const instance = generateMultiSourceMap();
      const reduceFn = (records: unknown[]) => ({
        count: records.length,
        count2: records.length,
      });
      const results = instance.reduceSeparate(reduceFn);
      const expected = [
        { city: "Seattle", month: "Aug", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "Seattle", month: "Aug", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "Seattle", month: "Apr", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "Seattle", month: "Apr", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "Seattle", month: "Dec", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "Seattle", month: "Dec", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "New York", month: "Aug", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "New York", month: "Aug", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "New York", month: "Apr", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "New York", month: "Apr", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "New York", month: "Dec", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "New York", month: "Dec", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "Chicago", month: "Aug", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "Chicago", month: "Aug", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "Chicago", month: "Apr", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "Chicago", month: "Apr", _aggregateKey: "count2", _aggregateValue: 1 },
        { city: "Chicago", month: "Dec", _aggregateKey: "count", _aggregateValue: 1 },
        { city: "Chicago", month: "Dec", _aggregateKey: "count2", _aggregateValue: 1 },
      ];

      expect(results).toEqual(expected);
    });
    it("cannot reduce a non sourcemap (reduceGroupSeparate)", () => {
      const reduceFn = (records: unknown[]) => ({
        count: records.length,
        count2: records.length,
      });

      expect(() => {
        SourceMap.reduceGroupSeparate({} as SourceMap, reduceFn);
      }).toThrow();
    });
  });

  describe("reduceObject", () => {
    it("can reduce simple", () => {
      const instance = generateSourceMap();

      const results = instance.objectReduce({
        count: (records) => records.length,
        count2: (records) => records.length,
      });

      const expected = [
        { month: "Aug", count: 1, count2: 1 },
        { month: "Apr", count: 1, count2: 1 },
        { month: "Dec", count: 1, count2: 1 },
      ];

      expect(results).toEqual(expected);
    });
    it("can reduce complex", () => {
      const instance = generateMultiSourceMap();

      const results = instance.objectReduce({
        count: (records) => records.length,
        count2: (records) => records.length,
      });

      const expected = [
        { city: "Seattle", month: "Aug", count: 1, count2: 1 },
        { city: "Seattle", month: "Apr", count: 1, count2: 1 },
        { city: "Seattle", month: "Dec", count: 1, count2: 1 },
        { city: "New York", month: "Aug", count: 1, count2: 1 },
        { city: "New York", month: "Apr", count: 1, count2: 1 },
        { city: "New York", month: "Dec", count: 1, count2: 1 },
        { city: "Chicago", month: "Aug", count: 1, count2: 1 },
        { city: "Chicago", month: "Apr", count: 1, count2: 1 },
        { city: "Chicago", month: "Dec", count: 1, count2: 1 },
      ];

      expect(results).toEqual(expected);
    });
    it("cannot reduce a non sourcemap (objectReduce)", () => {
      const reducerObj = { count: (c: unknown[]) => c.length };
      expect(() => {
        SourceMap.objectReduce({} as SourceMap, reducerObj);
      }).toThrow("reduceGroups only works on arrays or sourceMaps");
    });
    it("object reduce should have functions and throws an error if not", () => {
      const instance = new SourceMap();
      expect(() => {
        SourceMap.objectReduce(instance, { name: "john" } as unknown as Record<string, (c: unknown[]) => unknown>);
      }).toThrow("generateObjectFn: all properties should be {(collection) => result}");
    });
  });

  describe("map", () => {
    it("can 1d map by reducing", () => {
      const source = generateSourceMap();
      const expected = new SourceMap();
      expected.source = "month";
      expected.set("Aug", 0.87);
      expected.set("Apr", 2.68);
      expected.set("Dec", 5.31);

      const results = source.map((r) => (peek(r) as PrecipRow).precip);
      expect(JSON.stringify(results)).toStrictEqual(JSON.stringify(expected));
      expect(results).toStrictEqual(expected);
    });
    it("can 1d map by filter and reducing", () => {
      const source = generateLongSourceMap();
      const data: [string, number][] = [
        ["Seattle", 1],
        ["New York", 1],
        ["Chicago", 1],
      ];
      const expected = new SourceMap(data);
      expected.source = "city";

      const results = source
        .map((c) => (c as PrecipRow[]).filter((r) => r.month === "Apr"))
        .map((c) => (c as unknown[]).length);

      expect(JSON.stringify(results)).toEqual(JSON.stringify(expected));
      expect(results).toStrictEqual(expected);
    });
    it("can 2d map by reducing", () => {
      const source = generateMultiSourceMap();
      const Chicago = new SourceMap([
        ["Aug", 1],
        ["Apr", 1],
        ["Dec", 1],
      ]);
      Chicago.source = "month";

      const Seattle = new SourceMap([
        ["Aug", 1],
        ["Apr", 1],
        ["Dec", 1],
      ]);
      Seattle.source = "month";

      const NewYork = new SourceMap([
        ["Aug", 1],
        ["Apr", 1],
        ["Dec", 1],
      ]);
      NewYork.source = "month";

      const expected = new SourceMap([
        ["Seattle", Seattle],
        ["New York", NewYork],
        ["Chicago", Chicago],
      ]);
      expected.source = "city";

      const results = source.map((r) => (r as unknown[]).length);
      expect(JSON.stringify(results)).toEqual(JSON.stringify(expected));
      expect(results).toStrictEqual(expected);
    });
  });
});
