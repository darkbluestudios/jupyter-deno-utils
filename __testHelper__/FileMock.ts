/**
 * Mock DirEntry-like object for tests (e.g. matchFiles).
 * Deno.DirEntry uses boolean properties, not methods.
 */
export class FileMock implements Deno.DirEntry {
  name: string;
  isFile = true;
  isDirectory = false;
  isSymlink = false;

  constructor(name: string) {
    this.name = name;
  }
}
