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
    const uncachedPath = `${modulePath}?cache_bypass=${Date.now()}`;
    
    return await import(uncachedPath);
}
