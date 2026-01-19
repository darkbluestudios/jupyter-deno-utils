import {
  Spy
} from "@std/testing/mock";

/**
 * Interface for mocking the console
 * @private
 */
export type ConsoleI = {
  log: Spy,
  warn: Spy,
  error: Spy,
  trace: Spy,
};