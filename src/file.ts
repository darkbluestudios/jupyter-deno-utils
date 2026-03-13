import { resolve } from "@std/path";

/**
 * Simple file utilities for working with files,
 * (or storing and loading json data)
 *
 * * Writing files
 *   * {@link writeFile} - write or append to file with plain text
 *   * {@link writeJSON} - write or append to a file with objects converted to JSON
 * * reading files
 *   * {@link readFile} - read a file as plain text
 *   * {@link readJSON} - read data as JSON
 * * listing directory
 *   * {@link pwd} - list the current path
 *   * {@link listFiles} - list files in a given path
 *   * {@link matchFiles} - find files or directories based on type of file or name
 * * checking files exist
 *   * {@link checkFile} - check if a file at a path exists
 *   * {@link fileExists} - check if a single file at a path exists
 * * using a cache for long running executions
 *   * {@link useCache} - perform an expensive calculation and write to a cache, or read from the cache transparently
 *
 * ---
 *
 * For example, we just generated a dataset we want to come back to.
 *
 * ```
 * const weather = [
 *   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
 *   { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 },
 *   { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 },
 *   { id: 3, city: 'New York', month: 'Apr', precip: 3.94 },
 *   { id: 4, city: 'New York', month: 'Aug', precip: 4.13 },
 *   { id: 5, city: 'New York', month: 'Dec', precip: 3.58 },
 *   { id: 6, city: 'Chicago',  month: 'Apr', precip: 3.62 },
 *   { id: 8, city: 'Chicago',  month: 'Dec', precip: 2.56 },
 *   { id: 7, city: 'Chicago',  month: 'Aug', precip: 3.98 }
 * ];
 * utils.file.writeJSON('./data/weather.json', weather);
 * ```
 *
 * ... Later on
 *
 * I forgot which directory that the notebook is running in:
 *
 * ```
 * utils.file.pwd();
 * // /Users/path/to/notebook/
 * ```
 *
 * Now, I'd like to look at the files I currently have saved:
 *
 * ```
 * utils.file.listFiles('.');
 * // [ 'data', 'package.json', ... ]
 *
 * utils.file.listFiles('./data');
 * // ['weather.json', 'barley.json', 'cars.json']
 * ```
 *
 * Great! we can load in the data
 *
 * ```
 * data = utils.file.readJSON('./data/weather.json');
 * // -- data already deserialized
 * data.length
 * // 9
 *
 * ... continue massaging the data as we wanted.
 * ```
 */

const logger = {
  get error() {
    return console.error;
  },
};

function existsSync(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch {
    return false;
  }
}

/** Options for reading files (encoding, reviver for JSON) */
export interface ReadOptions {
  encoding?: string;
  reviver?: (key: string, value: unknown) => unknown;
}

/** Options for writing files (encoding, append, prefix, suffix, replacer, spacing) */
export interface WriteOptions {
  encoding?: string;
  append?: boolean;
  prefix?: string;
  suffix?: string;
  replacer?: ((key: string, value: unknown) => unknown) | null;
  spacing?: number;
}

/** Options for listFiles (e.g. withFileTypes for matchFiles) */
export interface ListFilesOptions {
  withFileTypes?: boolean;
}

/**
 * Read JSON file.
 *
 * Note that this uses 'utf-8' encoding by default
 *
 * @param filePath - path of the file to load
 * @param fsOptions - options to pass for fsRead (ex: { encoding: 'utf-8' })
 * @param fsOptions.reviver - reviver to use when parsing the JSON
 * @param fsOptions.encoding - the encoding to read the JSON with
 * @example
 * const weather = [
 *   { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 },
 *   ...
 * ];
 * utils.file.writeJSON('./data/weather.json', weather);
 *
 * const myWeather = utils.file.readJSON('./data/weather.json');
 * myWeather.length; // 9
 * @see {@link writeJSON} - to write the data
 */
