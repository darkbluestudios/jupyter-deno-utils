import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as HashMapUtil from "../src/hashMap.ts";

describe("hashmap", () => {
  describe("add", () => {
    it("can add directly", () => {
      const expected = new Map([["key1", 1]]);
      const results = HashMapUtil.add(new Map(), "key1", 1);
      expect(results).toEqual(expected);
    });
    it("works with reduce", () => {
      const expected = new Map([
        ["key1", 1],
        ["key2", 2],
        ["key3", 3]
      ]);
      const targetObject = { key1: 1, key2: 2, key3: 3 };
      const keys = ["key1", "key2", "key3"];
      const result = keys.reduce(
        (reduceResult, key) =>
          HashMapUtil.add(reduceResult, key, targetObject[key as keyof typeof targetObject]),
        new Map()
      );
      expect(result).toEqual(expected);
    });
  });

  describe("stringify", () => {
    it("can stringify an empty map", () => {
      const target = new Map();
      const expected = '{"dataType":"Map","value":[]}';
      const results = HashMapUtil.stringify(target);
      expect(results).toBe(expected);
    });
    it("can stringify a single entry", () => {
      const target = new Map([["first", 1]]);
      const expected = '{"dataType":"Map","value":[["first",1]]}';
      const results = HashMapUtil.stringify(target);
      expect(results).toBe(expected);
    });
    it("can stringify multiple entries", () => {
      const target = new Map([
        ["first", 1],
        ["second", 2]
      ]);
      const expected = '{"dataType":"Map","value":[["first",1],["second",2]]}';
      const results = HashMapUtil.stringify(target);
      expect(results).toBe(expected);
    });
    it("can use the indentation", () => {
      const target = new Map([
        ["first", 1],
        ["second", 2]
      ]);
      const expected = `{
  "dataType": "Map",
  "value": [
    [
      "first",
      1
    ],
    [
      "second",
      2
    ]
  ]
}`;
      const results = HashMapUtil.stringify(target, 2);
      expect(results).toBe(expected);
    });
  });

  describe("toObject", () => {
    describe("can serialize", () => {
      it("with a simple map", () => {
        const target = new Map([
          ["first", 1],
          ["second", 2]
        ]);
        const expected = { first: 1, second: 2 };
        const result = HashMapUtil.toObject(target);
        expect(result).toEqual(expected);
      });
      it("with a map of numbers", () => {
        const target = new Map([
          [1, 1],
          [2, 2]
        ]);
        const expected: Record<number, number> = {};
        expected[1] = 1;
        expected[2] = 2;
        const result = HashMapUtil.toObject(target);
        expect(result).toEqual(expected);
      });
      it("an empty map", () => {
        const target = new Map();
        const expected = {};
        const result = HashMapUtil.toObject(target);
        expect(result).toEqual(expected);
      });
      it("null", () => {
        const target = null;
        const expected = {};
        const result = HashMapUtil.toObject(target);
        expect(result).toEqual(expected);
      });
    });
    describe("cannot serialize", () => {
      it("if the target map is not a map at all", () => {
        const target = { first: 1 };
        expect(() => HashMapUtil.toObject(target as unknown as Map<string | number, unknown>)).toThrow(
          "hashMap.toObject(map): must be passed a Map"
        );
      });
    });
  });

  describe("fromObject", () => {
    describe("can deserialize", () => {
      it("an object", () => {
        const target = { first: 1, second: 2, third: 3 };
        const results = HashMapUtil.fromObject(target);
        const expected = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 3]
        ]);
        expect(results).toEqual(expected);
      });
      it("a direct serialized object", () => {
        const sourceObj = {
          dataType: "Map",
          value: [
            ["first", 1],
            ["second", 2]
          ]
        };
        const expected = new Map([
          ["first", 1],
          ["second", 2]
        ]);
        const results = HashMapUtil.fromObject(sourceObj);
        expect(results).toEqual(expected);
      });
      it("a serialized map string", () => {
        const str =
          '{"dataType":"Map","value":[["first",1],["second",2],["third",3]]}';
        const strObj = JSON.parse(str);
        const expected = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 3]
        ]);
        const results = HashMapUtil.fromObject(strObj);
        expect(results).toEqual(expected);
      });
      it("a serialized map", () => {
        const sourceMap = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 3]
        ]);
        const str = HashMapUtil.stringify(sourceMap);
        const expectedStr =
          '{"dataType":"Map","value":[["first",1],["second",2],["third",3]]}';
        expect(str).toBe(expectedStr);
        const strObj = JSON.parse(str);
        const expected = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 3]
        ]);
        const results = HashMapUtil.fromObject(strObj);
        expect(results).toEqual(expected);
      });
    });
    describe("cannot deserialize", () => {
      it("a number", () => {
        const target = 4;
        expect(() => {
          HashMapUtil.fromObject(target as unknown as Record<string, unknown>);
        }).toThrow("hashMap.fromObject(object): must be passed an object");
      });
    });
  });

  describe("union", () => {
    describe("can work", () => {
      it("and takes both from source and target", () => {
        const source = new Map([["first", 1]]);
        const additional = new Map([["second", 2]]);
        const expected = new Map([
          ["first", 1],
          ["second", 2]
        ]);
        const results = HashMapUtil.union(source, additional, false);
        expect(results).toEqual(expected);
      });
      it("and unions if both the source and target are maps", () => {
        const source = new Map([
          ["first", 1],
          ["second", 2]
        ]);
        const additional = new Map([
          ["second", 1],
          ["third", 2]
        ]);
        const expected = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 2]
        ]);
        const results = HashMapUtil.union(source, additional, false);
        expect(results).toEqual(expected);
      });
      it("make a clone of the results", () => {
        const source = new Map([["first", 1]]);
        const additional = new Map([["second", 2]]);
        const expected = new Map([
          ["first", 1],
          ["second", 2]
        ]);
        const results = HashMapUtil.union(source, additional, false);
        expect(results).toEqual(expected);
        results.set("first", 0);
        results.set("second", 1);
        expect(results.get("first")).toBe(0);
        expect(source.get("first")).toBe(1);
        expect(results.get("second")).toBe(1);
        expect(additional.get("second")).toBe(2);
      });
      it("if the source is null", () => {
        const source = null;
        const additional = new Map([
          ["second", 1],
          ["third", 2]
        ]);
        const expected = new Map([
          ["second", 1],
          ["third", 2]
        ]);
        const results = HashMapUtil.union(source, additional, false);
        expect(results).toEqual(expected);
      });
      it("if the additional map is null", () => {
        const source = new Map([
          ["first", 1],
          ["second", 2]
        ]);
        const additional = null;
        const expected = new Map([
          ["first", 1],
          ["second", 2]
        ]);
        const results = HashMapUtil.union(source, additional, false);
        expect(results).toEqual(expected);
      });
    });
    describe("handles conflicts", () => {
      it("by ignoring if allow overwrites is default", () => {
        const source = new Map([["first", 1]]);
        const additional = new Map([["first", 0]]);
        const expected = new Map([["first", 1]]);
        const results = HashMapUtil.union(source, additional);
        expect(results).toEqual(expected);
      });
      it("by ignoring if allow overwrites is false", () => {
        const source = new Map([["first", 1]]);
        const additional = new Map([["first", 0]]);
        const expected = new Map([["first", 1]]);
        const results = HashMapUtil.union(source, additional, false);
        expect(results).toEqual(expected);
      });
      it("by updating if allow overwrites is true", () => {
        const source = new Map([["first", 1]]);
        const additional = new Map([["first", 0]]);
        const expected = new Map([["first", 0]]);
        const results = HashMapUtil.union(source, additional, true);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("clone", () => {
    describe("can clone", () => {
      it("a simple map", () => {
        const target = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 3]
        ]);
        const expected = target;
        const results = HashMapUtil.clone(target);
        expect(results).toEqual(expected);
      });
      it("an empty array", () => {
        const target = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 3]
        ]);
        const expected = target;
        const results = HashMapUtil.clone(target);
        expect(results).toEqual(expected);
      });
    });
    describe("changing a clone does not change the source", () => {
      it("a simple map", () => {
        const target = new Map([
          ["first", 1],
          ["second", 2],
          ["third", 3]
        ]);
        const expected = new Map([
          ["first", 0],
          ["second", 2],
          ["third", 3]
        ]);
        const results = HashMapUtil.clone(target);
        expect(results.has("first")).toBe(true);
        results.set("first", 0);
        expect(target.get("first")).toBe(1);
        expect(results.get("first")).toBe(0);
        expect(results).toEqual(expected);
      });
      it("an empty array", () => {
        const target = new Map();
        const expected = new Map([["first", 0]]);
        const results = HashMapUtil.clone(target);
        results.set("first", 0);
        expect(target.has("first")).toBe(false);
        expect(results.get("first")).toBe(0);
        expect(results).toEqual(expected);
      });
    });
    describe("cannot clone", () => {
      it("a number", () => {
        const target = 4;
        expect(() => {
          HashMapUtil.clone(target as unknown as Map<unknown, unknown>);
        }).toThrow("hashMap.clone(targetMap): targetMap must be a Map");
      });
      it("null", () => {
        const target = null;
        expect(() => {
          HashMapUtil.clone(target as unknown as Map<unknown, unknown>);
        }).toThrow("hashMap.clone(targetMap): targetMap must be a Map");
      });
    });
  });

  describe("mappingFn", () => {
    const bgRed = "background-color: #FF0000";
    const bgGreen = "background-color: #00FF00";
    const bgGrey = "background-color: #AAAAAA";
    const styleMap = new Map([
      ["1", bgRed],
      ["2", bgGreen]
    ]);

    it("styles if the value is found", () => {
      const mappingFn = HashMapUtil.mappingFn(styleMap, bgGrey);
      const expected = bgRed;
      const value = "1";
      const results = mappingFn(value);
      expect(results).toBe(expected);
    });
    it("styles if the value is found 2", () => {
      const mappingFn = HashMapUtil.mappingFn(styleMap, bgGrey);
      const expected = bgGreen;
      const value = "2";
      const results = mappingFn(value);
      expect(results).toBe(expected);
    });
    it("styles with default if not found", () => {
      const mappingFn = HashMapUtil.mappingFn(styleMap, bgGrey);
      const expected = bgGrey;
      const value = "somethingElse";
      const results = mappingFn(value);
      expect(results).toBe(expected);
    });
    it("styles with default empty string if not found", () => {
      const mappingFn = HashMapUtil.mappingFn(styleMap);
      const expected = "";
      const value = "somethingElse";
      const results = mappingFn(value);
      expect(results).toBe(expected);
    });
  });

  describe("reverse", () => {
    it("can map", () => {
      const encodingMap = new Map([
        [" ", "%20"],
        ["\\n", "%0A"],
        ["\\t", "%09"]
      ]);
      const result = encodingMap.get(" ");
      const expected = "%20";
      expect(result).toBe(expected);
    });
    it("can reverse a map", () => {
      const encodingMap = new Map([
        [" ", "%20"],
        ["\\n", "%0A"],
        ["\\t", "%09"]
      ]);
      const decodingMap = HashMapUtil.reverse(encodingMap);
      const result = decodingMap.get("%20");
      const expected = " ";
      expect(result).toBe(expected);
    });
    it("doesnt modify the existing map", () => {
      const encodingMap = new Map([
        [" ", "%20"],
        ["\\n", "%0A"],
        ["\\t", "%09"]
      ]);
      const decodingMap = HashMapUtil.reverse(encodingMap);
      expect(decodingMap).not.toBe(encodingMap);
    });
  });

  describe("getSet", () => {
    it("can set a value", () => {
      const key = "count";
      const defaultValue = null;
      const initialMap = new Map([[key, defaultValue]]);
      const functor = (value: number | null | undefined) => {
        if (!value) return 1;
        return value + 1;
      };
      HashMapUtil.getSet(initialMap, key, functor);
      const expected = 1;
      const results = initialMap.get(key);
      expect(results).toBe(expected);
    });
    it("can increment a value", () => {
      const key = "count";
      const defaultValue = null;
      const initialMap = new Map([[key, defaultValue]]);
      const functor = (value: number | null | undefined) => {
        if (!value) return 1;
        return value + 1;
      };
      HashMapUtil.getSet(initialMap, key, functor);
      HashMapUtil.getSet(initialMap, key, functor);
      const expected = 2;
      const results = initialMap.get(key);
      expect(results).toBe(expected);
    });
    it("can increment a value on an unknown key", () => {
      const key = "count";
      const initialMap = new Map<string, number>();
      const functor = (value: number | undefined) => {
        if (!value) return 1;
        return value + 1;
      };
      HashMapUtil.getSet(initialMap, key, functor);
      HashMapUtil.getSet(initialMap, key, functor);
      const expected = 2;
      const results = initialMap.get(key);
      expect(results).toBe(expected);
    });
    it("can increment a value multiple times", () => {
      const key = "count";
      const defaultValue = null;
      const initialMap = new Map([[key, defaultValue]]);
      const functor = (value: number | null | undefined) => {
        if (!value) return 1;
        return value + 1;
      };
      HashMapUtil.getSet(initialMap, key, functor);
      HashMapUtil.getSet(initialMap, key, functor);
      HashMapUtil.getSet(initialMap, key, functor);
      HashMapUtil.getSet(initialMap, key, functor);
      HashMapUtil.getSet(initialMap, key, functor);
      const expected = 5;
      const results = initialMap.get(key);
      expect(results).toBe(expected);
    });
    it("can set a value from map", () => {
      const key = "count";
      const defaultValue = null;
      const initialMap = new Map<string, number | null>([
        [key, defaultValue],
        ["anotherValue", 10]
      ]);
      const functor = (value: number | null | undefined, _: unknown, map: Map<unknown, unknown>) => {
        if (!value) return (map.get("anotherValue") as number);
        return value + 1;
      };
      HashMapUtil.getSet(initialMap, key, functor);
      const expected = 10;
      const results = initialMap.get(key);
      expect(results).toBe(expected);
    });
  });
});
