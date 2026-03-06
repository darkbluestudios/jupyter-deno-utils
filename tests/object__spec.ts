import { describe, it } from "@std/testing/bdd"; // afterEach, beforeEach
import { expect } from "@std/expect";
import ObjectUtils from "../src/object.ts";
import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";

/** Minimal spy for joinFn - records calls for tests that asserted on jest.fn() */
function createJoinSpy<T extends (...args: unknown[]) => unknown>(impl: T): T & { mock: { calls: unknown[][] } } {
  const calls: unknown[][] = [];
  const wrapped = (...args: unknown[]) => {
    calls.push(args);
    return impl(...args);
  };
  (wrapped as unknown as { mock: { calls: unknown[][] } }).mock = { calls };
  return wrapped as T & { mock: { calls: unknown[][] } };
}

// const initializeWeather = () => [
//   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
//   { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
//   { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
// ];
const cityLocations = new Map([
  ['Chicago', { locationId: 1, city: 'Chicago', lat: 41.8781, lon: 87.6298 }],
  ['New York', { locationId: 2, city: 'New York', lat: 40.7128, lon: 74.0060 }],
  ['Seattle', { locationId: 3, city: 'Seattle', lat: 47.6062, lon: 122.3321 }]
]);

describe('ObjectUtils', () => {
  describe('evaluate if function or property', () => {
    it('returns the specific value if null is sent', () => {
      const source = 23;
      const expected = 23;
      const results = ObjectUtils.evaluateFunctionOrProperty(null)(source);
      expect(results).toBe(expected);
    });
    it('returns a property if a string is passed', () => {
      const source = { age: 23 };
      const expected = 23;
      const results = ObjectUtils.evaluateFunctionOrProperty('age')(source);
      expect(results).toBe(expected);
    });
    it('returns a mapped value if the function is passed',  () => {
      const source = { age: 23 };
      const expected = 23 * 2;
      const results = ObjectUtils.evaluateFunctionOrProperty((r) => r.age * 2)(source);
      expect(results).toBe(expected);
    });
    it('throws an error if an unexpected type is passed',  () => {
      expect(() => ObjectUtils.evaluateFunctionOrProperty(new Date()))
        .toThrow();
    });
  });

  describe('objAssign', () => {
    it('can assign multiple values', () => {
      const expected = { first: 'john', last: 'doe' };
      let found = {};
      found = ObjectUtils.objAssign(found, 'first', 'john', 'last', 'doe');
      expect(found).toEqual(expected);
    });
    it('assigns a value even on an empty object', () => {
      const expected = { first: 'john' };
      const found = ObjectUtils.objAssign(undefined, 'first', 'john');
      expect(found).toEqual(expected);
    });
  });
  describe('objAssignIP', () => {
    it('assigns a value on an existing object', () => {
      const expected = { first: 'john', last: 'doe' };
      const found = {};
      ObjectUtils.objAssignIP(found, 'first', 'john');
      ObjectUtils.objAssignIP(found, 'last', 'doe');
      expect(found).toEqual(expected);
    });
    it('can assign multiple values at the same time', () => {
      const expected = { first: 'john', last: 'doe' };
      const found = {};
      ObjectUtils.objAssignIP(found, 'first', 'john', 'last', 'doe');
      expect(found).toEqual(expected);
    });
    it('assigns a value even on an empty object', () => {
      const expected = { first: 'john' };
      const found = ObjectUtils.objAssignIP(undefined, 'first', 'john');
      expect(found).toEqual(expected);
    });
    it('assigns a value on an existing object', () => {
      const data = { first: 'john', last: 'doe' };
      const propName = null;
      const propValue = 23;
      const expected = 'Expecting at least one property name to be passed';

      expect(() => {
        ObjectUtils.objAssignIP(data, propName, propValue);
      }).toThrow(expected);
    });
  });
  describe('propertyObj', () => {
    it('can create a simple object by itself', () => {
      const expected = { first: 'john' };
      const found = ObjectUtils.objAssign(null, 'first', 'john');
      expect(found).toEqual(expected);
    });
    it('can combine multiple property objects', () => {
      const expected = { first: 'john', last: 'doe' };
      const found = ObjectUtils.objAssign(null, 'first', 'john', 'last', 'doe');
      expect(found).toEqual(expected);
    });
    it('still works if multiple properties are not even', () => {
      const expected = { first: 'john', last: undefined };
      const found = ObjectUtils.objAssign(null, 'first', 'john', 'last');
      expect(found).toEqual(expected);
    });
    it('throws an error if a property is not passed', () => {
      expect(() => ObjectUtils.objAssign(null)).toThrow();
    });
    it('throws an error if a property is not a string', () => {
      expect(() => ObjectUtils.objAssign(null, 1, 'doe')).toThrow();
    });
  });
  describe('objAssignEntities', () => {
    it('can assign at least one entity', () => {
      const entities = [['first', 'john']];
      const expected = { first: 'john' };
      const result = ObjectUtils.objAssignEntities(null, entities);
      expect(result).toEqual(expected);
    });
    it('can assign multiple entities', () => {
      const entities = [['first', 'john'], ['last', 'doe']];
      const expected = { first: 'john', last: 'doe' };
      const result = ObjectUtils.objAssignEntities(null, entities);
      expect(result).toEqual(expected);
    });
    it('appends to an existing object', () => {
      const entities = [['first', 'john']];
      const expected = { first: 'john', last: 'doe' };
      const result = ObjectUtils.objAssignEntities({ last: 'doe' }, entities);
      expect(result).toEqual(expected);
    });
    it('fails if entities are not an array', () => {
      try {
        // not sure why this isn't catching the error
        //expect(ObjectUtils.objAssignEntities(null, {})).toThrow();
        ObjectUtils.objAssignEntities(null, {});
        throw new Error('exception should be thrown if entities are not an array');
      } catch (_err) {
        //
      }
    });
    it('fails if entities are not sent', () => {
      try {
        // not sure why this isn't catching the error
        // expect(ObjectUtils.objAssignEntities(null, [])).toThrow();
        ObjectUtils.objAssignEntities(null, []);
        throw new Error('exception should be thrown if entities are not an array');
      } catch (_err) {
        //
      }
    });
  });
  describe('assign', () => {
    describe('inPlace = false', () => {
      it('can augment a single object', () => {
        const data = { source: 'A', value: 5 };
        const augmentFn = (record) => ({ origin: `s_${record.source}` });
        const expected = [{ source: 'A', value: 5, origin: 's_A' }];
        const results = ObjectUtils.augment(data, augmentFn, false);
        
        //-- original data to be unmodified
        expect((data as Record<string, unknown>).origin).toBeUndefined();
        expect(expected[0].origin).toBe('s_A');

        expect(results).toEqual(expected);
      });
      it('can augment multiple objects', () => {
        const data = [
          { source: 'A', value: 5 }, { source: 'B', value: 11 },
          { source: 'A', value: 6 }, { source: 'B', value: 13 },
          { source: 'A', value: 5 }, { source: 'B', value: 12 }
        ];
        const augmentFn = (record: { source: string }) => ({ origin: `s_${record.source}` });
        const expected = [
          { source: 'A', value: 5, origin: 's_A' }, { source: 'B', value: 11, origin: 's_B' },
          { source: 'A', value: 6, origin: 's_A' }, { source: 'B', value: 13, origin: 's_B' },
          { source: 'A', value: 5, origin: 's_A' }, { source: 'B', value: 12, origin: 's_B' }
        ];
        const results = ObjectUtils.augment(data, augmentFn, false);
        expect((data[0] as Record<string, unknown>).origin).toBeUndefined();
        expect(expected[0].origin).toBe('s_A');
        expect(results).toEqual(expected);
      });
      it('augments immutably by default', () => {
        const data = [
          { source: 'A', value: 5 }, { source: 'B', value: 11 },
          { source: 'A', value: 6 }, { source: 'B', value: 13 },
          { source: 'A', value: 5 }, { source: 'B', value: 12 }
        ];
        const augmentFn = (record) => ({ origin: `s_${record.source}` });
        const expected = [
          { source: 'A', value: 5, origin: 's_A' }, { source: 'B', value: 11, origin: 's_B' },
          { source: 'A', value: 6, origin: 's_A' }, { source: 'B', value: 13, origin: 's_B' },
          { source: 'A', value: 5, origin: 's_A' }, { source: 'B', value: 12, origin: 's_B' }
        ];
        const results = ObjectUtils.augment(data, augmentFn);
        expect((data[0] as Record<string, unknown>).origin).toBeUndefined();
        expect(expected[0].origin).toBe('s_A');
        expect(results).toEqual(expected);
      });
    });
    describe('inPlace = false', () => {
      it('can augment a single object', () => {
        const data = { source: 'A', value: 5 };
        const augmentFn = (record) => ({ origin: `s_${record.source}` });
        const expected = [{ source: 'A', value: 5, origin: 's_A' }];
        const results = ObjectUtils.augment(data, augmentFn, true);
        
        //-- original data to be unmodified
        expect((data as Record<string, unknown>).origin).toBe('s_A');
        expect(expected[0].origin).toBe('s_A');

        expect(results).toEqual(expected);
      });
      it('can augment multiple objects', () => {
        const data = [
          { source: 'A', value: 5 }, { source: 'B', value: 11 },
          { source: 'A', value: 6 }, { source: 'B', value: 13 },
          { source: 'A', value: 5 }, { source: 'B', value: 12 }
        ];
        const augmentFn = (record: { source: string }) => ({ origin: `s_${record.source}` });
        const expected = [
          { source: 'A', value: 5, origin: 's_A' }, { source: 'B', value: 11, origin: 's_B' },
          { source: 'A', value: 6, origin: 's_A' }, { source: 'B', value: 13, origin: 's_B' },
          { source: 'A', value: 5, origin: 's_A' }, { source: 'B', value: 12, origin: 's_B' }
        ];
        const results = ObjectUtils.augment(data, augmentFn, true);
        expect((data[0] as Record<string, unknown>).origin).toBe('s_A');
        expect(expected[0].origin).toBe('s_A');
        expect(results).toEqual(expected);
      });
    });
  });
  describe('safe keys', () => {
    it('can get keys off a null object', () => {
      const expected = [];
      const found = ObjectUtils.keys(undefined);
      expect(found).toEqual(expected);
    });
    it('can get keys off an object', () => {
      const expected = ['first', 'last'];
      const found = ObjectUtils.keys({ first: 'john', last: 'doe' });
      expect(found).toEqual(expected);
    });
    describe('without max rows', () => {
      it('can get keys off an array', () => {
        const expected = ['first', 'last', 'cuca'];
        const found = ObjectUtils.keys([
          { first: 'john', last: 'doe' },
          { first: 'jane', last: 'doe' },
          { first: 'robin', last: 'lloyd', cuca: 'monga' }
        ]);
        expect(found).toEqual(expected);
      });
      it('can get keys off an array, including nulls', () => {
        const expected = ['first', 'last', 'cuca'];
        const found = ObjectUtils.keys([
          { first: 'john', last: 'doe' },
          { first: 'jane', last: 'doe' },
          { first: 'robin', last: 'lloyd', cuca: 'monga' },
          null,
          { first: 'becky', last: 'sternhoffer' }
        ]);
        expect(found).toEqual(expected);
      });
      describe('with max rows', () => {
        it('can get keys off an array', () => {
          const expected = ['first', 'last'];
          const found = ObjectUtils.keys([
            { first: 'john', last: 'doe' },
            { first: 'jane', last: 'doe' },
            { first: 'robin', last: 'lloyd', cuca: 'monga' }
          ], 2);
          expect(found).toEqual(expected);
        });
        it('can get keys off an array, including nulls', () => {
          const expected = ['first', 'last', 'cuca'];
          const found = ObjectUtils.keys([
            { first: 'john', last: 'doe' },
            { first: 'jane', last: 'doe' },
            { first: 'robin', last: 'lloyd', cuca: 'monga' },
            null,
            { first: 'becky', last: 'sternhoffer', score: 4 }
          ], 4);
          expect(found).toEqual(expected);
        });
      });
    });
  });
  describe('clean properties', () => {
    it('leaves a normal property alone', () => {
      const expected = 'first';
      const found = ObjectUtils.cleanPropertyName('first');
      expect(found).toBe(expected);
    });
    it('cleans a property if the property is completely quoted', () => {
      const expected = 'first';
      const found = ObjectUtils.cleanPropertyName('"first"');
      expect(found).toBe(expected);
    });
    it('works with spaces', () => {
      const expected = 'first_woman';
      const dirty = 'first woman';
      const found = ObjectUtils.cleanPropertyName(dirty);
      expect(found).toBe(expected);
    });
    it('works with numbers', () => {
      const expected = '1st_woman';
      const dirty = '1st woman';
      const found = ObjectUtils.cleanPropertyName(dirty);
      expect(found).toBe(expected);
    });
    it('works with odd characters', () => {
      const expected = 'first_woman';
      const dirty = 'first ("woman")';
      const found = ObjectUtils.cleanPropertyName(dirty);
      expect(found).toBe(expected);
    });
    it('works on bad data from d3', () => {
      const badData = [
        { num: '192', ' kind': ' s', ' date': ' 2021-07-11T22:23:07+0100' },
        { num: '190', ' kind': ' c', ' date': ' 2021-07-09T19:54:48+0100' },
        { num: '190', ' kind': ' s', ' date': ' 2021-07-08T17:00:32+0100' }
      ];
      const expected = { ' date': 'date', ' kind': 'kind', num: 'num' };
      const found = ObjectUtils.cleanPropertyNames(badData[0]);
      expect(found).toEqual(expected);
    });
    it('can clean properties as a set of fields provided', () => {
      const badData = [
        { num: '192', ' kind': ' s', ' date': ' 2021-07-11T22:23:07+0100' },
        { num: '190', ' kind': ' c', ' date': ' 2021-07-09T19:54:48+0100' },
        { num: '190', ' kind': ' s', ' date': ' 2021-07-08T17:00:32+0100' }
      ];
      const expected = { ' date': 'date', ' kind': 'kind', num: 'num' };
      const keys = ObjectUtils.keys(badData[0]);
      const found = ObjectUtils.cleanPropertyNames(keys);
      expect(found).toEqual(expected);
    });
    it('can clean properties from a list of objects provided', () => {
      const badData = [
        { num: '192', ' kind': ' s', ' date': ' 2021-07-11T22:23:07+0100' },
        { num: '190', ' kind': ' c', ' date': ' 2021-07-09T19:54:48+0100' },
        { num: '190', ' kind': ' s', ' date': ' 2021-07-08T17:00:32+0100' }
      ];
      const expected = { ' date': 'date', ' kind': 'kind', num: 'num' };
      const keys = ObjectUtils.keys(badData);
      expect(keys).toEqual(['num', ' kind', ' date']);
      const found = ObjectUtils.cleanPropertyNames(badData);
      expect(found).toEqual(expected);
    });
    it('can clean properties ', () => {
      const badData = [
        { num: '192', ' kind': ' s', ' date': ' 2021-07-11T22:23:07+0100' },
        { num: '190', ' kind': ' c', ' date': ' 2021-07-09T19:54:48+0100' },
        { num: '190', ' kind': ' s', ' date': ' 2021-07-08T17:00:32+0100' }
      ];
      const expected = [
        { date: ' 2021-07-11T22:23:07+0100', kind: ' s', num: '192' },
        { date: ' 2021-07-09T19:54:48+0100', kind: ' c', num: '190' },
        { date: ' 2021-07-08T17:00:32+0100', kind: ' s', num: '190' }
      ];
      const found = ObjectUtils.cleanProperties(badData);
      expect(found).toEqual(expected);
    });
  });
  describe('cleanProperties2', () => {
    describe('can clean properties', () => {
      it('leaves a normal property alone', () => {
        const badData = [
          { num: '192' },
          { num: '190' },
          { num: '190' }
        ];
        const expected = {
          labels: { num: 'num' },
          values: [
            { num: '192' },
            { num: '190' },
            { num: '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('cleans a property if the property is quoted', () => {
        const badData = [
          { first: '192', '"second"': '192' },
          { first: '190', '"second"': '190' },
          { first: '190', '"second"': '190' }
        ];
        const expected = {
          labels: { first: 'first', second: 'second' },
          values: [
            { first: '192', second: '192' },
            { first: '190', second: '190' },
            { first: '190', second: '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('cleans a property if the property is partially quoted start', () => {
        const badData = [
          { first: '192', '"second': '192' },
          { first: '190', '"second': '190' },
          { first: '190', '"second': '190' }
        ];
        const expected = {
          labels: { first: 'first', second: 'second' },
          values: [
            { first: '192', second: '192' },
            { first: '190', second: '190' },
            { first: '190', second: '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('cleans a property if the property is partially quoted - end', () => {
        const badData = [
          { first: '192', 'second"': '192' },
          { first: '190', 'second"': '190' },
          { first: '190', 'second"': '190' }
        ];
        const expected = {
          labels: { first: 'first', second: 'second' },
          values: [
            { first: '192', second: '192' },
            { first: '190', second: '190' },
            { first: '190', second: '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('works with spaces', () => {
        const badData = [
          { first: '192', 'second name': '192' },
          { first: '190', 'second name': '190' },
          { first: '190', 'second name': '190' }
        ];
        const expected = {
          labels: { first: 'first', second_name: 'second name' },
          values: [
            { first: '192', second_name: '192' },
            { first: '190', second_name: '190' },
            { first: '190', second_name: '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('works with numbers', () => {
        const badData = [
          { first: '192', '2nd name': '192' },
          { first: '190', '2nd name': '190' },
          { first: '190', '2nd name': '190' }
        ];
        const expected = {
          labels: { first: 'first', '2nd_name': '2nd name' },
          values: [
            { first: '192', '2nd_name': '192' },
            { first: '190', '2nd_name': '190' },
            { first: '190', '2nd_name': '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('works with odd characters', () => {
        const badData = [
          { first: '192', 'name("2nd")': '192' },
          { first: '190', 'name("2nd")': '190' },
          { first: '190', 'name("2nd")': '190' }
        ];
        const expected = {
          labels: { first: 'first', name_2nd: 'name("2nd")' },
          values: [
            { first: '192', name_2nd: '192' },
            { first: '190', name_2nd: '190' },
            { first: '190', name_2nd: '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('works on bad data from d3', () => {
        const badData = [
          { num: '192', ' kind': ' s', ' date': ' 2021-07-11T22:23:07+0100' },
          { num: '190', ' kind': ' c', ' date': ' 2021-07-09T19:54:48+0100' },
          { num: '190', ' kind': ' s', ' date': ' 2021-07-08T17:00:32+0100' }
        ];
        const expected = {
          labels: { date: 'date', kind: 'kind', num: 'num' },
          values: [
            { num: '192', kind: ' s', date: ' 2021-07-11T22:23:07+0100' },
            { num: '190', kind: ' c', date: ' 2021-07-09T19:54:48+0100' },
            { num: '190', kind: ' s', date: ' 2021-07-08T17:00:32+0100' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('can clean properties ', () => {
        const badData = [
          { num: '192', ' kind': ' s', ' date': ' 2021-07-11T22:23:07+0100' },
          { num: '190', ' kind': ' c', ' date': ' 2021-07-09T19:54:48+0100' },
          { num: '190', ' kind': ' s', ' date': ' 2021-07-08T17:00:32+0100' }
        ];
        const expected = {
          labels: { date: 'date', kind: 'kind', num: 'num' },
          values: [
            { date: ' 2021-07-11T22:23:07+0100', kind: ' s', num: '192' },
            { date: ' 2021-07-09T19:54:48+0100', kind: ' c', num: '190' },
            { date: ' 2021-07-08T17:00:32+0100', kind: ' s', num: '190' }
          ]
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
      it('does not fail on null', () => {
        const badData = null;
        const expected = {
          labels: {},
          values: []
        };
        const found = ObjectUtils.cleanProperties2(badData);
        expect(found).toEqual(expected);
      });
    });
    describe('keeps the order of the properties', () => {
      it('when cleaned', () => {
        const badData = [
          { num: '192', ' kind': ' s', ' date': ' 2021-07-11T22:23:07+0100' },
          { num: '190', ' kind': ' c', ' date': ' 2021-07-09T19:54:48+0100' },
          { num: '190', ' kind': ' s', ' date': ' 2021-07-08T17:00:32+0100' }
        ];
        const expected = {
          labels: { date: ' date', kind: ' kind', num: 'num' },
          values: [
            { num: '192', kind: ' s', date: ' 2021-07-11T22:23:07+0100' },
            { num: '190', kind: ' c', date: ' 2021-07-09T19:54:48+0100' },
            { num: '190', kind: ' s', date: ' 2021-07-08T17:00:32+0100' }
          ]
        };
        const results = ObjectUtils.cleanProperties2(badData);

        const expectedStr = JSON.stringify(expected.values);
        const resultsStr = JSON.stringify(results.values);
        expect(resultsStr).toEqual(expectedStr);
      });
    });
  });
  describe('renameProperties', () => {
    it('renames properties on an object', () => {
      const dirtyObject = { first: 'john', last: 'doe' };
      const translation = { first: 'first_name' };
      const expected = { first_name: 'john', last: 'doe' };
      const found = ObjectUtils.renameProperties(dirtyObject, translation);
      expect(found).toEqual(expected);
      expect(found).not.toEqual(dirtyObject);
    });
    it('returns an empty object if renaming a null object', () => {
      //-- don't put the result in the spec
      // const expected = {};
      const result = ObjectUtils.renameProperties(null, { first: 'first_name' });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
    });
    it('returns an empty object if renaming a null object', () => {
      //-- don't put the result in the spec
      // const expected = {};
      const result = ObjectUtils.renameProperties([null], { first: 'first_name' });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
    });
  });
  describe('renamePropertiesFromList', () => {
    it('renames properties on an object', () => {
      const dirtyObject = { first: 'john', last: 'doe' };
      const originalKeys = ['first'];
      const newKeys = ['first_name'];
      const expected = { first_name: 'john', last: 'doe' };
      const found = ObjectUtils.renamePropertiesFromList(dirtyObject, originalKeys, newKeys);
      expect(found).toEqual(expected);
      expect(found).not.toEqual(dirtyObject);
    });
    it('returns an empty object if renaming a null object', () => {
      //-- don't put the result in the spec
      // const expected = {};
      const originalKeys = ['first'];
      const newKeys = ['first_name'];
      const result = ObjectUtils.renamePropertiesFromList(null, originalKeys, newKeys);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
    });
    it('returns an empty object if renaming a null object', () => {
      //-- don't put the result in the spec
      // const expected = {};
      const originalKeys = ['first'];
      const newKeys = ['first_name'];
      const result = ObjectUtils.renamePropertiesFromList([null], originalKeys, newKeys);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
    });
    it('can use String replacement', () => {
      const dirtyObject = { first: 'john', last: 'doe' };
      const originalKeys = ObjectUtils.keys(dirtyObject);
      const newKeys = Array.from(originalKeys).map((s) => `${s}_name`);
      const expected = { first_name: 'john', last_name: 'doe' };
      const found = ObjectUtils.renamePropertiesFromList(dirtyObject, originalKeys, newKeys);
      expect(found).toEqual(expected);
      expect(found).not.toEqual(dirtyObject);
    });
  });
  describe('multiple step test', () => {
    const expected = [
      { first_name: 'john', last_name: 'doe', current_occupation: 'developer' },
      { first_name: 'jane', last_name: 'doe', current_occupation: 'developer' },
      { first_name: 'jim', last_name: 'bob', current_occupation: 'scientist' }
    ];
    const dirty = [
      { '"first name"': 'john', 'last name': 'doe', 'current (occupation)': 'developer' },
      { '"first name"': 'jane', 'last name': 'doe', 'current (occupation)': 'developer' },
      { '"first name"': 'jim', 'last name': 'bob', 'current (occupation)': 'scientist' }
    ];

    // const keys = ObjectUtils.keys(dirty);
    const cleanedKeys = ObjectUtils.cleanPropertyNames(dirty[0]);
    const expectedKeys = {
      '"first name"': 'first_name',
      'last name': 'last_name',
      'current (occupation)': 'current_occupation'
    };
    expect(cleanedKeys).toEqual(expectedKeys);

    const cleanedObjects = ObjectUtils.renameProperties(dirty, cleanedKeys);
    expect(cleanedObjects).toEqual(expected);
  });
  describe('collapse', () => {
    it('collapses with a single child', () => {
      const targetObj = {
        base: 'obj',
        child1: {
          targetValue: 'test'
        }
      };
      const result = ObjectUtils.collapse(targetObj);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('base', 'obj');
      expect(result).toHaveProperty('targetValue', 'test');
    });
    it('returns an empty object if the object to collapse is null', () => {
      const targetObj = null;
      const result = ObjectUtils.collapse(targetObj);
      const expected = {};
      expect(result).toEqual(expected);
    });
    it('is the same even if it is on the same object', () => {
      const targetObj = { base: 'obj', targetValue: 'test' };
      const result = ObjectUtils.collapse(targetObj);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('base', 'obj');
      expect(result).toHaveProperty('targetValue', 'test');
    });
    it('collapses even if the values are on two separate objects', () => {
      const targetObj = { p1: { base: 'obj' }, p2: { targetValue: 'test' } };
      const result = ObjectUtils.collapse(targetObj);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('base', 'obj');
      expect(result).toHaveProperty('targetValue', 'test');
    });
    it('does NOT include the field if the depth is too high', () => {
      const targetObj: Record<string, unknown> = { base: 'obj' };

      let travellingObj: Record<string, unknown> = targetObj;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < ObjectUtils.MAX_COLLAPSE_DEPTH + 4; i++) {
        travellingObj.p = {};
        travellingObj = travellingObj.p as Record<string, unknown>;
      }
      travellingObj.targetValue = 'test';

      const result = ObjectUtils.collapse(targetObj);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('base', 'obj');
      expect(result).not.toHaveProperty('targetValue', 'test');
    });
  });
  describe('isObject', () => {
    describe('valid objects', () => {
      it('Map', () => {
        const val = new Map([['firstname', 'john']]);
        const expected = true;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
      it('pojo', () => {
        const val = { firstName: 'john' };
        const expected = true;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
      it('class', () => {
        class Person {
          firstName: string;
          lastName: string;
          constructor(firstName: string, lastName: string) {
            this.firstName = firstName;
            this.lastName = lastName;
          }
        }
        const val = new Person('john', 'doe');
        const expected = true;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
    });
    describe('invalid objects', () => {
      it('null', () => {
        const val = null;
        const expected = false;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
      it('undefined', () => {
        const val = undefined;
        const expected = false;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
      it('string', () => {
        const val = 'string';
        const expected = false;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
      it('number', () => {
        const val = 2;
        const expected = false;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
      it('array', () => {
        const val = [0, 1, 2];
        const expected = false;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
      it('date', () => {
        const val = new Date(2023, 12, 1);
        const expected = false;
        const result = ObjectUtils.isObject(val);
        expect(result).toBe(expected);
      });
    });
  });
  describe('flatten', () => {
    describe('can flatten', () => {
      it('a simple pojo', () => {
        const val = {
          firstName: 'john',
          lastName: 'doe'
        };
        const expected = {
          firstName: 'john',
          lastName: 'doe'
        };
        const results = ObjectUtils.flatten(val);
        expect(results).toStrictEqual(expected);
      });
      it('a simple 2 deep pojo', () => {
        const val = {
          firstName: 'john',
          lastName: 'doe',
          class: {
            name: 'econ-101'
          }
        };
        const expected = {
          firstName: 'john',
          lastName: 'doe',
          'class.name': 'econ-101'
        };
        const results = ObjectUtils.flatten(val);
        expect(results).toStrictEqual(expected);
      });
      it('multiple nested objects', () => {
        const val = {
          firstName: 'john',
          lastName: 'doe',
          class: {
            name: 'econ-101',
            professor: {
              firstName: 'amy',
              lastName: 'gillespie',
              id: 10101
            }
          },
          subObject: {
            first: 'first',
            last: 'last'
          },
          array: [0, 1, 2, 3]
        };
        const expected = {
          firstName: 'john',
          lastName: 'doe',
          'class.name': 'econ-101',
          'class.professor.firstName': 'amy',
          'class.professor.lastName': 'gillespie',
          'class.professor.id': 10101,
          'subObject.first': 'first',
          'subObject.last': 'last',
          array: [0, 1, 2, 3]
        };
        const results = ObjectUtils.flatten(val);
        expect(results).toStrictEqual(expected);
      });
      it('does not flatten a null', () => {
        const val = null;
        const expected = null;
        const results = ObjectUtils.flatten(val);
        expect(results).toStrictEqual(expected);
      });
      it('does not flatten an array', () => {
        const val = [0, 1, 2];
        const expected = [0, 1, 2];
        const results = ObjectUtils.flatten(val);
        expect(results).toStrictEqual(expected);
      });
      it('does not flatten a date', () => {
        const val = new Date(2023, 12, 1);
        const expected = new Date(2023, 12, 1);
        const results = ObjectUtils.flatten(val);
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('expand', () => {
    describe('Can expand', () => {
      it('a simple pojo', () => {
        const value = { first: 'john', last: 'doe' };
        const expected = { first: 'john', last: 'doe' };
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
      it('a simple pojo with string properties', () => {
        const value = {};
        //-- yes this is against linting, but thats the point
        value['first'] = 'john'; // eslint-disable-line
        value['last'] = 'doe'; // eslint-disable-line
        const expected = { first: 'john', last: 'doe' };
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
      it('a simple pojo with a child', () => {
        const value = { first: 'john', last: 'doe', 'friend.first': 'jane', 'friend.last': 'doe' };
        const expected = { first: 'john', last: 'doe', friend: { first: 'jane', last: 'doe' } };
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
      it('a complex pojo with a child', () => {
        const value = {
          first: 'john',
          last: 'doe',
          'friend.first': 'jane',
          'friend.last': 'doe',
          'course.id': 'econ-101',
          'course.professor.id': 10101,
          'course.professor.first': 'jim',
          'course.professor.last': 'gifford'
        };
        const expected = {
          first: 'john',
          last: 'doe',
          friend: { first: 'jane', last: 'doe' },
          course: { id: 'econ-101', professor: { id: 10101, first: 'jim', last: 'gifford' } }
        };
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
    });
    describe('Cannot Expand', () => {
      it('a null', () => {
        const value = null;
        const expected = null;
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
      it('a number', () => {
        const value = 2.2;
        const expected = 2.2;
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
      it('an array', () => {
        const value = [0, 1, 2];
        const expected = [0, 1, 2];
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
      it('a date', () => {
        const value = new Date(2023, 12, 1);
        const expected = new Date(2023, 12, 1);
        const result = ObjectUtils.expand(value);
        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('generate schema', () => {
    it('creates a schema for a set of objects', () => {
      const createRecord = (a, b) => ({ a, b });
      const targetObj = [
        createRecord(1, 'a'),
        createRecord(2, 'b'),
        createRecord(3, 'c'),
        createRecord(4, 'd'),
        createRecord(5, 'e')
      ];
      const result = ObjectUtils.generateSchema(targetObj);
      const expected = { type: 'object', properties: { a: { type: 'number' }, b: { type: 'string' } }, required: ['a', 'b'] };
      // console.log(JSON.stringify(result.items));
      expect(result.items).toStrictEqual(expected);
    });
  });
  describe('mapByProperty', () => {
    it('can map based on a specific property', () => {
      const createPerson = (first, last) => ({ first, last });
      const collection = [
        createPerson('1', 'person'),
        createPerson('2', 'person'),
        createPerson('3', 'person'),
        createPerson('4', 'person'),
        createPerson('5', 'person')
      ];
      const expected = new Map();
      expected.set('1', createPerson('1', 'person'));
      expected.set('2', createPerson('2', 'person'));
      expected.set('3', createPerson('3', 'person'));
      expected.set('4', createPerson('4', 'person'));
      expected.set('5', createPerson('5', 'person'));

      const result = ObjectUtils.mapByProperty(collection, 'first');
      expect(result).toStrictEqual(expected);
    });
    it('can map an empty list without throwing an error', () => {
      ObjectUtils.mapByProperty([], 'field');
    });
    it('throws an error if no property is requested', () => {
      expect(() => ObjectUtils.mapByProperty([]))
        .toThrow('object.mapByProperty: expects a propertyName');
    });
    it('returns an empty map if the object to be mapped is null', () => {
      const expected = new Map();
      const result = ObjectUtils.mapByProperty(null, 'field');
      expect(result).toStrictEqual(expected);
    });
    describe('accessor', () => {
      it('can map property name', () => {
        const createPerson = (first, last) => ({ first, last });
        const collection = [
          createPerson('1', 'person'),
          createPerson('2', 'person'),
          createPerson('3', 'person'),
          createPerson('4', 'person'),
          createPerson('5', 'person')
        ];
        const expected = new Map();
        expected.set(collection[0].first, collection[0]);
        expected.set(collection[1].first, collection[1]);
        expected.set(collection[2].first, collection[2]);
        expected.set(collection[3].first, collection[3]);
        expected.set(collection[4].first, collection[4]);

        const result = ObjectUtils.mapByProperty(collection, 'first');

        expect(result).toEqual(result);
      });
      it('can map function', () => {
        const createPerson = (first, last) => ({ first, last });
        const collection = [
          createPerson('1', 'person'),
          createPerson('2', 'person'),
          createPerson('3', 'person'),
          createPerson('4', 'person'),
          createPerson('5', 'person')
        ];
        const expected = new Map();
        expected.set(collection[0].first, collection[0]);
        expected.set(collection[1].first, collection[1]);
        expected.set(collection[2].first, collection[2]);
        expected.set(collection[3].first, collection[3]);
        expected.set(collection[4].first, collection[4]);

        const result = ObjectUtils.mapByProperty(collection, (r) => r.first);

        expect(result).toEqual(result);
      });
    });
  });
  describe('selectObjectProperties', () => {
    it('can select properties of an object', () => {
      const baseObj = {
        a: 1,
        b: 2,
        c: 3,
        d: 4
      };
      const result = ObjectUtils.selectObjectProperties(baseObj, ['a', 'b']);
      const expected = [{
        a: 1,
        b: 2
      }];
      expect(result).toStrictEqual(expected);
    });
    it('can select properties as arguments', () => {
      const baseObj = {
        a: 1,
        b: 2,
        c: 3,
        d: 4
      };
      const result = ObjectUtils.selectObjectProperties(baseObj, 'a', 'b');
      const expected = [{
        a: 1,
        b: 2
      }];
      expect(result).toStrictEqual(expected);
    });
    it('does not throw an error if selecting properties on null', () => {
      const result = ObjectUtils.selectObjectProperties(null, ['a', 'b']);
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });
    it('returns an empty array if requesting an empty list of properties', () => {
      const result = ObjectUtils.selectObjectProperties(null, []);
      const expected = [];
      expect(result).toEqual(expected);
    });
    it('returns an empty array if requesting an null list of properties', () => {
      const result = ObjectUtils.selectObjectProperties(null, null);
      const expected = [];
      expect(result).toEqual(expected);
    });
  });
  it('can select properties of a list of 1 object', () => {
    const baseObj = [{
      a: 10,
      b: 20,
      c: 30,
      d: 40
    }];
    const result = ObjectUtils.selectObjectProperties(baseObj, ['a', 'b']);
    const expected = [{
      a: 10,
      b: 20
    }];
    expect(result).toStrictEqual(expected);
  });
  it('can select properties of a list of * objects', () => {
    const baseObj = [{
      a: 110,
      b: 120,
      c: 130,
      d: 140
    }, {
      a: 210,
      b: 220,
      c: 230,
      d: 240
    }];
    const result = ObjectUtils.selectObjectProperties(baseObj, ['a', 'b']);
    const expected = [{
      a: 110,
      b: 120
    }, {
      a: 210,
      b: 220
    }];
    expect(result).toStrictEqual(expected);
  });
  describe('filterObjectProperties', () => {
    it('can filter properties of an object', () => {
      const baseObj = {
        a: 1,
        b: 2,
        c: 3,
        d: 4
      };
      const result = ObjectUtils.filterObjectProperties(baseObj, ['a', 'b']);
      const expected = [{
        c: 3,
        d: 4
      }];
      expect(result).toStrictEqual(expected);
    });
    it('does not throw an error if filtering on null', () => {
      const result = ObjectUtils.filterObjectProperties(null, ['a', 'b']);
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });
  });
  it('can filter properties of a list of 1 object', () => {
    const baseObj = [{
      a: 10,
      b: 20,
      c: 30,
      d: 40
    }];
    const result = ObjectUtils.filterObjectProperties(baseObj, ['a', 'b']);
    const expected = [{
      c: 30,
      d: 40
    }];
    expect(result).toStrictEqual(expected);
  });
  it('can filter properties of a list of * objects', () => {
    const baseObj = [{
      a: 110,
      b: 120,
      c: 130,
      d: 140
    }, {
      a: 210,
      b: 220,
      c: 230,
      d: 240
    }];
    const result = ObjectUtils.filterObjectProperties(baseObj, ['a', 'b']);
    const expected = [{
      c: 130,
      d: 140
    }, {
      c: 230,
      d: 240
    }];
    expect(result).toStrictEqual(expected);
  });
  describe('getObjectPropertyTypes', () => {
    it('can find the types on a simple object', () => {
      const target = {
        name: 'John',
        age: 23,
        height: 6.0
      };
      const expected = new Map();
      expected.set('string', new Set(['name']));
      expected.set('number', new Set(['age', 'height']));
      const results = ObjectUtils.getObjectPropertyTypes(target);
      expect(results).toStrictEqual(expected);
    });
    it('can find the types on a list of objects', () => {
      const target = [{
        name: 'John',
        age: 23,
        height: 6.0
      }, {
        name: 'Jane',
        age: 28,
        height: 5.4,
        education: 'high'
      }];
      const expected = new Map();
      expected.set('string', new Set(['name', 'education']));
      expected.set('number', new Set(['age', 'height']));
      const results = ObjectUtils.getObjectPropertyTypes(target);
      expect(results).toStrictEqual(expected);
    });
    it('can find the types even with a null in a list of objects', () => {
      const target = [{
        name: 'John',
        age: 23,
        height: 6.0
      }, null, {
        name: 'Jane',
        age: 28,
        height: 5.4,
        education: 'high'
      }];
      const expected = new Map();
      expected.set('string', new Set(['name', 'education']));
      expected.set('number', new Set(['age', 'height']));
      const results = ObjectUtils.getObjectPropertyTypes(target);
      expect(results).toStrictEqual(expected);
    });
    it('can find the types with some objects having less properties', () => {
      const target = [{
        name: 'John',
        age: 23,
        height: 6.0,
        education: 'high'
      }, null, {
        name: 'Jane',
        age: null,
        height: null,
      }];
      const expected = new Map();
      expected.set('string', new Set(['name', 'education']));
      expected.set('number', new Set(['age', 'height']));
      const results = ObjectUtils.getObjectPropertyTypes(target);
      expect(results).toStrictEqual(expected);
    });
    it('does not throw an error if gettingPropertyTypes on null', () => {
      const expected = new Map();
      const result = ObjectUtils.getObjectPropertyTypes(null);
      expect(result).toStrictEqual(expected);
    });
  });
  describe('fetchObjectProperty', () => {
    it('can fetch a simple property off an object', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = 'john';
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'first');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a simple string property off an object', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = 'john';
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'first');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a simple number property off an object', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = 24;
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'age');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a simple object property off an object', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = { id: 'econ-101', name: 'Economy of Thought' };
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'class');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a child property off a related object', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = 'econ-101';
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'class.id');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a property off a child list .', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        classes: [{
          id: 'econ-101',
          name: 'Economy of Thought'
        }]
      };
      const expected = 'econ-101';
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'classes.0.id');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a property off a child list with prefixed []', () => {
      const targetObj = [{
        first: 'john',
        age: 24,
        classes: [{
          id: 'econ-101',
          name: 'Economy of Thought'
        }]
      }];
      const expected = 'econ-101';
      const result = ObjectUtils.fetchObjectProperty(targetObj, '[0]classes.0.id');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a property off a child list with prefixed .', () => {
      const targetObj = [{
        first: 'john',
        age: 24,
        classes: [{
          id: 'econ-101',
          name: 'Economy of Thought'
        }]
      }];
      const expected = 'econ-101';
      const result = ObjectUtils.fetchObjectProperty(targetObj, '.[0]classes.0.id');
      expect(result).toStrictEqual(expected);
    });
    it('can fetch a property off a child list []', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        classes: [{
          id: 'econ-101',
          name: 'Economy of Thought'
        }]
      };
      const expected = 'econ-101';
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'classes[0]id');
      expect(result).toStrictEqual(expected);
    });
    it('will not thrown an error if we target an invalid property', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      //-- no exception to be thrown because we are safe
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'class.invalidProperty', { safeAccess: true });
      expect(result).toBeFalsy();
    });
    it('will throw an error if we access past an invalid property is not found', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = 'Invalid property class.invalidProperty.invalidProperty2 [invalidProperty2] does not exist - safeAccess:false';
      expect(() => {
        ObjectUtils.fetchObjectProperty(targetObj, 'class.invalidProperty.invalidProperty2', { safeAccess: false });
      }).toThrow(expected);
    });
    it('will not throw an error if we access past an invalid property but is safe', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = null;
      const results = ObjectUtils.fetchObjectProperty(targetObj, 'class.invalidProperty.invalidProperty2', { safeAccess: true });
      expect(results).toBe(expected);
    });
    it('can support safe access of properties', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      //-- no exception to be thrown because we are safe
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'class.invalidProperty.invalidProperty2', { safeAccess: true });
      expect(result).toBeFalsy();
    });
    it('can support elvis operators with valid property', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      const expected = 'Economy of Thought';
      //-- no exception to be thrown because we are safe
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'class.?name', { safeAccess: false });
      expect(result).toBe(expected);
    });
    it('can support elvis operators with invalid property', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101',
          name: 'Economy of Thought'
        }
      };
      //-- no exception to be thrown because we are safe
      const result = ObjectUtils.fetchObjectProperty(targetObj, 'class.?invalidProperty.?invalidProperty2', { safeAccess: false });
      expect(result).toBeFalsy();
    });
    it('does not throw an error if fetching properties on null', () => {
      const result = ObjectUtils.fetchObjectProperty(null, 'clases.className');
      expect(result).toBeNull();
    });
  });
  describe('applyPropertyValue', () => {
    describe('can set', () => {
      it('on a simple object', () => {
        const targetObj = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const path = 'favoriteColor';
        const value = 'blue';
        const expected = {
          first: 'john',
          age: 24,
          favoriteColor: 'blue',
          class: {
            id: 'econ-101'
          }
        };
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
      it('on a child object', () => {
        const targetObj = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const path = 'class.name';
        const value = 'Economy of Thought';
        const expected = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101',
            name: 'Economy of Thought'
          }
        };
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
      it('on a non-existant child object', () => {
        const targetObj = {
          first: 'john',
          age: 24
        };
        const path = 'class.name';
        const value = 'Economy of Thought';
        const expected = {
          first: 'john',
          age: 24,
          class: {
            name: 'Economy of Thought'
          }
        };
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
      it('on a non-existant child object multi-level', () => {
        const targetObj = {
          first: 'john',
          age: 24
        };
        const path = 'class.instance.name';
        const value = 'Economy of Thought';
        const expected = {
          first: 'john',
          age: 24,
          class: {
            instance: {
              name: 'Economy of Thought'
            }
          }
        };
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
      it('on a multi-dimensional array', () => {
        const targetObj = [{
          first: 'john',
          age: 24,
          class: [{
            id: 'econ-101'
          }]
        }];
        const path = '[0]class[0].name';
        const value = 'Economy of Thought';
        const expected = [{
          first: 'john',
          age: 24,
          class: [{
            id: 'econ-101',
            name: 'Economy of Thought'
          }]
        }];
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
      it('an invalid path: hanging dot .', () => {
        const targetObj = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const path = 'class.';
        const value = 'blue';
        // const expected = 'applyPropertyValue(obj, path, value):Unable to set value with path:class.';
        const expected = {
          first: 'john',
          age: 24,
          class: 'blue'
        };
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
    });
    describe('cannot set', () => {
      it('on a null object', () => {
        const targetObj = null;
        const path = 'favoriteColor';
        const value = 'blue';
        const expected = null;
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
    });
    it('on a null path', () => {
      const targetObj = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101'
        }
      };
      const path = null;
      const value = 'blue';
      const expected = {
        first: 'john',
        age: 24,
        class: {
          id: 'econ-101'
        }
      };
      const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
      expect(result).toStrictEqual(expected);
    });
  });
  describe('applyPropertyValues', () => {
    describe('can apply', () => {
      it('can apply a single value to multiple objects', () => {
        const targetObj = [{ name: 'john', last: 'doe' }, { name: 'jane', last: 'doe' }];
        const path = 'age';
        const values = 25;
        const expected = [
          { name: 'john', last: 'doe', age: 25 },
          { name: 'jane', last: 'doe', age: 25 }
        ];
        const results = ObjectUtils.applyPropertyValues(targetObj, path, values);
        expect(results).toStrictEqual(expected);
      });
      it('can apply separate values to multiple objects', () => {
        const targetObj = [{ name: 'john', last: 'doe' }, { name: 'jane', last: 'doe' }];
        const path = 'age';
        const values = [24, 25];
        const expected = [
          { name: 'john', last: 'doe', age: 24 },
          { name: 'jane', last: 'doe', age: 25 }
        ];
        const results = ObjectUtils.applyPropertyValues(targetObj, path, values);
        expect(results).toStrictEqual(expected);
      });
      it('will apply the 1 property if only one target provided', () => {
        const targetObj = [{ name: 'john', last: 'doe' }];
        const path = 'age';
        const values = [24, 25];
        const expected = [
          { name: 'john', last: 'doe', age: 24 }
        ];
        const results = ObjectUtils.applyPropertyValues(targetObj, path, values);
        expect(results).toStrictEqual(expected);
      });
      it('will apply the 1 property if only one value provided', () => {
        const targetObj = [{ name: 'john', last: 'doe' }, { name: 'jane', last: 'doe' }];
        const path = 'age';
        const values = [24];
        const expected = [
          { name: 'john', last: 'doe', age: 24 },
          { name: 'jane', last: 'doe' }
        ];
        const results = ObjectUtils.applyPropertyValues(targetObj, path, values);
        expect(results).toStrictEqual(expected);
      });
      it('can apply a single null value to multiple objects', () => {
        const targetObj = [{ name: 'john', last: 'doe', age: 25 }, { name: 'jane', last: 'doe', age: 25 }];
        const path = 'age';
        const values = null;
        const expected = [
          { name: 'john', last: 'doe', age: null },
          { name: 'jane', last: 'doe', age: null }
        ];
        const results = ObjectUtils.applyPropertyValues(targetObj, path, values);
        expect(results).toStrictEqual(expected);
      });
      it('if valueList is null', () => {
        const targetObj = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const path = 'class.name';
        const value = null;
        const expected = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101',
            name: null
          }
        };
        const results = ObjectUtils.applyPropertyValues(targetObj, path, value);
        expect(results).toStrictEqual(expected);
      });
      it('if valueList is undefined', () => {
        const targetObj = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const path = 'class.name';
        const value = undefined;
        const expected = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101',
            name: undefined
          }
        };
        const results = ObjectUtils.applyPropertyValues(targetObj, path, value);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('cannot apply', () => {
      it('an invalid path: hanging dot .', () => {
        const targetObj = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const path = 'class.';
        const value = 'blue';
        // const expected = 'applyPropertyValue(obj, path, value):Unable to set value with path:class.';
        const expected = {
          first: 'john',
          age: 24,
          class: 'blue'
        };
        const result = ObjectUtils.applyPropertyValue(targetObj, path, value);
        expect(result).toStrictEqual(expected);
      });
      it('if targetObjects are null', () => {
        const targetObj = null;
        const path = 'class.name';
        const value = 'blue';
        const expected = null;
        const results = ObjectUtils.applyPropertyValues(targetObj, path, value);
        expect(results).toStrictEqual(expected);
      });
      it('if path are null', () => {
        const targetObj = null;
        const path = 'class.';
        const value = 'blue';
        const expected = null;
        const results = ObjectUtils.applyPropertyValues(targetObj, path, value);
        expect(results).toStrictEqual(expected);
      });
      it('if targetObjects is an empty array', () => {
        const targetObj = [];
        const path = 'class.name';
        const value = 'blue';
        const expected = [];
        const results = ObjectUtils.applyPropertyValues(targetObj, path, value);
        expect(results).toStrictEqual(expected);
      });
      it('if valueList is an empty array', () => {
        const targetObj = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const path = 'class.name';
        const value = [];
        const expected = {
          first: 'john',
          age: 24,
          class: {
            id: 'econ-101'
          }
        };
        const results = ObjectUtils.applyPropertyValues(targetObj, path, value);
        expect(results).toStrictEqual(expected);
      });
    });
  });
  describe('fetchObjectproperties', () => {
    it('can fetch a list of multiple properties', () => {
      const classInfo = {
        id: 'econ-101',
        className: 'Economy of Thought',
        professor: {
          name: 'Professor Oak',
          tenure: 20
        }
      };
      const targetObjects = [
        { first: 'john', age: 24, class: classInfo },
        { first: 'jane', age: 24, class: classInfo }
      ];
      const expected = [
        { first: 'john', classId: 'econ-101', professor: 'Professor Oak' },
        { first: 'jane', classId: 'econ-101', professor: 'Professor Oak' }
      ];
      const result = ObjectUtils.fetchObjectProperties(
        targetObjects,
        { first: 'first', classId: 'class.id', professor: 'class.professor.name' }
      );
      expect(targetObjects[0].class.id).toBe('econ-101');
      expect(result).toStrictEqual(expected);
    });
    it('Throws an error if a property path does not exist', () => {
      const classInfo = {
        id: 'econ-101',
        className: 'Economy of Thought',
        professor: {
          name: 'Professor Oak',
          tenure: 20
        }
      };
      const targetObjects = [
        { first: 'john', age: 24, class: classInfo },
        { first: 'jane', age: 24, class: classInfo }
      ];
      try {
        ObjectUtils.fetchObjectProperties(
          targetObjects,
          { first: 'first', classId: 'class.id', professor: 'class.professor.name', invalidProp: 'cuca.monga.cowabunga' }
        );
        expect('An exception to have been thrown').toBe(true);
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });
    it('can fetch a list of multiple properties safely', () => {
      const classInfo = {
        id: 'econ-101',
        className: 'Economy of Thought',
        professor: {
          name: 'Professor Oak',
          tenure: 20
        }
      };
      const targetObjects = [
        { first: 'john', age: 24, class: classInfo },
        { first: 'jane', age: 24, class: classInfo }
      ];
      const expected = [
        { first: 'john', classId: 'econ-101', professor: 'Professor Oak', invalidProp: null },
        { first: 'jane', classId: 'econ-101', professor: 'Professor Oak', invalidProp: null }
      ];
      const result = ObjectUtils.fetchObjectProperties(
        targetObjects,
        { first: 'first', classId: 'class.id', professor: 'class.professor.name', invalidProp: 'cuca.monga.cowabunga' },
        { safeAccess: true }
      );
      expect(result).toStrictEqual(expected);
    });
    it('can append fetching properties', () => {
      const classInfo = {
        id: 'econ-101',
        className: 'Economy of Thought',
        professor: {
          name: 'Professor Oak',
          tenure: 20
        }
      };
      const targetObjects = [
        { first: 'john', age: 24, class: classInfo },
        { first: 'jane', age: 24, class: classInfo }
      ];
      const expected = [
        { first: 'john', age: 24, classId: 'econ-101', professor: 'Professor Oak', class: classInfo },
        { first: 'jane', age: 24, classId: 'econ-101', professor: 'Professor Oak', class: classInfo }
      ];
      const result = ObjectUtils.fetchObjectProperties(
        targetObjects,
        { first: 'first', classId: 'class.id', professor: 'class.professor.name' },
        { append: true }
      );
      expect(targetObjects[0].class.id).toBe('econ-101');
      expect(result).toStrictEqual(expected);
    });
    it('does not throw an error if fetching properties on null', () => {
      const result = ObjectUtils.fetchObjectProperties(
        null,
        { first: 'first', classId: 'class.id', professor: 'class.professor.name' }
      );
        
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });
    it('can fetch properties off a single object', () => {
      const classInfo = {
        id: 'econ-101',
        className: 'Economy of Thought',
        professor: {
          name: 'Professor Oak',
          tenure: 20
        }
      };
      const targetObject = { first: 'john', age: 24, class: classInfo };
      const expected = [
        { first: 'john', age: 24, classId: 'econ-101', professor: 'Professor Oak', class: classInfo },
      ];
      const result = ObjectUtils.fetchObjectProperties(
        targetObject,
        { first: 'first', classId: 'class.id', professor: 'class.professor.name' },
        { append: true }
      );
      expect(targetObject.class.id).toBe('econ-101');
      expect(result).toStrictEqual(expected);
    });

    it('join values', () => {
      const weather = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
      ];

      const results = ObjectUtils.join(weather, 'city', cityLocations, ((w, c) => ({ ...w, ...c })));
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3, lat: 47.6062, lon: 122.3321 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, locationId: 2, lat: 40.7128, lon: 74.006 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, locationId: 1, lat: 41.8781, lon: 87.6298 }
      ];

      expect(results).toEqual(expected);
    });

    it('sets null values if join cannot be found', () => {
      const weather = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 },
        { id: 7, city: 'San Francisco',  month: 'Apr', precip: 5.20 }
      ];

      const results = ObjectUtils.join(weather, 'city', cityLocations, ((w, c) => ({ ...w, ...c })));
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3, lat: 47.6062, lon: 122.3321 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, locationId: 2, lat: 40.7128, lon: 74.006 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, locationId: 1, lat: 41.8781, lon: 87.6298 },
        { id: 7, city: 'San Francisco',  month: 'Apr', precip: 5.20 }
      ];

      expect(results).toEqual(expected);
    });
  });

  describe('join', () => {
    it('must have a joinFn', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexField = 'city';
      const targetMap = cityLocations;

      const errorMsg = 'object.join(objectArray, indexField, targetMap, joinFn): joinFn is required';

      expect(() => ObjectUtils.join(targetObj, indexField, targetMap, null)).toThrow(errorMsg);
    });
    it('must have a targetMap', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexField = 'city';
      const targetMap = null;
      const joinFn = createJoinSpy((s: unknown) => s);

      const errorMsg = 'object.join(objectArray, indexField, targetMap, joinFn): targetMap cannot be null';

      expect(() => ObjectUtils.join(targetObj, indexField, targetMap, joinFn)).toThrow(errorMsg);
    });

    it('can join on a null object', () => {
      const targetObj = null;
      const indexField = 'city';
      const targetMap = cityLocations;

      const joinFn = createJoinSpy((s: unknown, _t: unknown) => s);

      const results = ObjectUtils.join(targetObj, indexField, targetMap, joinFn);
      const expected = [];

      expect(joinFn.mock.calls.length).toBe(0);

      expect(results).toEqual(expected);
    });

    it('can join a single object', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexField = 'city';
      const targetMap = cityLocations;

      const joinFn = spy((_s: unknown, _t: unknown) => ({}));

      ObjectUtils.join(targetObj, indexField, targetMap, joinFn);

      assertSpyCalls(joinFn, 1);
      // const resultArguments = joinFn.mock.calls[0];

      //-- should be called only once, and with the source object and target matching object as arguments.
      // const expectedArguments = [targetObj, targetMap.get('Seattle')];
      // assertSpyCall(joinFn, 3, ({ args: expectedArguments }));
    });

    it('can join array', () => {
      const targetObj = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
      ];
      const indexField = 'city';
      const targetMap = cityLocations;

      const joinFn = spy((s: unknown, t: unknown) => ({ ...(s as Record<string, unknown>), locationId: (t as { locationId?: number })?.locationId }));

      const results = ObjectUtils.join(targetObj, indexField, targetMap, joinFn);
      /*
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3 },
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, locationId: 2 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, locationId: 1 }
      ];
      */

      //-- null was added
      expect(targetObj.length).toBe(3);

      //-- 4 items returned, one for each
      expect(results).toBeTruthy();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);

      assertSpyCalls(joinFn, 3);

      // @TODO
      // assertSpyCall(joinFn, 0, ({ args: expected }));
    });

    it('can join with null objects in the array', () => {
      const targetObj = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
      ];
      const indexField = 'city';
      const targetMap = cityLocations;

      // const joinFn = createJoinSpy((s: unknown, t: unknown) => ({ ...(s as Record<string, unknown>), locationId: (t as { locationId?: number })?.locationId }));
      const joinFn = (_s:object, _t:object) => ({..._s, ..._t });
      const joinMock = spy(joinFn);

      const results = ObjectUtils.join(targetObj, indexField, targetMap, joinMock);
      /*
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, locationId: 2 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, locationId: 1 }
      ];
      */

      //-- null was added
      expect(targetObj.length).toBe(4);

      //-- 4 items returned, one for each
      expect(results).toBeTruthy();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(4);

      //-- not called on null
      assertSpyCalls(joinMock, 3);

      // @TODO
      // expect(results).toEqual(expected);
    });

    it('can join an array with a map', () => {
      const targetObj = [{ id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 }];
      const indexField = 'city';
      const targetMap = cityLocations;
      const joinFn = (_entry:unknown,_target:unknown) => ({});

      const joinMock = spy(joinFn);

      ObjectUtils.join(targetObj, indexField, targetMap, joinMock);

      assertSpyCalls(joinMock, 1);

      // @TODO

      //-- should be called only once, and with the source object and target matching object as arguments.
      // const expectedArguments = [targetObj[0], targetMap.get('Seattle')];
      // assertSpyCall(joinMock, 1, ({ args: expectedArguments }));
    });

    it('an join based on a formula', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexFn = (obj) => obj.city;
      const targetMap = cityLocations;

      const seattleLocation = targetMap.get('Seattle');
      expect(seattleLocation).toBeDefined();
      expect(seattleLocation!.city).toBe('Seattle');

      const joinFn = spy(indexFn)

      ObjectUtils.join(targetObj, joinFn, targetMap, joinFn);

      assertSpyCalls(joinFn, 2);
      // expect(joinFn).toHaveBeenCalled();
      // expect(joinFn).toHaveBeenCalledTimes(1);

      assertSpyCall(joinFn, 1, ({ args: [targetObj, seattleLocation] }));
    });
    it('can lookup and store a pointer', () => {
      const targetObj = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 },
        { id: 7, city: 'San Francisco',  month: 'Apr', precip: 5.20 }
      ];
      const indexField = 'city';
      const targetMap = cityLocations;

      const joinFn = createJoinSpy((s: unknown, t: unknown) => ({ ...(s as Record<string, unknown>), location: t }));

      /* eslint-disable object-property-newline */
      const results = ObjectUtils.join(targetObj, indexField, targetMap, joinFn);
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, location:
          { city: 'Seattle', locationId: 3, lat: 47.6062, lon: 122.3321 }
        },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, location:
          { city: 'New York', locationId: 2, lat: 40.7128, lon: 74.006 }
        },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, location:
          { city: 'Chicago', locationId: 1, lat: 41.8781, lon: 87.6298 }
        },
        { id: 7, city: 'San Francisco',  month: 'Apr', precip: 5.20, location: null }
      ];
      /* eslint-enable object-property-newline */

      expect(results).toEqual(expected);
    });
  });

  describe('joinProperties', () => {
    describe('must have at least one property requested', () => {
      it('none sent', () => {
        const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
        const indexField = 'city';
        const targetMap = cityLocations;

        const errorMsg = 'object.joinProperties(objectArray, indexField, targetMap, ...fields): at least one property passed to join';

        expect(() => ObjectUtils.joinProperties(targetObj, indexField, targetMap)).toThrow(errorMsg);
      });
      it('null sent', () => {
        const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
        const indexField = 'city';
        const targetMap = cityLocations;

        const errorMsg = 'object.joinProperties(objectArray, indexField, targetMap, ...fields): at least one property passed to join';

        expect(() => ObjectUtils.joinProperties(targetObj, indexField, targetMap, null)).toThrow(errorMsg);
      });
      it('null plus valid sent', () => {
        const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
        const indexField = 'city';
        const targetMap = cityLocations;

        const errorMsg = 'object.joinProperties(objectArray, indexField, targetMap, ...fields): at least one property passed to join';

        expect(() => ObjectUtils.joinProperties(targetObj, indexField, targetMap, null, 'lat')).not.toThrow(errorMsg);
      });
    });
    it('must have a targetMap', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexField = 'city';
      const targetMap = null;
      const errorMsg = 'object.join(objectArray, indexField, targetMap, joinFn): targetMap cannot be null';

      expect(() => ObjectUtils.joinProperties(targetObj, indexField, targetMap, 'lat')).toThrow(errorMsg);
    });

    it('can join on a null object', () => {
      const targetObj = null;
      const indexField = 'city';
      const targetMap = cityLocations;

      const results = ObjectUtils.joinProperties(targetObj, indexField, targetMap, 'lat', 'lon');
      const expected = [];

      expect(results).toEqual(expected);
    });

    it('can join a single object', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexField = 'city';
      const targetMap = cityLocations;

      const results = ObjectUtils.joinProperties(targetObj, indexField, targetMap, 'locationId');
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3 }
      ];

      expect(results).toEqual(expected);
    });

    it('can join with multiple properties', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexField = 'city';
      const targetMap = cityLocations;

      const results = ObjectUtils.joinProperties(targetObj, indexField, targetMap, 'lat', 'lon');
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, lat: 47.6062, lon: 122.3321 }
      ];

      expect(results).toEqual(expected);
    });

    it('can join array', () => {
      const targetObj = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
      ];
      const indexField = 'city';
      const targetMap = cityLocations;

      const results = ObjectUtils.joinProperties(targetObj, indexField, targetMap, 'locationId');
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3 },
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, locationId: 2 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, locationId: 1 }
      ];

      expect(results).toEqual(expected);
    });

    it('can join with null objects in the array', () => {
      const targetObj = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
      ];
      const indexField = 'city';
      const targetMap = cityLocations;

      const results = ObjectUtils.joinProperties(targetObj, indexField, targetMap, 'locationId');
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, locationId: 2 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, locationId: 1 }
      ];

      expect(results).toEqual(expected);
    });

    it('can join an array with a map', () => {
      const targetObj = [{ id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 }];
      const indexField = 'city';
      const targetMap = cityLocations;

      const results = ObjectUtils.joinProperties(targetObj, indexField, targetMap, 'locationId');
      const expected = [{ id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3 }];

      expect(results).toEqual(expected);
    });

    it('an join based on a formula', () => {
      const targetObj = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
      const indexFn = (obj) => obj.city;
      const targetMap = cityLocations;

      const seattleLocation = targetMap.get('Seattle');
      expect(seattleLocation).toBeDefined();
      expect(seattleLocation!.city).toBe('Seattle');

      const results = ObjectUtils.joinProperties(targetObj, indexFn, targetMap, 'locationId');
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3 }
      ];

      expect(results).toEqual(expected);
    });

    it('sets null values if join cannot be found', () => {
      const weather = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 },
        { id: 7, city: 'San Francisco',  month: 'Apr', precip: 5.20 }
      ];

      const results = ObjectUtils.joinProperties(weather, 'city', cityLocations, 'locationId', 'lat', 'lon');
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87, locationId: 3, lat: 47.6062, lon: 122.3321 },
        null,
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94, locationId: 2, lat: 40.7128, lon: 74.006 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62, locationId: 1, lat: 41.8781, lon: 87.6298 },
        { id: 7, city: 'San Francisco',  month: 'Apr', precip: 5.20, locationId: undefined, lat: undefined, lon: undefined }
      ];

      expect(results).toEqual(expected);
    });
  });

  describe('findWithProperties', () => {
    describe('array of objects', () => {
      it('single property', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' }
        ];
        const results = ObjectUtils.findWithProperties(students, 'birthday');
        expect(results).toStrictEqual(expected);
      });
      it('multiple properties', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const results = ObjectUtils.findWithProperties(students, 'first', 'last', 'birthday');
        expect(results).toStrictEqual(expected);
      });
      it('array of properties', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const results = ObjectUtils.findWithProperties(students, ['first', 'last']);
        expect(results).toStrictEqual(expected);
      });
      it('matching one', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const results = ObjectUtils.findWithProperties(students, 'failure');
        expect(results).toStrictEqual(expected);
      });
      it('matching multiple', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' }
        ];
        const results = ObjectUtils.findWithProperties(students, 'birthday');
        expect(results).toStrictEqual(expected);
      });
      it('matching none', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
        ];
        const results = ObjectUtils.findWithProperties(students, 'cuca');
        expect(results).toStrictEqual(expected);
      });
    });
    describe('single object', () => {
      it('matching one', () => {
        const students = { first: 'john', last: 'doe', birthday: '2002-04-01' };
        const expected = [
        ];
        const results = ObjectUtils.findWithProperties(students, 'cuca');
        expect(results).toStrictEqual(expected);
      });
      it('matching none', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
        ];
        const results = ObjectUtils.findWithProperties(students, 'cuca');
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('findWithoutProperties', () => {
    describe('array of objects', () => {
      it('single property', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const results = ObjectUtils.findWithoutProperties(students, 'birthday');
        expect(results).toStrictEqual(expected);
      });
      it('multiple properties', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const results = ObjectUtils.findWithoutProperties(students, 'first', 'last', 'birthday');
        expect(results).toStrictEqual(expected);
      });
      it('array of properties', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const results = ObjectUtils.findWithoutProperties(students, ['first', 'last', 'cuca']);
        expect(results).toStrictEqual(expected);
      });
      it('matching one', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const results = ObjectUtils.findWithoutProperties(students, 'birthday');
        expect(results).toStrictEqual(expected);
      });
      it('matching multiple', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' }
        ];
        const results = ObjectUtils.findWithoutProperties(students, 'failure');
        expect(results).toStrictEqual(expected);
      });
      it('matching none', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
        ];
        const results = ObjectUtils.findWithoutProperties(students, 'first');
        expect(results).toStrictEqual(expected);
      });
    });
    describe('single object', () => {
      it('matching one', () => {
        const students = { first: 'john', last: 'doe', birthday: '2002-04-01' };
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' }
        ];
        const results = ObjectUtils.findWithoutProperties(students, 'failure');
        expect(results).toStrictEqual(expected);
      });
      it('matching none', () => {
        const students = { first: 'john', last: 'doe', birthday: '2002-04-01' };
        const expected = [
        ];
        const results = ObjectUtils.findWithoutProperties(students, 'first');
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('setPropertyDefaults', () => {
    describe('sets defaults on an array of objects', () => {
      it('with one property missing', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', birthday: 'N/A', failure: 401 }
        ];

        ObjectUtils.setPropertyDefaults(students, {
          first: 'N/A',
          last: 'N/A',
          birthday: 'N/A'
        });

        expect(students).toStrictEqual(expected);
      });
      it('with whole new property', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', color: 'N/A', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', color: 'N/A', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', color: 'N/A', birthday: 'N/A', failure: 401 }
        ];

        ObjectUtils.setPropertyDefaults(students, {
          first: 'N/A',
          last: 'N/A',
          birthday: 'N/A',
          color: 'N/A'
        });

        expect(students).toStrictEqual(expected);
      });
      it('with no changes if property exists', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];
        const expected = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];

        ObjectUtils.setPropertyDefaults(students, {
          first: 'N/A',
          last: 'N/A'
        });

        expect(students).toStrictEqual(expected);
      });
    });
    describe('sets defaults on a single object', () => {
      it('with whole new property', () => {
        const students = { first: 'jack', last: 'white', failure: 401 };
        const expected = { first: 'jack', last: 'white', color: 'N/A', birthday: 'N/A', failure: 401 };

        ObjectUtils.setPropertyDefaults(students, {
          first: 'N/A',
          last: 'N/A',
          birthday: 'N/A',
          color: 'N/A'
        });

        expect(students).toStrictEqual(expected);
      });
    });
    describe('fails', () => {
      it('if the default object is null or false', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];

        const expectedError = 'object.setPropertyDefaults(targetObject, defaultObject): '
          + 'defaultObject is expected to be an object with properties set to the defaults to apply';

        expect(() => {
          ObjectUtils.setPropertyDefaults(students, null);
        }).toThrow(expectedError);
      });
      it('if the default object is not an object', () => {
        const students = [
          { first: 'john', last: 'doe', birthday: '2002-04-01' },
          { first: 'jane', last: 'doe', birthday: '2003-05-01' },
          { first: 'jack', last: 'white', failure: 401 }
        ];

        const expectedError = 'object.setPropertyDefaults(targetObject, defaultObject): '
          + 'defaultObject is expected to be an object with properties set to the defaults to apply';

        expect(() => {
          ObjectUtils.setPropertyDefaults(students, 2);
        }).toThrow(expectedError);
      });
    });
  });

  describe('propertyFromList', () => {
    it('accesses a property from a list', () => {
      const data = [{ record: 'jobA', val: 1 }, { record: 'jobA', val: 2 },
        { record: 'jobA', val: 3 }, { record: 'jobA', val: 4 },
        { record: 'jobA', val: 5 }, { record: 'jobA', val: 6 },
        { record: 'jobA', val: 7 }, { record: 'jobA', val: 8 },
        { record: 'jobA', val: 9 }, { record: 'jobA', val: 10 }
      ];
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = ObjectUtils.propertyFromList(data, 'val');
      expect(results).toStrictEqual(expected);
    });
    it('accesses a function from a list', () => {
      const data = [{ record: 'jobA', val: 1 }, { record: 'jobA', val: 2 },
        { record: 'jobA', val: 3 }, { record: 'jobA', val: 4 },
        { record: 'jobA', val: 5 }, { record: 'jobA', val: 6 },
        { record: 'jobA', val: 7 }, { record: 'jobA', val: 8 },
        { record: 'jobA', val: 9 }, { record: 'jobA', val: 10 }
      ];
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = ObjectUtils.propertyFromList(data, (r) => r.val);
      expect(results).toStrictEqual(expected);
    });
    it('accesses values from a list', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = ObjectUtils.propertyFromList(data);
      expect(results).toStrictEqual(expected);
    });
    it('does not fail if not sent a list', () => {
      const data = 1;
      const expected = [];
      const results = ObjectUtils.propertyFromList(data);
      expect(results).toStrictEqual(expected);
    });
    it('does not fail if sent a null list', () => {
      const data = null;
      const expected = [];
      const results = ObjectUtils.propertyFromList(data);
      expect(results).toStrictEqual(expected);
    });
    it('does not fail if sent an empty list', () => {
      const data = [];
      const expected = [];
      const results = ObjectUtils.propertyFromList(data);
      expect(results).toStrictEqual(expected);
    });
  });

  describe('mapProperties', () => {
    describe('can map', () => {
      it('one property', () => {
        const list = [
          { id: '100', age: '21', name: 'p1' },
          { id: '200', age: '22', name: 'p2' },
          { id: '300', age: '23', name: 'p3' },
          { id: '400', age: '24', name: 'p4' },
          { id: '500', age: '25', name: 'p5' }
        ];
        const expected = [
          { id: 100, age: '21', name: 'p1' },
          { id: 200, age: '22', name: 'p2' },
          { id: 300, age: '23', name: 'p3' },
          { id: 400, age: '24', name: 'p4' },
          { id: 500, age: '25', name: 'p5' }
        ];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum, 'id');
        expect(results).toStrictEqual(expected);
      });
      it('two properties', () => {
        const list = [
          { id: '100', age: '21', name: 'p1' },
          { id: '200', age: '22', name: 'p2' },
          { id: '300', age: '23', name: 'p3' },
          { id: '400', age: '24', name: 'p4' },
          { id: '500', age: '25', name: 'p5' }
        ];
        const expected = [
          { id: 100, age: 21, name: 'p1' },
          { id: 200, age: 22, name: 'p2' },
          { id: 300, age: 23, name: 'p3' },
          { id: 400, age: 24, name: 'p4' },
          { id: 500, age: 25, name: 'p5' }
        ];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum, 'id', 'age');
        expect(results).toStrictEqual(expected);
      });
      it('no properties', () => {
        const list = [
          { id: '100', age: '21', name: 'p1' },
          { id: '200', age: '22', name: 'p2' },
          { id: '300', age: '23', name: 'p3' },
          { id: '400', age: '24', name: 'p4' },
          { id: '500', age: '25', name: 'p5' }
        ];
        const expected = [
          { id: 100, age: 21, name: Number.NaN },
          { id: 200, age: 22, name: Number.NaN },
          { id: 300, age: 23, name: Number.NaN },
          { id: 400, age: 24, name: Number.NaN },
          { id: 500, age: 25, name: Number.NaN }
        ];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('with one object', () => {
      it('one property', () => {
        const list = { id: '100', age: '21', name: 'p1' };
        const expected = [{ id: 100, age: '21', name: 'p1' }];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum, 'id');
        expect(results).toStrictEqual(expected);
      });
      it('two properties', () => {
        const list = { id: '100', age: '21', name: 'p1' };
        const expected = [{ id: 100, age: 21, name: 'p1' }];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum, 'id', 'age');
        expect(results).toStrictEqual(expected);
      });
    });
    describe('with properties in an array', () => {
      it('one property', () => {
        const list = [
          { id: '100', age: '21', name: 'p1' },
          { id: '200', age: '22', name: 'p2' },
          { id: '300', age: '23', name: 'p3' },
          { id: '400', age: '24', name: 'p4' },
          { id: '500', age: '25', name: 'p5' }
        ];
        const expected = [
          { id: 100, age: '21', name: 'p1' },
          { id: 200, age: '22', name: 'p2' },
          { id: 300, age: '23', name: 'p3' },
          { id: 400, age: '24', name: 'p4' },
          { id: 500, age: '25', name: 'p5' }
        ];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum, ['id']);
        expect(results).toStrictEqual(expected);
      });
      it('two properties', () => {
        const list = [
          { id: '100', age: '21', name: 'p1' },
          { id: '200', age: '22', name: 'p2' },
          { id: '300', age: '23', name: 'p3' },
          { id: '400', age: '24', name: 'p4' },
          { id: '500', age: '25', name: 'p5' }
        ];
        const expected = [
          { id: 100, age: 21, name: 'p1' },
          { id: 200, age: 22, name: 'p2' },
          { id: 300, age: 23, name: 'p3' },
          { id: 400, age: 24, name: 'p4' },
          { id: 500, age: 25, name: 'p5' }
        ];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum, ['id', 'age']);
        expect(results).toStrictEqual(expected);
      });
      it('no properties', () => {
        const list = [
          { id: '100', age: '21', name: 'p1' },
          { id: '200', age: '22', name: 'p2' },
          { id: '300', age: '23', name: 'p3' },
          { id: '400', age: '24', name: 'p4' },
          { id: '500', age: '25', name: 'p5' }
        ];
        const expected = [
          { id: '100', age: '21', name: 'p1' },
          { id: '200', age: '22', name: 'p2' },
          { id: '300', age: '23', name: 'p3' },
          { id: '400', age: '24', name: 'p4' },
          { id: '500', age: '25', name: 'p5' }
        ];
        const parseNum = (str) => parseInt(str, 10);
        const results = ObjectUtils.mapProperties(list, parseNum, []);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('throws an error', () => {
      it('if the formatting function is missing', () => {
        const list = { id: '100', age: '21', name: 'p1' };
        const expectedError = 'object.mapProperties(collection, formattingFn, ...propertiesToFormat): formattingFn must be provided';
        expect(() => {
          ObjectUtils.mapProperties(list);
        }).toThrow(expectedError);
      });
      it('if the formatting is not a function', () => {
        const list = { id: '100', age: '21', name: 'p1' };
        const expectedError = 'object.mapProperties(collection, formattingFn, ...propertiesToFormat): formattingFn must be provided';
        expect(() => {
          ObjectUtils.mapProperties(list, 'a', 'id');
        }).toThrow(expectedError);
      });
    });
  });

  describe('formatProperties', () => {
    describe('can translate with a function', () => {
      it('with no properties assigned', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({}));
        expect(result).toStrictEqual(expected);
      });
      it('with one property to clean', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'B', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'B', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'B', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ station: () => 'B' }));
        expect(result).toStrictEqual(expected);
      });
      it('with two properties to clean', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'false', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'B', isFahreinheit: true, offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'B', isFahreinheit: true, offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'B', isFahreinheit: false, offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ station: () => 'B', isFahreinheit: (val) => val === 'true' }));
        expect(result).toStrictEqual(expected);
      });
      it('with many properties to clean', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'false', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: true, offset: 0, temp: 36.669599999999996, type: 'C', descr: '0123' },
          { station: 'A', isFahreinheit: true, offset: 2, temp: 37.2252, type: 'C', descr: '0123456' },
          { station: 'A', isFahreinheit: false, offset: 3, temp: 37.7808, type: 'C', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({
          type: 'C',
          offset: 'number',
          isFahreinheit: 'boolean',
          temp: (val) => (val - 32) * 0.5556
        }));
        expect(result).toStrictEqual(expected);
      });
    });
    describe('throws an error', () => {
      it('or not as a safe example', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'false', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const formatter = {};
        expect(() => ObjectUtils.formatProperties(data, formatter)).not.toThrow();
      });
      it('if the format is null', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'false', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const formatter = null;
        // eslint-disable-next-line
        const expectedError = 'ObjectUtils.formatProperties(collection, propertyTranslations): propertyTranslations must be an object, with the properties matching those to be formatted, and values as functions returning the new value';
        expect(() => ObjectUtils.formatProperties(data, formatter)).toThrow(expectedError);
      });
    });
    describe('can translate with a literal', () => {
      it('with one string literal', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'B', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'B', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'B', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ station: 'B' }));
        expect(result).toStrictEqual(expected);
      });
      it('with one number literal', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 20, isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 20, isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 20, isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ station: 20 }));
        expect(result).toStrictEqual(expected);
      });
    });
    describe('with a function shorthand', () => {
      it('string', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: '98', type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: '99', type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: '100', type: 'F', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ temp: 'string' }));
        expect(result).toStrictEqual(expected);
      });
      it('ellipsis', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: '98', type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: '99', type: 'F', descr: '0123456' },
          {
            station: 'A',
            isFahreinheit: 'true',
            offset: '3',
            temp: '100',
            type: 'F',
            descr: '0123456789012345678901234567890123456789012345678901234567890123456789'
          }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: '98', type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: '99', type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: '100', type: 'F', descr: '01234567890123456789012345678901234567890123456789…' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ descr: 'ellipsis' }));
        expect(result).toStrictEqual(expected);
      });
      it('ellipsis(5)', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: '98', type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: '99', type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: '100', type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: '98', type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: '99', type: 'F', descr: '01234…' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: '100', type: 'F', descr: '01234…' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ descr: 'ellipsis(5)' }));
        expect(result).toStrictEqual(expected);
      });
      it('number', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: 123 },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: 123456 },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: 123456789 }
        ];
        const result = ObjectUtils.formatProperties(data, ({ descr: 'number' }));
        expect(result).toStrictEqual(expected);
      });
      it('float', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: 123 },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: 123456 },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: 123456789 }
        ];
        const result = ObjectUtils.formatProperties(data, ({ descr: 'float' }));
        expect(result).toStrictEqual(expected);
      });
      it('int', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: 123 },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: 123456 },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: 123456789 }
        ];
        const result = ObjectUtils.formatProperties(data, ({ descr: 'int' }));
        expect(result).toStrictEqual(expected);
      });
      it('integer', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: 123 },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: 123456 },
          { station: 'A', isFahreinheit: 'true', offset: '3', temp: 100, type: 'F', descr: 123456789 }
        ];
        const result = ObjectUtils.formatProperties(data, ({ descr: 'integer' }));
        expect(result).toStrictEqual(expected);
      });
      it('boolean', () => {
        const data = [
          { station: 'A', isFahreinheit: 'true', offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: 'false', offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const expected = [
          { station: 'A', isFahreinheit: true, offset: '0', temp: 98, type: 'F', descr: '0123' },
          { station: 'A', isFahreinheit: true, offset: '2', temp: 99, type: 'F', descr: '0123456' },
          { station: 'A', isFahreinheit: false, offset: '3', temp: 100, type: 'F', descr: '0123456789' }
        ];
        const result = ObjectUtils.formatProperties(data, ({ isFahreinheit: 'boolean' }));
        expect(result).toStrictEqual(expected);
      });
    });
    describe('does not fail', () => {
      it('if null is passed for a collection', () => {
        const data = null;
        const expected = [];
        const result = ObjectUtils.formatProperties(data, ({ station: 20 }));
        expect(result).toStrictEqual(expected);
      });
    });
    describe('can format a single object', () => {
      const data = { station: 'A', isFahreinheit: 'true', offset: '2', temp: 99, type: 'F', descr: '0123456' };
      const expected = [{ station: 'A', isFahreinheit: true, offset: 2, temp: 37.2252, type: 'C', descr: '0123456' }];
      const result = ObjectUtils.formatProperties(data, ({
        type: 'C',
        offset: 'number',
        isFahreinheit: 'boolean',
        temp: (val) => (val - 32) * 0.5556
      }));
      expect(result).toStrictEqual(expected);
    });
  });

  describe('propertyValueSample', () => {
    describe('can describe', () => {
      it('with one object', () => {
        const collection = {
          first: 'first',
          age: 23
        };
        const expected = new Map<string, string | number>([
          ['first', 'first'],
          ['age', 23]
        ]);
        const results = ObjectUtils.propertyValueSample(collection);
        expect(results).toStrictEqual(expected);
      });
      it('with multiple objects', () => {
        const collection = [{
          first: 'firstVal',
          age: 23
        }, {
          last: 'lastVal'
        }];
        const expected = new Map<string, string | number>([
          ['first', 'firstVal'],
          ['age', 23],
          ['last', 'lastVal']
        ]);
        const results = ObjectUtils.propertyValueSample(collection);
        expect(results).toStrictEqual(expected);
      });
      it('with multiple objects duplicating values', () => {
        const collection = [{
          first: 'firstVal',
          age: 23
        }, {
          first: 'ignore',
          last: 'lastVal',
          age: 99
        }];
        const expected = new Map<string, string | number>([
          ['first', 'firstVal'],
          ['age', 23],
          ['last', 'lastVal']
        ]);
        const results = ObjectUtils.propertyValueSample(collection);
        expect(results).toStrictEqual(expected);
      });
      it('with null values', () => {
        const collection = [{
          first: 'firstVal',
          age: 23
        }, null, {
          first: 'ignore',
          last: 'lastVal',
          age: 99
        }];
        const expected = new Map<string, string | number>([
          ['first', 'firstVal'],
          ['age', 23],
          ['last', 'lastVal']
        ]);
        const results = ObjectUtils.propertyValueSample(collection);
        expect(results).toStrictEqual(expected);
      });
      it('with number values', () => {
        const collection = [{
          first: 'firstVal',
          age: 23
        }, 23, {
          first: 'ignore',
          last: 'lastVal',
          age: 99
        }];
        const expected = new Map<string, string | number>([
          ['first', 'firstVal'],
          ['age', 23],
          ['last', 'lastVal']
        ]);
        const results = ObjectUtils.propertyValueSample(collection);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('fails', () => {
      it('if object collection is not passed', () => {
        const collection = null;
        
        expect(
          () => ObjectUtils.propertyValueSample(collection)
        ).toThrow('propertyValueSample(objectCollection): objectCollection is required');
      });
    });
  });
  describe('cacheIterate', () => {
    /*
    const complexMarkdown = (`
      Heading

      # Overview
      This entire list is a hierarchy of data.

      # Section A
      This describes section A

      ## SubSection 1
      With a subsection belonging to Section A

      ## SubSection 2
      And another subsection sibling to SubSection 1, but also under Section A.

      # Section B
      With an entirely unrelated section B, that is sibling to Section A

      ## SubSection 1
      And another subsection 1, but this time related to Section B.`)
      .split('\n')
      .filter((line) => line ? true : false)
      .map((line) => line.trim());
    const isHeader1 = (str) => str.startsWith('# ');
    const isHeader2 = (str) => str.startsWith('## ');

    const complexSource = complexMarkdown.map((r) => ({
      text: r,
      section: isHeader1(r) ? r.replace(/^\s?#+\s+/, '') : undefined,
      subSection: isHeader2(r) ? r.replace(/^\s?#+\s+/, '') : undefined
    })).map((r) => ({ ...r, isHeader: r.section || r.subSection ? true : false }));
    */

    const isHeader1 = (str) => str.startsWith('# ');
    const isHeader2 = (str) => str.startsWith('## ');

    const complexSource = [
      {
        text: 'Heading',
        section: undefined,
        subSection: undefined,
        isHeader: false
      },
      {
        text: '# Overview',
        section: 'Overview',
        subSection: undefined,
        isHeader: true
      },
      {
        text: 'This entire list is a hierarchy of data.',
        section: undefined,
        subSection: undefined,
        isHeader: false
      },
      {
        text: '# Section A',
        section: 'Section A',
        subSection: undefined,
        isHeader: true
      },
      {
        text: 'This describes section A',
        section: undefined,
        subSection: undefined,
        isHeader: false
      },
      {
        text: '## SubSection 1',
        section: undefined,
        subSection: 'SubSection 1',
        isHeader: true
      },
      {
        text: 'With a subsection belonging to Section A',
        section: undefined,
        subSection: undefined,
        isHeader: false
      },
      {
        text: '## SubSection 2',
        section: undefined,
        subSection: 'SubSection 2',
        isHeader: true
      },
      {
        text: 'And another subsection sibling to SubSection 1, but also under Section A.',
        section: undefined,
        subSection: undefined,
        isHeader: false
      },
      {
        text: '# Section B',
        section: 'Section B',
        subSection: undefined,
        isHeader: true
      },
      {
        text: 'With an entirely unrelated section B, that is sibling to Section A',
        section: undefined,
        subSection: undefined,
        isHeader: false
      },
      {
        text: '## SubSection 1',
        section: undefined,
        subSection: 'SubSection 1',
        isHeader: true
      },
      {
        text: 'And another subsection 1, but this time related to Section B.',
        section: undefined,
        subSection: undefined,
        isHeader: false
      }
    ];

    describe('can iterate', () => {
      it('over a simple usecase', () => {
        const source = complexSource; // .slice(0, 8);

        //-- return undefined if the value should not persist
        const result = ObjectUtils.augmentInherit(source, (entry) => ({
          section: isHeader1(entry.text) ? entry.text.replace(/#+\s+/, '') : undefined,
          subSection: isHeader2(entry.text) ? entry.text.replace(/#+\s+/, '') : undefined
        }));

        const expected = [
          {
            text: 'Heading',
            section: undefined,
            subSection: undefined,
            isHeader: false
          },
          {
            text: '# Overview',
            section: 'Overview',
            subSection: undefined,
            isHeader: true
          },
          {
            text: 'This entire list is a hierarchy of data.',
            section: 'Overview',
            subSection: undefined,
            isHeader: false
          },
          {
            text: '# Section A',
            section: 'Section A',
            subSection: undefined,
            isHeader: true
          },
          {
            text: 'This describes section A',
            section: 'Section A',
            subSection: undefined,
            isHeader: false
          },
          {
            text: '## SubSection 1',
            section: 'Section A',
            subSection: 'SubSection 1',
            isHeader: true
          },
          {
            text: 'With a subsection belonging to Section A',
            section: 'Section A',
            subSection: 'SubSection 1',
            isHeader: false
          },
          {
            text: '## SubSection 2',
            section: 'Section A',
            subSection: 'SubSection 2',
            isHeader: true
          },
          {
            text: 'And another subsection sibling to SubSection 1, but also under Section A.',
            section: 'Section A',
            subSection: 'SubSection 2',
            isHeader: false
          },
          {
            text: '# Section B',
            section: 'Section B',
            subSection: undefined,
            isHeader: true
          },
          {
            text: 'With an entirely unrelated section B, that is sibling to Section A',
            section: 'Section B',
            subSection: undefined,
            isHeader: false
          },
          {
            text: '## SubSection 1',
            section: 'Section B',
            subSection: 'SubSection 1',
            isHeader: true
          },
          {
            text: 'And another subsection 1, but this time related to Section B.',
            section: 'Section B',
            subSection: 'SubSection 1',
            isHeader: false
          }
        ];

        // console.log(source);
        expect(result).toStrictEqual(expected);
      });
      it('even if a null is returned', () => {
        const source = complexSource; // .slice(0, 8);

        //-- return undefined if the value should not persist
        const result = ObjectUtils.augmentInherit(source, (entry: { text?: string }) => {
          let entryResult: { section: string | undefined; subSection: string | undefined } | null = ({
            section: isHeader1(entry.text) ? (entry.text ?? '').replace(/#+\s+/, '') : undefined,
            subSection: isHeader2(entry.text) ? (entry.text ?? '').replace(/#+\s+/, '') : undefined
          });

          // console.log('entry:text:' + entry.text);
          if ((entry.text || '').includes('Section A')) {
            entryResult = null;
          }

          return entryResult;
        });

        const expected = [
          {
            text: 'Heading',
            section: undefined,
            subSection: undefined,
            isHeader: false
          },
          {
            text: '# Overview',
            section: 'Overview',
            subSection: undefined,
            isHeader: true
          },
          {
            text: 'This entire list is a hierarchy of data.',
            section: 'Overview',
            subSection: undefined,
            isHeader: false
          },
          {
            text: '# Section A',
            section: 'Overview',
            subSection: undefined,
            isHeader: true
          },
          {
            text: 'This describes section A',
            section: 'Overview',
            subSection: undefined,
            isHeader: false
          },
          {
            text: '## SubSection 1',
            section: 'Overview',
            subSection: 'SubSection 1',
            isHeader: true
          },
          {
            text: 'With a subsection belonging to Section A',
            section: 'Overview',
            subSection: 'SubSection 1',
            isHeader: false
          },
          {
            text: '## SubSection 2',
            section: 'Overview',
            subSection: 'SubSection 2',
            isHeader: true
          },
          {
            text: 'And another subsection sibling to SubSection 1, but also under Section A.',
            section: 'Overview',
            subSection: 'SubSection 2',
            isHeader: false
          },
          {
            text: '# Section B',
            section: 'Section B',
            subSection: undefined,
            isHeader: true
          },
          {
            text: 'With an entirely unrelated section B, that is sibling to Section A',
            section: 'Section B',
            subSection: undefined,
            isHeader: false
          },
          {
            text: '## SubSection 1',
            section: 'Section B',
            subSection: 'SubSection 1',
            isHeader: true
          },
          {
            text: 'And another subsection 1, but this time related to Section B.',
            section: 'Section B',
            subSection: 'SubSection 1',
            isHeader: false
          }
        ];

        // console.log(source);
        expect(result).toStrictEqual(expected);
      });
      it('Example within Docs', () => {
        const source = [
          { text: '# Overview' },
          { text: 'This entire list is a hierarchy of data.' },
          { text: '# Section A' },
          { text: 'This describes section A' },
          { text: '## SubSection 1' },
          { text: 'With a subsection belonging to Section A' },
          { text: '# Section B' },
          { text: 'With an entirely unrelated section B, that is sibling to Section A' },
          { text: '## SubSection 1' },
          { text: 'And another subsection 1, but this time related to Section B.' }
        ];
        const inheritFn = (entry) => ({
          section: isHeader1(entry.text) ? entry.text.replace(/#+\s+/, '') : undefined,
          subSection: isHeader2(entry.text) ? entry.text.replace(/#+\s+/, '') : undefined
        });
        const expected = [
          { text: '# Overview', section: 'Overview', subSection: undefined },
          {
            text: 'This entire list is a hierarchy of data.',
            section: 'Overview',
            subSection: undefined
          },
          { text: '# Section A', section: 'Section A', subSection: undefined },
          {
            text: 'This describes section A',
            section: 'Section A',
            subSection: undefined
          },
          {
            text: '## SubSection 1',
            section: 'Section A',
            subSection: 'SubSection 1'
          },
          {
            text: 'With a subsection belonging to Section A',
            section: 'Section A',
            subSection: 'SubSection 1'
          },
          { text: '# Section B', section: 'Section B', subSection: undefined },
          {
            text: 'With an entirely unrelated section B, that is sibling to Section A',
            section: 'Section B',
            subSection: undefined
          },
          {
            text: '## SubSection 1',
            section: 'Section B',
            subSection: 'SubSection 1'
          },
          {
            text: 'And another subsection 1, but this time related to Section B.',
            section: 'Section B',
            subSection: 'SubSection 1'
          }
        ];
        const results = ObjectUtils.augmentInherit(source, inheritFn);
        expect(results).toStrictEqual(expected);
      });
    });

    describe('cannot iterate', () => {
      it('if the source is not an array', () => {
        const inheritFn = (entry) => ({
          section: isHeader1(entry.text) ? entry.text.replace(/#+\s+/, '') : undefined,
          subSection: isHeader2(entry.text) ? entry.text.replace(/#+\s+/, '') : undefined
        });

        const expected = 'augmentInherit(source, augmentFn): source must be an array';

        expect(() => ObjectUtils.augmentInherit('string', inheritFn)).toThrow(expected);
      });
      it('if the augmentFn is not a function', () => {
        const source = complexSource; // .slice(0, 8);

        const expected = 'augmentInherit(source, augmentFn): augmentFn must be a function of signature: (entry, lastValue) => obj';

        expect(() => ObjectUtils.augmentInherit(source, 'string')).toThrow(expected);
      });
    });
  });
  describe('propertyInherit', () => {
    describe('can inherit', () => {
      it('simple example', () => {
        const source = [
          {
            text: 'A',
            section: 'Overview',
            subSection: undefined
          },
          {
            text: 'B',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'C',
            section: 'Section A',
            subSection: undefined
          },
          {
            text: 'D',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'E',
            section: undefined,
            subSection: 'SubSection 1'
          },
          {
            text: 'F',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'G',
            section: 'Section B',
            subSection: undefined },
          {
            text: 'H',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'I',
            section: undefined,
            subSection: 'SubSection 1'
          },
          {
            text: 'J',
            section: undefined,
            subSection: undefined
          }
        ];
        const expected = [
          {
            text: 'A',
            section: 'Overview',
            subSection: undefined
          },
          {
            text: 'B',
            section: 'Overview',
            subSection: undefined
          },
          {
            text: 'C',
            section: 'Section A',
            subSection: undefined
          },
          {
            text: 'D',
            section: 'Section A',
            subSection: undefined
          },
          {
            text: 'E',
            section: 'Section A',
            subSection: 'SubSection 1'
          },
          {
            text: 'F',
            section: 'Section A',
            subSection: 'SubSection 1'
          },
          {
            text: 'G',
            section: 'Section B',
            subSection: undefined },
          {
            text: 'H',
            section: 'Section B',
            subSection: undefined
          },
          {
            text: 'I',
            section: 'Section B',
            subSection: 'SubSection 1'
          },
          {
            text: 'J',
            section: 'Section B',
            subSection: 'SubSection 1'
          }
        ];
        const results = ObjectUtils.propertyInherit(source, 'section', 'subSection');
        expect(results).toStrictEqual(expected);
      });

      it('short circuits if no properties provided', () => {
        const source = [
          {
            text: 'A',
            section: 'Overview',
            subSection: undefined
          },
          {
            text: 'B',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'C',
            section: 'Section A',
            subSection: undefined
          },
          {
            text: 'D',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'E',
            section: undefined,
            subSection: 'SubSection 1'
          },
          {
            text: 'F',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'G',
            section: 'Section B',
            subSection: undefined },
          {
            text: 'H',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'I',
            section: undefined,
            subSection: 'SubSection 1'
          },
          {
            text: 'J',
            section: undefined,
            subSection: undefined
          }
        ];
        const expected = [
          {
            text: 'A',
            section: 'Overview',
            subSection: undefined
          },
          {
            text: 'B',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'C',
            section: 'Section A',
            subSection: undefined
          },
          {
            text: 'D',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'E',
            section: undefined,
            subSection: 'SubSection 1'
          },
          {
            text: 'F',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'G',
            section: 'Section B',
            subSection: undefined },
          {
            text: 'H',
            section: undefined,
            subSection: undefined
          },
          {
            text: 'I',
            section: undefined,
            subSection: 'SubSection 1'
          },
          {
            text: 'J',
            section: undefined,
            subSection: undefined
          }
        ];
        const results = ObjectUtils.propertyInherit(source);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('cannot work', () => {
      it('if the source list is null', () => {
        const source = null;
        const expected = 'propertyInherit(source, ...properties): source must be an array';
        expect(() => {
          ObjectUtils.propertyInherit(source, 'property1');
        }).toThrow(expected);
      });
    });
  });

  describe('union', () => {
    describe('can union', () => {
      describe('with no overlap', () => {
        it('simple arrays', () => {
          const source1 = [{ first: 'john' }, { first: 'jane' }];
          const source2 = [{ last: 'doe' }, { last: 'doh' }];
          const expected = [
            { first: 'john', last: 'doe' },
            { first: 'jane', last: 'doh' }
          ];
          const results = ObjectUtils.union(source1, source2);
          expect(results).toStrictEqual(expected);
        });
        it('with source 1 as object', () => {
          const source1 = { first: 'john' };
          const source2 = [{ last: 'doe' }, { last: 'doh' }];
          const expected = [
            { first: 'john', last: 'doe' },
            { first: 'john', last: 'doh' }
          ];
          const results = ObjectUtils.union(source1, source2);
          expect(results).toStrictEqual(expected);
        });
        it('with source 2 as object', () => {
          const source1 = [{ first: 'john' }, { first: 'jane' }];
          const source2 = { last: 'doe' };
          const expected = [
            { first: 'john', last: 'doe' },
            { first: 'jane', last: 'doe' }
          ];
          const results = ObjectUtils.union(source1, source2);
          expect(results).toStrictEqual(expected);
        });
        it('with both as objects', () => {
          const source1 = { first: 'john' };
          const source2 = { last: 'doe' };
          const expected = [
            { first: 'john', last: 'doe' }
          ];
          const results = ObjectUtils.union(source1, source2);
          expect(results).toStrictEqual(expected);
        });
      });

      describe('if values overlap', () => {
        describe('with arrays', () => {
          it('source 1', () => {
            const source1 = [{ first: 'john', last: 'unknown' }, { first: 'jane' }];
            const source2 = [{ last: 'doe' }, { last: 'doh' }];
            const expected = [
              { first: 'john', last: 'doe' },
              { first: 'jane', last: 'doh' }
            ];
            const results = ObjectUtils.union(source1, source2);
            expect(results).toStrictEqual(expected);
          });
          it('source 2', () => {
            const source1 = [{ first: 'john', age: 2 }, { first: 'jane' }];
            const source2 = [{ first: 'johnny', last: 'doe' }, { last: 'doh' }];
            const expected = [
              { first: 'johnny', last: 'doe', age: 2 },
              { first: 'jane', last: 'doh' }
            ];
            const results = ObjectUtils.union(source1, source2);
            expect(results).toStrictEqual(expected);
          });
        });
        describe('with objects', () => {
          it('source 1', () => {
            const source1 = [{ first: 'john', last: 'unknown' }, { first: 'jane' }];
            const source2 = { last: 'doe' };
            const expected = [
              { first: 'john', last: 'doe' },
              { first: 'jane', last: 'doe' }
            ];
            const results = ObjectUtils.union(source1, source2);
            expect(results).toStrictEqual(expected);
          });
          it('source 2', () => {
            const source1 = { first: 'john' };
            const source2 = [{ last: 'doe' }, { last: 'doh' }];
            const expected = [
              { first: 'john', last: 'doe' },
              { first: 'john', last: 'doh' }
            ];
            const results = ObjectUtils.union(source1, source2);
            expect(results).toStrictEqual(expected);
          });
          it('both', () => {
            const source1 = { first: 'john' };
            const source2 = { last: 'doe' };
            const expected = [
              { first: 'john', last: 'doe' }
            ];
            const results = ObjectUtils.union(source1, source2);
            expect(results).toStrictEqual(expected);
          });
        });
      });
      describe('if lengths are different', () => {
        it('source 1', () => {
          const source1 = [{ first: 'john' }];
          const source2 = [{ last: 'doe' }, { last: 'doh' }];
          const expected = [
            { first: 'john', last: 'doe' },
            { last: 'doh' }
          ];
          const results = ObjectUtils.union(source1, source2);
          expect(results).toStrictEqual(expected);
        });
        it('source 2', () => {
          const source1 = [{ first: 'john' }, { first: 'jane' }];
          const source2 = [{ last: 'doh' }];
          const expected = [
            { first: 'john', last: 'doh' },
            { first: 'jane' }
          ];
          const results = ObjectUtils.union(source1, source2);
          expect(results).toStrictEqual(expected);
        });
      });
    });
    describe('cannot union', () => {
      it('if source1 is not an object ', () => {
        const source1 = 'string';
        const source2 = [{ last: 'doe' }];
        const expected = 'union(source1:object[], source2:object[]): source1 must be a collection of objects, or a single object';
        expect(() => ObjectUtils.union(source1, source2)).toThrow(expected);
      });
      it('if source2 is not an object ', () => {
        const source1 = [{ first: 'john' }];
        const source2 = 'string';
        const expected = 'union(source1:object[], source2:object[]): source2 must be a collection of objects, or a single object';
        expect(() => ObjectUtils.union(source1, source2)).toThrow(expected);
      });
    });
  });
  describe('extractObjectProperty', () => {
    describe('can extract', () => {
      describe('from a list', () => {
        it('a property name', () => {
          const weather = [
            { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
            null,
            { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
            { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
          ];
          const expected = ['Seattle', 'New York', 'Chicago'];
          const results = ObjectUtils.extractObjectProperty(weather, 'city');
          expect(results).toStrictEqual(expected);
        });
        it('a function', () => {
          const weather = [
            { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
            null,
            { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
            { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
          ];
          const expected = ['Seattle', 'New York', 'Chicago'];
          const results = ObjectUtils.extractObjectProperty(weather, (r) => r.city);
          expect(results).toStrictEqual(expected);
        });
      });
      describe('from an Object', () => {
        it('a property name', () => {
          const weather = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
          const expected = ['Seattle'];
          const results = ObjectUtils.extractObjectProperty(weather, 'city');
          expect(results).toStrictEqual(expected);
        });
        it('a function', () => {
          const weather = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
          const expected = ['Seattle'];
          const results = ObjectUtils.extractObjectProperty(weather, (r) => r.city);
          expect(results).toStrictEqual(expected);
        });
      });
      describe('deeply from an object array', () => {
        const data = [
          {
            category_id: 'c884a636628bca341e',
            menu_item_id: 'mi88dc7bb31bc6104f1',
            item_sizes: [
              {
                id: 'mio882f48820281cf4b6',
                price: 16.09
              }
            ]
          },
          {
            category_id: 'c884a636628bca341e',
            menu_item_id: 'mi8802b942e737df40d',
            item_sizes: [
              {
                id: 'mio88b60bcd7dd202481',
                price: 17.09
              }
            ]
          },
          {
            category_id: 'c884a636628bca341e',
            menu_item_id: 'mi88ff22662b0c0644a',
            item_sizes: [
              {
                id: 'mio88645e98cd8ffc42e',
                price: 14.99
              }
            ]
          }
        ];
        const expected = [16.09, 17.09, 14.99];
        const results = ObjectUtils.extractObjectProperty(data, 'item_sizes[0].price');
        expect(results).toEqual(expected);
      });
      describe('deeply from an object', () => {
        const data = [
          {
            category_id: 'c884a636628bca341e',
            menu_item_id: 'mi88dc7bb31bc6104f1',
            item_sizes: {
              id: 'mio882f48820281cf4b6',
              price: 16.09
            }
          },
          {
            category_id: 'c884a636628bca341e',
            menu_item_id: 'mi8802b942e737df40d',
            item_sizes: {
              id: 'mio88b60bcd7dd202481',
              price: 17.09
            }
          },
          {
            category_id: 'c884a636628bca341e',
            menu_item_id: 'mi88ff22662b0c0644a',
            item_sizes: {
              id: 'mio88645e98cd8ffc42e',
              price: 14.99
            }
          }
        ];
        const expected = [16.09, 17.09, 14.99];
        const results = ObjectUtils.extractObjectProperty(data, 'item_sizes.price');
        expect(results).toEqual(expected);
      });
    });
    describe('cannot extract', () => {
      it('if the list is empty', () => {
        const weather = [];
        const expected = [];
        const results = ObjectUtils.extractObjectProperty(weather, (r) => r.city);
        expect(results).toStrictEqual(expected);
      });
      it('if the list is null', () => {
        const weather = null;
        const expected = [];
        const results = ObjectUtils.extractObjectProperty(weather, (r) => r.city);
        expect(results).toStrictEqual(expected);
      });
    });
  });
  describe('extractObjectProperties', () => {
    describe('cannot extract', () => {
      it('an empty array', () => {
        const weather = [
        ];
        const expected = {
          city: []
        };
        const results = ObjectUtils.extractObjectProperties(weather, ['city']);
        expect(results).toStrictEqual(expected);
      });
      it('if map is not set', () => {
        const weather = [
          { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
          null,
          { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
          { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
        ];
        const expected = [];
        const results = ObjectUtils.extractObjectProperties(weather, null);
        expect(results).toStrictEqual(expected);
      });
      it('if map is not a map or array', () => {
        const weather = [
          { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
          null,
          { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
          { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
        ];
        const expected = 'object.extractObjectProperties(list:Object[], '
          + 'propertyOrFnMap:Map<String, stringOrFn>): propertyOrFnMap must be '
          + 'a map of propertyName keys, with a function or property name as the value';
        expect(() => ObjectUtils.extractObjectProperties(weather, 2)).toThrow(expected);
      });
      it('if values other than strings are provded', () => {
        const weather = [
          { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
          null,
          { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
          { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
        ];
        const expected = {
          city: ['Seattle', 'New York', 'Chicago']
        };
        const results = ObjectUtils.extractObjectProperties(weather, [1, 'city']);
        expect(results).toStrictEqual(expected);
      });
      it('docs example 1', () => {
        const weather = [
          { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
          null,
          { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
          { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
        ];
        const expected = {
          city: ['Seattle', 'New York', 'Chicago'],
          month: ['Aug', 'Apr', 'Apr']
        };
        const results = ObjectUtils.extractObjectProperties(weather, ['city', 'month']);
        expect(results).toStrictEqual(expected);
      });
      it('docs example 2', () => {
        const weather = [
          { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
          null,
          { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
          { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
        ];
        const expected = {
          city: ['Seattle', 'New York', 'Chicago'],
          Month: ['Aug', 'Apr', 'Apr'],
          precipitation: [0.87, 3.94, 3.62]
        };
        const results = ObjectUtils.extractObjectProperties(weather,
          ['city', ['Month', 'month'], ['precipitation', (r) => r.precip]]);
        expect(results).toStrictEqual(expected);
      });
      it('docs example 3', () => {
        const data = [{
          category_id: 'c884a636628bca341e',
          menu_item_id: 'mi88dc7bb31bc6104f1',
          item_sizes: [{ id: 'mio882f48820281cf4b6', price: 16.09 }]
        },
        {
          category_id: 'c884a636628bca341e',
          menu_item_id: 'mi8802b942e737df40d',
          item_sizes: [{ id: 'mio88b60bcd7dd202481', price: 17.09 }]
        },
        {
          category_id: 'c884a636628bca341e',
          menu_item_id: 'mi88ff22662b0c0644a',
          item_sizes: [{ id: 'mio88645e98cd8ffc42e', price: 14.99 }]
        }];
        const expected = {
          menu_item_id: ['mi88dc7bb31bc6104f1', 'mi8802b942e737df40d', 'mi88ff22662b0c0644a'],
          'item_sizes[0].price': [16.09, 17.09, 14.99]
        };
        const results = ObjectUtils.extractObjectProperties(data,
          ['menu_item_id', 'item_sizes[0].price']);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('can extract', () => {
      describe('from a list', () => {
        describe('with a list', () => {
          it('a property name', () => {
            const weather = [
              { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
              null,
              { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
              { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
            ];
            const expected = {
              city: ['Seattle', 'New York', 'Chicago']
            };
            const results = ObjectUtils.extractObjectProperties(weather, ['city']);
            expect(results).toStrictEqual(expected);
          });
          it('multiple property names', () => {
            const weather = [
              { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
              null,
              { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
              { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
            ];
            const expected = {
              city: ['Seattle', 'New York', 'Chicago'],
              month: ['Aug', 'Apr', 'Apr']
            };
            const results = ObjectUtils.extractObjectProperties(weather, ['city', 'month']);
            expect(results).toStrictEqual(expected);
          });
          it('deeply from an object array', () => {
            const data = [
              {
                category_id: 'c884a636628bca341e',
                menu_item_id: 'mi88dc7bb31bc6104f1',
                item_sizes: [
                  {
                    id: 'mio882f48820281cf4b6',
                    price: 16.09
                  }
                ]
              },
              {
                category_id: 'c884a636628bca341e',
                menu_item_id: 'mi8802b942e737df40d',
                item_sizes: [
                  {
                    id: 'mio88b60bcd7dd202481',
                    price: 17.09
                  }
                ]
              },
              {
                category_id: 'c884a636628bca341e',
                menu_item_id: 'mi88ff22662b0c0644a',
                item_sizes: [
                  {
                    id: 'mio88645e98cd8ffc42e',
                    price: 14.99
                  }
                ]
              }
            ];
            const expected = {
              category_id: ['c884a636628bca341e', 'c884a636628bca341e', 'c884a636628bca341e'],
              'item_sizes[0].id': ['mio882f48820281cf4b6', 'mio88b60bcd7dd202481', 'mio88645e98cd8ffc42e'],
              'item_sizes[0].price': [16.09, 17.09, 14.99]
            };
            const results = ObjectUtils.extractObjectProperties(data, ['category_id', 'item_sizes[0].price', 'item_sizes[0].id']);
            expect(results).toEqual(expected);
          });
          it('deeply from an object', () => {
            const data = [
              {
                category_id: 'c884a636628bca341e',
                menu_item_id: 'mi88dc7bb31bc6104f1',
                item_sizes: {
                  id: 'mio882f48820281cf4b6',
                  price: 16.09
                }
              },
              {
                category_id: 'c884a636628bca341e',
                menu_item_id: 'mi8802b942e737df40d',
                item_sizes: {
                  id: 'mio88b60bcd7dd202481',
                  price: 17.09
                }
              },
              {
                category_id: 'c884a636628bca341e',
                menu_item_id: 'mi88ff22662b0c0644a',
                item_sizes: {
                  id: 'mio88645e98cd8ffc42e',
                  price: 14.99
                }
              }
            ];
            const expected = {
              'item_sizes.price': [16.09, 17.09, 14.99]
            };
            const results = ObjectUtils.extractObjectProperties(data, ['item_sizes.price']);
            expect(results).toEqual(expected);
          });
        });
        describe('with a map', () => {
          it('a property name', () => {
            const weather = [
              { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
              null,
              { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
              { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
            ];
            const expected = {
              city: ['Seattle', 'New York', 'Chicago']
            };
            const results = ObjectUtils.extractObjectProperties(weather, new Map([['city', 'city']]));
            expect(results).toStrictEqual(expected);
          });
          it('a function', () => {
            const weather = [
              { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
              null,
              { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
              { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
            ];
            const expected = {
              city: ['Seattle', 'New York', 'Chicago']
            };
            const results = ObjectUtils.extractObjectProperties(weather, new Map([['city', (r) => r.city]]));
            expect(results).toStrictEqual(expected);
          });
          it('multiple property name', () => {
            const weather = [
              { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
              null,
              { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
              { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
            ];
            const expected = {
              city: ['Seattle', 'New York', 'Chicago'],
              month: ['Aug', 'Apr', 'Apr']
            };
            const results = ObjectUtils.extractObjectProperties(weather, new Map([['city', 'city'], ['month', 'month']]));
            expect(results).toStrictEqual(expected);
          });
          it('multiple functions', () => {
            const weather = [
              { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
              null,
              { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
              { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
            ];
            const expected = {
              city: ['Seattle', 'New York', 'Chicago'],
              month: ['Aug', 'Apr', 'Apr']
            };
            const results = ObjectUtils.extractObjectProperties(weather, new Map([['city', (r) => r.city], ['month', (r) => r.month]]));
            expect(results).toStrictEqual(expected);
          });
          it('mixed functions and strings', () => {
            const weather = [
              { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
              null,
              { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
              { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 }
            ];
            const propertyMap = new Map();
            propertyMap.set('city', null);
            propertyMap.set('city2', 'city');
            propertyMap.set('city3', (r) => r.city);

            const expected = {
              city: ['Seattle', 'New York', 'Chicago'],
              city2: ['Seattle', 'New York', 'Chicago'],
              city3: ['Seattle', 'New York', 'Chicago']
            };

            const results = ObjectUtils.extractObjectProperties(weather, propertyMap);
            expect(results).toStrictEqual(expected);
          });
        });
      });
    });
  });
  describe('extractTransformApply', () => {
    it('on a simple case', () => {
      const targetObjects = [
        { account: 'A', user: 'X' },
        { account: 'A', user: 'Y' },
        { account: 'A', user: 'Z' },
      ];
      const path = 'user';
      const values = ObjectUtils.extractObjectProperty(targetObjects, path);
      const expectedTransformations = new Map([['X', 'User-X'], ['Y', 'User-Y'], ['Z', 'User-Z']]);

      expect(expectedTransformations.get('X')).toBe('User-X');
      expect(expectedTransformations.get('Y')).toBe('User-Y');
      expect(expectedTransformations.get('Z')).toBe('User-Z');

      const transformedValues = values.map((val) => expectedTransformations.get(val));

      expect(transformedValues[0]).toBe('User-X');
      expect(transformedValues[1]).toBe('User-Y');
      expect(transformedValues[2]).toBe('User-Z');

      ObjectUtils.applyPropertyValues(targetObjects, path, transformedValues);

      const expected = [
        { account: 'A', user: 'User-X' },
        { account: 'A', user: 'User-Y' },
        { account: 'A', user: 'User-Z' },
      ];

      expect(targetObjects).toStrictEqual(expected);
    });
    it('on multiple properties', () => {
      const targetObjects = [
        { account: 'A', user: 'X', owner: 'Z' },
        { account: 'A', user: 'Y', owner: 'X' },
        { account: 'A', user: 'Z', owner: 'Y' },
      ];
      const paths = ['user', 'owner'];
      const values = ObjectUtils.extractObjectProperties(targetObjects, paths);
      const expectedTransformations = new Map([['X', 'User-X'], ['Y', 'User-Y'], ['Z', 'User-Z']]);

      expect(expectedTransformations.get('X')).toBe('User-X');
      expect(expectedTransformations.get('Y')).toBe('User-Y');
      expect(expectedTransformations.get('Z')).toBe('User-Z');

      const transformedUsers = values.user.map((val) => expectedTransformations.get(val));
      const transformedOwners = values.owner.map((val) => expectedTransformations.get(val));

      ObjectUtils.applyPropertyValues(targetObjects, 'user', transformedUsers);
      ObjectUtils.applyPropertyValues(targetObjects, 'owner', transformedOwners);

      const expected = [
        { account: 'A', user: 'User-X', owner: 'User-Z' },
        { account: 'A', user: 'User-Y', owner: 'User-X' },
        { account: 'A', user: 'User-Z', owner: 'User-Y' },
      ];

      expect(targetObjects).toStrictEqual(expected);
    });
  });

  describe('objectCollectionFromArray', () => {
    it('can convert from a valid array', () => {
      const weather = [
        ['id', 'city', 'month', 'precip'],
        [1, 'Seattle', 'Aug', 0.87],
        [0, 'Seattle', 'Apr', 2.68],
        [2, 'Seattle', 'Dec', 5.31]
      ];
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
      ];
      const results = ObjectUtils.objectCollectionFromArray(weather);
      expect(results).toStrictEqual(expected);
    });
    it('throws an error if no headers provided', () => {
      const weather = [
        [1, 'Seattle', 'Aug', 0.87],
        [0, 'Seattle', 'Apr', 2.68],
        [2, 'Seattle', 'Dec', 5.31]
      ];
      const expected = 'Property must be a string:1';
      expect(() => ObjectUtils.objectCollectionFromArray(weather))
        .toThrow(expected);
    });
    it('can convert from an array with built in headers', () => {
      const weather = [
        ['id', 'city', 'month', 'precip'],
        [1, 'Seattle', 'Aug', 0.87],
        [0, 'Seattle', 'Apr', 2.68],
        [2, 'Seattle', 'Dec', 5.31]
      ];
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
      ];
      const results = ObjectUtils.objectCollectionFromArray(weather);
      expect(results).toStrictEqual(expected);
    });
    it('can convert from an array with separate headers', () => {
      const weather = [
        [1, 'Seattle', 'Aug', 0.87],
        [0, 'Seattle', 'Apr', 2.68],
        [2, 'Seattle', 'Dec', 5.31]
      ];
      const headers = ['id', 'city', 'month', 'precip'];
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
      ];
      const results = ObjectUtils.objectCollectionFromArray(weather, headers);
      expect(results).toStrictEqual(expected);
    });
    it('can convert from an array with headers only', () => {
      const weather = [
        ['id', 'city', 'month', 'precip']
      ];
      const expected = [
      ];
      const results = ObjectUtils.objectCollectionFromArray(weather);
      expect(results).toStrictEqual(expected);
    });
    it('can convert from an empty array with only headers separate', () => {
      const weather = [
      ];
      const headers = ['id', 'city', 'month', 'precip'];
      const expected = [
      ];
      const results = ObjectUtils.objectCollectionFromArray(weather, headers);
      expect(results).toStrictEqual(expected);
    });
    it('throws an error if converting from null', () => {
      const weather = null;
      const expected = 'objectCollectionFromArray: expected collection to be a 2 dimensional array';
      expect(() => ObjectUtils.objectCollectionFromArray(weather))
        .toThrow(expected);
    });
  });

  describe('objectCollectionToArray', () => {
    it('can convert from a valid set', () => {
      const weather = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
      ];
      const expected = [
        ['id', 'city', 'month', 'precip'],
        [1, 'Seattle', 'Aug', 0.87],
        [0, 'Seattle', 'Apr', 2.68],
        [2, 'Seattle', 'Dec', 5.31]
      ];
      const results = ObjectUtils.objectCollectionToArray(weather);
      expect(results).toStrictEqual(expected);
    });
    it('throws an error if converting from null', () => {
      const weather = null;
      const expected = 'objectCollectionToArray: expected collection to be a collection of objects';
      expect(() => ObjectUtils.objectCollectionToArray(weather))
        .toThrow(expected);
    });
  });

  describe('objectCollectionFromDataFrameObject', () => {
    it('can convert from a valid dataframe object', () => {
      const weather = {
        id: [1, 0, 2],
        city: ['Seattle',  'Seattle', 'Seattle'],
        month: ['Aug', 'Apr', 'Dec'],
        precip: [0.87, 2.68, 5.31]
      };
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
      ];
      const results = ObjectUtils.objectCollectionFromDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
    it('throws an error if not an object', () => {
      const weather = 23;
      const expected = 'objectCollectionFromDataFrameObject must be passed an object with properties holding 1d tensors';
      expect(() => ObjectUtils.objectCollectionFromDataFrameObject(weather))
        .toThrow(expected);
    });
    it('can convert from a dataframe object that may have fields that are not tensors', () => {
      const weather = {
        id: [1, 0, 2],
        city: ['Seattle',  'Seattle', 'Seattle'],
        month: ['Aug', 'Apr', 'Dec'],
        precip: [0.87, 2.68, 5.31],
        valid: true
      };
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
      ];
      const results = ObjectUtils.objectCollectionFromDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
    it('can convert from a dataframe even if the tensor lists are uneven', () => {
      const weather = {
        id: [1, 0, 2],
        city: ['Seattle',  'Seattle', 'Seattle'],
        month: ['Aug', 'Apr'],
        precip: [0.87],
        valid: true
      };
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr' },
        { id: 2, city: 'Seattle' }
      ];
      const results = ObjectUtils.objectCollectionFromDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
    it('can convert from a dataframe object with headers only', () => {
      const weather = {
        id: [],
        city: [],
        month: [],
        precip: []
      };
      const expected = [
      ];
      const results = ObjectUtils.objectCollectionFromDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
    it('can convert from an empty dataframe', () => {
      const weather = {};
      const expected = [];
      const results = ObjectUtils.objectCollectionFromDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
    it('throws an error if converting from null', () => {
      const weather = null;
      const expected = [];
      const results = ObjectUtils.objectCollectionFromDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
  });

  describe('objectCollectionToDataFrameObject', () => {
    it('can convert from a valid set', () => {
      const weather = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
      ];
      const expected = {
        id: [1, 0, 2],
        city: ['Seattle',  'Seattle', 'Seattle'],
        month: ['Aug', 'Apr', 'Dec'],
        precip: [0.87, 2.68, 5.31]
      };
      const results = ObjectUtils.objectCollectionToDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
    it('throws an error if converting from null', () => {
      const weather = null;
      const expected = {};
      const results = ObjectUtils.objectCollectionToDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
    it('throws an error if converting from null', () => {
      const weather = null;
      const expected = {};
      const results = ObjectUtils.objectCollectionToDataFrameObject(weather);
      expect(results).toStrictEqual(expected);
    });
  });

  describe('getSet', () => {
    it('can set a value', () => {
      const key = 'count';
      const defaultValue = null;
      const initialObject = {};
      initialObject[key] = defaultValue;
      // const incrementValue = 1;

      const functor = (value) => { // key, obj) => {
        if (!value) return 1;
        return value + 1;
      };

      ObjectUtils.getSet(initialObject, key, functor);

      const expected = 1;
      const results = initialObject[key];
      expect(results).toBe(expected);
    });
    it('can increment a value', () => {
      const key = 'count';
      const defaultValue = null;
      const initialObject = {};
      initialObject[key] = defaultValue;
      
      const functor = (value) => { //, key, obj) => {
        if (!value) return 1;
        return value + 1;
      };

      ObjectUtils.getSet(initialObject, key, functor);
      ObjectUtils.getSet(initialObject, key, functor);

      const expected = 2;
      const results = initialObject[key];
      expect(results).toBe(expected);
    });
    it('can increment a value on a new property', () => {
      const key = 'count';
      // const defaultValue = null;
      const initialObject = {};
      // initialObject[key] = defaultValue;
      
      const functor = (value) => { //, key, obj) => {
        if (!value) return 1;
        return value + 1;
      };

      ObjectUtils.getSet(initialObject, key, functor);
      ObjectUtils.getSet(initialObject, key, functor);

      const expected = 2;
      const results = initialObject[key];
      expect(results).toBe(expected);
    });
    it('can increment a value multiple times', () => {
      const key = 'count';
      const defaultValue = null;
      const initialObject = {};
      initialObject[key] = defaultValue;
      
      const functor = (value) => { //, key, obj) => {
        if (!value) return 1;
        return value + 1;
      };

      ObjectUtils.getSet(initialObject, key, functor);
      ObjectUtils.getSet(initialObject, key, functor);
      ObjectUtils.getSet(initialObject, key, functor);
      ObjectUtils.getSet(initialObject, key, functor);
      ObjectUtils.getSet(initialObject, key, functor);

      const expected = 5;
      const results = initialObject[key];
      expect(results).toBe(expected);
    });
    it('can set a value', () => {
      const key = 'count';
      const defaultValue = null;
      const initialObject: Record<string, unknown> = {};
      initialObject[key] = defaultValue;
      initialObject.anotherValue = 10;

      const functor = (value, _, obj) => {
        if (!value) return obj.anotherValue;
        return value + 1;
      };

      ObjectUtils.getSet(initialObject, key, functor);

      const expected = 10;
      const results = initialObject[key];
      expect(results).toBe(expected);
    });
  });
  describe('get', () => {
    it('can get a value', () => {
      const data = { first: 'john', last: 'doe' };
      const accessor = 'first';
      const expected = 'john';
      const results = ObjectUtils.get(data, accessor);
      expect(results).toBe(expected);
    });
    it('can get a value', () => {
      const data = { first: 'john', last: 'doe' };
      const accessor = null;
      const expected = 'object.mapByProperty: expects a propertyName';

      expect(() => ObjectUtils.get(data, accessor)).toThrow(expected);
    });
  });

  describe('keysWithinList', () => {
    describe('can pass an array of fields', () => {
      it('can find a subset of fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last'];
        const expected = ['first', 'last'];
        const results = ObjectUtils.keysWithinList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('can find all fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'favouriteColor'];
        const expected = ['first', 'last', 'favouriteColor'];
        const results = ObjectUtils.keysWithinList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('does not find fields not in the list of objects', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'shoeSize'];
        const expected = ['first', 'last'];
        const results = ObjectUtils.keysWithinList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns an empty list if no fields are asked', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = [];
        const expected = [];
        const results = ObjectUtils.keysWithinList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns an empty list if no fields match', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['shoeSize'];
        const expected = [];
        const results = ObjectUtils.keysWithinList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('can pass arguments individually', () => {
      it('can find a subset of fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last'];
        const expected = ['first', 'last'];
        const results = ObjectUtils.keysWithinList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('can find all fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'favouriteColor'];
        const expected = ['first', 'last', 'favouriteColor'];
        const results = ObjectUtils.keysWithinList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('does not find fields not in the list of objects', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'shoeSize'];
        const expected = ['first', 'last'];
        const results = ObjectUtils.keysWithinList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns an empty list if no fields are asked', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = [];
        const expected = [];
        const results = ObjectUtils.keysWithinList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns an empty list if no fields match', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['shoeSize'];
        const expected = [];
        const results = ObjectUtils.keysWithinList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('keysNotInList', () => {
    describe('can pass an array of fields', () => {
      it('can find a subset of fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last'];
        const expected = ['favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('can find all fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'favouriteColor'];
        const expected = [];
        const results = ObjectUtils.keysNotInList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('finds fields not in the list of objects', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'shoeSize'];
        const expected = ['favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns all fields if no fields are asked', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = [];
        const expected = ['first', 'last', 'favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns the list if no fields match', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['shoeSize'];
        const expected = ['first', 'last', 'favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('can pass arguments individually', () => {
      it('can find a subset of fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last'];
        const expected = ['favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('can find all fields', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'favouriteColor'];
        const expected = [];
        const results = ObjectUtils.keysNotInList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('finds fields not in the list of objects', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['first', 'last', 'shoeSize'];
        const expected = ['favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns all fields if no fields are asked', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = [];
        const expected = ['first', 'last', 'favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
      it('returns the list if no fields match', () => {
        const dataSet = [
          { first: 'john', last: 'McCartney', favouriteColor: 'blue' },
          { first: 'ringo', last: 'Starr', favouriteColor: 'red' }
        ];
        const fieldsToCheck = ['shoeSize'];
        const expected = ['first', 'last', 'favouriteColor'];
        const results = ObjectUtils.keysNotInList(dataSet, ...fieldsToCheck);
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('splitIntoDatums', () => {
    it('can separate by multiple fields', () => {
      const data = [
        { category: 'A', source: 'chicago', x: 0.1, y: 0.6, z: 0.9 },
        { category: 'B', source: 'springfield', x: 0.7, y: 0.2, z: 1.1 },
        { category: 'C', source: 'winnetka', x: 0.6, y: 0.1, z: 0.2 }
      ];
      const fieldsToSplit = ['x', 'y', 'z'];
      const expected = [
        { category: 'A', source: 'chicago', series: 'x', value: 0.1 },
        { category: 'A', source: 'chicago', series: 'y', value: 0.6 },
        { category: 'A', source: 'chicago', series: 'z', value: 0.9 },
        { category: 'B', source: 'springfield', series: 'x', value: 0.7 },
        { category: 'B', source: 'springfield', series: 'y', value: 0.2 },
        { category: 'B', source: 'springfield', series: 'z', value: 1.1 },
        { category: 'C', source: 'winnetka', series: 'x', value: 0.6 },
        { category: 'C', source: 'winnetka', series: 'y', value: 0.1 },
        { category: 'C', source: 'winnetka', series: 'z', value: 0.2 }
      ];
      const results = ObjectUtils.splitIntoDatums(data, fieldsToSplit);
      expect(results).toStrictEqual(expected);
    });
    it('can separate a single record', () => {
      const data = [
        { category: 'A', source: 'chicago', x: 0.1, y: 0.6, z: 0.9 }
      ];
      const fieldsToSplit = ['x', 'y', 'z'];
      const expected = [
        { category: 'A', source: 'chicago', series: 'x', value: 0.1 },
        { category: 'A', source: 'chicago', series: 'y', value: 0.6 },
        { category: 'A', source: 'chicago', series: 'z', value: 0.9 }
      ];
      const results = ObjectUtils.splitIntoDatums(data, fieldsToSplit);
      expect(results.length).toBe(3);
      expect(results).toStrictEqual(expected);
    });
    it('can separate by a single field', () => {
      const data = [
        { category: 'A', source: 'chicago', x: 0.1 },
        { category: 'B', source: 'springfield', x: 0.7 },
        { category: 'C', source: 'winnetka', x: 0.6 }
      ];
      const fieldsToSplit = ['x', 'y', 'z'];
      const expected = [
        { category: 'A', source: 'chicago', series: 'x', value: 0.1 },
        { category: 'B', source: 'springfield', series: 'x', value: 0.7 },
        { category: 'C', source: 'winnetka', series: 'x', value: 0.6 }
      ];
      const results = ObjectUtils.splitIntoDatums(data, fieldsToSplit);
      expect(results).toStrictEqual(expected);
    });
    it('still works if passing fields that do not exist', () => {
      const data = [
        { category: 'A', source: 'chicago', x: 0.1 }
      ];
      const fieldsToSplit = ['x', 'y', 'z'];
      const expected = [
        { category: 'A', source: 'chicago', series: 'x', value: 0.1 }
      ];
      const results = ObjectUtils.splitIntoDatums(data, fieldsToSplit);
      expect(results).toStrictEqual(expected);
    });
  });
});
