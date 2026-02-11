/**
 * Imports a local module to bypass the cache.
 * 
 * Allowing for local development without restarting the entire notebook.
 * 
 * @param {string} localModulePath - the path to the local module
 * @example
 * const localLib = await utils.importFresh('./lib/MyLibrary.ts');
 */
export default async function importFresh(modulePath:string): Promise<any> {
    const uncachedPath = importFresh2(modulePath);
    
    return await import(uncachedPath);
}

/**
 * Modifies a path so import will bypass the cache
 * 
 * @param {string} localModulePath - the path to the local module
 * @returns {string} - an altered version of the path that will skip the cache
 * @example
 * const localLib = import(importFresh('./lib/MyLibrary.ts'));
 */
export function importFresh2(modulePath:string): string {
    return `${modulePath}?cache_bypass=${Date.now()}`;
}