export function readJSON(
  filePath: string,
  fsOptions: ReadOptions = {},
): unknown {
  const resolvedPath = resolve(filePath);
  const optionsDefaults = { encoding: "utf-8" };
  const cleanedOptions = { ...optionsDefaults, ...fsOptions };

  if (!existsSync(resolvedPath)) {
    logger.error("File does not exist: %s", resolvedPath);
    return undefined;
  }

  try {
    const text = Deno.readTextFileSync(resolvedPath);
    const reviver = cleanedOptions.reviver;
    return reviver ? JSON.parse(text, reviver) : JSON.parse(text);
  } catch {
    logger.error(`unable to read file: ${resolvedPath}`);
    return undefined;
  }
}

/**
 * Reads a file in as text.
 *
 * This can be handy for tinkering / cleaning of small sets of data.
 *
 * Note that this uses `utf-8` by default for the encoding
 *
 * @param filePath - path of the file to load
 * @param fsOptions - options to pass for fsRead (ex: { encoding: 'utf-8' })
 * @returns file contents as string, or undefined if not found
 * @see {@link writeFile} - for writing
 * @example
 * sillySong = utils.file.readFile('../data/pirates.txt');
 *
 * sillySong.split(/\n[ \t]*\n/)        // split on multiple line breaks
 *   .map(stanza => stanza.split(/\n/)  // split lines by newline
 *     .map(line => line.trim())        // trim each line
 *   );
 * sillySong[0][0]; // I am the very model of a modern Major-General,
 */
export function readFile(
  filePath: string,
  fsOptions: { encoding?: string } = {},
): string | undefined {
  const resolvedPath = resolve(filePath);
  const optionsDefaults = { encoding: "utf-8" };
  const _cleanedOptions = { ...optionsDefaults, ...fsOptions };

  if (!existsSync(resolvedPath)) {
    logger.error("File does not exist: %s", resolvedPath);
    return undefined;
  }

  try {
    return Deno.readTextFileSync(resolvedPath);
  } catch {
    logger.error(`unable to read file: ${resolvedPath}`);
    return undefined;
  }
}

/**
 * Writes JSON to a file.
 *
 * NOTE that this uses `utf-8` as the default encoding
 *
 * ```
 * const weather = [ ... ];
 * utils.file.writeJSON('./data/weather.json', weather);
 *
 * const myWeather = utils.file.readJSON('./data/weather.json');
 * myWeather.length; // 9
 * ```
 *
 * Note, passing `append:true` in the options, will let you append text before writing,
 * useful for dealing with large and complex files.
 *
 * ```
 * weatherEntry1 = { id: 1, city: 'Seattle',  month: 'Aug', precip: 0.87 };
 * weatherEntry2 = { id: 0, city: 'Seattle',  month: 'Apr', precip: 2.68 };
 * weatherEntry3 = { id: 2, city: 'Seattle',  month: 'Dec', precip: 5.31 };
 *
 * utils.file.writeJSON('./data/weather2.json', weatherEntry1, { prefix: '[' });
 * utils.file.writeJSON('./data/weather2.json', weatherEntry2, { append: true, prefix: ', ' });
 * utils.file.writeJSON('./data/weather2.json', weatherEntry3, { append: true, prefix: ', ', suffix: ']' });
 * ```
 *
 * @param filePath - path of the file to write
 * @param contents - contents of the file (will be JSON.stringify'd)
 * @param fsOptions - nodejs fs writeFileSync, appendFileSync options
 * @param fsOptions.append - if true, will append the text to the file
 * @param fsOptions.prefix - string to add before writing the json, like an opening bracket '[' or comma ','
 * @param fsOptions.suffix - string to add after writing the json, like a closing bracket ']'
 * @param fsOptions.replacer - function to use when writing JSON passed to stringify
 * @param fsOptions.encoding - encoding to use when writing the file
 * @see {@link readJSON} - for reading
 */
