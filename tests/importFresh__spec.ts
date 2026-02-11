import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import importFresh from '../src/importFresh.ts';

describe('can import a library', () => {
    it('can import', async () => {
        const myLibrary = await importFresh('../tests/__testHelper/ImportFreshLib.ts');
        const myLibraryType = typeof myLibrary.default;
        const expects = 'function';
        expect(myLibraryType).toBe(expects);
    });
    it('can load a library', async () => {
        const myLibrary = await importFresh('../tests/__testHelper/ImportFreshLib.ts');
        const expects = 2;
        const results = myLibrary.default(5,3);
        expect(results).toStrictEqual(expects);
    });
});

// /test/__testHelper/ImportFreshLib.ts?cache_bypass=1770820409167