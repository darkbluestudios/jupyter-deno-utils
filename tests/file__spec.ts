import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { assertSpyCalls, stub, type Spy } from "@std/testing/mock";
import { resolve } from "@std/path";
import FileUtil from "../src/file.ts";
import { FileMock } from "../__testHelper__/FileMock.ts";
import {
  type ConsoleI,
  mockConsole,
  removeConsoleMock,
} from "./__testHelper/JupyterContext.ts";

// Mutable state for Deno stubs (set per test).
// exists: when statSyncThrows is true, path is treated as not existing.
let statSyncThrows = false;
let readTextFileSyncReturn = "";
let readTextFileSyncShouldThrow = false;
let writeTextFileSyncThrowOnce = false;
let statSyncReturn: { isDirectory: boolean } = { isDirectory: true };
let readDirSyncReturn: Deno.DirEntry[] = [];
let readDirSyncShouldThrow = false;

let readTextFileSyncStub: Spy;
let writeTextFileSyncStub: Spy;
let statSyncStub: Spy;
let readDirSyncStub: Spy;

describe("FileUtil", () => {
  let _consoleMock: ConsoleI;

  beforeEach(() => {
    _consoleMock = mockConsole();
    statSyncThrows = false;
    readTextFileSyncReturn = "";
    readTextFileSyncShouldThrow = false;
    writeTextFileSyncThrowOnce = false;
    statSyncReturn = { isDirectory: true };
    readDirSyncReturn = [];
    readDirSyncShouldThrow = false;

    statSyncStub = stub(Deno, "statSync", (_path: string | URL) => {
      if (statSyncThrows) throw new Error("NotFound");
      return statSyncReturn as Deno.FileInfo;
    });
    readTextFileSyncStub = stub(Deno, "readTextFileSync", (_path: string | URL) => {
      if (readTextFileSyncShouldThrow) {
        throw new Error("throw an error if the file could not be read");
      }
      return readTextFileSyncReturn;
    });
    writeTextFileSyncStub = stub(Deno, "writeTextFileSync", (
      _path: string | URL,
      _data: string,
      _options?: { append?: boolean },
    ) => {
      if (writeTextFileSyncThrowOnce) {
        writeTextFileSyncThrowOnce = false;
        throw new Error("throw an error if the file could not be read");
      }
    });
    readDirSyncStub = stub(Deno, "readDirSync", (_path: string | URL) => {
      if (readDirSyncShouldThrow) {
        throw new Error("throw an error if the file could not be read");
      }
      return readDirSyncReturn[Symbol.iterator]();
    });
  });

  afterEach(() => {
    readTextFileSyncStub.restore();
    writeTextFileSyncStub.restore();
    statSyncStub.restore();
    readDirSyncStub.restore();
    removeConsoleMock();
  });

  describe("readJSON", () => {
    it("reads a json with a resolved path", () => {
      statSyncThrows = false;
      readTextFileSyncReturn = JSON.stringify({ success: true });

      const results = FileUtil.readJSON("./sampleFile");
      const resultsStr = JSON.stringify(results);
      const expected = JSON.stringify({ success: true });
      expect(resultsStr).toBe(expected);
    });
    it("returns undefined if the file cannot be found", () => {
      statSyncThrows = true;

      const results = FileUtil.readJSON("./sampleFile");
      expect(results).toBeUndefined();
    });
    it("shows an error if the file could not be read", () => {
      statSyncThrows = false;
      readTextFileSyncShouldThrow = true;

      FileUtil.readJSON("./sampleFile");

      assertSpyCalls(_consoleMock.error, 1);
    });
  });

  describe("can check for errors thrown", () => {
    it("tests that a function that throws can be asserted", () => {
      const fn = () => {
        throw new Error("some error");
      };
      expect(() => fn()).toThrow("some error");
    });
  });

  describe("readFile", () => {
    it("reads a file", () => {
      statSyncThrows = false;
      readTextFileSyncReturn = "success";

      const results = FileUtil.readFile("./sampleFile");
      expect(results).toBe("success");
    });
    it("returns undefined if the file cannot be found", () => {
      statSyncThrows = true;

      const results = FileUtil.readFile("./sampleFile");
      expect(results).toBeUndefined();
    });
    it("shows an error if the file could not be read", () => {
      statSyncThrows = false;
      readTextFileSyncShouldThrow = true;

      FileUtil.readFile("./sampleFile");

      assertSpyCalls(_consoleMock.error, 1);
    });
  });

  describe("writeJSON", () => {
    describe("writes text", () => {
      it("writes text", () => {
        const message = { message: "success" };
        const expected = JSON.stringify(message, null, 2);

        FileUtil.writeJSON("./sampleFile", message);

        assertSpyCalls(writeTextFileSyncStub, 1);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expected);
      });
      it("appends if appends is true", () => {
        const message = { message: "success" };
        const expected = '{\n  "message": "success"\n}';
        const args = { append: true };

        FileUtil.writeJSON("./sampleFile", message, args);

        assertSpyCalls(writeTextFileSyncStub, 1);
        const callArgs = writeTextFileSyncStub.calls[0].args;
        expect(callArgs[2]).toEqual({ append: true });
        const result = callArgs[1];
        expect(result).toBe(expected);
      });
      it("appends with a prefix", () => {
        const message = { message: "success" };
        const expected = '[{\n  "message": "success"\n}';
        const args = { append: true, prefix: "[" };

        FileUtil.writeJSON("./sampleFile", message, args);

        assertSpyCalls(writeTextFileSyncStub, 1);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expected);
      });
      it("appends with a suffix", () => {
        const message = { message: "success" };
        const expected = '{\n  "message": "success"\n}]';
        const args = { append: true, suffix: "]" };

        FileUtil.writeJSON("./sampleFile", message, args);

        assertSpyCalls(writeTextFileSyncStub, 1);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expected);
      });
      it("appends with a prefix and a suffix", () => {
        const message = { message: "success" };
        const expected = '[{\n  "message": "success"\n}]';
        const args = { append: true, prefix: "[", suffix: "]" };

        FileUtil.writeJSON("./sampleFile", message, args);

        assertSpyCalls(writeTextFileSyncStub, 1);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expected);
      });
    });
    describe("fails", () => {
      it("logs when the file cannot be written", () => {
        const message = { message: "success" };
        writeTextFileSyncThrowOnce = true;

        FileUtil.writeJSON("./sampleFile", message);

        assertSpyCalls(_consoleMock.error, 1);
      });
      it("shows an error if the file could not be written", () => {
        const message = { message: "success" };
        writeTextFileSyncThrowOnce = true;

        FileUtil.writeJSON("./sampleFile", message);

        assertSpyCalls(_consoleMock.error, 1);
      });
    });
  });

  describe("writeFile", () => {
    describe("writes text", () => {
      it("synchronously", () => {
        const message = "Success";
        const expected = message;

        FileUtil.writeFile("./sampleFile", message);

        assertSpyCalls(writeTextFileSyncStub, 1);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expected);
      });
      it("appends text", () => {
        const message = "Success";
        const expected = message;
        const options = { append: true };

        FileUtil.writeFile("./sampleFile", message, options);

        assertSpyCalls(writeTextFileSyncStub, 1);
        expect(writeTextFileSyncStub.calls[0].args[2]).toEqual({ append: true });
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expected);
      });
    });
    describe("fails", () => {
      it("logs when the file cannot be written", () => {
        const message = { message: "success" };
        writeTextFileSyncThrowOnce = true;

        FileUtil.writeFile("./sampleFile", message as unknown as string);
      });
      it("shows an error if the file could not be written", () => {
        const message = "success";
        writeTextFileSyncThrowOnce = true;

        FileUtil.writeFile("./sampleFile", message);

        // writeFile logs 3 times: message, err.message, err.stack
        assertSpyCalls(_consoleMock.error, 3);
      });
    });
  });

  describe("writeFileStd", () => {
    it("writes text", () => {
      const message = "Success";
      const expected = message;

      FileUtil.writeFileStd("./sampleFile", message);

      assertSpyCalls(writeTextFileSyncStub, 1);
      const result = writeTextFileSyncStub.calls[0].args[1];
      expect(result).toBe(expected);
    });
    it("provides an error message if the file cannot be written", () => {
      const message = { message: "success" };
      writeTextFileSyncThrowOnce = true;

      FileUtil.writeFileStd("./sampleFile", message as unknown as string);

      // writeFile logs 3 times: message, err.message, err.stack
      assertSpyCalls(_consoleMock.error, 3);
    });
  });

  describe("pwd", () => {
    it("pwd returns the current path resolved", () => {
      const result = FileUtil.pwd();
      expect(result).toBeTruthy();
    });
  });

  describe("listFiles", () => {
    it("lists files in a folder that exists", () => {
      statSyncThrows = false;
      statSyncReturn = { isDirectory: true };
      readDirSyncReturn = [new FileMock("Success")];

      const results = FileUtil.listFiles("./tmp");
      expect(results).toEqual(["Success"]);
    });
    it("does not list files if the path does not exist", () => {
      statSyncThrows = true;

      const results = FileUtil.listFiles("./tmp");
      expect(results).toBeUndefined();
    });
    it("does not list files for a file", () => {
      statSyncThrows = false;
      statSyncReturn = { isDirectory: false };

      const results = FileUtil.listFiles("./tmp");
      expect(results).toBeUndefined();
    });
    it("shows an error if the file could not be listed", () => {
      statSyncThrows = false;
      statSyncReturn = { isDirectory: true };
      readDirSyncShouldThrow = true;

      FileUtil.listFiles("./tmp");

      assertSpyCalls(_consoleMock.error, 1);
    });
    it("can accept a listdir argument", () => {
      statSyncThrows = false;
      statSyncReturn = { isDirectory: true };
      readDirSyncReturn = [new FileMock("a")];

      const results = FileUtil.listFiles("./tmp", { withFileTypes: true });
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      assertSpyCalls(readDirSyncStub, 1);
      expect(readDirSyncStub.calls[0].args[0]).toBeDefined();
    });
  });

  describe("matchFiles", () => {
    describe("can match files", () => {
      it("with the full path", () => {
        const dirPath = "./tmp";
        const resultList = ["a", "b", "c", "d"].map((str) => new FileMock(str));
        const expected = ["a", "b"].map((str) => resolve(dirPath, str));

        statSyncThrows = false;
        statSyncReturn = { isDirectory: true };
        readDirSyncReturn = resultList;

        const evenFn = (val: string) => val === "a" || val === "b";
        const results = FileUtil.matchFiles(dirPath, evenFn);

        expect(results).toEqual(expected);
      });
      it("without the full path", () => {
        const dirPath = "./tmp";
        const resultList = ["a", "b", "c", "d"].map((str) => new FileMock(str));
        const expected = ["a", "b"];

        statSyncThrows = false;
        statSyncReturn = { isDirectory: true };
        readDirSyncReturn = resultList;

        const evenFn = (val: string) => val === "a" || val === "b";
        const results = FileUtil.matchFiles(dirPath, evenFn, false);

        expect(results).toEqual(expected);
      });
    });

    describe("does not fail", () => {
      it("if no results are found", () => {
        const dirPath = "./tmp";
        const resultList: Deno.DirEntry[] = [];
        const expected: string[] = [];

        statSyncThrows = false;
        statSyncReturn = { isDirectory: true };
        readDirSyncReturn = resultList;

        const evenFn = (val: string) => val === "a" || val === "b";
        const results = FileUtil.matchFiles(dirPath, evenFn, false);

        expect(results).toEqual(expected);
      });
      it("if matcher says no matches found", () => {
        const dirPath = "./tmp";
        const resultList = ["a", "b", "c"].map((str) => new FileMock(str));
        const expected: string[] = [];

        statSyncThrows = false;
        statSyncReturn = { isDirectory: true };
        readDirSyncReturn = resultList;

        const noFn = (_val: string) => false;
        const results = FileUtil.matchFiles(dirPath, noFn, false);

        expect(results).toEqual(expected);
      });
    });
  });

  describe("checkFile", () => {
    describe("with no files passed", () => {
      it("fails if null is passed", () => {
        expect(() => FileUtil.checkFile(null as unknown as string)).toThrow();
      });
      it("fails if null is passed with other valid arguments", () => {
        expect(() =>
          FileUtil.checkFile("./testFile", null as unknown as string),
        ).toThrow();
      });
      it("returns null if no arguments passed", () => {
        const expected = null;
        const results = FileUtil.checkFile();
        expect(results).toBe(expected);
      });
      it("returns null if empty array passed in first argument", () => {
        const expected = null;
        const results = FileUtil.checkFile([]);
        expect(results).toBe(expected);
      });
    });
    describe("with one file", () => {
      it("and file exists", () => {
        const expected = null;
        statSyncThrows = false;

        const results = FileUtil.checkFile("./file1");
        expect(results).toBe(expected);
        assertSpyCalls(statSyncStub, 1);
        const call = statSyncStub.calls[0].args[0];
        expect(String(call)).toContain("file1");
      });

      it("and file does not exist", () => {
        statSyncThrows = true;

        const results = FileUtil.checkFile("./file1");
        expect(results).toBeTruthy();
        expect(Array.isArray(results)).toBe(true);
        expect(results!.length).toBe(1);
        expect(results![0]).toContain("file1");
        assertSpyCalls(statSyncStub, 1);
        const call = statSyncStub.calls[0].args[0];
        expect(String(call)).toContain("file1");
      });
    });
    describe("with file array", () => {
      it("and file exists", () => {
        const expected = null;
        statSyncThrows = false;

        const results = FileUtil.checkFile(["./file1"]);
        expect(results).toBe(expected);
        assertSpyCalls(statSyncStub, 1);
        const call = statSyncStub.calls[0].args[0];
        expect(String(call)).toContain("file1");
      });

      it("and file does not exist", () => {
        statSyncThrows = true;

        const results = FileUtil.checkFile(["./file1"]);
        expect(results).toBeTruthy();
        expect(Array.isArray(results)).toBe(true);
        expect(results!.length).toBe(1);
        expect(results![0]).toContain("file1");
        assertSpyCalls(statSyncStub, 1);
      });
    });
    describe("with multiple arguments", () => {
      describe("and file exists", () => {
        it("with separate arguments", () => {
          statSyncThrows = false;
          const results = FileUtil.checkFile("./file1", "./file2");
          expect(results).toBe(null);
          assertSpyCalls(statSyncStub, 2);
        });
        it("with array", () => {
          statSyncThrows = false;
          const results = FileUtil.checkFile(["./file1", "./file2"]);
          expect(results).toBe(null);
          assertSpyCalls(statSyncStub, 2);
        });
      });

      describe("and file does not exist", () => {
        it("with separate arguments", () => {
          statSyncStub.restore();
          const throwOnCall = [false, true]; // second path "does not exist"
          let idx = 0;
          statSyncStub = stub(Deno, "statSync", () => {
            if (throwOnCall[idx++]) throw new Error("NotFound");
            return statSyncReturn as Deno.FileInfo;
          });

          const results = FileUtil.checkFile("./file1", "./file2");

          expect(results).toBeTruthy();
          expect(Array.isArray(results)).toBe(true);
          expect(results!.length).toBe(2);
          expect(results![0]).toBeFalsy();
          expect(results![1]).toContain("file2");
          assertSpyCalls(statSyncStub, 2);
        });
        it("as array of arguments", () => {
          statSyncStub.restore();
          const throwOnCall = [false, true];
          let idx = 0;
          statSyncStub = stub(Deno, "statSync", () => {
            if (throwOnCall[idx++]) throw new Error("NotFound");
            return statSyncReturn as Deno.FileInfo;
          });

          const results = FileUtil.checkFile(["./file1", "./file2"]);

          expect(results).toBeTruthy();
          expect(Array.isArray(results)).toBe(true);
          expect(results!.length).toBe(2);
          expect(results![0]).toBeFalsy();
          expect(results![1]).toContain("file2");
          assertSpyCalls(statSyncStub, 2);
        });
      });
    });
  });

  describe("fileExists", () => {
    it("and file exists", () => {
      const expected = true;
      statSyncThrows = false;

      const results = FileUtil.fileExists("./file1");
      expect(results).toBe(expected);
      assertSpyCalls(statSyncStub, 1);
      const call = statSyncStub.calls[0].args[0];
      expect(String(call)).toContain("file1");
    });

    it("and file does not exist", () => {
      statSyncThrows = true;
      const expected = false;

      const results = FileUtil.fileExists("./file1");
      expect(results).toBe(expected);
      assertSpyCalls(statSyncStub, 1);
      const call = statSyncStub.calls[0].args[0];
      expect(String(call)).toContain("file1");
    });
  });

  describe("cacheSerialize deserialize", () => {
    it("can serialize an object with a date", () => {
      const numberValue = 25;
      const strValue = "cuca";
      const dateValue = new Date("2025-01-01T00:00:00.000Z");
      const data = {
        date: dateValue,
        dateButNot: dateValue,
        value: numberValue,
        str: strValue,
      };
      const jsonStr = JSON.stringify(data, null, 0);

      const parsed = JSON.parse(jsonStr, FileUtil.cacheDeserializer as (key: string, value: unknown) => unknown);

      expect(typeof parsed.date).toBe("object");
      expect(typeof parsed.dateButNot).toBe("string");

      expect(parsed.date).toStrictEqual(dateValue);
      expect(parsed.dateButNot).toStrictEqual(dateValue.toISOString());

      expect(parsed.value).toStrictEqual(numberValue);
      expect(parsed.str).toStrictEqual(strValue);
    });
  });

  describe("useCache", () => {
    describe("readJSON", () => {
      it("reads a json with a resolved path", () => {
        const shouldWrite = false;
        const cachePath = "./tmp";
        const cacheFile = "sampleFile";
        const expensiveFn = () => ({ success: true });

        statSyncThrows = false;
        readTextFileSyncReturn = JSON.stringify({ success: true });

        const expected = { success: true };
        const results = FileUtil.useCache(
          shouldWrite,
          cachePath,
          cacheFile,
          expensiveFn,
        );

        expect(results).toStrictEqual(expected);
      });
      it("reads a json with a date in it", () => {
        const shouldWrite = false;
        const cachePath = "./tmp";
        const cacheFile = "sampleFile";
        const expensiveFn = () => ({ success: true });

        const dateValue = new Date("2025-01-01T00:00:00.000Z");
        const data = {
          date: dateValue,
          series: "a",
        };
        const dataJSON = JSON.stringify(data, null, 0);
        const parsedJSON = JSON.parse(
          dataJSON,
          FileUtil.cacheDeserializer as (key: string, value: unknown) => unknown,
        );

        statSyncThrows = false;
        readTextFileSyncReturn = JSON.stringify(parsedJSON);

        const expected = data;
        const results = FileUtil.useCache(
          shouldWrite,
          cachePath,
          cacheFile,
          expensiveFn,
        );

        expect(results).toStrictEqual(expected);
      });
    });
    describe("writeJSON", () => {
      it("writes to the cache", () => {
        const shouldWrite = true;
        const cachePath = "./tmp";
        const cacheFile = "sampleFile";

        const dateValue = new Date("2025-01-01T00:00:00.000Z");
        const expensiveResults = { success: true, date: dateValue };
        const expensiveResultsStr = JSON.stringify(expensiveResults, null, 2);
        const expensiveFn = () => expensiveResults;

        const cacheResults = FileUtil.useCache(
          shouldWrite,
          cachePath,
          cacheFile,
          expensiveFn,
        );

        expect(cacheResults).toStrictEqual(expensiveResults);
        assertSpyCalls(writeTextFileSyncStub, 1);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expensiveResultsStr);
      });
      it("writes to the cache without a trailing slash", () => {
        const shouldWrite = true;
        const cachePath = "./tmp";
        const cacheFile = "sampleFile";

        const dateValue = new Date("2025-01-01T00:00:00.000Z");
        const expensiveResults = { success: true, date: dateValue };
        const expensiveResultsStr = JSON.stringify(expensiveResults, null, 2);
        const expensiveFn = () => expensiveResults;

        const cacheResults = FileUtil.useCache(
          shouldWrite,
          cachePath,
          cacheFile,
          expensiveFn,
        );

        expect(cacheResults).toStrictEqual(expensiveResults);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expensiveResultsStr);
      });
      it("writes to the cache with a trailing slash", () => {
        const shouldWrite = true;
        const cachePath = "./";
        const cacheFile = "sampleFile";

        const dateValue = new Date("2025-01-01T00:00:00.000Z");
        const expensiveResults = { success: true, date: dateValue };
        const expensiveResultsStr = JSON.stringify(expensiveResults, null, 2);
        const expensiveFn = () => expensiveResults;

        const cacheResults = FileUtil.useCache(
          shouldWrite,
          cachePath,
          cacheFile,
          expensiveFn,
        );

        expect(cacheResults).toStrictEqual(expensiveResults);
        const result = writeTextFileSyncStub.calls[0].args[1];
        expect(result).toBe(expensiveResultsStr);
      });
    });
  });
});