export function writeJSON(
  filePath: string,
  contents: unknown,
  fsOptions: WriteOptions = {},
): void {
  const optionsDefaults = { encoding: "utf-8" };
  const cleanedOptions = { ...optionsDefaults, ...fsOptions };
  const isAppend = cleanedOptions.append === true;
  const prefix = cleanedOptions.prefix ?? "";
  const suffix = cleanedOptions.suffix ?? "";
  const replacer = cleanedOptions.replacer ?? null;
  const spacing = cleanedOptions.spacing ?? 2;
  const jsonContents = JSON.stringify(
    contents,
    replacer ?? undefined,
    spacing,
  );

  try {
    const data = prefix + jsonContents + suffix;
    if (isAppend) {
      Deno.writeTextFileSync(filePath, data, { append: true });
    } else {
      Deno.writeTextFileSync(filePath, data);
    }
  } catch {
    logger.error(`unable to write to file: ${filePath}`);
  }
}

/**
 * Writes to a file.
 *
 * Note that this uses `utf-8` as the encoding by default
 *
 * ```
 * const myString = `hello`;
 * utils.file.writeFile('./tmp', myString);
 * const newString = utils.file.readFile('./tmp');
 * newString; // 'hello';
 * ```
 *
 * Note, you can append to the file by passing `{append:true}` in the options.
 *
 * @param filePath - path of the file to write
 * @param contents - contents of the file
 * @param fsOptions - nodejs fs writeFileSync, appendFileSync options
 * @param fsOptions.append - if true, will append the text to the file
 * @param fsOptions.encoding - encoding to use when writing the file
 * @see {@link readFile} - for reading
 */
export function writeFile(
  filePath: string,
  contents: string,
  fsOptions: { encoding?: string; append?: boolean } = {},
): void {
  const resolvedPath = resolve(filePath);
  const optionsDefaults = { encoding: "utf-8" };
  const _cleanedOptions = { ...optionsDefaults, ...fsOptions };
  const isAppend = fsOptions.append === true;

  try {
    if (isAppend) {
      Deno.writeTextFileSync(resolvedPath, contents, { append: true });
    } else {
      Deno.writeTextFileSync(resolvedPath, contents);
    }
  } catch (err: unknown) {
    logger.error(`unable to write to file: ${filePath}`);
    if (err instanceof Error) {
      logger.error("err.message", err.message);
      logger.error(err.stack ?? "");
    }
  }
}

/**
 * Useful when checking values for tests
 * @deprecated Use writeFile
 */
export const writeFileStd = writeFile;

/**
 * List the current path (working directory)
 *
 * @returns current working directory path
 * @see {@link listFiles} - to list the files of a directory
 * @example
 * utils.file.pwd(); // /user/path/to/notebook
 */
export function pwd(): string {
  return resolve(".");
}

/**
 * List files in a directory
 *
 * @param directoryPath - path of the directory to list
 * @param readdirOptions - object with options to pass to readdir (e.g. withFileTypes for matchFiles)
 * @see {@link pwd} - to get the current working directory
 * @see {@link matchFiles} - find files or directories based on type of file or name
 * @example
 * utils.file.listFiles('./');
 * // ['.gitignore', 'data', ... ];
 */
export function listFiles(
  directoryPath: string,
  readdirOptions: ListFilesOptions | null = null,
): string[] | Deno.DirEntry[] | undefined {
  const resolvedPath = resolve(directoryPath);
  if (!existsSync(resolvedPath)) {
    logger.error("Path does not exist: %s", resolvedPath);
    return undefined;
  }
  try {
    const stat = Deno.statSync(resolvedPath);
    if (!stat.isDirectory) {
      logger.error(`Path is not a directory:${resolvedPath}`);
      return undefined;
    }
  } catch {
    logger.error(`Path is not a directory:${resolvedPath}`);
    return undefined;
  }

  try {
    const entries = Array.from(Deno.readDirSync(resolvedPath));
    if (readdirOptions?.withFileTypes) {
      return entries;
    }
    return entries.map((e) => e.name);
  } catch {
    logger.error(`unable to read directory: ${resolvedPath}`);
    return undefined;
  }
}

