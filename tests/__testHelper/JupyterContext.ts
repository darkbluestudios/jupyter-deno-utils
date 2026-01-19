import { Spy, spy } from "@std/testing/mock";

/**
 * Helper for classes that need to mock being within the iJavaScript context
 * @ignore
 * @private
 */

/**
 * Mock to verify messages being sent to the console.
 * 
 * @ignore
 * @private
 */
export interface ConsoleI {
  log: Spy;
  warn: Spy;
  error: Spy;
  trace: Spy;
};

/**
 * Function to export a mime value
 * 
 * @ignore
 * @private
 */
type MimeFn = (a: string) => void;

/**
 * Mock Display for accepting mime types sent to jupyter
 * 
 * @ignore
 * @private
 */
export interface DisplayI {
  text: MimeFn;
  png: MimeFn;
  svg: MimeFn;
  html: MimeFn;
  jpg: MimeFn;
  mime: MimeFn;
  sendResults: MimeFn;
}

/*
/#
 * 
 * @param name Name of the display to create
 * @returns 
 #/
export const createNewDisplay = (name?:string) => {
  const valueFn = spy((value) => `display:${name}:${(value)}`);
  const newDisplay = ({
    async: valueFn,
    text: valueFn,
    png: valueFn,
    svg: valueFn,
    html: valueFn,
    jpg: valueFn,
    mime: valueFn,
    sendResults: valueFn
  });
  return newDisplay;
};

/#
 * Stubs the information needed for the tests to believe you are running within Jupyter
 #/
export const stubJupyterContext = () => {
  //  const newContext = ({
  //    ...createNewDisplay(),
  //    createDisplay: createNewDisplay,
  //    sendResult: () => {}
  //  });
  //  //globalThis.$$ = newContext;
  //
  //  // global.console = ({
  //  //   error: spy(),
  //  //   log: spy(),
  //  //   warn: spy()
  //  // });
};

/#
 * Restores the settings so the tests no longer believe
 * they are running within Jupyter
 #/
export const removeIJSContext = () => {
  // delete globalThis.$$;
};
*/

const originalConsoleLog:any = console.log;
const originalConsoleWarn:any = console.warn;
const originalConsoleError:any = console.error;
const originalConsoleTrace:any = console.trace;

const stubFn = () => null;

let consoleMock:ConsoleI | null;

export const mockConsole = () => {
  if (!consoleMock) {
    console.log = stubFn;
    console.warn = stubFn;
    console.error = stubFn;
    console.trace = stubFn;

    consoleMock = ({
      log: spy(console, 'log'),
      warn: spy(console, 'warn'),
      error: spy(console, 'error'),
      trace: spy(console, 'trace')
    });
  }

  return consoleMock;
};
export const removeConsoleMock = () => {
  if (consoleMock) {
    consoleMock.log.restore();
    consoleMock.warn.restore();
    consoleMock.error.restore();
    consoleMock.trace.restore();

    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    console.trace = originalConsoleTrace;
    consoleMock = null;
  }
};

