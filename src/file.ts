import { resolve } from "@std/path";

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

export interface ReadOptions {
  encoding?: string;
  reviver?: (key: string, value: unknown) => unknown;
}

export interface WriteOptions {
  encoding?: string;
  append?: boolean;
  prefix?: string;
  suffix?: string;
  replacer?: ((key: string, value: unknown) => unknown) | null;
  spacing?: number;
}

export interface ListFilesOptions {
  withFileTypes?: boolean;
}

/**
 * Read JSON file.
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

/** @deprecated Use writeFile. */
export const writeFileStd = writeFile;

/**
 * List the current path (working directory).
 */
export function pwd(): string {
  return resolve(".");
}

/**
 * List files in a directory.
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
 * Finds files in a directory matching a function.
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
 * Checks if any of the files provided do not exist.
 * @returns null if all exist, or array of paths not found.
 * @throws if any path is null or undefined.
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
 * Checks if a single file exists.
 */
export function fileExists(filePath: string): boolean {
  const resolvedPath = resolve(filePath);
  return existsSync(resolvedPath);
}

/**
 * JSON reviver for cache: deserializes date keys to Date.
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
 * Use a cache file: read from cache or run expensiveFn and write.
 */
export function useCache<T>(
  shouldWrite: boolean,
  cachePath: string,
  cacheFile: string,
  expensiveFn: () => T,
  fsOptions: ReadOptions & WriteOptions | null = null,
): T {
  const ensureEndsWithSlash = (str: string) =>
    str.endsWith("/") ? str : `${str}/`;
  const cacheFilePath = `${ensureEndsWithSlash(cachePath)}${cacheFile}`;
  const cacheExists = fileExists(cacheFilePath);

  if (cacheExists && !shouldWrite) {
    const cleanOptions = { ...(fsOptions ?? {}), reviver: cacheDeserializer };
    const results = readJSON(cacheFilePath, cleanOptions);
    return results as T;
  }

  const results = expensiveFn();
  writeJSON(cacheFilePath, results, fsOptions ?? {});
  return results;
}

const FileUtil = {
  readJSON,
  readFile,
  writeJSON,
  writeFile,
  writeFileStd,
  pwd,
  listFiles,
  matchFiles,
  checkFile,
  fileExists,
  cacheDeserializer,
  useCache,
};

export default FileUtil;
