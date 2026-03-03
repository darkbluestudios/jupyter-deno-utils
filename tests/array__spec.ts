import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import ArrayUtils from "../src/array.ts";

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

const idMap = (weather: WeatherRow[]) => weather.map((r) => r.id);

describe('ArrayUtils', () => {
  describe('createSort', () => {
    it('should sort ascending by default', () => {
      const weatherToSort = initializeWeather();
      const sortFn = ArrayUtils.createSort('id');
      const sortedWeather = weatherToSort.sort(sortFn);
      const resultIds = idMap(sortedWeather);
      const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      expect(resultIds).toEqual(expected);
    });

    it('can sort with equivalent values', () => {
      const valuesToSort = [1, 0, 2, 3, 4, 5, 6, 8, 7];
      const sortFn = ArrayUtils.createSort('-');

      //-- duplicate some values
      valuesToSort.push(4);
      valuesToSort.push(6);

      const expected = [8, 7, 6, 6, 5, 4, 4, 3, 2, 1, 0];
      const results = valuesToSort.sort(sortFn);

      expect(results).toEqual(expected);
    });
    
    it('should sort descending with -', () => {
      const weatherToSort = initializeWeather();
      const sortFn = ArrayUtils.createSort('-id');
      const sortedWeather = weatherToSort.sort(sortFn);
      const resultIds = idMap(sortedWeather);
      const expected = [8, 7, 6, 5, 4, 3, 2, 1, 0];
      expect(resultIds).toEqual(expected);
    });

    it('can mix ascending', () => {
      const weatherToSort = initializeWeather();
      const sortFn = ArrayUtils.createSort('city', '-precip');
      const sortedWeather = weatherToSort.sort(sortFn);
      const resultIds = idMap(sortedWeather);
      const expected = [7, 6, 8, 4, 3, 5, 2, 0, 1];
      expect(resultIds).toEqual(expected);
    });

    it('can sort by ascending by default', () => {
      const weatherValues = initializeWeather().map((r) => r.precip);
      const expected = [ 0.87, 2.56, 2.68, 3.58, 3.62, 3.94, 3.98, 4.13, 5.31 ];
      const results = weatherValues.sort(ArrayUtils.createSort());
      expect(results).toEqual(expected);
    });

    it('can sort by ascending with an empty argument', () => {
      const weatherValues = initializeWeather().map((r) => r.precip);
      const expected = [ 0.87, 2.56, 2.68, 3.58, 3.62, 3.94, 3.98, 4.13, 5.31 ];
      const results = weatherValues.sort(ArrayUtils.createSort(null as unknown as string));
      expect(results).toEqual(expected);
    });

    it('can sort descending with an - sent', () => {
      const weatherValues = initializeWeather().map((r) => r.precip);
      const expected = [5.31, 4.13, 3.98, 3.94, 3.62, 3.58, 2.68, 2.56, 0.87];
      const results = weatherValues.sort(ArrayUtils.createSort('-'));
      expect(results).toEqual(expected);
    });

    it('does not sort anything with a null sortFn', () => {
      const weatherValues = initializeWeather();
      const expected = initializeWeather().sort(ArrayUtils.createSort('city'));
      const results = weatherValues.sort(ArrayUtils.createSort('city', null as unknown as string));
      expect(results).toEqual(expected);
    });
  });

  describe('peekFirst', () => {
    it('finds the first item in an array', () => {
      const data = [0, 1, 2, 3];
      const expected = 0;
      const results = ArrayUtils.peekFirst(data);
      expect(results).toEqual(expected);
    });
    it('finds the only item if the array has one item', () => {
      const data = [99];
      const expected = 99;
      const results = ArrayUtils.peekFirst(data);
      expect(results).toEqual(expected);
    });
    it('finds null if the array is empty', () => {
      const data: unknown[] = [];
      const expected = null;
      const results = ArrayUtils.peekFirst(data);
      expect(results).toEqual(expected);
    });
    it('finds null if the array is not an array', () => {
      const data = { obj: 'ect' };
      const expected = null;
      const results = ArrayUtils.peekFirst(data as unknown as unknown[]);
      expect(results).toEqual(expected);
    });
  });

  describe('peekLast', () => {
    it('finds the last item in an array', () => {
      const data = [0, 1, 2, 3];
      const expected = 3;
      const results = ArrayUtils.peekLast(data);
      expect(results).toEqual(expected);
    });
    it('finds the only item if the array has one item', () => {
      const data = [99];
      const expected = 99;
      const results = ArrayUtils.peekLast(data);
      expect(results).toEqual(expected);
    });
    it('finds null if the array is empty', () => {
      const data: unknown[] = [];
      const expected = null;
      const results = ArrayUtils.peekLast(data);
      expect(results).toEqual(expected);
    });
    it('finds null if the array is not an array', () => {
      const data = { obj: 'ect' };
      const expected = null;
      const results = ArrayUtils.peekLast(data as unknown as unknown[]);
      expect(results).toEqual(expected);
    });
  });

  describe('pickRows', () => {
    describe('can pick from an array', () => {
      it('with array of multiple rows', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        const rows = [0, 1];

        const expected = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red']
        ];

        const results = ArrayUtils.pickRows(data, rows);
        expect(results).toEqual(expected);
      });
      it('with params of multiple rows', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        // const rows = [0, 1];

        const expected = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red']
        ];

        const results = ArrayUtils.pickRows(data, 0, 1);
        expect(results).toEqual(expected);
      });
      it('with array of single row', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        const rows = [0];

        const expected = [
          ['john', 23, 'purple']
        ];

        const results = ArrayUtils.pickRows(data, rows);
        expect(results).toEqual(expected);
      });
      it('with params of single row', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        // const rows = [0, 1];

        const expected = [
          ['john', 23, 'purple']
        ];

        const results = ArrayUtils.pickRows(data, 0);
        expect(results).toEqual(expected);
      });
    });
  });

  describe('pick columns', () => {
    describe('can pick from an array', () => {
      it('with array of multiple columns', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        const columns = [0, 1];

        const expected = [
          ['john', 23],
          ['jane', 32],
          ['ringo', 27]
        ];

        const results = ArrayUtils.pickColumns(data, columns);
        expect(results).toEqual(expected);
      });
      it('with params of multiple columns', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        // const columns = [0, 1];

        const expected = [
          ['john', 23],
          ['jane', 32],
          ['ringo', 27]
        ];

        const results = ArrayUtils.pickColumns(data, 0, 1);
        expect(results).toEqual(expected);
      });
      it('with array of single column', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        const columns = [0];

        const expected = [
          ['john'],
          ['jane'],
          ['ringo']
        ];

        const results = ArrayUtils.pickColumns(data, columns);
        expect(results).toEqual(expected);
      });
      it('with params of single column', () => {
        const data = [
          ['john', 23, 'purple'],
          ['jane', 32, 'red'],
          ['ringo', 27, 'green']
        ];
  
        // const columns = [0, 1];

        const expected = [
          ['john'],
          ['jane'],
          ['ringo']
        ];

        const results = ArrayUtils.pickColumns(data, 0);
        expect(results).toEqual(expected);
      });
    });
  });

  describe('pick', () => {
    it('pick rows', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const rows = [0, 1];

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red']
      ];

      const results = ArrayUtils.pick(data, { rows });
      expect(results).toEqual(expected);
    });
    it('pick columns', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const columns = [0, 1];

      const expected = [
        ['john', 23],
        ['jane', 32],
        ['ringo', 27]
      ];

      const results = ArrayUtils.pick(data, { columns });
      expect(results).toEqual(expected);
    });
    it('pick both', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const rows = [0, 1];
      const columns = [0, 1];

      const expected = [
        ['john', 23],
        ['jane', 32]
      ];

      const results = ArrayUtils.pick(data, { rows, columns });
      expect(results).toEqual(expected);
    });
    it('pick with null options returns the whole array', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const rows = null;
      const columns = null;

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const results = ArrayUtils.pick(data, { rows, columns });
      expect(results).toEqual(expected);
    });
    it('pick with neither option returns the whole array', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const results = ArrayUtils.pick(data, {});
      expect(results).toEqual(expected);
    });
    it('pick without any option returns the whole array', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const results = ArrayUtils.pick(data);
      expect(results).toEqual(expected);
    });
  });

  describe('size', () => {
    it('creates', () => {
      const expected = [undefined, undefined, undefined, undefined, undefined];
      const results = ArrayUtils.size(5);
      expect(results).toStrictEqual(expected);
    });
    it('creates with null', () => {
      const expected = [null, null, null, null, null];
      const results = ArrayUtils.size(5, null);
      expect(results).toStrictEqual(expected);
    });
    it('creates with a function', () => {
      const expected = [2, 2, 2];
      const results = ArrayUtils.size(3, () => 2);
      expect(results).toStrictEqual(expected);
    });
    it('creates with a function with an index', () => {
      const expected = [0, 1, 2];
      const results = ArrayUtils.size(3, (i: number) => i);
      expect(results).toStrictEqual(expected);
    });
  });

  describe('arange', () => {
    it('can work instead of a for loop', () => {
      const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const results = ArrayUtils.arange(10);
      const resultsCaptured: number[] = [];
      results.forEach((val) => resultsCaptured.push(val));
      expect(results).toStrictEqual(expected);
      expect(resultsCaptured).toStrictEqual(results);
    });
    it('works from 110 to 115', () => {
      const expected = [110, 111, 112, 113, 114];
      const results = ArrayUtils.arange(5, 110);
      expect(results).toStrictEqual(expected);
    });
    it('can count by fives', () => {
      const expected = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
        55, 60, 65, 70, 75, 80, 85, 90, 95
      ];
      const results = ArrayUtils.arange(20, 0, 5);
      expect(results).toStrictEqual(expected);
    });
  });

  describe('isMultiDimensional', () => {
    describe('is', () => {
      it('if sent a two dimensional array', () => {
        const testValue = [[0, 1], [2, 3]];
        const expected = true;
        const result = ArrayUtils.isMultiDimensional(testValue);
        expect(result).toBe(expected);
      });
      it('if sent a semi two dimensional array', () => {
        const testValue = [0, 1, [2, 3]];
        const expected = true;
        const result = ArrayUtils.isMultiDimensional(testValue);
        expect(result).toBe(expected);
      });
    });
    describe('is not', () => {
      it('if sent a non array', () => {
        const testValue = 0;
        const expected = false;
        const result = ArrayUtils.isMultiDimensional(testValue);
        expect(result).toBe(expected);
      });
      it('if sent undefined', () => {
        const testValue = undefined;
        const expected = false;
        const result = ArrayUtils.isMultiDimensional(testValue);
        expect(result).toBe(expected);
      });
      it('if sent null', () => {
        const testValue = null;
        const expected = false;
        const result = ArrayUtils.isMultiDimensional(testValue);
        expect(result).toBe(expected);
      });
    });
  });

  describe('arrayLength2d', () => {
    describe('has a length of zero', () => {
      it('if the target array is not an array', () => {
        const testValue = null as unknown as unknown[][];
        const expected = 0;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('if the target array is an empty array', () => {
        const testValue: unknown[][] = [];
        const expected = 0;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('if the target array is an empty 2d array', () => {
        const testValue: unknown[][] = [[]];
        const expected = 0;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('if the target array is an mixed 2d array', () => {
        const testValue = [23, []] as unknown as unknown[][];
        const expected = 0;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
    });
    describe('longest length', () => {
      it('in mixed array 1', () => {
        const testValue = [23, [1]] as unknown as unknown[][];
        const expected = 1;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('in mixed array 2', () => {
        const testValue = [23, [1, 2]] as unknown as unknown[][];
        const expected = 2;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('in same sized arrays', () => {
        const testValue = [[1, 2], [3, 4]];
        const expected = 2;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('in different sized arrays', () => {
        const testValue = [[1, 2, 3], [4, 5]];
        const expected = 3;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('in different sized arrays 2', () => {
        const testValue = [[1, 2], [3, 4, 5]];
        const expected = 3;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('in different sized arrays with empty', () => {
        const testValue = [[1, 2], [], [3, 4, 5]];
        const expected = 3;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
      it('in different sized arrays with null', () => {
        const testValue = [[1, 2], null, [3, 4, 5]] as unknown as unknown[][];
        const expected = 3;
        const results = ArrayUtils.arrayLength2d(testValue);
        expect(results).toBe(expected);
      });
    });
  });

  describe('transpose', () => {
    it('transposes a 3x3 matrix', () => {
      const expected = [[0, 3, 6],
        [1, 4, 7],
        [2, 5, 8]];
      const matrix = [[0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
    it('transposes a 3x4 matrix', () => {
      const expected = [
        [0, 4, 8],
        [1, 5, 9],
        [2, 6, 10],
        [3, 7, 11]
      ];
      const matrix = [[0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11]];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
    it('transposes a 4x3 matrix', () => {
      const expected = [[0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11]
      ];
      const matrix = [
        [0, 4, 8],
        [1, 5, 9],
        [2, 6, 10],
        [3, 7, 11]
      ];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
    it('transposes a mixed matrix', () => {
      const expected = [
        [undefined, 0, 3, 6],
        [undefined, 1, 4, 7],
        [undefined, 2, 5, 8]];
      const matrix = [[],
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
    it('transposes a mixed matrix with null', () => {
      const expected = [
        [0, undefined, 3, 6],
        [1, undefined, 4, 7],
        [2, undefined, 5, 8]
      ];
      const matrix = [
        [0, 1, 2],
        [],
        [3, 4, 5],
        [6, 7, 8]];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
    it('does not transpose an empty array', () => {
      const expected: unknown[][] = [];
      const matrix = null as unknown as unknown[][];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
    it('transposes a 1d array', () => {
      const expected = [[0], [1], [2], [3], [4]];
      const matrix = [0, 1, 2, 3, 4];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
    it('transposes a 1d vertical array', () => {
      const expected = [[0, 1, 2, 3, 4]];
      const matrix = [[0], [1], [2], [3], [4]];
      const result = ArrayUtils.transpose(matrix);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('reshape', () => {
    it('can reshape a 1 dimensional array into columns', () => {
      const source = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const expected = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const results = ArrayUtils.reshape(source, 3);
      expect(results).toStrictEqual(expected);
    });
    it('can reshape even if the columns are not exact', () => {
      const source = [1, 2, 3, 4, 5, 6, 7, 8];
      const expected = [[1, 2, 3], [4, 5, 6], [7, 8]];
      const results = ArrayUtils.reshape(source, 3);
      expect(results).toStrictEqual(expected);
    });
    it('can reshape even if the source is empty', () => {
      const source: unknown[] = [];
      const expected = [[]];
      const results = ArrayUtils.reshape(source, 3);
      expect(results).toStrictEqual(expected);
    });
  });

  describe('clone', () => {
    describe('can clone', () => {
      it('literal value 2', () => {
        const targetValue = 2;
        const expectedValue = 2;
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('[]', () => {
        const targetValue = [];
        const expectedValue = [];
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('[2]', () => {
        const targetValue = [2];
        const expectedValue = [2];
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('[2, 4, 5]', () => {
        const targetValue = [2, 4, 5];
        const expectedValue = [2, 4, 5];
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('[[0, 1, 2], [3, 4, 5]]', () => {
        const targetValue = [[0, 1, 2], [3, 4, 5]];
        const expectedValue = [[0, 1, 2], [3, 4, 5]];
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('2', () => {
        const targetValue = '2';
        const expectedValue = '2';
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('["2"]', () => {
        const targetValue = ['2'];
        const expectedValue = ['2'];
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('["2", "4", "5"]', () => {
        const targetValue = ['2', '4', '5'];
        const expectedValue = ['2', '4', '5'];
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
      it('[["0", "1", "2"], ["3", "4", "5"]]', () => {
        const targetValue = [['0', '1', '2'], ['3', '4', '5']];
        const expectedValue = [['0', '1', '2'], ['3', '4', '5']];
        const result = ArrayUtils.clone(targetValue);
        expect(result).toEqual(expectedValue);
      });
    });
  });

  describe('arangeMulti', () => {
    it('can arrange a zero dimension cube', () => {
      const args = [];
      const expected = [];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('can arrange a 1 dimension cube: 0', () => {
      const args = [0];
      const expected = [];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('can arrange a 1 dimension cube: 2', () => {
      const args = [2];
      const expected = [0, 1];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('can arrange a 1 dimension cube: 4', () => {
      const args = [4];
      const expected = [0, 1, 2, 3];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('can arrange a 2 dimension cube: 2,2', () => {
      const args = [2, 2];
      const expected = [[0, 1], [0, 1]];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('can arrange a 2 dimension cube: 2,4', () => {
      const args = [2, 4];
      const expected = [[0, 1, 2, 3], [0, 1, 2, 3]];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('can arrange a 3 dimension cube: 2,2,2', () => {
      const args = [2, 2, 2];
      const expected = [[[0, 1], [0, 1]], [[0, 1], [0, 1]]];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('can arrange a 3 dimension cube: 2, 2,4', () => {
      const args = [2, 2, 4];
      const expected = [[[0, 1, 2, 3], [0, 1, 2, 3]], [[0, 1, 2, 3], [0, 1, 2, 3]]];
      const results = ArrayUtils.arrangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
    it('arrange is synonym of arrange', () => {
      const args = [2, 2, 4];
      const expected = [[[0, 1, 2, 3], [0, 1, 2, 3]], [[0, 1, 2, 3], [0, 1, 2, 3]]];
      const results = ArrayUtils.arangeMulti.apply(this, args);
      expect(results).toEqual(expected);
    });
  });

  describe('indexify', () => {
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
    
    const isHeader1 = (entry: unknown) => (entry as string).startsWith('# ');
    const isHeader2 = (entry: unknown) => (entry as string).startsWith('## ');

    describe('can index', () => {
      it('A list without indexers', () => {
        const source = complexMarkdown;
        const expected = [
          { entry: 'Heading', section: [], subIndex: 1 },
          { entry: '# Overview', section: [], subIndex: 2 },
          {
            entry: 'This entire list is a hierarchy of data.',
            section: [],
            subIndex: 3
          },
          { entry: '# Section A', section: [], subIndex: 4 },
          { entry: 'This describes section A', section: [], subIndex: 5 },
          { entry: '## SubSection 1', section: [], subIndex: 6 },
          {
            entry: 'With a subsection belonging to Section A',
            section: [],
            subIndex: 7
          },
          { entry: '## SubSection 2', section: [], subIndex: 8 },
          {
            entry: 'And another subsection sibling to SubSection 1, but also under Section A.',
            section: [],
            subIndex: 9
          },
          { entry: '# Section B', section: [], subIndex: 10 },
          {
            entry: 'With an entirely unrelated section B, that is sibling to Section A',
            section: [],
            subIndex: 11
          },
          { entry: '## SubSection 1', section: [], subIndex: 12 },
          {
            entry: 'And another subsection 1, but this time related to Section B.',
            section: [],
            subIndex: 13
          }
        ];
        const results = ArrayUtils.indexify(source);
        // console.log(results);
        expect(results).toStrictEqual(expected);
      });

      it('a list with one hierarchy level', () => {
        const source = complexMarkdown;
        const expected = [
          { entry: 'Heading', section: [ 0 ], subIndex: 1 },
          { entry: '# Overview', section: [ 1 ], subIndex: 0 },
          {
            entry: 'This entire list is a hierarchy of data.',
            section: [ 1 ],
            subIndex: 1
          },
          { entry: '# Section A', section: [ 2 ], subIndex: 0 },
          { entry: 'This describes section A', section: [ 2 ], subIndex: 1 },
          { entry: '## SubSection 1', section: [ 2 ], subIndex: 2 },
          {
            entry: 'With a subsection belonging to Section A',
            section: [ 2 ],
            subIndex: 3
          },
          { entry: '## SubSection 2', section: [ 2 ], subIndex: 4 },
          {
            entry: 'And another subsection sibling to SubSection 1, but also under Section A.',
            section: [ 2 ],
            subIndex: 5
          },
          { entry: '# Section B', section: [ 3 ], subIndex: 0 },
          {
            entry: 'With an entirely unrelated section B, that is sibling to Section A',
            section: [ 3 ],
            subIndex: 1
          },
          { entry: '## SubSection 1', section: [ 3 ], subIndex: 2 },
          {
            entry: 'And another subsection 1, but this time related to Section B.',
            section: [ 3 ],
            subIndex: 3
          }
        ];
        const results = ArrayUtils.indexify(source, isHeader1);
        // console.log(results);
        expect(results).toStrictEqual(expected);
      });
      it('a list with two hierarchy levels', () => {
        const source = complexMarkdown;
        const expected = [
          { entry: 'Heading', section: [ 0, 0 ], subIndex: 1 },
          { entry: '# Overview', section: [ 1, 0 ], subIndex: 0 },
          {
            entry: 'This entire list is a hierarchy of data.',
            section: [ 1, 0 ],
            subIndex: 1
          },
          { entry: '# Section A', section: [ 2, 0 ], subIndex: 0 },
          { entry: 'This describes section A', section: [ 2, 0 ], subIndex: 1 },
          { entry: '## SubSection 1', section: [ 2, 1 ], subIndex: 0 },
          {
            entry: 'With a subsection belonging to Section A',
            section: [ 2, 1 ],
            subIndex: 1
          },
          { entry: '## SubSection 2', section: [ 2, 2 ], subIndex: 0 },
          {
            entry: 'And another subsection sibling to SubSection 1, but also under Section A.',
            section: [ 2, 2 ],
            subIndex: 1
          },
          { entry: '# Section B', section: [ 3, 0 ], subIndex: 0 },
          {
            entry: 'With an entirely unrelated section B, that is sibling to Section A',
            section: [ 3, 0 ],
            subIndex: 1
          },
          { entry: '## SubSection 1', section: [ 3, 1 ], subIndex: 0 },
          {
            entry: 'And another subsection 1, but this time related to Section B.',
            section: [ 3, 1 ],
            subIndex: 1
          }
        ];
        const results = ArrayUtils.indexify(source, isHeader1, isHeader2);
        // console.log(results);
        expect(results).toStrictEqual(expected);
      });
      it('can find all headers', () => {
        const source = complexMarkdown;
        const expected = [
          { entry: '# Overview', section: [ 1, 0 ], subIndex: 0 },
          { entry: '# Section A', section: [ 2, 0 ], subIndex: 0 },
          { entry: '## SubSection 1', section: [ 2, 1 ], subIndex: 0 },
          { entry: '## SubSection 2', section: [ 2, 2 ], subIndex: 0 },
          { entry: '# Section B', section: [ 3, 0 ], subIndex: 0 },
          { entry: '## SubSection 1', section: [ 3, 1 ], subIndex: 0 }
        ];
        const results = ArrayUtils.indexify(source, isHeader1, isHeader2)
          .filter((element) => element.subIndex === 0);
        // console.log(results);
        expect(results).toStrictEqual(expected);
      });
    });

    describe('throws an error', () => {
      it('if it is not passed an array', () => {
        const expected = 'indexify(source, ...sectionIndicatorFunctions): source must be an array';
        expect(() => {
          ArrayUtils.indexify('cuca' as unknown as unknown[], isHeader1);
        }).toThrow(expected);
      });
      it('if it is not passed a function to index', () => {
        const expected = 'all section indicators passed must be functions';
        expect(() => {
          ArrayUtils.indexify(complexMarkdown, '# headers' as unknown as (entry: unknown) => boolean);
        }).toThrow(expected);
      });
      it('if it is not passed all functions to index', () => {
        const expected = 'all section indicators passed must be functions';
        expect(() => {
          ArrayUtils.indexify(complexMarkdown, isHeader1, '# headers' as unknown as (entry: unknown) => boolean);
        }).toThrow(expected);
      });
    });
  });

  describe('extract', () => {
    it('extract rows', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const rows = [0, 1];

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red']
      ];

      const results = ArrayUtils.extract(data, { rows });
      expect(results).toEqual(expected);
    });
    it('extract columns', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const columns = [0, 1];

      const expected = [
        ['john', 23],
        ['jane', 32],
        ['ringo', 27]
      ];

      const results = ArrayUtils.extract(data, { columns });
      expect(results).toEqual(expected);
    });
    it('extract both', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const rows = [0, 1];
      const columns = [0, 1];

      const expected = [
        ['john', 23],
        ['jane', 32]
      ];

      const results = ArrayUtils.extract(data, { rows, columns });
      expect(results).toEqual(expected);
    });
    it('extract with null options returns the whole array', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const rows = null;
      const columns = null;

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const results = ArrayUtils.extract(data, { rows, columns });
      expect(results).toEqual(expected);
    });
    it('extract with neither option returns the whole array', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const results = ArrayUtils.extract(data, {});
      expect(results).toEqual(expected);
    });
    it('extract without any option returns the whole array', () => {
      const data = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const expected = [
        ['john', 23, 'purple'],
        ['jane', 32, 'red'],
        ['ringo', 27, 'green']
      ];

      const results = ArrayUtils.extract(data);
      expect(results).toEqual(expected);
    });
  });

  describe('applyArrayValue', () => {
    describe('can set', () => {
      describe('on a simple array', () => {
        it('on item [0]', () => {
          const targetObj = [0, 0, 0, 0];
          const path = '[0]';
          const value = 1;
          const expected = [1, 0, 0, 0];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('on item 0', () => {
          const targetObj = [0, 0, 0, 0];
          const path = '0';
          const value = 2;
          const expected = [2, 0, 0, 0];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('on item 2', () => {
          const targetObj = [0, 0, 0, 0];
          const path = '2';
          const value = 3;
          const expected = [0, 0, 3, 0];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('on item 3', () => {
          const targetObj = [0, 0, 0, 0];
          const path = '3';
          const value = 4;
          const expected = [0, 0, 0, 4];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('on item 4', () => {
          const targetObj = [0, 0, 0, 0];
          const path = '4';
          const value = 5;
          const expected = [0, 0, 0, 0, 5];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
      });
      describe('on objects in an array', () => {
        it('update a property', () => {
          const targetObj = [{
            first: 'john'
          }, {
            first: 'jane'
          }];
          const path = '[1].last';
          const value = 'doe';
          const expected = [{
            first: 'john'
          }, {
            first: 'jane',
            last: 'doe'
          }];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('deep property', () => {
          const targetObj = [{
            first: 'john'
          }, {
            first: 'jane',
            class: {}
          }];
          const path = '[1].class.name';
          const value = 'econ-101';
          const expected = [{
            first: 'john'
          }, {
            first: 'jane',
            class: {
              name: 'econ-101'
            }
          }];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('deep property', () => {
          const targetObj = [{
            first: 'john'
          }, {
            first: 'jane',
            classes: [{ name: 'econ-101' }]
          }];
          const path = '[1].classes[0].professor';
          const value = "o'leary";
          const expected = [{
            first: 'john'
          }, {
            first: 'jane',
            classes: [{
              name: 'econ-101',
              professor: "o'leary"
            }]
          }];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('deep non-existant child obj', () => {
          const targetObj = [{
            first: 'john'
          }, {
            first: 'jane'
          }];
          const path = '[1].class.name';
          const value = 'econ-101';
          const expected = [{
            first: 'john'
          }, {
            first: 'jane',
            class: {
              name: 'econ-101'
            }
          }];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('deep non-existant 2x child obj', () => {
          const targetObj = [{
            first: 'john'
          }, {
            first: 'jane'
          }];
          const path = '[1].class.professor.name';
          const value = "o'leary";
          const expected = [{
            first: 'john'
          }, {
            first: 'jane',
            class: {
              professor: {
                name: "o'leary"
              }
            }
          }];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
        it('overwrite a property', () => {
          const targetObj = [{
            first: 'john'
          }, {
            first: 'jane'
          }];
          const path = '[1]';
          const value = { first: 'bobby' };
          const expected = [{
            first: 'john'
          }, {
            first: 'bobby'
          }];
          const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
          expect(result).toStrictEqual(expected);
        });
      });
    });
    describe('cannot set', () => {
      it('on a null object', () => {
        const targetObj = null;
        const path = 'favoriteColor';
        const value = 'blue';
        const expected = null;
        const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[], path, value);
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
      const result = ArrayUtils.applyArrayValue(targetObj as unknown as Record<string, unknown>[] | Record<string, unknown>, path as unknown as string, value);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('applyArrayValues', () => {
    describe('can apply', () => {
      it('can apply a single value to multiple objects', () => {
        const targetObj = [{ name: 'john', last: 'doe' }, { name: 'jane', last: 'doe' }];
        const path = 'age';
        const values = 25;
        const expected = [
          { name: 'john', last: 'doe', age: 25 },
          { name: 'jane', last: 'doe', age: 25 }
        ];
        const results = ArrayUtils.applyArrayValues(targetObj, path, values);
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
        const results = ArrayUtils.applyArrayValues(targetObj, path, values);
        expect(results).toStrictEqual(expected);
      });
      it('will apply the 1 property if only one target provided', () => {
        const targetObj = [{ name: 'john', last: 'doe' }];
        const path = 'age';
        const values = [24, 25];
        const expected = [
          { name: 'john', last: 'doe', age: 24 }
        ];
        const results = ArrayUtils.applyArrayValues(targetObj, path, values);
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
        const results = ArrayUtils.applyArrayValues(targetObj, path, values);
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
        const results = ArrayUtils.applyArrayValues(targetObj, path, values);
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
        const results = ArrayUtils.applyArrayValues(targetObj as unknown as Record<string, unknown>[], path, value);
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
        const results = ArrayUtils.applyArrayValues(targetObj as unknown as Record<string, unknown>[], path, value);
        expect(results).toStrictEqual(expected);
      });
      it('hanging dot .', () => {
        const targetObj = [
          [0, 0, 0],
          [0, 0, 0]
        ];
        const path = '1';
        const value = 2;
        const expected = [
          [0, 2, 0],
          [0, 2, 0]
        ];
        const results = ArrayUtils.applyArrayValues(targetObj as unknown as Record<string, unknown>[], path, value);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('cannot apply', () => {
      it('if targetObjects are null', () => {
        const targetObj = null;
        const path = 'class.name';
        const value = 'blue';
        const expected = null;
        const results = ArrayUtils.applyArrayValues(targetObj as unknown as Record<string, unknown>[], path, value);
        expect(results).toStrictEqual(expected);
      });
      it('if path are null', () => {
        const targetObj = null;
        const path = 'class.';
        const value = 'blue';
        const expected = null;
        const results = ArrayUtils.applyArrayValues(targetObj as unknown as Record<string, unknown>[], path, value);
        expect(results).toStrictEqual(expected);
      });
      it('if targetObjects is an empty array', () => {
        const targetObj = [];
        const path = 'class.name';
        const value = 'blue';
        const expected = [];
        const results = ArrayUtils.applyArrayValues(targetObj as unknown as Record<string, unknown>[], path, value);
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
        const results = ArrayUtils.applyArrayValues(targetObj as unknown as Record<string, unknown>[], path, value);
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('multiLineSubstr', () => {
    // eslint-disable-next-line operator-linebreak
    const docsStr = '' +
`id first_name last_name  city        email                        gender ip_address      airport_code car_model_year
-- ---------- ---------- ----------- ---------------------------- ------ --------------- ------------ --------------
1  Thekla     Brokenshaw Chicago     tbrokenshaw0@kickstarter.com Female 81.118.170.238  CXI          2003          
2  Lexi       Dugall     New York    ldugall1@fc2.com             Female 255.140.25.31   LBH          2005          
3  Shawna     Burghill   London      sburghill2@scribd.com        Female 149.240.166.189 GBA          2004          
4  Ginger     Tween      Lainqu      gtween3@wordpress.com        Female 132.67.225.203  EMS          1993          
5  Elbertina  Setford    Los Angeles esetford4@ted.com            Female 247.123.242.49  MEK          1989          `;
    const docsArray = [
      'id first_name last_name  city        email                        gender ip_address      airport_code car_model_year',
      '-- ---------- ---------- ----------- ---------------------------- ------ --------------- ------------ --------------',
      '1  Thekla     Brokenshaw Chicago     tbrokenshaw0@kickstarter.com Female 81.118.170.238  CXI          2003          ',
      '2  Lexi       Dugall     New York    ldugall1@fc2.com             Female 255.140.25.31   LBH          2005          ',
      '3  Shawna     Burghill   London      sburghill2@scribd.com        Female 149.240.166.189 GBA          2004          ',
      '4  Ginger     Tween      Lainqu      gtween3@wordpress.com        Female 132.67.225.203  EMS          1993          ',
      '5  Elbertina  Setford    Los Angeles esetford4@ted.com            Female 247.123.242.49  MEK          1989          '
    ];

    describe('with the docs example', () => {
      it('with an explicit start', () => {
        const expected = ['car_model_year', '--------------', '2003          ', '2005          ', '2004          ', '1993          ', '1989          '];
        const results = ArrayUtils.multiLineSubstr(docsStr, 102);
        expect(results).toStrictEqual(expected);
      });
      it('with an explicit start and end', () => {
        const expected = ['ip_address    ', '--------------', '81.118.170.238', '255.140.25.31 ', '149.240.166.18', '132.67.225.203', '247.123.242.49'];
        const results = ArrayUtils.multiLineSubstr(docsStr, 73, 14);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
    });
    describe('can extract from a string', () => {
      it('with an explicit start', () => {
        const expected = ['car_model_year', '--------------', '2003          ', '2005          ', '2004          ', '1993          ', '1989          '];
        const results = ArrayUtils.multiLineSubstr(docsStr, 102);
        expect(results).toStrictEqual(expected);
      });
      it('with an explicit start and end', () => {
        const expected = ['ip_address    ', '--------------', '81.118.170.238', '255.140.25.31 ', '149.240.166.18', '132.67.225.203', '247.123.242.49'];
        const results = ArrayUtils.multiLineSubstr(docsStr, 73, 14);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('with a single string', () => {
        const lineString = 'id first_name last_name  city        email                        gender ip_address      airport_code car_model_year';
        const expected = ['ip_address    '];
        const results = ArrayUtils.multiLineSubstr(lineString, 73, 14);
        // console.log(expected);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('can extract from an array of strings', () => {
      it('with an explicit start', () => {
        const expected = ['car_model_year', '--------------', '2003          ', '2005          ', '2004          ', '1993          ', '1989          '];
        const results = ArrayUtils.multiLineSubstr(docsArray, 102);
        expect(results).toStrictEqual(expected);
      });
      it('with an explicit start and end', () => {
        const expected = ['ip_address    ', '--------------', '81.118.170.238', '255.140.25.31 ', '149.240.166.18', '132.67.225.203', '247.123.242.49'];
        const results = ArrayUtils.multiLineSubstr(docsArray, 73, 14);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('from the beginning', () => {
        // eslint-disable-next-line operator-linebreak
        const str = '' +
`line1
line2
line3`;
        const expected = ['line1', 'line2', 'line3'];
        const results = ArrayUtils.multiLineSubstr(str, 0);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('past the end', () => {
        // eslint-disable-next-line operator-linebreak
        const str = '' +
`line1
line2
line3`;
        const expected = ['', '', ''];
        const results = ArrayUtils.multiLineSubstr(str, 100);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('with an array of a single string', () => {
        const lineString = ['id first_name last_name  city        email                        gender ip_address      airport_code car_model_year'];
        const expected = ['ip_address    '];
        const results = ArrayUtils.multiLineSubstr(lineString, 73, 14);
        // console.log(expected);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('cant', () => {
      it('extract from an object', () => {
        const target = {} as unknown as string;
        const expected = 'multiLineSubstr(target, start, length): target is assumed a multi-line string or array of strings';
        expect(() => ArrayUtils.multiLineSubstr(target, 0)).toThrow(expected);
      });
    });
  });
  
  describe('multiLineSubstring', () => {
    const docsStr = `
id first_name last_name  city        email                        gender ip_address      airport_code car_model_year
-- ---------- ---------- ----------- ---------------------------- ------ --------------- ------------ --------------
1  Thekla     Brokenshaw Chicago     tbrokenshaw0@kickstarter.com Female 81.118.170.238  CXI          2003          
2  Lexi       Dugall     New York    ldugall1@fc2.com             Female 255.140.25.31   LBH          2005          
3  Shawna     Burghill   London      sburghill2@scribd.com        Female 149.240.166.189 GBA          2004          
4  Ginger     Tween      Lainqu      gtween3@wordpress.com        Female 132.67.225.203  EMS          1993          
5  Elbertina  Setford    Los Angeles esetford4@ted.com            Female 247.123.242.49  MEK          1989          `;
    const docsArray = [
      'id first_name last_name  city        email                        gender ip_address      airport_code car_model_year',
      '-- ---------- ---------- ----------- ---------------------------- ------ --------------- ------------ --------------',
      '1  Thekla     Brokenshaw Chicago     tbrokenshaw0@kickstarter.com Female 81.118.170.238  CXI          2003          ',
      '2  Lexi       Dugall     New York    ldugall1@fc2.com             Female 255.140.25.31   LBH          2005          ',
      '3  Shawna     Burghill   London      sburghill2@scribd.com        Female 149.240.166.189 GBA          2004          ',
      '4  Ginger     Tween      Lainqu      gtween3@wordpress.com        Female 132.67.225.203  EMS          1993          ',
      '5  Elbertina  Setford    Los Angeles esetford4@ted.com            Female 247.123.242.49  MEK          1989          '
    ];

    describe('with the docs example', () => {
      it('with an explicit start', () => {
        const expected = ['car_model_year', '--------------', '2003          ', '2005          ', '2004          ', '1993          ', '1989'];
        const results = ArrayUtils.multiLineSubstring(docsStr, 102);
        expect(results).toStrictEqual(expected);
      });
      it('with an explicit start and end', () => {
        const expected = ['ip_address    ', '--------------', '81.118.170.238', '255.140.25.31 ', '149.240.166.18', '132.67.225.203', '247.123.242.49'];
        const results = ArrayUtils.multiLineSubstring(docsStr, 73, 87);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
    });
    describe('can extract from a string', () => {
      it('with an explicit start', () => {
        const expected = ['car_model_year', '--------------', '2003          ', '2005          ', '2004          ', '1993          ', '1989'];
        const results = ArrayUtils.multiLineSubstring(docsStr, 102);
        expect(results).toStrictEqual(expected);
      });
      it('with an explicit start and end', () => {
        const expected = ['ip_address    ', '--------------', '81.118.170.238', '255.140.25.31 ', '149.240.166.18', '132.67.225.203', '247.123.242.49'];
        const results = ArrayUtils.multiLineSubstring(docsStr, 73, 87);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('from the beginning', () => {
        const str = `
line1
line2
line3`;
        const expected = ['line1', 'line2', 'line3'];
        const results = ArrayUtils.multiLineSubstring(str, 0);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('past the end', () => {
        const str = `
line1
line2
line3`;
        const expected = ['', '', ''];
        const results = ArrayUtils.multiLineSubstring(str, 100);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('with a single string', () => {
        const lineString = 'id first_name last_name  city        email                        gender ip_address      airport_code car_model_year';
        const expected = ['ip_address    '];
        const results = ArrayUtils.multiLineSubstring(lineString, 73, 87);
        // console.log(expected);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('can extract from an array of strings', () => {
      it('with an explicit start', () => {
        const expected = ['car_model_year', '--------------', '2003          ', '2005          ', '2004          ', '1993          ', '1989          '];
        const results = ArrayUtils.multiLineSubstring(docsArray, 102);
        expect(results).toStrictEqual(expected);
      });
      it('with an explicit start and end', () => {
        const expected = ['ip_address    ', '--------------', '81.118.170.238', '255.140.25.31 ', '149.240.166.18', '132.67.225.203', '247.123.242.49'];
        const results = ArrayUtils.multiLineSubstring(docsArray, 73, 87);
        // console.log(JSON.stringify(results).replace(/"/g, "'"));
        expect(results).toStrictEqual(expected);
      });
      it('with an array of a single string', () => {
        const lineString = ['id first_name last_name  city        email                        gender ip_address      airport_code car_model_year'];
        const expected = ['ip_address    '];
        const results = ArrayUtils.multiLineSubstring(lineString, 73, 87);
        // console.log(expected);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('cant', () => {
      it('extract from an object', () => {
        const target = {} as unknown as string;
        const expected = 'multiLineSubstring(target, startPosition, endPosition): target is assumed a multi-line string or array of strings';
        expect(() => ArrayUtils.multiLineSubstring(target, 0)).toThrow(expected);
      });
    });
  });

  describe('multiStepReduce', () => {
    const simpleList = [1, 2, 3, 4, 5];
    const simpleAdd = (a, b) => a + b;
    const simpleSubtract = (a, b) => a - b;
    it('can add across multiple values', () => {
      const expected = [0, 1, 3, 6, 10, 15];
      const results = ArrayUtils.multiStepReduce(simpleList, simpleAdd, 0);
      expect(results).toStrictEqual(expected);
    });
    it('can subtract across multiple values', () => {
      const expected = [15, 14, 12, 9, 5, 0];
      const results = ArrayUtils.multiStepReduce(simpleList, simpleSubtract, 15);
      expect(results).toStrictEqual(expected);
    });
    it('can add strings', () => {
      const list = ['hello', ' how', ' are', ' you', '?'];
      const expected = ['', 'hello', 'hello how', 'hello how are', 'hello how are you', 'hello how are you?'];
      const results = ArrayUtils.multiStepReduce(list, simpleAdd, '');
      expect(results).toStrictEqual(expected);
    });
    it('can detect the first go round', () => {
      const list = ['0', '1', '2'];
      const expected = [undefined, 'EMPTY0', 'EMPTY01', 'EMPTY012'];
      const fn = (a, b) => {
        const cleanA = (a === undefined) ? 'EMPTY' : a;
        const cleanB = (b === undefined) ? 'EMPTY' : b;
        return `${cleanA}${cleanB}`;
      };
      const results = ArrayUtils.multiStepReduce(list, fn);
      expect(results).toStrictEqual(expected);
    });
    describe('documentation', () => {
      const sumFn = (a, b) => a + b;
      const columnWidths = [3, 11, 11, 12, 29, 7, 16, 13, 15];
      // eslint-disable-next-line operator-linebreak
      const hardSpacedString = '' +
`id first_name last_name  city        email                        gender ip_address      airport_code car_model_year
-- ---------- ---------- ----------- ---------------------------- ------ --------------- ------------ --------------
1  Thekla     Brokenshaw Chicago     tbrokenshaw0@kickstarter.com Female 81.118.170.238  CXI          2003          
2  Lexi       Dugall     New York    ldugall1@fc2.com             Female 255.140.25.31   LBH          2005          
3  Shawna     Burghill   London      sburghill2@scribd.com        Female 149.240.166.189 GBA          2004          
4  Ginger     Tween      Lainqu      gtween3@wordpress.com        Female 132.67.225.203  EMS          1993          
5  Elbertina  Setford    Los Angeles esetford4@ted.com            Female 247.123.242.49  MEK          1989          `;
      it('sumfn works', () => {
        const expected = 5;
        const results = sumFn(2, 3);
        expect(results).toBe(expected);
      });
      it('can sum up numbers', () => {
        const expected = [0, 3, 14, 25, 37, 66, 73, 89, 102, 117];

        const results = ArrayUtils.multiStepReduce(columnWidths, sumFn, 0);
        expect(results).toStrictEqual(expected);
      });
      it('comes up with pairs', () => {
        const lineStops = ArrayUtils.multiStepReduce(columnWidths, sumFn, 0);
        const expectedStops = [0, 3, 14, 25, 37, 66, 73, 89, 102, 117];
        expect(lineStops).toStrictEqual(expectedStops);

        const substrPairs = columnWidths.map((value, index) => [expectedStops[index], value]);
        const expectedPairs = [[0, 3], [3, 11], [14, 11], [25, 12], [37, 29], [66, 7], [73, 16], [89, 13], [102, 15]];
        expect(substrPairs).toStrictEqual(expectedPairs);
      });
      it('can extract out strings', () => {
        const lineStops = ArrayUtils.multiStepReduce(columnWidths, sumFn, 0);
        const substrPairs = columnWidths.map((value, index) => [lineStops[index], value]);

        const expected = [['id ', '-- ', '1  ', '2  ', '3  ', '4  ', '5  '],
          ['first_name ', '---------- ', 'Thekla     ', 'Lexi       ', 'Shawna     ', 'Ginger     ', 'Elbertina  '],
          ['last_name  ', '---------- ', 'Brokenshaw ', 'Dugall     ', 'Burghill   ', 'Tween      ', 'Setford    '],
          ['city        ', '----------- ', 'Chicago     ', 'New York    ', 'London      ', 'Lainqu      ', 'Los Angeles '],
          ['email                        ', '---------------------------- ', 'tbrokenshaw0@kickstarter.com ', 'ldugall1@fc2.com             ', 'sburghill2@scribd.com        ', 'gtween3@wordpress.com        ', 'esetford4@ted.com            '],
          ['gender ', '------ ', 'Female ', 'Female ', 'Female ', 'Female ', 'Female '],
          ['ip_address      ', '--------------- ', '81.118.170.238  ', '255.140.25.31   ', '149.240.166.189 ', '132.67.225.203  ', '247.123.242.49  '],
          ['airport_code ', '------------ ', 'CXI          ', 'LBH          ', 'GBA          ', 'EMS          ', 'MEK          '],
          ['car_model_year', '--------------', '2003          ', '2005          ', '2004          ', '1993          ', '1989          ']];
        const results = substrPairs
          .map(([startingPos, length]) => ArrayUtils.multiLineSubstr(hardSpacedString, startingPos, length));
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('PeekableArrayIterator', () => {
    it('can iterate over a set of numbers', () => {
      const values = [0, 1, 2, 3, 4, 5];
      const itr = new ArrayUtils.PeekableArrayIterator(values);

      let result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(0);

      result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(1);

      result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(2);

      result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(3);

      result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(4);

      result = itr.next();
      expect(result.value).toBe(5);
      expect(result.done).toBe(false);

      result = itr.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
    });
    it('get duplicate the iterator', () => {
      const values = [0, 1, 2];
      const itr = new ArrayUtils.PeekableArrayIterator(values);

      let result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(0);

      const itr2 = itr[Symbol.iterator]();

      result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(1);

      result = itr2.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(2);

      result = itr2.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe(undefined);
    });
    it('can iterate over an empty list', () => {
      const values = [];
      const itr = new ArrayUtils.PeekableArrayIterator(values);
      const result = itr.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
    });
    it('can iterate over other iterable things', () => {
      const values = new Set([0, 1]);
      const itr = new ArrayUtils.PeekableArrayIterator(values);

      let result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(0);

      result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(1);

      result = itr.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe(undefined);
    });
    it('can go past the end of the array', () => {
      const values = new Set([0, 1]);
      const itr = new ArrayUtils.PeekableArrayIterator(values);

      let result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(0);

      result = itr.next();
      expect(result.done).toBe(false);
      expect(result.value).toBe(1);

      result = itr.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe(undefined);
    });
    it('has the the last item in the list as undefined', () => {
      const values = [0, 1, 2, 3, 4, 5];
      const itr = new ArrayUtils.PeekableArrayIterator(values);

      itr.next();
      itr.next();
      itr.next();
      itr.next();

      let result = itr.next();
  
      //-- this is needed for for loops to work as expected...
      result = itr.peek.next();
      expect(result.value).toBe(5);
      expect(result.done).toBe(false);

      result = itr.peek.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
    });
    it('for loops work', () => {
      const values = [0, 1, 2, 3, 4, 5];
      const itr = new ArrayUtils.PeekableArrayIterator(values);

      const expected = [0, 1, 2, 3, 4, 5];
      const results: number[] = [];

      for (const i of itr) {
        results.push(i);
      }

      expect(results).toStrictEqual(expected);
    });
    describe('can peek at values', () => {
      it('without messing up the main iterator', () => {
        const values = [0, 1, 2, 3, 4, 5];
        const itr = new ArrayUtils.PeekableArrayIterator(values);
  
        let result = itr.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(0);
  
        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(1);
  
        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(2);
  
        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(3);
  
        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(4);
  
        result = itr.peek.next();
        expect(result.value).toBe(5);
        expect(result.done).toBe(false);
  
        result = itr.peek.next();
        expect(result.value).toBe(undefined);
        expect(result.done).toBe(true);
  
        result = itr.peek.next();
        expect(result.value).toBe(undefined);
        expect(result.done).toBe(true);
  
        result = itr.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(1);
      });
      it('can use peekItr', () => {
        const source = [0, 1, 2, 3, 4, 5];
        const itr = new ArrayUtils.PeekableArrayIterator(source);

        itr.next();
        itr.next();

        let result = itr.next();
        expect(result.value).toBe(2);
        expect(result.done).toBe(false);

        const peekItr = itr.peek;
        result = peekItr.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(3);

        result = peekItr.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(4);

        result = peekItr.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(5);

        result = peekItr.next();
        expect(result.done).toBe(true);
        expect(result.value).toBe(undefined);
      });
      it('can use iterator for loop', () => {
        const source = [0, 1, 2, 3, 4, 5];
        const itr = new ArrayUtils.PeekableArrayIterator(source);

        itr.next();
        itr.next();

        const expectedResults = [2, 3, 4, 5];
        const resultList: number[] = [];

        for (const i of itr) {
          resultList.push(i);
        }
        expect(resultList).toStrictEqual(expectedResults);
      });
      it('can use peek for loop', () => {
        const source = [0, 1, 2, 3, 4, 5];
        const itr = new ArrayUtils.PeekableArrayIterator(source);

        itr.next();
        itr.next();

        const expectedResults = [2, 3, 4, 5];
        const resultList: number[] = [];

        for (const i of itr.peek) {
          resultList.push(i);
        }
        expect(resultList).toStrictEqual(expectedResults);
      });
      it('can use peek for iteration', () => {
        const values = [0, 1, 2, 3, 4, 5];
        const itr = new ArrayUtils.PeekableArrayIterator(values);

        let result = itr.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(0);

        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(1);
  
        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(2);
  
        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(3);
  
        result = itr.peek.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(4);
  
        result = itr.peek.next();
        expect(result.value).toBe(5);
        expect(result.done).toBe(false);
  
        result = itr.peek.next();
        expect(result.value).toBe(undefined);
        expect(result.done).toBe(true);
  
        result = itr.peek.next();
        expect(result.value).toBe(undefined);
        expect(result.done).toBe(true);
  
        result = itr.next();
        expect(result.done).toBe(false);
        expect(result.value).toBe(1);
      });
    });
  });
  
  describe('delayedFunction', () => {
    it('can delay a function but ensure that it isnt called', () => {
      let isCalled = false;
      const shouldBeDelayed = (arg1) => {
        isCalled = arg1;
        return isCalled;
      };
      
      expect(isCalled).toBe(false);

      const delayed = ArrayUtils.delayedFn(shouldBeDelayed, ['abc']);

      expect(isCalled).toBe(false);

      delayed();

      expect(isCalled).toStrictEqual('abc');
    });
    it('can support an array as the first argument', () => {
      let isCalled = false;
      const shouldBeDelayed = (arg1, arg2, arg3) => {
        isCalled = arg1 + arg2 + arg3;
        return isCalled;
      };
      const expected = 6;
      
      expect(isCalled).toBe(false);

      const delayed = ArrayUtils.delayedFn(shouldBeDelayed, [1, 2, 3]);

      expect(isCalled).toBe(false);

      delayed();

      expect(isCalled).toStrictEqual(expected);
    });
    it('can support multiple arguments instead', () => {
      let isCalled = false;
      const shouldBeDelayed = (arg1, arg2, arg3) => {
        isCalled = arg1 + arg2 + arg3;
        return isCalled;
      };
      const expected = 6;
      
      expect(isCalled).toBe(false);

      const delayed = ArrayUtils.delayedFn(shouldBeDelayed, 1, 2, 3);

      expect(isCalled).toBe(false);

      delayed();

      expect(isCalled).toStrictEqual(expected);
    });
  });
  
  describe('chainFunctions', () => {
    it('can chain a function', async () => {
      const sumValues = (...rest: number[]) => rest.reduce((result, val) => result + val, 0);
      const fnArgs = [[1], [1, 1], [1, 1, 2], [1, 1, 2, 3]];
      const expected = [1, 2, 4, 7];
      const results = await ArrayUtils.chainFunctions(sumValues as (...args: unknown[]) => unknown, fnArgs);
      expect(results).toStrictEqual(expected);
    });
    it('can handle the error in the chain with the top promise', async () => {
      const sumValues = (...rest: number[]) => {
        if (rest.length < 2) return rest.reduce((result, val) => result + val, 0);
        throw new Error('Some Error thrown in the middle of the loop');
      };
      const fnArgs = [[1], [1, 1], [1, 1, 2], [1, 1, 2, 3]];
      const expected = 'Some Error';
      await expect(ArrayUtils.chainFunctions(sumValues as (...args: unknown[]) => unknown, fnArgs)).rejects.toThrow(expected);
    });
    it('can chain promises', async () => {
      const sumValues = (...rest: number[]) => {
        const finalResult = rest.reduce((result, val) => result + val, 0);
        return Promise.resolve(finalResult);
      };
      const fnArgs = [[1], [1, 1], [1, 1, 2], [1, 1, 2, 3]];
      const expected = [1, 2, 4, 7];
      const results = await ArrayUtils.chainFunctions(sumValues as (...args: unknown[]) => unknown, fnArgs);
      expect(results).toStrictEqual(expected);
    });
  });
  
  describe('asyncWaitAndChain', () => {
    it('can chain a function', async () => {
      const sumValues = (...rest: number[]) => rest.reduce((result, val) => result + val, 0);
      const fnArgs = [[1]];
      const expected = [1];
      const results = await ArrayUtils.asyncWaitAndChain(0.01, sumValues as (...args: unknown[]) => unknown, fnArgs);
      expect(results).toStrictEqual(expected);
    });
    it('can handle errors in parent promise', async () => {
      const sumValues = (_rest: number[]) => {
        throw new Error('CUSTOM ERROR');
      };
      const fnArgs = [[1]];
      const expected = 'CUSTOM ERROR';
      await expect(ArrayUtils.asyncWaitAndChain(0.01, sumValues as (...args: unknown[]) => unknown, fnArgs)).rejects.toThrow(expected);
    });
    it('can async wait with promises', async () => {
      const sumValues = (...rest: number[]) => {
        const sumValuesResult = rest.reduce((result, value) => result + value, 0);
        return Promise.resolve(sumValuesResult);
      };
      const fnArgs = [[1]];
      const expected = [1];
      const finalResults = await ArrayUtils.asyncWaitAndChain(0.01, sumValues as (...args: unknown[]) => unknown, fnArgs);
      expect(finalResults).toStrictEqual(expected);
    });
  });
  describe('extractFromHardSpacedTable', () => {
    const columns = [
      'id ',
      'first_name ',
      'last_name  ',
      'city        ',
      'email                        ',
      'gender ',
      'ip_address      ',
      'airport_code ',
      'car_model_year '
    ];
    // eslint-disable-next-line operator-linebreak
    const hardSpacedString = '' +
`id first_name last_name  city        email                        gender ip_address      airport_code car_model_year
-- ---------- ---------- ----------- ---------------------------- ------ --------------- ------------ --------------
1  Thekla     Brokenshaw Chicago     tbrokenshaw0@kickstarter.com Female 81.118.170.238  CXI          2003          
2  Lexi       Dugall     New York    ldugall1@fc2.com             Female 255.140.25.31   LBH          2005          
3  Shawna     Burghill   London      sburghill2@scribd.com        Female 149.240.166.189 GBA          2004          
4  Ginger     Tween      Lainqu      gtween3@wordpress.com        Female 132.67.225.203  EMS          1993          
5  Elbertina  Setford    Los Angeles esetford4@ted.com            Female 247.123.242.49  MEK          1989          `;
    it('can extract by string headers', () => {
      const columnWidths = columns;
      const expected = [
        [
          'id ',
          '-- ',
          '1  ',
          '2  ',
          '3  ',
          '4  ',
          '5  ',
        ],
        [
          'first_name ',
          '---------- ',
          'Thekla     ',
          'Lexi       ',
          'Shawna     ',
          'Ginger     ',
          'Elbertina  ',
        ],
        [
          'last_name  ',
          '---------- ',
          'Brokenshaw ',
          'Dugall     ',
          'Burghill   ',
          'Tween      ',
          'Setford    ',
        ],
        [
          'city        ',
          '----------- ',
          'Chicago     ',
          'New York    ',
          'London      ',
          'Lainqu      ',
          'Los Angeles ',
        ],
        [
          'email                        ',
          '---------------------------- ',
          'tbrokenshaw0@kickstarter.com ',
          'ldugall1@fc2.com             ',
          'sburghill2@scribd.com        ',
          'gtween3@wordpress.com        ',
          'esetford4@ted.com            ',
        ],
        [
          'gender ',
          '------ ',
          'Female ',
          'Female ',
          'Female ',
          'Female ',
          'Female ',
        ],
        [
          'ip_address      ',
          '--------------- ',
          '81.118.170.238  ',
          '255.140.25.31   ',
          '149.240.166.189 ',
          '132.67.225.203  ',
          '247.123.242.49  ',
        ],
        [
          'airport_code ',
          '------------ ',
          'CXI          ',
          'LBH          ',
          'GBA          ',
          'EMS          ',
          'MEK          ',
        ],
        [
          'car_model_year',
          '--------------',
          '2003          ',
          '2005          ',
          '2004          ',
          '1993          ',
          '1989          ',
        ]
      ];
      const results = ArrayUtils.extractFromHardSpacedTable(hardSpacedString, columnWidths);
      expect(results).toStrictEqual(expected);
    });
    it('test numeric headers', () => {
      const columnWidths = columns.map((str) => str.length);
      const expected = [3, 11, 11, 12, 29, 7, 16, 13, 15];
      expect(columnWidths).toStrictEqual(expected);
    });
    it('can extract by numeric headers', () => {
      const columnWidths = columns.map((str) => str.length);

      const expectedColumnWidths = [3, 11, 11, 12, 29, 7, 16, 13, 15];
      expect(columnWidths).toStrictEqual(expectedColumnWidths);

      const expected = [
        [
          'id ',
          '-- ',
          '1  ',
          '2  ',
          '3  ',
          '4  ',
          '5  ',
        ],
        [
          'first_name ',
          '---------- ',
          'Thekla     ',
          'Lexi       ',
          'Shawna     ',
          'Ginger     ',
          'Elbertina  ',
        ],
        [
          'last_name  ',
          '---------- ',
          'Brokenshaw ',
          'Dugall     ',
          'Burghill   ',
          'Tween      ',
          'Setford    ',
        ],
        [
          'city        ',
          '----------- ',
          'Chicago     ',
          'New York    ',
          'London      ',
          'Lainqu      ',
          'Los Angeles ',
        ],
        [
          'email                        ',
          '---------------------------- ',
          'tbrokenshaw0@kickstarter.com ',
          'ldugall1@fc2.com             ',
          'sburghill2@scribd.com        ',
          'gtween3@wordpress.com        ',
          'esetford4@ted.com            ',
        ],
        [
          'gender ',
          '------ ',
          'Female ',
          'Female ',
          'Female ',
          'Female ',
          'Female ',
        ],
        [
          'ip_address      ',
          '--------------- ',
          '81.118.170.238  ',
          '255.140.25.31   ',
          '149.240.166.189 ',
          '132.67.225.203  ',
          '247.123.242.49  ',
        ],
        [
          'airport_code ',
          '------------ ',
          'CXI          ',
          'LBH          ',
          'GBA          ',
          'EMS          ',
          'MEK          ',
        ],
        [
          'car_model_year',
          '--------------',
          '2003          ',
          '2005          ',
          '2004          ',
          '1993          ',
          '1989          ',
        ]
      ];
      const results = ArrayUtils.extractFromHardSpacedTable(hardSpacedString, columnWidths);
      expect(results).toStrictEqual(expected);
    });
    it('can extract a mixture', () => {
      const columnWidthLengths = columns.map((str) => str.length);

      const columnWidths = [
        ...columns.slice(0, 2),
        ...columnWidthLengths.slice(2)
      ];

      const expectedColumnWidths = ['id ', 'first_name ', 11, 12, 29, 7, 16, 13, 15];
      expect(columnWidths).toStrictEqual(expectedColumnWidths);

      const expected = [
        [
          'id ',
          '-- ',
          '1  ',
          '2  ',
          '3  ',
          '4  ',
          '5  ',
        ],
        [
          'first_name ',
          '---------- ',
          'Thekla     ',
          'Lexi       ',
          'Shawna     ',
          'Ginger     ',
          'Elbertina  ',
        ],
        [
          'last_name  ',
          '---------- ',
          'Brokenshaw ',
          'Dugall     ',
          'Burghill   ',
          'Tween      ',
          'Setford    ',
        ],
        [
          'city        ',
          '----------- ',
          'Chicago     ',
          'New York    ',
          'London      ',
          'Lainqu      ',
          'Los Angeles ',
        ],
        [
          'email                        ',
          '---------------------------- ',
          'tbrokenshaw0@kickstarter.com ',
          'ldugall1@fc2.com             ',
          'sburghill2@scribd.com        ',
          'gtween3@wordpress.com        ',
          'esetford4@ted.com            ',
        ],
        [
          'gender ',
          '------ ',
          'Female ',
          'Female ',
          'Female ',
          'Female ',
          'Female ',
        ],
        [
          'ip_address      ',
          '--------------- ',
          '81.118.170.238  ',
          '255.140.25.31   ',
          '149.240.166.189 ',
          '132.67.225.203  ',
          '247.123.242.49  ',
        ],
        [
          'airport_code ',
          '------------ ',
          'CXI          ',
          'LBH          ',
          'GBA          ',
          'EMS          ',
          'MEK          ',
        ],
        [
          'car_model_year',
          '--------------',
          '2003          ',
          '2005          ',
          '2004          ',
          '1993          ',
          '1989          ',
        ]
      ];
      const results = ArrayUtils.extractFromHardSpacedTable(hardSpacedString, columnWidths);
      expect(results).toStrictEqual(expected);
    });
    it('does not support an object for lengths', () => {
      const columnWidths = { first: 10, last: 20 } as unknown as (number | string)[];
      const expected = 'columnWidths passed must be an array of column widths to extract';
      expect(() => {
        ArrayUtils.extractFromHardSpacedTable(hardSpacedString, columnWidths);
      }).toThrow(expected);
    });
    it('does not support other values', () => {
      const columnWidthLengths = columns.map((str) => str.length);
      const columnWidths: (number | string | object)[] = [
        ...columns.slice(0, 2),
        {},
        ...columnWidthLengths.slice(2)
      ];
      const expected = 'Only strings and numbers are accepted as columnWidths';
      expect(() => {
        ArrayUtils.extractFromHardSpacedTable(hardSpacedString, columnWidths as (number | string)[]);
      }).toThrow(expected);
    });
  });

  describe('zip', () => {
    const first = ['john', 'paul', 'george', 'ringo'];
    const last = ['lennon', 'mccartney', 'harrison', 'starr'];
    const phrase = ['imagine', 'yesterday', 'taxman', 'walrus'];
    const color = ['red', 'green', 'blue', 'white'];

    it('can combine a single array', () => {
      const expected = [['john', 'lennon'], ['paul', 'mccartney'],
        ['george', 'harrison'], ['ringo', 'starr']];
      const results = ArrayUtils.zip(first, last);
      expect(results).toStrictEqual(expected);
    });
    it('can combine two empty lists', () => {
      const expected = [[]];
      const results = ArrayUtils.zip([], []);
      expect(results).toStrictEqual(expected);
    });
    it('can combine three empty lists', () => {
      const expected = [[]];
      const results = ArrayUtils.zip([], [], []);
      expect(results).toStrictEqual(expected);
    });
    it('can combine three empty lists and a value', () => {
      const expected = [['john']];
      const results = ArrayUtils.zip([], [], [], first);
      expect(results).toStrictEqual(expected);
    });

    it('can combine afterwards left', () => {
      const expected = [['john', 'lennon', 'imagine'],
        ['paul', 'mccartney', 'yesterday'],
        ['george', 'harrison', 'taxman'],
        ['ringo', 'starr', 'walrus']];
      const starter = [['john', 'lennon'], ['paul', 'mccartney'],
        ['george', 'harrison'], ['ringo', 'starr']];
      const results = ArrayUtils.zip(starter, phrase);
      expect(results).toStrictEqual(expected);
    });
    it('can combine afterwards right', () => {
      const expected = [['imagine', 'john', 'lennon'],
        ['yesterday', 'paul', 'mccartney'],
        ['taxman', 'george', 'harrison'],
        ['walrus', 'ringo', 'starr']];
      const starter = [['john', 'lennon'], ['paul', 'mccartney'],
        ['george', 'harrison'], ['ringo', 'starr']];
      const results = ArrayUtils.zip(phrase, starter);
      expect(results).toStrictEqual(expected);
    });

    it('can combine all at once', () => {
      const expected = [['john', 'lennon', 'imagine'],
        ['paul', 'mccartney', 'yesterday'],
        ['george', 'harrison', 'taxman'],
        ['ringo', 'starr', 'walrus']];
      const results = ArrayUtils.zip(first, last, phrase);
      expect(results).toStrictEqual(expected);
    });

    describe('works if the left is empty', () => {
      it('and the right is a single value', () => {
        const expected = [['john'], ['paul'], ['george'], ['ringo']];
        const left = [];
        const right = first;
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
      it('if the right is an array', () => {
        const expected = [['john'], ['paul'], ['george'], ['ringo']];
        const left = [];
        const right = expected;
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
      it('if the right is a set', () => {
        const expected = [['john'], ['paul'], ['george'], ['ringo']];
        const left = [];
        const right = [new Set(['john']), ['paul'], ['george'], ['ringo']];
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
    });
    describe('works if the right is empty', () => {
      it('and the left is a single value', () => {
        const expected = [['john'], ['paul'], ['george'], ['ringo']];
        const left = first;
        const right = [];
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
      it('an the left is an array', () => {
        const expected = [['john'], ['paul'], ['george'], ['ringo']];
        const left = expected;
        const right = [];
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
      it('an the left is a set', () => {
        const expected = [['john'], ['paul'], ['george'], ['ringo']];
        const left = [new Set(['john']), ['paul'], ['george'], ['ringo']];
        const right = [];
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
    });

    it('can combine 4 lists', () => {
      const expected = [['john', 'lennon', 'imagine', 'red'],
        ['paul', 'mccartney', 'yesterday', 'green'],
        ['george', 'harrison', 'taxman', 'blue'],
        ['ringo', 'starr', 'walrus', 'white']];
      const results = ArrayUtils.zip(first, last, phrase, color);
      expect(results).toStrictEqual(expected);
    });
    it('can combine separately A', () => {
      const expected = [['john', 'lennon'], ['paul', 'mccartney'],
        ['george', 'harrison'], ['ringo', 'starr']];
      const results = ArrayUtils.zip(first, last);
      expect(results).toStrictEqual(expected);
    });
    it('can combine separately B', () => {
      const expected = [['imagine', 'red'], ['yesterday', 'green'],
        ['taxman', 'blue'], ['walrus', 'white']];
      const results = ArrayUtils.zip(phrase, color);
      expect(results).toStrictEqual(expected);
    });
    it('can combine separately B', () => {
      const expected = [['john', 'lennon', 'imagine', 'red'],
        ['paul', 'mccartney', 'yesterday', 'green'],
        ['george', 'harrison', 'taxman', 'blue'],
        ['ringo', 'starr', 'walrus', 'white']];
      const left = [['john', 'lennon'], ['paul', 'mccartney'],
        ['george', 'harrison'], ['ringo', 'starr']];
      const right = [['imagine', 'red'], ['yesterday', 'green'],
        ['taxman', 'blue'], ['walrus', 'white']];
      const results = ArrayUtils.zip(left, right);
      expect(results).toStrictEqual(expected);
    });

    describe('must be given something iteratable', () => {
      it('cannot combine if not given something iteratable', () => {
        const expected = 'zip: left must be iterable';
        const left = {} as unknown as Iterable<unknown>;
        const right = left;
        expect(() => {
          ArrayUtils.zip(left, right);
        }).toThrow(expected);
      });
      it('cannot combine if not given something iteratable', () => {
        const expected = 'zip: right must be iterable';
        const left = first;
        const right = {} as unknown as Iterable<unknown>;
        expect(() => {
          ArrayUtils.zip(left, right);
        }).toThrow(expected);
      });
    });

    describe('can combine things not an array', () => {
      it('can a set to the left', () => {
        const expected = [['john', 'lennon'], ['paul', 'mccartney'],
          ['george', 'harrison'], ['ringo', 'starr']];
        const left = new Set(first);
        const right = last;
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
      it('can a set to the right', () => {
        const expected = [['john', 'lennon'], ['paul', 'mccartney'],
          ['george', 'harrison'], ['ringo', 'starr']];
        const left = first;
        const right = new Set(last);
        const results = ArrayUtils.zip(left, right);
        expect(results).toStrictEqual(expected);
      });
    });
  });

  describe('resize', () => {
    const baseList = ['heart', 'club', 'spade', 'diamond'];
    it('can make a list smaller', () => {
      const expected = ['heart', 'club'];
      const result = ArrayUtils.resize(baseList, 2);
      expect(result).toStrictEqual(expected);
    });
    it('can make a list larger', () => {
      const expected = ['heart', 'club', 'spade', 'diamond', undefined, undefined];
      const result = ArrayUtils.resize(baseList, 6);
      expect(result).toStrictEqual(expected);
    });
    it('can make a list larger with a default', () => {
      const expected = ['heart', 'club', 'spade', 'diamond', '--undefined', '--undefined'];
      const result = ArrayUtils.resize(baseList, 6, '--undefined');
      expect(result).toStrictEqual(expected);
    });
    it('can make a list larger', () => {
      const expected = ['heart', 'club', 'spade', 'diamond'];
      const result = ArrayUtils.resize(baseList, 4);
      expect(result).toStrictEqual(expected);
    });
    describe('returns an empty array', () => {
      it('if the source array is not an array', () => {
        const expected = [];
        const result = ArrayUtils.resize({} as unknown as unknown[], 4);
        expect(result).toStrictEqual(expected);
      });
      it('if the source array null', () => {
        const expected = [];
        const result = ArrayUtils.resize(null, 4);
        expect(result).toStrictEqual(expected);
      });
      it('if the source array is an empty array', () => {
        const expected = [];
        const result = ArrayUtils.resize([], 4);
        expect(result).toStrictEqual(expected);
      });
    });
  });
});