/**
 * Finds files in a directory, returning only the file names and paths of those that match a function.
 *
 * Note the matching function passes both fileNames and DirEntry objects
 * (fileName: string, file: DirEntry) => boolean
 * allowing for checking for files: `.isFile`, directories: `.isDirectory`, etc.
 *
 * For example, if there is a `./tmp` folder, with:
 *
 * * ./tmp/fileA (file)
 * * ./tmp/fileB (file)
 * * ./tmp/dirA  (directory)
 * * ./tmp/dirB  (directory)
 *
 * You could find only files like the following:
 *
 * ```
 * utils.file.matchFiles('./tmp', (fileName, file) => file.isFile);
 * // ['./tmp/fileA', './tmp/fileB'];
 * ```
 *
 * or find directories ending with the letter B:
 *
 * ```
 * utils.file.matchFiles('./tmp',
 *  (fileName, file) => file.isDirectory && fileName.endsWith('B')
 * );
 * // ['./tmp/dirB'];
 * ```
 *
 * Note: passing false as the last parameter will only return file names
 *
 * ```
 * utils.file.matchFiles('./tmp', (fileName) => fileName.startsWith('file'), false);
 * // ['fileA', 'fileB']
 * ```
 *
 * @param directoryPath - path of the directory to match within
 * @param matchingFunction - (fileName, file) => boolean function to determine if the path should be returned or not
 * @param returnFullPath - whether the full path should be returned (default true)
 * @returns list of the files that match
 * @see {@link listFiles} - list files in a given path
 */
export function matchFiles(
  directoryPath: string,
  matchingFunction: (fileName: string, file: Deno.DirEntry) => boolean,
  returnFullPath = true,
): string[] {
  const list = listFiles(directoryPath, { withFileTypes: true });
  if (!list || !Array.isArray(list)) return [];
  const entries = list as Deno.DirEntry[];
  return entries
    .filter((dirExt) => matchingFunction(dirExt.name, dirExt))
    .map((dirExt) =>
      returnFullPath
        ? resolve(directoryPath, dirExt.name)
        : dirExt.name,
    );
}

/**
 * Synchronously checks if any of the files provided do not exist.
 *
 * For example:
 *
 * ```
 * //-- these exist
 * // ./data/credentials.env
 * // ./data/results.json
 *
 * if (!utils.file.checkFile('./data/results.json')) {
 *    //-- retrieve the results
 *    results = await connection.query('SELECT XYZ from Contacts');
 *    utils.file.writeJSON('./data/results.json', results);
 * } else {
 *    results = utils.file.readJSON('./data/results.json');
 * }
 * ```
 *
 * Note, you can also ask for multiple files at once
 *
 * ```
 * utils.file.checkFile(
 *    './data/credentials.env',
 *    './data/results.json',
 *    './data/results.csv'
 * );
 * // null if all exist, or array of paths not found
 * ```
 *
 * or as an array:
 *
 * ```
 * utils.file.checkFile(['./data/credentials.env']);
 * ```
 *
 * @param files - List of file paths to check (can use relative paths, like './')
 * @returns null if all files are found, or array of string paths of files not found
 * @see {@link listFiles} or {@link pwd} to help with paths
 */
export function checkFile(...files: (string | string[] | null)[]): string[] | null {
  const cleanFiles =
    files.length === 1 && Array.isArray(files[0]) ? files[0] : (files as (string | null)[]);
  if (cleanFiles.some((p) => p == null)) {
    throw new Error("Invalid path: null or undefined");
  }
  const resolvedFiles = (cleanFiles as string[]).map((unresolvedPath) =>
    resolve(unresolvedPath),
  );
  const notFoundFiles = resolvedFiles.map((resolvedPath) =>
    existsSync(resolvedPath) ? null : resolvedPath
  );
  if (notFoundFiles.every((p) => p === null)) {
    return null;
  }
  return notFoundFiles as string[];
}

