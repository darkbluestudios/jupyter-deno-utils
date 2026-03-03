import { describe, it, beforeEach, afterEach, afterAll } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { assertSpyCalls, spy, type Spy } from "@std/testing/mock";
import ArrayUtils from "../src/array.ts";
import TableGenerator from "../src/TableGenerator.ts";
import { newTable as _newTable } from '../src/TableGenerator.ts';

type WeatherRow = { id: number; city: string; month: string; precip: number };

const initializeWeather = (): WeatherRow[] => [
  { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
  { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
  { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 },
  { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
  { id: 4, city: 'New York', month: 'Aug', precip: 4.13 },
  { id: 5, city: 'New York', month: 'Dec', precip: 3.58 },
  { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 },
  { id: 8, city: 'Chicago',  month: 'Dec', precip: 2.56 },
  { id: 7, city: 'Chicago',  month: 'Aug', precip: 3.98 }
];

const initializeWeatherArray = () => [
  ['id', 'city', 'month', 'precip'],
  [ 1, 'Seattle', 'Aug', 0.87 ],
  [ 0, 'Seattle', 'Apr', 2.68 ],
  [ 2, 'Seattle', 'Dec', 5.31 ],
  [ 3, 'New York', 'Apr', 3.94 ],
  [ 4, 'New York', 'Aug', 4.13 ],
  [ 5, 'New York', 'Dec', 3.58 ],
  [ 6, 'Chicago', 'Apr', 3.62 ],
  [ 8, 'Chicago', 'Dec', 2.56 ],
  [ 7, 'Chicago', 'Aug', 3.98 ]
];

const initializeWeatherList = () => [
  0.87, 2.68, 5.31, 3.94, 4.13, 3.58, 3.62, 2.56, 3.98
];

const initializeWeatherDataFrameObject = () => ({
  id: [
    1, 0, 2, 3, 4,
    5, 6, 8, 7
  ],
  city: [
    'Seattle',  'Seattle',
    'Seattle',  'New York',
    'New York', 'New York',
    'Chicago',  'Chicago',
    'Chicago'
  ],
  month: [
    'Aug', 'Apr',
    'Dec', 'Apr',
    'Aug', 'Dec',
    'Apr', 'Dec',
    'Aug'
  ],
  precip: [
    0.87, 2.68, 5.31,
    3.94, 4.13, 3.58,
    3.62, 2.56, 3.98
  ]
});

const initializeSmallWeather = () => [
  { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
  { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 }
];

describe("tableGenerator", () => {
  describe("prepare", () => {
    it("can prepare a table without any arguments", () => {
      const weather = initializeWeather();
      const expected = {
        headers: ["id", "city", "month", "precip"],
        data: [
          [1, "Seattle", "Aug", 0.87],
          [0, "Seattle", "Apr", 2.68],
          [2, "Seattle", "Dec", 5.31],
          [3, "New York", "Apr", 3.94],
          [4, "New York", "Aug", 4.13],
          [5, "New York", "Dec", 3.58],
          [6, "Chicago", "Apr", 3.62],
          [8, "Chicago", "Dec", 2.56],
          [7, "Chicago", "Aug", 3.98]
        ]
      };
      const results = new TableGenerator(weather).prepare();
      expect(results.headers).toStrictEqual(expected.headers);
      expect(results.data).toStrictEqual(expected.data);
    });

    describe("constructor", () => {
      it('uses the constructor to initialize data', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats a null dataset as empty', () => {
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator(null)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats an empty constructor as null', () => {
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator()
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('data', () => {
      it('uses data() to override the constructor', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(null)
          .data(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('uses fromObjectCollection to override the constructor', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(null)
          .fromObjectCollection(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats a null dataset as empty', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator(weather)
          .data(null)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats an empty data() call as empty', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator(weather)
          .data()
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('shows columns for all rows provided', () => {
        const weather = [
          { id: 1, city: 'Seattle',  month: 'Aug' },
          { id: 0, city: 'Seattle',  month: 'Apr' },
          { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 }
        ];
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle', 'Aug', ''],
            [0, 'Seattle', 'Apr', ''],
            [2, 'Seattle', 'Dec', 5.31]
          ]
        });
        const results = new TableGenerator(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('fromArray', () => {
      it('uses fromArray to override the constructor', () => {
        const weather = initializeWeatherArray();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(null)
          .fromArray(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('can use a separate header list if provided', () => {
        const weather = [
          ['A', 'B', 'C', 'D'],
          ...initializeWeatherArray().slice(1)
        ];
        const expected = ({
          headers: ['A', 'B', 'C', 'D'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(null)
          .fromArray(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats a null dataset as empty', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator(weather)
          .fromArray(null)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats an empty data() call as empty', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator(weather)
          .fromArray()
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('shows columns for all rows provided', () => {
        const weather = initializeWeatherArray().slice(0, 4);
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle', 'Aug', 0.87],
            [0, 'Seattle', 'Apr', 2.68],
            [2, 'Seattle', 'Dec', 5.31]
          ]
        });
        const results = new TableGenerator()
          .fromArray(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('fromList', () => {
      it('uses fromList to override the constructor', () => {
        const weather = initializeWeatherList();
        const expected = ({
          headers: ['_'],
          data: [
            [0.87],
            [2.68],
            [5.31],
            [3.94],
            [4.13],
            [3.58],
            [3.62],
            [2.56],
            [3.98]
          ] });
        const results = new TableGenerator(null)
          .fromList(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats a null dataset as empty', () => {
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator()
          .fromList(null)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats an empty data() call as empty', () => {
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator()
          .fromList()
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('shows columns for all rows provided', () => {
        const weather = initializeWeatherList().slice(0, 4);
        const expected = ({
          headers: ['_'],
          data: [
            [0.87],
            [2.68],
            [5.31],
            [3.94]
          ]
        });
        const results = new TableGenerator()
          .fromList(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('fromDataFrameObject', () => {
      it('uses fromObjectCollection to override the constructor', () => {
        const weather = initializeWeatherDataFrameObject();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(null)
          .fromDataFrameObject(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats a null dataset as empty', () => {
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator()
          .fromDataFrameObject(null)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('treats an empty data() call as empty', () => {
        const expected = ({
          headers: [],
          data: []
        });
        const results = new TableGenerator()
          .fromDataFrameObject()
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('shows columns for all rows provided', () => {
        const weather = initializeWeatherDataFrameObject();
        weather.city = weather.city.slice(0, 3);
        weather.id = weather.id.slice(0, 3);
        weather.precip = weather.precip.slice(0, 3);
        weather.month = weather.month.slice(0, 3);

        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle', 'Aug', 0.87],
            [0, 'Seattle', 'Apr', 2.68],
            [2, 'Seattle', 'Dec', 5.31]
          ]
        });
        const results = new TableGenerator(weather)
          .fromDataFrameObject(weather)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('sortFn', () => {
      it('can sort a table', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [0, 'Seattle',  'Apr', 2.68],
            [1, 'Seattle',  'Aug', 0.87],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [7, 'Chicago',  'Aug', 3.98],
            [8, 'Chicago',  'Dec', 2.56]
          ] });
        const results = new TableGenerator(weather)
          .sortFn(ArrayUtils.createSort('id'))
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('sort', () => {
      it('can sort by one column', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [0, 'Seattle',  'Apr', 2.68],
            [1, 'Seattle',  'Aug', 0.87],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [7, 'Chicago',  'Aug', 3.98],
            [8, 'Chicago',  'Dec', 2.56]
          ] });
        const results = new TableGenerator(weather)
          .sort('id')
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('can sort by two columns', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [6, 'Chicago',  'Apr', 3.62],
            [7, 'Chicago',  'Aug', 3.98],
            [8, 'Chicago',  'Dec', 2.56],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [0, 'Seattle',  'Apr', 2.68],
            [1, 'Seattle',  'Aug', 0.87],
            [2, 'Seattle',  'Dec', 5.31],
          ] });
        const results = new TableGenerator(weather)
          .sort('city', 'month')
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('columns', () => {
      it('can specify the columns to show', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city'],
          data: [
            [1, 'Seattle' ],
            [0, 'Seattle' ],
            [2, 'Seattle' ],
            [3, 'New York'],
            [4, 'New York'],
            [5, 'New York'],
            [6, 'Chicago' ],
            [8, 'Chicago' ],
            [7, 'Chicago' ]
          ] });
        const results = new TableGenerator(weather)
          .columns(['id', 'city'])
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('expects columns to be a list of strings or numbers', () => {
        const weather = initializeWeather();
        const instance = new TableGenerator(weather);
        expect(() => instance.columns({} as unknown as string)).toThrow();
      });
    });
    describe('columnsToExclude', () => {
      it('can exclude columns by array', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'month', 'precip'],
          data: [
            [1, 'Aug', 0.87],
            [0, 'Apr', 2.68],
            [2, 'Dec', 5.31],
            [3, 'Apr', 3.94],
            [4, 'Aug', 4.13],
            [5, 'Dec', 3.58],
            [6, 'Apr', 3.62],
            [8, 'Dec', 2.56],
            [7, 'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .columnsToExclude(['city'])
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('can exclude columns as arguments', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'month', 'precip'],
          data: [
            [1, 'Aug', 0.87],
            [0, 'Apr', 2.68],
            [2, 'Dec', 5.31],
            [3, 'Apr', 3.94],
            [4, 'Aug', 4.13],
            [5, 'Dec', 3.58],
            [6, 'Apr', 3.62],
            [8, 'Dec', 2.56],
            [7, 'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .columnsToExclude('city')
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('throws an error if columns to exclude are invalid', () => {
        expect(() => new TableGenerator()
          .columnsToExclude(2 as unknown as string)
          .prepare()).toThrow();
      });
    });
    describe('filter', () => {
      it('can filter results', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31]
          ] });
        const results = new TableGenerator(weather)
          .filter((r) => r.city === 'Seattle')
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('labels', () => {
      it('can specify labels', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['Id', 'City of Birth', 'month', 'Precipitation'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .labels({ id: 'Id', city: 'City of Birth', precip: 'Precipitation' })
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('formatterFn', () => {
      it('can provide a formatter', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'SEA', 'Aug', 0.87],
            [0, 'SEA', 'Apr', 2.68],
            [2, 'SEA', 'Dec', 5.31],
            [3, 'NY_', 'Apr', 3.94],
            [4, 'NY_', 'Aug', 4.13],
            [5, 'NY_', 'Dec', 3.58],
            [6, 'CHI', 'Apr', 3.62],
            [8, 'CHI', 'Dec', 2.56],
            [7, 'CHI', 'Aug', 3.98]
          ] });
        const cityMap = new Map([['Seattle', 'SEA'], ['Chicago', 'CHI'], ['New York', 'NY_']]);
        expect(cityMap.get('New York')).toBe('NY_');
        const cellFormatter = ({ value, property }) => property !== 'city'
          ? value
          : cityMap.get(value);
        const results = new TableGenerator(weather)
          .formatterFn(cellFormatter)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('formatter', () => {
      it('can format with an object', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'SEA', 'aug', 0.87],
            [0, 'SEA', 'apr', 2.68],
            [2, 'SEA', 'dec', 5.31],
            [3, 'NY_', 'apr', 3.94],
            [4, 'NY_', 'aug', 4.13],
            [5, 'NY_', 'dec', 3.58],
            [6, 'CHI', 'apr', 3.62],
            [8, 'CHI', 'dec', 2.56],
            [7, 'CHI', 'aug', 3.98]
          ] });
        const cityMap = new Map([['Seattle', 'SEA'], ['Chicago', 'CHI'], ['New York', 'NY_']]);
        expect(cityMap.get('New York')).toBe('NY_');
        const formatObj = ({
          city: (value) => cityMap.has(value) ? cityMap.get(value) : value,
          month: (value) => value ? value.toLowerCase() : value
        });
        const results = new TableGenerator(weather)
          .formatter(formatObj)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('clears the formatter if you send it again with null', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .formatter({})
          .formatter(null)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('throws an error if an invalid formatter is sent', () => {
        try {
          new TableGenerator(initializeSmallWeather())
            .formatter(((() => {}) as unknown as Record<string, unknown>))
            .prepare();
          expect(true).toBe('an exception thrown');
        } catch (_err) {
          // do nothing
        }
      });
      describe('basic type conversion', () => {
        it('string 1', () => {
          const weather = initializeWeather();
          const expected = ({
            headers: ['id', 'city', 'month', 'precip'],
            data: [
              [1, 'Seattle',  'Aug', '0.87'],
              [0, 'Seattle',  'Apr', '2.68'],
              [2, 'Seattle',  'Dec', '5.31'],
              [3, 'New York', 'Apr', '3.94'],
              [4, 'New York', 'Aug', '4.13'],
              [5, 'New York', 'Dec', '3.58'],
              [6, 'Chicago',  'Apr', '3.62'],
              [8, 'Chicago',  'Dec', '2.56'],
              [7, 'Chicago',  'Aug', '3.98']
            ] });
          const results = new TableGenerator(weather)
            .formatter({ precip: 'string' })
            .prepare();
          expect(results.headers).toStrictEqual(expected.headers);
          expect(results.data).toStrictEqual(expected.data);
        });
        it('string 2', () => {
          const weather = initializeWeather()
            .map((r) => ({ ...r, precip: String(r.precip) }));
          const expected = ({
            headers: ['id', 'city', 'month', 'precip'],
            data: [
              [1, 'Seattle',  'Aug', 0.87],
              [0, 'Seattle',  'Apr', 2.68],
              [2, 'Seattle',  'Dec', 5.31],
              [3, 'New York', 'Apr', 3.94],
              [4, 'New York', 'Aug', 4.13],
              [5, 'New York', 'Dec', 3.58],
              [6, 'Chicago',  'Apr', 3.62],
              [8, 'Chicago',  'Dec', 2.56],
              [7, 'Chicago',  'Aug', 3.98]
            ] });

          expect(weather[0].precip).toBe('0.87');
          const results = new TableGenerator(weather)
            .formatter({ precip: 'number' })
            .prepare();
          expect(results.headers).toStrictEqual(expected.headers);
          expect(results.data).toStrictEqual(expected.data);
        });
        it('boolean', () => {
          const weather = initializeWeather()
            .map((r) => ({ ...r, isHot: r.precip >= 4 }));
          const expected = ({
            headers: ['id', 'city', 'month', 'precip', 'isHot'],
            data: [
              [1, 'Seattle',  'Aug', 0.87, false],
              [0, 'Seattle',  'Apr', 2.68, false],
              [2, 'Seattle',  'Dec', 5.31, true],
              [3, 'New York', 'Apr', 3.94, false],
              [4, 'New York', 'Aug', 4.13, true],
              [5, 'New York', 'Dec', 3.58, false],
              [6, 'Chicago',  'Apr', 3.62, false],
              [8, 'Chicago',  'Dec', 2.56, false],
              [7, 'Chicago',  'Aug', 3.98, false]
            ] });

          const results = new TableGenerator(weather)
            .formatter({ isHot: 'boolean' })
            .prepare();
          expect(results.headers).toStrictEqual(expected.headers);
          expect(results.data).toStrictEqual(expected.data);
        });
        /*
        it('fails if formatter is string, but not string, number, boolean', () => {
          const weather = initializeWeather();
          
          const expectedError = 'TableGenerator.format: property precip formatter of somethingelse is unsupported. Only (String, Number, Boolean) are supported';
          expect(() => {
            new TableGenerator(weather)
              .formatter({
                precip: 'somethingElse'
              })
              .formatter(null)
              .prepare();
          }).toThrow(expectedError);
        });
        */
      });
    });

    describe('format', () => {
      it('can format with an object', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'SEA', 'aug', 0.87],
            [0, 'SEA', 'apr', 2.68],
            [2, 'SEA', 'dec', 5.31],
            [3, 'NY_', 'apr', 3.94],
            [4, 'NY_', 'aug', 4.13],
            [5, 'NY_', 'dec', 3.58],
            [6, 'CHI', 'apr', 3.62],
            [8, 'CHI', 'dec', 2.56],
            [7, 'CHI', 'aug', 3.98]
          ] });
        const cityMap = new Map([['Seattle', 'SEA'], ['Chicago', 'CHI'], ['New York', 'NY_']]);
        expect(cityMap.get('New York')).toBe('NY_');
        const formatObj = ({
          city: (value) => cityMap.has(value) ? cityMap.get(value) : value,
          month: (value) => value ? value.toLowerCase() : value
        });
        const results = new TableGenerator(weather)
          .format(formatObj)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('clears the formatter if you send it again with null', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68],
            [2, 'Seattle',  'Dec', 5.31],
            [3, 'New York', 'Apr', 3.94],
            [4, 'New York', 'Aug', 4.13],
            [5, 'New York', 'Dec', 3.58],
            [6, 'Chicago',  'Apr', 3.62],
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .format({})
          .format(null)
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
      it('throws an error if an invalid formatter is sent', () => {
        try {
          new TableGenerator(initializeSmallWeather())
            .format(((() => {}) as unknown as Record<string, unknown>))
            .prepare();
          expect(true).toBe('an exception thrown');
        } catch (_err) {
          // do nothing
        }
      });
      describe('basic type conversion', () => {
        it('string 1', () => {
          const weather = initializeWeather();
          const expected = ({
            headers: ['id', 'city', 'month', 'precip'],
            data: [
              [1, 'Seattle',  'Aug', '0.87'],
              [0, 'Seattle',  'Apr', '2.68'],
              [2, 'Seattle',  'Dec', '5.31'],
              [3, 'New York', 'Apr', '3.94'],
              [4, 'New York', 'Aug', '4.13'],
              [5, 'New York', 'Dec', '3.58'],
              [6, 'Chicago',  'Apr', '3.62'],
              [8, 'Chicago',  'Dec', '2.56'],
              [7, 'Chicago',  'Aug', '3.98']
            ] });
          const results = new TableGenerator(weather)
            .format({ precip: 'string' })
            .prepare();
          expect(results.headers).toStrictEqual(expected.headers);
          expect(results.data).toStrictEqual(expected.data);
        });
        it('string 2', () => {
          const weather = initializeWeather()
            .map((r) => ({ ...r, precip: String(r.precip) }));
          const expected = ({
            headers: ['id', 'city', 'month', 'precip'],
            data: [
              [1, 'Seattle',  'Aug', 0.87],
              [0, 'Seattle',  'Apr', 2.68],
              [2, 'Seattle',  'Dec', 5.31],
              [3, 'New York', 'Apr', 3.94],
              [4, 'New York', 'Aug', 4.13],
              [5, 'New York', 'Dec', 3.58],
              [6, 'Chicago',  'Apr', 3.62],
              [8, 'Chicago',  'Dec', 2.56],
              [7, 'Chicago',  'Aug', 3.98]
            ] });

          expect(weather[0].precip).toBe('0.87');
          const results = new TableGenerator(weather)
            .format({ precip: 'number' })
            .prepare();
          expect(results.headers).toStrictEqual(expected.headers);
          expect(results.data).toStrictEqual(expected.data);
        });
        it('boolean', () => {
          const weather = initializeWeather()
            .map((r) => ({ ...r, isHot: r.precip >= 4 }));
          const expected = ({
            headers: ['id', 'city', 'month', 'precip', 'isHot'],
            data: [
              [1, 'Seattle',  'Aug', 0.87, false],
              [0, 'Seattle',  'Apr', 2.68, false],
              [2, 'Seattle',  'Dec', 5.31, true],
              [3, 'New York', 'Apr', 3.94, false],
              [4, 'New York', 'Aug', 4.13, true],
              [5, 'New York', 'Dec', 3.58, false],
              [6, 'Chicago',  'Apr', 3.62, false],
              [8, 'Chicago',  'Dec', 2.56, false],
              [7, 'Chicago',  'Aug', 3.98, false]
            ] });

          const results = new TableGenerator(weather)
            .format({ isHot: 'boolean' })
            .prepare();
          expect(results.headers).toStrictEqual(expected.headers);
          expect(results.data).toStrictEqual(expected.data);
        });
      });
    });
    describe('limit', () => {
      it('can limit to 2 records', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [1, 'Seattle',  'Aug', 0.87],
            [0, 'Seattle',  'Apr', 2.68]
          ] });
        const results = new TableGenerator(weather)
          .limit(2)
          .prepare();
        expect(results).toStrictEqual(expected);
      });
      it('can limit to last 2 records', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [7, 'Chicago',  'Aug', 3.98],
            [8, 'Chicago',  'Dec', 2.56]
          ] });
        const results = new TableGenerator(weather)
          .limit(-2)
          .prepare();
        expect(results).toStrictEqual(expected);
      });
    });
    describe('offset', () => {
      it('can offset 7 records', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .offset(7)
          .prepare();
        expect(results).toStrictEqual(expected);
      });
      it('can offset beyond the number of records', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
          ] });
        const results = new TableGenerator(weather)
          .offset(100)
          .prepare();
        expect(results).toStrictEqual(expected);
      });
      it('can offset -2 records', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
            [8, 'Chicago',  'Dec', 2.56],
            [7, 'Chicago',  'Aug', 3.98]
          ] });
        const results = new TableGenerator(weather)
          .offset(-2)
          .prepare();
        expect(results).toStrictEqual(expected);
      });
      /*
      it('can offset below the number of records', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip'],
          data: [
          ] });
        const results = new TableGenerator(weather)
          .offset(-100)
          .prepare();
        expect(results).toStrictEqual(expected);
      });
      */
    });
    describe('printOptions', () => {
      it("can influence dates through print options", () => {
        const data = [
          { id: 1, dateTime: new Date(Date.UTC(2022, 3, 2, 9)), child: { results: true } },
          { id: 2, dateTime: new Date(Date.UTC(2022, 3, 3, 9)), child: { results: false } },
          { id: 3, dateTime: new Date(Date.UTC(2022, 3, 4, 9)), child: { results: true } }
        ];
        const expected = `id|dateTime                |child          
--|--                      |--             
1 |2022-04-02T09:00:00.000Z|[object Object]
2 |2022-04-03T09:00:00.000Z|[object Object]
3 |2022-04-04T09:00:00.000Z|[object Object]`;
        const results = new TableGenerator(data)
          .printOptions({ collapseObjects: true, dateFormat: "toISOString" })
          .generateMarkdown();
        expect(results).toStrictEqual(expected);
      });
    });
    describe('augment', () => {
      it('can augment', () => {
        const weather = initializeWeather();
        const expected = ({
          headers: ['id', 'city', 'month', 'precip', 'state'],
          data: [
            [1, 'Seattle',  'Aug', 0.87, 'WA'],
            [0, 'Seattle',  'Apr', 2.68, 'WA'],
            [2, 'Seattle',  'Dec', 5.31, 'WA'],
            [3, 'New York', 'Apr', 3.94, 'NY'],
            [4, 'New York', 'Aug', 4.13, 'NY'],
            [5, 'New York', 'Dec', 3.58, 'NY'],
            [6, 'Chicago',  'Apr', 3.62, 'IL'],
            [8, 'Chicago',  'Dec', 2.56, 'IL'],
            [7, 'Chicago',  'Aug', 3.98, 'IL']
          ]
        });
        const cityState = new Map([['Seattle', 'WA'], ['New York', 'NY'], ['Chicago', 'IL']]);
        const results = new TableGenerator(weather)
          .augment({
            state: (row) => cityState.get(row.city as string)
          })
          .prepare();
        expect(results.headers).toStrictEqual(expected.headers);
        expect(results.data).toStrictEqual(expected.data);
      });
    });
    describe('transpose', () => {
      it('will transpose a result, if transposed once', () => {
        const data = [
          { name: 'John', color: 'green', age: 23, hair: 'blond', state: 'IL' },
          { name: 'Jane', color: 'brown', age: 23, hair: 'blonde', state: 'IL' }
        ];
        const expected = ({
          headers: ['name', 'John', 'Jane'],
          data: [
            ['color', 'green', 'brown'],
            ['age', 23, 23],
            ['hair', 'blond', 'blonde'],
            ['state', 'IL', 'IL']
          ]
        });

        const results = new TableGenerator(data)
          .transpose()
          .prepare();

        expect(results).toEqual(expected);
      });
      it('will be the same result, if transposed twice', () => {
        const data = [
          { name: 'John', color: 'green', age: 23, hair: 'blond', state: 'IL' },
          { name: 'Jane', color: 'brown', age: 23, hair: 'blonde', state: 'IL' }
        ];
        const expected = `name |John |Jane  
--   |--   |--    
color|green|brown 
age  |23   |23    
hair |blond|blonde
state|IL   |IL    `;

        const results = new TableGenerator(data)
          .transpose()
          .generateMarkdown();

        expect(results).toEqual(expected);
      });
    });
  });
  describe('generateHTML', () => {
    it('can render a table', () => {
      const weather = initializeSmallWeather();
      const results = new TableGenerator(weather)
        .columns(['id', 'city'])
        .generateHTML();
      expect(results).toBeTruthy();
    //-- @TODO: work on unit tests for the table
    });

    describe('styleTable', () => {
      it('can style the table', () => {
        const weather = initializeSmallWeather();
        const results = new TableGenerator(weather)
          .styleTable('1px solid black')
          .generateHTML();
        const expected = `<table cellspacing="0px" style="1px solid black;">
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('does not duplicate semicolons', () => {
        const weather = initializeSmallWeather();
        const results = new TableGenerator(weather)
          .styleTable('1px solid black;')
          .generateHTML();
        const expected = `<table cellspacing="0px" style="1px solid black;">
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('applies no style if styleTable is null', () => {
        const weather = initializeSmallWeather();
        const results = new TableGenerator(weather)
          .styleTable('1px solid black;')
          .styleTable(null)
          .generateHTML();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
    });

    describe('styleHeader', () => {
      it('can style the headers', () => {
        const weather = initializeSmallWeather();
        const results = new TableGenerator(weather)
          .styleHeader('1px solid black')
          .generateHTML();
        const expected = `<table cellspacing="0px" >
<tr style="1px solid black">
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('does not duplicate semicolons if provided in style', () => {
        const weather = initializeSmallWeather();
        const results = new TableGenerator(weather)
          .styleHeader('1px solid black;')
          .generateHTML();
        const expected = `<table cellspacing="0px" >
<tr style="1px solid black;">
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('does not provide a style if styleHeader is null', () => {
        const weather = initializeSmallWeather();
        const results = new TableGenerator(weather)
          .styleHeader('1px solid black;')
          .styleHeader(null)
          .generateHTML();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
    });
    
    describe('styleRow', () => {
      it('can style the rows with a literal', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr style="dynamic-style: 1;">
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const styleRowFn = ({ rowIndex }) => rowIndex % 2 === 0
          ? ''
          : `dynamic-style: ${rowIndex}`;
        const results = new TableGenerator(weather)
          .styleRow(styleRowFn)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('does not duplicate semicolons if included in styleRow', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr style="dynamic-style: 1;">
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const styleRowFn = ({ rowIndex }) => rowIndex % 2 === 0
          ? ''
          : `dynamic-style: ${rowIndex};`;
        const results = new TableGenerator(weather)
          .styleRow(styleRowFn)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('clears the style if styleRow is null', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const styleRowFn = ({ rowIndex }) => rowIndex % 2 === 0
          ? ''
          : `dynamic-style: ${rowIndex}`;
        const results = new TableGenerator(weather)
          .styleRow(styleRowFn)
          .styleRow(null)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('styles correctly if filter is used', () => {
        /*
        with filter included, we will no longer be able to use the same
        order of the records in the dataset, so we must recreate the objects
        to be passed to the generateStyle function.
        */
        const weather = initializeWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr style="dynamic-style: green;">
\t<td >6</td>
\t<td >Chicago</td>
\t<td >Apr</td>
\t<td >3.62</td>
</tr>
<tr >
\t<td >8</td>
\t<td >Chicago</td>
\t<td >Dec</td>
\t<td >2.56</td>
</tr>
<tr style="dynamic-style: green;">
\t<td >7</td>
\t<td >Chicago</td>
\t<td >Aug</td>
\t<td >3.98</td>
</tr>
</table>`;
        const styleRowFn = ({ record }) => record.precip > 3
          ? 'dynamic-style: green'
          : '';
        const results = new TableGenerator(weather)
          .styleRow(styleRowFn)
          .filter((obj) => obj.city === 'Chicago')
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('styles the rows well if there is a limit', () => {
        const weather = initializeWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
<tr >
\t<td >2</td>
\t<td >Seattle</td>
\t<td >Dec</td>
\t<td >5.31</td>
</tr>
<tr style="dynamic-style: found;">
\t<td >3</td>
\t<td >New York</td>
\t<td >Apr</td>
\t<td >3.94</td>
</tr>
<tr style="dynamic-style: found;">
\t<td >4</td>
\t<td >New York</td>
\t<td >Aug</td>
\t<td >4.13</td>
</tr>
<tr style="dynamic-style: found;">
\t<td >5</td>
\t<td >New York</td>
\t<td >Dec</td>
\t<td >3.58</td>
</tr>
</table>`;
        const styleRowFn = ({ record }: { record: Record<string, unknown> }) => record.city === "New York"
          ? "dynamic-style: found"
          : "";
        const results = new TableGenerator(weather)
          .styleRow(styleRowFn)
          .limit(6)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('styles the rows well if there is a limit and offset', () => {
        const weather = initializeWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr style="dynamic-style: found;">
\t<td >3</td>
\t<td >New York</td>
\t<td >Apr</td>
\t<td >3.94</td>
</tr>
<tr style="dynamic-style: found;">
\t<td >4</td>
\t<td >New York</td>
\t<td >Aug</td>
\t<td >4.13</td>
</tr>
<tr style="dynamic-style: found;">
\t<td >5</td>
\t<td >New York</td>
\t<td >Dec</td>
\t<td >3.58</td>
</tr>
<tr >
\t<td >6</td>
\t<td >Chicago</td>
\t<td >Apr</td>
\t<td >3.62</td>
</tr>
<tr >
\t<td >8</td>
\t<td >Chicago</td>
\t<td >Dec</td>
\t<td >2.56</td>
</tr>
<tr >
\t<td >7</td>
\t<td >Chicago</td>
\t<td >Aug</td>
\t<td >3.98</td>
</tr>
</table>`;
        const styleRowFn = ({ record }: { record: Record<string, unknown> }) => record.city === "New York"
          ? "dynamic-style: found"
          : "";
        const results = new TableGenerator(weather)
          .styleRow(styleRowFn)
          .limit(6)
          .offset(3)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('styles the rows well if there is only an offset', () => {
        const weather = initializeWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr style="dynamic-style: found;">
\t<td >3</td>
\t<td >New York</td>
\t<td >Apr</td>
\t<td >3.94</td>
</tr>
<tr style="dynamic-style: found;">
\t<td >4</td>
\t<td >New York</td>
\t<td >Aug</td>
\t<td >4.13</td>
</tr>
<tr style="dynamic-style: found;">
\t<td >5</td>
\t<td >New York</td>
\t<td >Dec</td>
\t<td >3.58</td>
</tr>
<tr >
\t<td >6</td>
\t<td >Chicago</td>
\t<td >Apr</td>
\t<td >3.62</td>
</tr>
<tr >
\t<td >8</td>
\t<td >Chicago</td>
\t<td >Dec</td>
\t<td >2.56</td>
</tr>
<tr >
\t<td >7</td>
\t<td >Chicago</td>
\t<td >Aug</td>
\t<td >3.98</td>
</tr>
</table>`;
        const styleRowFn = ({ record }: { record: Record<string, unknown> }) => record.city === "New York"
          ? "dynamic-style: found"
          : "";
        const results = new TableGenerator(weather)
          .styleRow(styleRowFn)
          .offset(3)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
    });
    describe('styleColumn', () => {
      it('can style a column based on the value of the cell', () => {
        const weather = initializeWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td style="background-color:blue;">Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
<tr >
\t<td >2</td>
\t<td >Seattle</td>
\t<td >Dec</td>
\t<td >5.31</td>
</tr>
<tr >
\t<td >3</td>
\t<td >New York</td>
\t<td >Apr</td>
\t<td >3.94</td>
</tr>
<tr >
\t<td >4</td>
\t<td >New York</td>
\t<td style="background-color:blue;">Aug</td>
\t<td >4.13</td>
</tr>
<tr >
\t<td >5</td>
\t<td >New York</td>
\t<td >Dec</td>
\t<td >3.58</td>
</tr>
<tr >
\t<td >6</td>
\t<td >Chicago</td>
\t<td >Apr</td>
\t<td >3.62</td>
</tr>
<tr >
\t<td >8</td>
\t<td >Chicago</td>
\t<td >Dec</td>
\t<td >2.56</td>
</tr>
<tr >
\t<td >7</td>
\t<td >Chicago</td>
\t<td style="background-color:blue;">Aug</td>
\t<td >3.98</td>
</tr>
</table>`;
        const monthFn = spy((value) => value === 'Aug' ? 'background-color:blue' : '');
        const results = new TableGenerator(weather)
          .styleColumn({ month: monthFn })
          .generateHTML();
        //FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('works with styling rows and columns together', () => {
        const weather = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n</tr>
<tr style="font-weight:bold;">\n\t<td style="background-color:blue;">1</td>\n</tr>
<tr style="font-weight:bold;">\n\t<td >2</td>\n</tr>
<tr >\n\t<td >3</td>\n</tr>
</table>`;
        const testFn = spy((value) => value === 1 ? 'background-color:blue' : '');
        const rowFn = spy(({ rowIndex }) => rowIndex < 2 ? 'font-weight:bold' : '');
        const results = new TableGenerator(weather)
          .styleColumn({ id: testFn })
          .styleRow(rowFn as unknown as (ctx: { rowIndex: number; row: unknown[]; record: Record<string, unknown> }) => string)
          .generateHTML();
        
        assertSpyCalls(testFn, 3);
        assertSpyCalls(rowFn, 3);

        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('works with styling cells and columns together', () => {
        const weather = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n</tr>
<tr >\n\t<td style="font-weight:bold; background-color:blue;">1</td>\n</tr>
<tr >\n\t<td style="font-weight:bold;">2</td>\n</tr>
<tr >\n\t<td >3</td>\n</tr>
</table>`;
        const testFn = spy((value) => value === 1 ? 'background-color:blue' : '');
        const cellFn = spy(({ rowIndex }) => rowIndex < 2 ? 'font-weight:bold' : '');
        const results = new TableGenerator(weather)
          .styleColumn({ id: testFn })
          .styleCell(cellFn as unknown as (ctx: { rowIndex: number; columnIndex: number; row: unknown[]; record: Record<string, unknown> }) => string)
          .generateHTML();
        
        assertSpyCalls(testFn, 3);
        assertSpyCalls(cellFn, 3);

        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      describe('fails', () => {
        it('if we call styleColumn with a function', () => {
          const weather = [{ id: 1 }, { id: 2 }];
          const expectedError = 'styleColumn(styleObj): expects an object with properties matching the column LABELs';
          const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n</tr>
<tr >\n\t<td style="background-color:blue;">1</td>\n</tr>
<tr >\n\t<td >2</td>\n</tr>
</table>`;
          const testFn = spy((value) => value === 1 ? 'background-color:blue' : '');
          let results;

          //-- break it
          expect(
            () => {
              results = new TableGenerator(weather)
                .styleColumn(testFn as unknown as Record<string, (v: unknown, c: unknown) => string>)
                .generateHTML();
            }
          ).toThrow(expectedError);

          //-- fix it
          results = new TableGenerator(weather)
            .styleColumn({ id: testFn })
            .generateHTML();
          
          assertSpyCalls(testFn, 2);

          // FileUtil.writeFileStd('./tmp/tmp', results);
          expect(results).toBe(expected);
        });
        it('if we call styleColumn with a null', () => {
          const weather = [{ id: 1 }, { id: 2 }];
          const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n</tr>
<tr >\n\t<td >1</td>\n</tr>
<tr >\n\t<td >2</td>\n</tr>
</table>`;
          const testFn = spy((value) => value === 1 ? 'background-color:blue' : '');
          
          //-- fix it
          const results = new TableGenerator(weather)
            .styleColumn({ id: testFn })
            .styleColumn(null) //-- negates the style
            .generateHTML();
          
          assertSpyCalls(testFn, 0);
          
          // FileUtil.writeFileStd('./tmp/tmp', results);
          expect(results).toBe(expected);
        });
      });

      it('demo in help 1', () => {
        const weather = [
          { reg: 'z', source: 'A', temp: 10 },
          { reg: 'z', source: 'B', temp: 98 },
          { reg: 'z', source: 'A', temp: 100 }
        ];
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>reg</th>
\t<th>source</th>
\t<th>temp</th>
</tr>
<tr >
\t<td >z</td>
\t<td >A</td>
\t<td >10</td>
</tr>
<tr >
\t<td >z</td>
\t<td style="font-weight:bold;">B</td>
\t<td style="background-color:pink;">98</td>
</tr>
<tr >
\t<td >z</td>
\t<td >A</td>
\t<td style="background-color:pink;">100</td>
</tr>
</table>`;
        const results = new TableGenerator(weather)
          .styleColumn({
            //-- we want to make the background color of the color red, if the temp > 50
            temp: (temp: unknown) => (temp as number) > 50 ? "background-color:pink" : "",

            //-- we want to make the source bold if the source is B
            source: (source) => source === 'B' ? 'font-weight:bold' : ''
          })
          .generateHTML();
        
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('demo in help 2', () => {
        const weather = [
          { reg: 'z', source: 'A', tempFormat: 'c', temp: 10 },
          { reg: 'z', source: 'B', tempFormat: 'f', temp: 98 },
          { reg: 'z', source: 'A', tempFormat: 'f', temp: 100 }
        ];
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>reg</th>
\t<th>source</th>
\t<th>tempFormat</th>
\t<th>temp</th>
</tr>
<tr >
\t<td >z</td>
\t<td >A</td>
\t<td >c</td>
\t<td style="background-color:pink;">10</td>
</tr>
<tr >
\t<td >z</td>
\t<td >B</td>
\t<td >f</td>
\t<td style="background-color:pink;">98</td>
</tr>
<tr >
\t<td >z</td>
\t<td >A</td>
\t<td >f</td>
\t<td style="background-color:pink;">100</td>
</tr>
</table>`;
        const convertToKelvin = (temp, format) => {
          if (format === 'k') {
            return temp;
          } else if (format === 'c') {
            return 273.15 + temp;
          } else if (format === 'f') {
            return (459.67 + temp) * (5 / 9);
          }
          return undefined;
        };
        expect(convertToKelvin(50, 'f')).toBeCloseTo(283.15);
        const results = new TableGenerator(weather)
          .styleColumn({
            //-- we want to make the background color of the color red, if the temp > 50
            temp: (temp, { record }) => convertToKelvin(temp, record.tempFormat) > 283
              ? 'background-color:pink'
              : ''
          })
          .generateHTML();
        
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      describe('calling the styleFn', () => {
        it('actually calls the function', () => {
          const weather = [{ id: 1 }, { id: 2 }];
          const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n</tr>
<tr >\n\t<td style="background-color:blue;">1</td>\n</tr>
<tr >\n\t<td >2</td>\n</tr>
</table>`;
          const testFn = spy((value) => value === 1 ? 'background-color:blue' : '');
          const results = new TableGenerator(weather)
            .styleColumn({ id: testFn })
            .generateHTML();
          
          assertSpyCalls(testFn, 2);

          // FileUtil.writeFileStd('./tmp/tmp', results);
          expect(results).toBe(expected);
        });
        it('does not call if no matching property found', () => {
          const weather = [{ id: 1 }, { id: 2 }];
          const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n</tr>
<tr >\n\t<td >1</td>\n</tr>
<tr >\n\t<td >2</td>\n</tr>
</table>`;
          const testFn = spy((value) => value === 'Aug' ? 'background-color:blue' : '');
          const results = new TableGenerator(weather)
            .styleColumn({ month: testFn })
            .generateHTML();
          
          assertSpyCalls(testFn, 0);

          // FileUtil.writeFileStd('./tmp/tmp', results);
          expect(results).toBe(expected);
        });
        it('has the properties expected passed', () => {
          const weather = [{ id: 1 }, { id: 2 }];
          const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n</tr>
<tr >\n\t<td style="background-color:blue;">1</td>\n</tr>
<tr >\n\t<td >2</td>\n</tr>
</table>`;
          const testFn = spy((value) => value === 1 ? 'background-color:blue' : '');
          const results = new TableGenerator(weather)
            .styleColumn({ id: testFn })
            .generateHTML();
          
          assertSpyCalls(testFn, 2);

          const call1 = testFn.calls[0].args as unknown[];
          expect(call1[0]).toEqual(1);
          expect(call1[1]).toMatchObject({
            columnHeader: "id",
            columnIndex: 0,
            record: { id: 1 },
            row: [1],
            rowIndex: 0,
            value: 1
          });

          const call2 = testFn.calls[1].args as unknown[];
          expect(call2[0]).toEqual(2);
          expect(call2[1]).toMatchObject({
            columnHeader: "id",
            columnIndex: 0,
            record: { id: 2 },
            row: [2],
            rowIndex: 1,
            value: 2
          });

          // FileUtil.writeFileStd('./tmp/tmp', results);
          expect(results).toBe(expected);
        });
        it('properties passed with multiple columns', () => {
          const weather = [{ id: 1, label: 'a' }, { id: 2, label: 'b' }];
          const expected = `<table cellspacing="0px" >
<tr >\n\t<th>id</th>\n\t<th>label</th>\n</tr>
<tr >\n\t<td style="background-color:blue;">1</td>\n\t<td >a</td>\n</tr>
<tr >\n\t<td >2</td>\n\t<td >b</td>\n</tr>
</table>`;
          const testFn = spy((value) => value === 1 ? 'background-color:blue' : '');
          const results = new TableGenerator(weather)
            .styleColumn({ id: testFn })
            .generateHTML();
          
          //-- NOT called because it didn't match the property name
          assertSpyCalls(testFn, 2);

          const call1 = testFn.calls[0].args as unknown[];
          expect(call1[0]).toEqual(1);
          expect(call1[1]).toMatchObject({
            columnHeader: "id",
            columnIndex: 0,
            record: { id: 1, label: "a" },
            row: [1, "a"],
            rowIndex: 0,
            value: 1
          });

          const call2 = testFn.calls[1].args as unknown[];
          expect(call2[0]).toEqual(2);
          expect(call2[1]).toMatchObject({
            columnHeader: "id",
            columnIndex: 0,
            record: { id: 2, label: "b" },
            row: [2, "b"],
            rowIndex: 1,
            value: 2
          });

          // FileUtil.writeFileStd('./tmp/tmp', results);
          expect(results).toBe(expected);
        });
      });
    });
    describe('styleCell', () => {
      it('can style the cells with a literal', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td style="dynamic-style: 1;">Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const styleRowFn = ({ rowIndex, columnIndex }) => (rowIndex % 2 === 1 && columnIndex === 1)
          ? `dynamic-style: ${rowIndex}`
          : '';
        const results = new TableGenerator(weather)
          .styleCell(styleRowFn)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('does not duplicate semicolons if provided in styleRow', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td style="dynamic-style: 1;">Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const styleRowFn = ({ rowIndex, columnIndex }) => (rowIndex % 2 === 1 && columnIndex === 1)
          ? `dynamic-style: ${rowIndex};`
          : '';
        const results = new TableGenerator(weather)
          .styleCell(styleRowFn)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('clears the style if styleCell is null', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const styleRowFn = ({ rowIndex, columnIndex }) => (rowIndex % 2 === 1 && columnIndex === 1)
          ? `dynamic-style: ${rowIndex}`
          : '';
        const results = new TableGenerator(weather)
          .styleCell(styleRowFn)
          .styleCell(null)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
    });
    describe('border', () => {
      it('adds a border AND styleRow', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td style="border: 1px solid #aaa;">1</td>
\t<td style="border: 1px solid #aaa;">Seattle</td>
\t<td style="border: 1px solid #aaa;">Aug</td>
\t<td style="border: 1px solid #aaa;">0.87</td>
</tr>
<tr >
\t<td style="border: 1px solid #aaa;">0</td>
\t<td style="border: 1px solid #aaa; dynamic-style: 1;">Seattle</td>
\t<td style="border: 1px solid #aaa;">Apr</td>
\t<td style="border: 1px solid #aaa;">2.68</td>
</tr>
</table>`;
        const styleRowFn = ({ rowIndex, columnIndex }) => (rowIndex % 2 === 1 && columnIndex === 1)
          ? `dynamic-style: ${rowIndex}`
          : '';
        const borderCSS = true;
        const results = new TableGenerator(weather)
          .styleCell(styleRowFn)
          .border(borderCSS)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('adds a border with true', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td style="border: 1px solid #aaa;">1</td>
\t<td style="border: 1px solid #aaa;">Seattle</td>
\t<td style="border: 1px solid #aaa;">Aug</td>
\t<td style="border: 1px solid #aaa;">0.87</td>
</tr>
<tr >
\t<td style="border: 1px solid #aaa;">0</td>
\t<td style="border: 1px solid #aaa;">Seattle</td>
\t<td style="border: 1px solid #aaa;">Apr</td>
\t<td style="border: 1px solid #aaa;">2.68</td>
</tr>
</table>`;
        const borderCSS = true;
        const results = new TableGenerator(weather)
          .border(borderCSS)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('adds a border with explicit css', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td style="border: 2px dotted blue;">1</td>
\t<td style="border: 2px dotted blue;">Seattle</td>
\t<td style="border: 2px dotted blue;">Aug</td>
\t<td style="border: 2px dotted blue;">0.87</td>
</tr>
<tr >
\t<td style="border: 2px dotted blue;">0</td>
\t<td style="border: 2px dotted blue;">Seattle</td>
\t<td style="border: 2px dotted blue;">Apr</td>
\t<td style="border: 2px dotted blue;">2.68</td>
</tr>
</table>`;
        const borderCSS = '2px dotted blue';
        const results = new TableGenerator(weather)
          .border(borderCSS)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('can clear the border', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const borderCSS = '2px dotted blue';
        const results = new TableGenerator(weather)
          .border(borderCSS)
          .border(null)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
    });
    
    describe('augment', () => {
      it('can augment additional columns', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>precip</th>
\t<th>month</th>
\t<th>fullMonth</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >0.87</td>
\t<td >Aug</td>
\t<td >August</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >2.68</td>
\t<td >Apr</td>
\t<td >April</td>
</tr>
</table>`;
        const monthMap = new Map([['Apr', 'April'], ['Dec', 'December'], ['Aug', 'August']]);
        const results = new TableGenerator(weather)
          .augment(({ fullMonth: (row) => monthMap.get(row.month as string) }))
          .columns(['id', 'city', 'precip', 'month', 'fullMonth'])
          .generateHTML();
        //FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });
      it('clears the format if we send a null formatter', () => {
        const weather = initializeSmallWeather();
        const expected = `<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>`;
        const results = new TableGenerator(weather)
          .augment(null)
          .generateHTML();
        // FileUtil.writeFileStd('./tmp/tmp', results);
        expect(results).toBe(expected);
      });

      it('throws an error if a function was sent to the augment', () => {
        const weather = initializeSmallWeather();
        expect(() => new TableGenerator(weather)
          .augment(((() => {}) as unknown as Record<string, (r: Record<string, unknown>) => unknown>))
          .generateHTML()).toThrow();
      });
    });
  });
  describe('generateMarkdown', () => {
    it('can render csv', () => {
      const weather = initializeWeather().slice(0, 2);
      const expected = 'id|city   \n--|--     \n1 |Seattle\n0 |Seattle';
      const results = new TableGenerator(weather)
        .columns('id', 'city')
        .generateMarkdown({ align: true });
      expect(results).toBeTruthy();
      expect(results).toBe(expected);
    });
    it('can render as default', () => {
      const weather = initializeWeather().slice(0, 2);
      const expected = 'id|city   |month\n--|--     |--   \n1 |Seattle|Aug  \n0 |Seattle|Apr  ';
      const results = new TableGenerator(weather)
        .columns('id', 'city', 'month')
        .generateMarkdown();
      expect(results).toBeTruthy();
      expect(results).toBe(expected);
    });
    it('can render csv not unified', () => {
      const weather = initializeWeather().slice(0, 2);
      const expected = 'id|city|month\n--|--|--\n1|Seattle|Aug\n0|Seattle|Apr';
      const results = new TableGenerator(weather)
        .columns('id', 'city', 'month')
        .generateMarkdown({ align: false });
      expect(results).toBeTruthy();
      expect(results).toBe(expected);
    });
  });
  describe('generateCSV', () => {
    it('can render csv', () => {
      const weather = initializeWeather().slice(0, 2);
      const expected = '"id","city","month"\n"1","Seattle","Aug"\n"0","Seattle","Apr"';
      const results = new TableGenerator(weather)
        .columns('id', 'city', 'month')
        .generateCSV();
      // console.log(JSON.stringify(results));
      // console.log(results);
      expect(results).toBeTruthy();
      expect(results).toBe(expected);
    });
  });
  describe('generateTSV', () => {
    it('can render tsv', () => {
      const weather = initializeWeather().slice(0, 2);
      //eslint-disable-next-line quotes
      const expected = `"id"\t"city"\t"month"\n"1"\t"Seattle"\t"Aug"\n"0"\t"Seattle"\t"Apr"`;
      const results = new TableGenerator(weather)
        .columns('id', 'city', 'month')
        .generateTSV();
      // console.log(JSON.stringify(results));
      // console.log(results);
      expect(results).toBeTruthy();
      expect(results).toBe(expected);
    });
    it('can render tsv', () => {
      const weather = initializeWeather().slice(0, 2)
        .map((r) => ({ ...r, badText: 'He said "what?"' }));
      //eslint-disable-next-line quotes
      const expected = `"id"\t"city"\t"month"\t"Bad ""Text"
"1"\t"Seattle"\t"Aug"\t"He said ""what?"""
"0"\t"Seattle"\t"Apr"\t"He said ""what?"""`;
      const results = new TableGenerator(weather)
        .columns('id', 'city', 'month', 'badText')
        .labels({ badText: 'Bad "Text' })
        .generateTSV();
      // console.log(JSON.stringify(results));
      // console.log(results);
      expect(results).toBeTruthy();
      expect(results).toBe(expected);
    });
  });
  describe('generateArray', () => {
    it('can prepare a table without any arguments', () => {
      const weather = initializeWeather();
      const expected = ({
        headers: ['id', 'city', 'month', 'precip'],
        data: [
          [1, 'Seattle',  'Aug', 0.87],
          [0, 'Seattle',  'Apr', 2.68],
          [2, 'Seattle',  'Dec', 5.31],
          [3, 'New York', 'Apr', 3.94],
          [4, 'New York', 'Aug', 4.13],
          [5, 'New York', 'Dec', 3.58],
          [6, 'Chicago',  'Apr', 3.62],
          [8, 'Chicago',  'Dec', 2.56],
          [7, 'Chicago',  'Aug', 3.98]
        ] });
      const results = new TableGenerator(weather)
        .generateArray();
      expect(results.headers).toStrictEqual(expected.headers);
      expect(results.data).toStrictEqual(expected.data);
    });
  });
  describe("generateArray2", () => {
    it("can prepare a table without any arguments", () => {
      const weather = initializeWeather();
      const expected = [
        ["id", "city", "month", "precip"],
        [1, "Seattle", "Aug", 0.87],
        [0, "Seattle", "Apr", 2.68],
        [2, "Seattle", "Dec", 5.31],
        [3, "New York", "Apr", 3.94],
        [4, "New York", "Aug", 4.13],
        [5, "New York", "Dec", 3.58],
        [6, "Chicago", "Apr", 3.62],
        [8, "Chicago", "Dec", 2.56],
        [7, "Chicago", "Aug", 3.98]
      ];
      const results = new TableGenerator(weather).generateArray2();
      expect(results).toStrictEqual(expected);
    });
  });

  describe('generateObjectCollection', () => {
    it('can generate a list of objects if given proper data', () => {
      const weather = initializeWeather();
      const expected = [
        { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
        { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
        { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 },
        { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
        { id: 4, city: 'New York', month: 'Aug', precip: 4.13 },
        { id: 5, city: 'New York', month: 'Dec', precip: 3.58 },
        { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 },
        { id: 8, city: 'Chicago',  month: 'Dec', precip: 2.56 },
        { id: 7, city: 'Chicago',  month: 'Aug', precip: 3.98 }
      ];
      const results = new TableGenerator(weather)
        .generateObjectCollection();
      expect(results).toStrictEqual(expected);
    });
    it('doesnt throw an error on an empty set', () => {
      const weather = null;
      const expected = [
      ];
      const results = new TableGenerator(weather)
        .generateObjectCollection();
      expect(results).toStrictEqual(expected);
    });
  });

  describe('generateDataFrame', () => {
    it('can generate a dataFrame Object if given proper data', () => {
      const weather = initializeWeather();
      const expected = {
        id: [
          1, 0, 2, 3, 4,
          5, 6, 8, 7
        ],
        city: [
          'Seattle',  'Seattle',
          'Seattle',  'New York',
          'New York', 'New York',
          'Chicago',  'Chicago',
          'Chicago'
        ],
        month: [
          'Aug', 'Apr',
          'Dec', 'Apr',
          'Aug', 'Dec',
          'Apr', 'Dec',
          'Aug'
        ],
        precip: [
          0.87, 2.68, 5.31,
          3.94, 4.13, 3.58,
          3.62, 2.56, 3.98
        ]
      };
      const results = new TableGenerator(weather)
        .generateDataFrameObject();
      expect(results).toStrictEqual(expected);
    });
    it('doesnt throw an error on an empty set', () => {
      const weather = null;
      const expected = {
      };
      const results = new TableGenerator(weather)
        .generateDataFrameObject();
      expect(results).toStrictEqual(expected);
    });
  });

  describe("ijs aware", () => {
    const OLD_CONSOLE = globalThis.console;
    let mockConsole: { log: Spy<unknown, unknown[], unknown>; error: Spy<unknown, unknown[], unknown>; warn: Spy<unknown, unknown[], unknown> };
    beforeEach(() => {
      const createNewDisplay = (name?: string) => {
        const valueFn = (value: unknown) => `display:${name}:${value}`;
        return {
          async: () => {},
          text: valueFn,
          png: valueFn,
          svg: valueFn,
          html: valueFn,
          jpg: valueFn,
          mime: valueFn,
          sendResults: valueFn
        };
      };
      mockConsole = {
        log: spy(),
        error: spy(),
        warn: spy()
      };
      const newContext = {
        ...createNewDisplay(),
        createDisplay: createNewDisplay,
        sendResult: () => {}
      };
      (globalThis as unknown as { $$?: unknown }).$$ = newContext;
      (globalThis as unknown as { console: unknown }).console = { ...OLD_CONSOLE, ...mockConsole };
    });
    afterEach(() => {
      delete (globalThis as unknown as { $$?: unknown }).$$;
    });
    afterAll(() => {
      (globalThis as unknown as { console: unknown }).console = OLD_CONSOLE;
    });
    describe("render", () => {
      it("has ijs context by default", () => {
        expect((globalThis as unknown as { $$?: { html: unknown } }).$$).toBeTruthy();
        expect((globalThis as unknown as { $$?: { html: unknown } }).$$?.html).toBeTruthy();
      });
      it("throws an error if not in IJS", () => {
        delete (globalThis as unknown as { $$?: unknown }).$$;
        const data = initializeSmallWeather();
        const instance = new TableGenerator(data);
        
        expect(() => instance.render()).toThrow();
      });
      it('can render a table with a default height', () => {
        const htmlSpy = spy((globalThis as { $$?: { html: (s: string) => void } }).$$!, "html");
        const data = initializeSmallWeather();
        new TableGenerator(data)
          .render();
        
        assertSpyCalls(htmlSpy, 1);

        const results = htmlSpy.calls[0].args[0];
        // FileUtil.writeFileStd('./tmp/tmp', results);

        expect(results).toContain('<div class="sticky-table" style="max-height: 50vh">');
      });
      it('can render a table with a custom 50px height', () => {
        const htmlSpy = spy((globalThis as { $$?: { html: (s: string) => void } }).$$!, "html");
        const data = initializeSmallWeather();
        new TableGenerator(data)
          .height('50px')
          .render();
        
        assertSpyCalls(htmlSpy, 1);

        const results = htmlSpy.calls[0].args[0];
        // FileUtil.writeFileStd('./tmp/tmp', results);

        expect(results).toContain('<div class="sticky-table" style="max-height: 50px">');
      });
      it('can render a table with a custom 100vh height', () => {
        const htmlSpy = spy((globalThis as { $$?: { html: (s: string) => void } }).$$!, "html");
        const data = initializeSmallWeather();
        new TableGenerator(data)
          .height('100vh')
          .render();
        
        assertSpyCalls(htmlSpy, 1);

        const results = htmlSpy.calls[0].args[0];
        // FileUtil.writeFileStd('./tmp/tmp', results);

        expect(results).toContain('<div class="sticky-table" style="max-height: 100vh">');
      });
      it('can render a result without error', () => {
        const htmlSpy = spy((globalThis as { $$?: { html: (s: string) => void } }).$$!, "html");
        const data = initializeSmallWeather();
        new TableGenerator(data)
          .render();
        
        assertSpyCalls(htmlSpy, 1);
        const expected = `<span class="sticky-table-marker" ></span>
<style type='text/css'>
.sticky-table table { text-align: left; position: relative; border-collapse: collapse; }
.sticky-table td { border: 1px solid #cccccc; }
.sticky-table th { background: #676c87; color: white; position: sticky; top: 0; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4); }
</style>
<div class="sticky-table" style="max-height: 50vh">
<table cellspacing="0px" >
<tr >
\t<th>id</th>
\t<th>city</th>
\t<th>month</th>
\t<th>precip</th>
</tr>
<tr >
\t<td >1</td>
\t<td >Seattle</td>
\t<td >Aug</td>
\t<td >0.87</td>
</tr>
<tr >
\t<td >0</td>
\t<td >Seattle</td>
\t<td >Apr</td>
\t<td >2.68</td>
</tr>
</table>
</div>`;
        const results = htmlSpy.calls[0].args[0];
        // FileUtil.writeFileStd('./tmp/tmp', results);

        expect(results).toBe(expected);
      });
    });

    describe('renderMarkdown', () => {
      it('has ijs context by default', () => {
        expect((globalThis as unknown as { $$?: { html: unknown } }).$$).toBeTruthy();
        expect((globalThis as unknown as { $$?: { html: unknown } }).$$?.html).toBeTruthy();
      });
      it("renderMarkdown does not require IJS (uses console.log)", () => {
        const data = initializeSmallWeather();
        const instance = new TableGenerator(data);
        expect(() => instance.renderMarkdown()).not.toThrow();
      });
      it("can render a result without error", () => {
        const data = initializeSmallWeather();
        new TableGenerator(data).renderMarkdown();
        assertSpyCalls(mockConsole.log, 1);
        const expected = `id|city   |month|precip
--|--     |--   |--    
1 |Seattle|Aug  |0.87  
0 |Seattle|Apr  |2.68  `;
        const results = mockConsole.log.calls[0].args[0];
        expect(results).toBe(expected);
      });
    });

    describe("renderCSV", () => {
      it("has ijs context by default", () => {
        expect((globalThis as unknown as { $$?: unknown }).$$).toBeTruthy();
      });
      it("renderCSV does not require IJS (uses console.log)", () => {
        const data = initializeSmallWeather();
        const instance = new TableGenerator(data);
        expect(() => instance.renderCSV()).not.toThrow();
      });
      it("can render a result without error", () => {
        const data = initializeSmallWeather();
        new TableGenerator(data).renderCSV();
        assertSpyCalls(mockConsole.log, 1);
        const expected = `"id","city","month","precip"
"1","Seattle","Aug","0.87"
"0","Seattle","Apr","2.68"`;
        const results = mockConsole.log.calls[0].args[0];
        expect(results).toBe(expected);
      });
    });

    describe("renderTSV", () => {
      it("has ijs context by default", () => {
        expect((globalThis as unknown as { $$?: unknown }).$$).toBeTruthy();
      });
      it("renderTSV does not require IJS (uses console.log)", () => {
        const data = initializeSmallWeather();
        const instance = new TableGenerator(data);
        expect(() => instance.renderTSV()).not.toThrow();
      });
      it("can render a result without error", () => {
        const data = initializeSmallWeather().map((r) => ({ ...r, badText: 'he said "what?"' }));
        new TableGenerator(data).labels({ badText: 'bad "text' }).renderTSV();
        assertSpyCalls(mockConsole.log, 1);
        const expected = `"id"\t"city"\t"month"\t"precip"\t"bad ""text"
"1"\t"Seattle"\t"Aug"\t"0.87"\t"he said ""what?"""
"0"\t"Seattle"\t"Apr"\t"2.68"\t"he said ""what?"""`;
        const results = mockConsole.log.calls[0].args[0];
        expect(results).toBe(expected);
      });
      it("can render an object without error", () => {
        const data = initializeSmallWeather().map((r) => ({ ...r, obj: { first: "name" } }));
        new TableGenerator(data).renderTSV();
        assertSpyCalls(mockConsole.log, 1);
        const expected = `"id"\t"city"\t"month"\t"precip"\t"obj"
"1"\t"Seattle"\t"Aug"\t"0.87"\t"{""first"":""name""}"
"0"\t"Seattle"\t"Apr"\t"2.68"\t"{""first"":""name""}"`;
        const results = mockConsole.log.calls[0].args[0];
        expect(results).toBe(expected);
      });
    });
  });

  describe('newTable', () => {
    const weather = initializeWeather();
    const expected = {
      headers: ["id", "city", "month", "precip"],
      data: [
        [1, "Seattle", "Aug", 0.87],
        [0, "Seattle", "Apr", 2.68],
        [2, "Seattle", "Dec", 5.31],
        [3, "New York", "Apr", 3.94],
        [4, "New York", "Aug", 4.13],
        [5, "New York", "Dec", 3.58],
        [6, "Chicago", "Apr", 3.62],
        [8, "Chicago", "Dec", 2.56],
        [7, "Chicago", "Aug", 3.98]
      ]
    };
    const results = _newTable(weather);
    const prep = results.prepare();
    expect(prep.headers).toStrictEqual(expected.headers);
    expect(prep.data).toStrictEqual(expected.data);
  })
});
