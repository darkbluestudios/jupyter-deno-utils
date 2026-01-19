import { describe, it, afterEach, beforeEach } from '@std/testing/bdd';
import { expect } from '@std/expect';

// const { mockConsole, removeConsoleMock } = require('../__testHelper/ijsContext.ts');

// import { mockConsole, removeConsoleMock } from './__testHelper/JupyterContext.ts';

// import { MappableFn, FilterFn } from "../src/types/standard.ts";

import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "@std/testing/mock";

import chain from "../src/chain.ts";

import { ConsoleI, mockConsole, removeConsoleMock } from "./__testHelper/JupyterContext.ts";

describe('testing/spy works the way I think it does', () => {
  it('can spy a function', () => {
    const testFn = spy();

    testFn(1, 2, 3);
    testFn();

    assertSpyCalls(testFn, 2);

    assertSpyCall(testFn, 0, { args: [1, 2, 3] });
    assertSpyCall(testFn, 1, { args: [] });
  });
  it('can spy on a function that does something', () => {
    const myFn = () => 3;

    const testFn = spy(myFn);

    const result = testFn();
    expect(result).toBe(3);

    assertSpyCalls(testFn, 1);
    assertSpyCall(testFn, 0, ({ args: [] }));
  });
});

describe('chain', () => {

  describe('default', () => {
    let consoleMock:ConsoleI;

    beforeEach(() => {
      consoleMock = mockConsole();
    });
    afterEach(() => {
      removeConsoleMock();
    });

    it('is a function', () => {
      const chainType = typeof chain;
      expect(chainType).toBe('function');
    });
    it('is a chainContainer', () => {
      const value = 2;
      const chainResult = chain(2);
      const result = chainResult.value;
      const expected = value;

      expect(result).toBe(expected);
    });
    it('still works if there is an error', () => {
      const errorSpy = spy();
      const errorThrown = new Error('some errory');

      const expected = 'some error';

      expect(() => chain(2)
        .chain(() => {
          throw errorThrown;
        })
      ).toThrow(expected);
    });
    it('calls the errorFn', () => {
      const errorSpy = spy();
      const errorThrown = new Error('some errory');

      const expected = 'some error';

      expect(() => chain(2)
        .errorHandler(errorSpy)
        .chain(() => {
          throw errorThrown;
        })
      ).toThrow(expected);

      assertSpyCalls(errorSpy, 1);
    });
  });

  describe('can get a value from a chain', () => {
    it('number 9', () => {
      const value = 9;
      const expected = 9;
      const result = chain(value).value;
      expect(result).toBe(expected);
    });
    it('null', () => {
      const value = null;
      const expected = null;
      const result = chain(value).value;
      expect(result).toBe(expected);
    });
    it('undefined', () => {
      const value = undefined;
      const expected = undefined;
      const result = chain(value).value;
      expect(result).toBe(expected);
    });
    it('string hello', () => {
      const value = 'hello';
      const expected = 'hello';
      const result = chain(value).value;
      expect(result).toBe(expected);
    });
  });

  describe('can run jupyter.display symbol', () => {
    it('can get the value from the symbol', () => {
      const initialValue = 2;
      const expected = ({
        'text/plain': initialValue
      });

      // @see https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b
      // @ts-ignore: symbols
      const result:any = chain(initialValue)[Symbol.for('Jupyter.display')](); 

      expect(result).toStrictEqual(expected);
    });
  });

  describe('to array', () => {
    it('can convert an array', () => {

    });
    it('can convert a set', () => {
      const expected = ['a', 'b', 'c'];
      const value = new Set(expected);
      const result = chain(value).toArray().close();

      expect(result.length).toBe(value.size);
      expect(Array.isArray(result)).toBe(true);
    
      //-- no duplicates
      const resultSet = new Set(result);
      expect(resultSet.size).toBe(expected.length);

      for (let i = 0; i < expected.length; i += 1) {
        const expectedValue = expected[i];
        expect(resultSet.has(expectedValue)).toBe(true);
      }
    });
  });

  describe('can chain a value', () => {
    it('a simple add', () => {
      const addTwo = (value:any) => value + 2;
      expect(addTwo(2)).toBe(4);

      const value = 3;
      const expected = 5;
      const result = chain(value)
        .chain(addTwo)
        .value;
      
      expect(result).toBe(expected);
    });
  });

  describe('chainMap', () => {
    it('can apply a map to an array', () => {
      const addTwo = (value:any) => value + 2;
      expect(addTwo(2)).toBe(4);

      const value = [1, 2, 3];
      const expected = [3, 4, 5];
      const result = chain(value)
        .chainMap(addTwo)
        .value;

      expect(result).toStrictEqual(expected);
    });
    it('throws an error with a single value', () => {
      const addTwo = (value:any) => value + 2;
      const value = 3;
      const expectedError = 'chainMap expected an array, but was passed:3';

      expect(() => chain(value).chainMap(addTwo))
        .toThrow(expectedError);
    });
    it('can chain a map after a value', () => {
      const initializeCount = (size:any) => Array.from(Array(size)).map((_val, index) => index);
      expect(initializeCount(3)).toStrictEqual([0, 1, 2]);
      const addTwo = (value:any) => value + 2;
      expect(addTwo(2)).toBe(4);

      const value = 3;
      const expected = [2, 3, 4];
      const result = chain(value)
        .chain(initializeCount)
        .chainMap(addTwo)
        .value;

      expect(result).toStrictEqual(expected);
    });
  });

  describe('chainForEach', () => {
    describe('can execute', () => {
      it('calls jest fn and returns value', () => {
        const fn = spy(() => 'a');
        const result = fn();
        const expected = 'a';
        expect(result).toBe(expected);

        assertSpyCalls(fn, 1);
        assertSpyCall(fn, 0, ({ args: [] }));
      });
      it('calls the functions', () => {
        const fn = spy(() => 'a');
        const values = [11, 12, 13];
        const expected = [11, 12, 13]; // results from fn never are applied.

        const results = chain(values)
          .chainForEach(fn)
          .close();
        
        expect(results).toEqual(expected);

        assertSpyCalls(fn, 3);

        assertSpyCall(fn, 0, ({ args: [11, 0, [11, 12, 13]]}));

        assertSpyCall(fn, 1, ({ args: [12, 1, [11, 12, 13]] }));

        assertSpyCall(fn, 2, ({ args: [13, 2, [11, 12, 13]] }));
      });
      it('works if you pass a set', () => {
        const fn = spy(() => 'a');
        const values = new Set([11, 12, 13]);
        const expected = new Set([11, 12, 13]); // results from fn never are applied.

        const results = chain(values)
          .chainForEach(fn)
          .close();
        
        expect(results).toEqual(expected);

        assertSpyCalls(fn, 3);

        assertSpyCall(fn, 0, ({ args: [11, 11, new Set([11, 12, 13])]}));

        assertSpyCall(fn, 1, ({ args: [12, 12, new Set([11, 12, 13])] }));

        assertSpyCall(fn, 2, ({ args: [13, 13, new Set([11, 12, 13])] }));
      });
      it('works if you pass a set', () => {
        const fn = spy(() => 'a');
        const values = new Set([11, 12, 13]);
        const expected = new Set([11, 12, 13]); // results from fn never are applied.

        const results = chain(values)
          .chainForEach(fn)
          .close();
        
        expect(results).toEqual(expected);

        assertSpyCalls(fn, 3);

        assertSpyCall(fn, 0, ({ args: [11, 11, new Set([11, 12, 13])]}))

        assertSpyCall(fn, 1, ({ args: [12, 12, new Set([11, 12, 13])] }))

        assertSpyCall(fn, 2, ({ args: [13, 13, new Set([11, 12, 13])] }))
      });
      it('works if you pass a map', () => {
        const fn = spy(() => 'a');
        const values = new Map([['eleven', 11], ['twelve', 12], ['thirteen', 13]]);
        const expected = new Map([['eleven', 11], ['twelve', 12], ['thirteen', 13]]); // results from fn never are applied.

        expect(values).toStrictEqual(expected);

        chain(values)
          .chainForEach(fn)
          .close();

        assertSpyCalls(fn, 3);

        assertSpyCall(fn, 0, ({ args: [11, 'eleven', new Map([['eleven', 11], ['twelve', 12], ['thirteen', 13]])]}))

        assertSpyCall(fn, 1, ({ args: [12, 'twelve', new Map([['eleven', 11], ['twelve', 12], ['thirteen', 13]])] }))

        assertSpyCall(fn, 2, ({ args: [13, 'thirteen', new Map([['eleven', 11], ['twelve', 12], ['thirteen', 13]])] }));
      });
    });
    describe('fails', () => {
      it('if the value passed is a string', () => {
        const fn = spy(() => 'a');
        const values = 1;
        const expectedError = 'chainForEach expects an array, but was passed:1';

        expect(() => chain(values).chainForEach(fn)).toThrow(expectedError);
      });
    });
  });

  describe('chainReduce', () => {
    it('reduce works as expected', () => {
      const reduceArray = (result:any, value:any) => result + value;
      const value = [1, 2, 3];
      expect(value.reduce(reduceArray, 0)).toBe(6);
    });
    it('can reduce an array', () => {
      const reduceArray = (result:any, value:any) => result + value;
      
      const value = [1, 2, 3];
      expect(value.reduce(reduceArray, 0)).toBe(6);

      const expected = 6;
      const result = chain(value)
        .chainReduce(reduceArray, 0)
        .value;

      expect(result).toStrictEqual(expected);
    });
    it('throws an error with a single value', () => {
      const reduceArray = (result:any, value:any) => result + value;
      const value = 3;
      const expectedError = 'chainReduce expected an array, but was passed:3';

      expect(() => chain(value).chainReduce(reduceArray, 0))
        .toThrow(expectedError);
    });
    it('can chain a map after a value', () => {
      const initializeCount = (size:any) => Array.from(Array(size)).map((_val, index) => index);
      expect(initializeCount(3)).toStrictEqual([0, 1, 2]);
      const reduceArray = (result:any, value:any) => result + value;
      expect([1, 2, 3].reduce(reduceArray, 0)).toBe(6);
      const addTwo = (value:any) => value + 2;
      expect(addTwo(2)).toBe(4);

      const value = 3;
      const expected = 9;
      const result = chain(value)
        .chain(initializeCount)
        .chainMap(addTwo)
        .chainReduce(reduceArray, 0)
        .value;

      expect(result).toStrictEqual(expected);
    });
  });

  describe('debug', () => {

    let consoleMock:ConsoleI;

    beforeEach(() => {
      consoleMock = mockConsole();
    });
    afterEach(() => {
      removeConsoleMock();
    });
    it('can detect console', () => {
      console.log('test');

      assertSpyCalls(consoleMock.log, 1);
    });
    it('can detect it not being called', () => {
      assertSpyCalls(consoleMock.log, 0);
    });
    it('can debug a value', () => {
      const value = 3;
      const expected = 6;
      const results = chain(value)
        .chain((v:any) => v + 3)
        .debug()
        .value;
      // expect(console.log).toHaveBeenCalled();
      // expect(console.log.mock.calls[0][0]).toBe(6);

      assertSpyCalls(consoleMock.log, 1);
      assertSpyCall(consoleMock.log, 0, ({ args: [6]}));

      expect(results).toBe(expected);
    });
    it('can support a custom debug', () => {
      const fnMock = spy();
      const value = 3;
      const expected = 6;
      const results = chain(value)
        .chain((v:any) => v + 3)
        .debug(fnMock)
        .value;

      assertSpyCalls(fnMock, 1);
      assertSpyCall(fnMock, 0, ({ args: [6]}));

      expect(results).toBe(expected);
    });
    it('standard debug line', () => {
      const addTwo = (val:any) => val + 2;
      expect(addTwo(3)).toBe(5);

      const expected = 10;
      const results = chain(3)
        .chain(addTwo)
        .chain(addTwo)
        .debug()
        .chain((value:any) => value + 3)
        .value;
      
      expect(results).toBe(expected);

      // expect(console.log.mock.calls[0][0]).toBe(7);

      assertSpyCalls(consoleMock.log, 1);
      assertSpyCall(consoleMock.log, 0, ({ args: [7]}));
    });
  });

  describe('close', () => {
    it('returns the value', () => {
      const value = 234;
      const expected = 234;
      const result = chain(value).close();
      expect(result).toBe(expected);
    });
    it('chains on closes', () => {
      const value = 234;
      const expected = 468;
      const double = (v:any) => v + v;
      const result = chain(value).close(double);
      expect(result).toBe(expected);
    });
  });

  describe('errorHandler', () => {

    let consoleMock:ConsoleI;

    beforeEach(() => {
      consoleMock = mockConsole();
    });
    afterEach(() => {
      removeConsoleMock();
    });

    it('still closes even if no error handler', () => {
      const customError = Error('CustomError');
      const throwError = () => {
        throw customError;
      };

      const value = 2;
      const c = chain(value);
      
      expect(
        () => c.chain(throwError)
      ).toThrow('CustomError');
    });
    it('can use custom error handling', () => {
      let customErrorFlag = false;
      const catchCustomError = spy(() => {
        customErrorFlag = true;
      });
      const customError = Error('CustomError');
      const throwError = () => {
        throw customError;
      };

      const value = 2;
      const c = chain(value)
        .errorHandler(catchCustomError);
      
      expect(
        () => c.chain(throwError)
      ).toThrow('CustomError');

      // expect(catchCustomError).toHaveBeenCalled();
      // expect(catchCustomError.mock.calls[0][0]).toBe(customError);

      assertSpyCalls(catchCustomError, 1);
      assertSpyCall(catchCustomError, 0, ({ args: [ customError ]}))

      expect(customErrorFlag).toBe(true);
    });
    describe('errorHandlers are passed down', () => {
      it('onChain', () => {
        let customErrorFlag = false;
        const catchCustomError = spy(() => {
          customErrorFlag = true;
        });
        const customError = Error('CustomError');
        const throwError = () => {
          throw customError;
        };

        const identity = (v:any) => v;

        const value = 2;
        const c = chain(value)
          .chain(identity)
          .errorHandler(catchCustomError);
        
        expect(
          () => c.chain(throwError)
        ).toThrow('CustomError');

        // expect(catchCustomError).toHaveBeenCalled();
        // expect(catchCustomError.mock.calls[0][0]).toBe(customError);

        assertSpyCalls(catchCustomError, 1);
        assertSpyCall(catchCustomError, 0, ({ args: [ customError ]}))

        expect(customErrorFlag).toBe(true);
      });
      it('on chainMap', () => {
        let customErrorFlag = false;
        const catchCustomError = spy(() => {
          customErrorFlag = true;
        });
        const customError = Error('CustomError');
        const throwError = () => {
          throw customError;
        };

        const identity = (v:any) => v;

        const value = [2];
        const c = chain(value)
          .chainMap(identity)
          .errorHandler(catchCustomError);
        
        expect(
          () => c.chain(throwError)
        ).toThrow('CustomError');

        // expect(catchCustomError).toHaveBeenCalled();
        // expect(catchCustomError.mock.calls[0][0]).toBe(customError);

        assertSpyCalls(catchCustomError, 1);
        assertSpyCall(catchCustomError, 0, ({ args: [ customError ]}))

        expect(customErrorFlag).toBe(true);
      });
      it('on chainReduce', () => {
        let customErrorFlag = false;
        const catchCustomError = spy(() => {
          customErrorFlag = true;
        });
        const customError = Error('CustomError');
        const throwError = () => {
          throw customError;
        };

        const value = [2];
        const c = chain(value)
          .chainReduce((result:any, v:any) => result + v, 0)
          .errorHandler(catchCustomError);
        
        expect(
          () => c.chain(throwError)
        ).toThrow('CustomError');

        // expect(catchCustomError).toHaveBeenCalled();
        // expect(catchCustomError.mock.calls[0][0]).toBe(customError);

        assertSpyCalls(catchCustomError, 1);
        assertSpyCall(catchCustomError, 0, ({ args: [ customError ]}))

        expect(customErrorFlag).toBe(true);
      });
    });
  });
  describe('clone', () => {

    let consoleMock:ConsoleI;

    beforeEach(() => {
      consoleMock = mockConsole();
    });
    afterEach(() => {
      removeConsoleMock();
    });

    describe('errorHandler', () => {
      it('passes the value along', () => {
        const value = 234;
        const expected = 234;
        
        const c = chain(value);

        const c2 = c.clone();

        const result = c2.close();

        expect(result).toBe(expected);
      });
      it('can use custom error handling', () => {
        let customErrorFlag = false;
        const catchCustomError = spy(() => {
          customErrorFlag = true;
        });
        const customError = Error('CustomError');
        const throwError = () => {
          throw customError;
        };
  
        const value = 2;
        const c = chain(value)
          .errorHandler(catchCustomError);

        const c2 = c.clone();
        
        expect(
          () => c2.chain(throwError)
        ).toThrow('CustomError');
  
        // expect(catchCustomError).toHaveBeenCalled();
        // expect(catchCustomError.mock.calls[0][0]).toBe(customError);

        assertSpyCalls(catchCustomError, 1);
        assertSpyCall(catchCustomError, 0, ({ args: [ customError ]}))
  
        expect(customErrorFlag).toBe(true);
      });
    });
  });

  describe('console to string overrides', () => {
    it('toString', () => {
      const val = 2;
      const expected = `{\n  "value": 2\n}`;
      const results = chain(val).toString();
      expect(results).toBe(expected);
    });
    it('inspect', () => {
      const val = 2;
      const expected = `{\n  "value": 2\n}`;
      const results = chain(val).inspect();
      expect(results).toBe(expected);
    });
    it('toJSON', () => {
      const val = 2;
      const results = chain(val).toJSON();
      expect(results.value).toBe(val);
    });
  });

  describe('chainFilter', () => {
    describe('fails', () => {
      it('if the filter is applied against a non-array', () => {
        const expected = 'chainFilter expects an array, but was passed:2';
        const initialValue = 2;

        expect(() => chain(initialValue).chainFilter((val) => val > 1)).toThrow(expected);
      });
    });
    describe('can filter', () => {
      it('an array of a couple values', () => {
        const expected = [3,4,5];
        const initialValue = [1,2,3,4,5];
        const result = chain(initialValue).chainFilter((val) => val >= 3).close();
        expect(result).toStrictEqual(expected);
      });
      it('an array of a single value', () => {
        const expected = [3];
        const initialValue = [3];
        const result = chain(initialValue).chainFilter((val) => val >= 3).close();
        expect(result).toStrictEqual(expected);
      });
      it('an array of no values', () => {
        const expected:any[] = [];
        const initialValue:any[] = [];
        const result = chain(initialValue).chainFilter((val) => val >= 3).close();
        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('chainFlatMap', () => {
    let consoleMock:ConsoleI;

    beforeEach(() => {
      consoleMock = mockConsole();
    });
    afterEach(() => {
      removeConsoleMock();
    });

    it('cannot chain a non function', () => {
      const initialVal = 2;
      const expected = 'chainFlatMap expects an array, but was passed:2';
      const flatMapFn = (val:number) => val * 2;

      expect(() => {
        chain(initialVal).chainFlatMap(flatMapFn)
      }).toThrow(expected);
    });

    it('can flatten a map function', () => {
      const initialVal = [1, 2, 3];
      const expected = [2, 1, 4, 1, 6, 1]
      const flatMapFn = (val:number) => [val * 2, 1];
      const result = chain(initialVal).chainFlatMap(flatMapFn).close();

      expect(result).toStrictEqual(expected);
    });
  });

  describe('execute', () => {
    const executeSpy = spy();
    const initialValue = 2;
    const result = chain(initialValue).execute(executeSpy).close();

    expect(result).toStrictEqual(initialValue);

    assertSpyCalls(executeSpy, 1);
    assertSpyCall(executeSpy, 0, ({ args: [initialValue ]}));
  });

  describe('replace', () => {
    it('can replace a value', () => {
      const initialValue = 2;
      const expected = 4;
      const result = chain(initialValue).replace(expected).close();
      expect(result).toStrictEqual(expected);
    });
  });
});