/**
 * Checks if a single file exists
 *
 * @param filePath - path to check if the file exists
 * @returns if the file exists (true) or not (false)
 * @see {@link checkFile} - if checking multiple files
 */
export function fileExists(filePath: string): boolean {
  const resolvedPath = resolve(filePath);
  return existsSync(resolvedPath);
}

/**
 * JSON reviver for cache: deserializes date keys (date, *_date, *Date) to Date objects.
 * Used internally by useCache when reading cached JSON.
 */
export function cacheDeserializer(key: string, value: unknown): unknown {
  if (
    key &&
    (key === "date" || key.endsWith("_date") || key.endsWith("Date")) &&
    typeof value === "string"
  ) {
    return new Date(value);
  }
  return value;
}

/**
 * For very long or time-intensive executions, sometimes it is better to cache the results
 * than to execute them every single time.
 *
 * Note that this works synchronously, and can be easier to use than if promises are involved.
 *
 * As opposed to ijs.useCache - which works with promises.
 *
 * ```
 * shouldWrite = true; /// we will write to the cache with the results from the execution
 * expensiveResults = utils.file.useCache(shouldWrite, './cache', 'expensive.json', () => {
 *    const data = d3.csvParse(utils.file.readFile('./someFile.csv'))
 *      .map(obj => ({ ...obj, date: Date.parse(obj.epoch) }));
 *
 *    const earliestDate = utils.date.startOfDay( utils.agg.min(data, 'date') );
 *    const lastDate = utils.date.endOfDay( utils.agg.max(data, 'date') );
 *
 *    // binning or lots of other things.
 *
 *    return finalResults;
 * });
 *
 * expensiveResults.length = 1023424;
 * ```
 *
 * but sometimes I would rather just skip to the end
 *
 * ```
 * shouldWrite = false; /// we will read from the cache instead,
 * // everything else remains the same
 *
 * expensiveResults = utils.file.useCache(shouldWrite, './cache', 'expensive.json', () => {
 *    const data = d3.csvParse(utils.file.readFile('./someFile.csv'))
 *      .map(obj => ({ ...obj, date: Date.parse(obj.epoch) }));
 *
 *    //-- function can remain untouched,
 *    //-- BUT nothing in here will be executed
 *    //-- since we are reading from the cache
 * });
 *
 * //-- completely transparent to the runner
 * expensiveResults.length = 1023424;
 * ```
 *
 * @param shouldWrite - whether we should write to the cache (true) or read from the cache (false)
 * @param cachePath - Path to the cache folder, ex: './cache'
 * @param cacheFile - Filename of the cache file to use for this execution, ex: 'ExecutionsPerMin.json'
 * @param expensiveFn - function that returns the results to be stored in the cache
 * @param fsOptions - options to use when writing or reading files
 * @returns either the deserialized json from the cache or the results from the expensive function
 * @see {@link readJSON} - reads a local JSON file
 * @see {@link writeJSON} - writes to a JSON file
 * @see ijs.useCache - similar idea - but supports promises
 */
export async function useCache<T>(
  shouldWrite: boolean,
  cachePath: string,
  cacheFile: string,
  expensiveFn: () => T,
  fsOptions: ReadOptions & WriteOptions | null = null,
): Promise<T> {
  const ensureEndsWithSlash = (str: string) =>
    str.endsWith("/") ? str : `${str}/`;
  const cacheFilePath = `${ensureEndsWithSlash(cachePath)}${cacheFile}`;
  const cacheExists = fileExists(cacheFilePath);

  if (cacheExists && !shouldWrite) {
    const cleanOptions = { ...(fsOptions ?? {}), reviver: cacheDeserializer };
    const results = readJSON(cacheFilePath, cleanOptions);
    return Promise.resolve(results) as Promise<T>;
  }

  const results = await expensiveFn();
  writeJSON(cacheFilePath, results, fsOptions ?? {});
  return Promise.resolve(results) as Promise<T>;
}

