import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as JupyterUtils from "../src/jupyter.ts";
import { JupyterDisplaySymbol } from '../src/types/jupyter.ts';

describe('JupyterUtils', () => {
  describe('renderMimeType', () => {
    it('can render a mime type', () => {
      const result = JupyterUtils.renderMimeType('text/plain', 'Hello, world!');

      const symbol = JupyterDisplaySymbol;
      const symbolTypeResult = typeof result[symbol];
      const expected = 'function';

      expect(symbolTypeResult).toBe(expected);
    });
    it('has the mime type in the result', () => {
        const result = JupyterUtils.renderMimeType('text/plain', 'Hello, world!');

        const symbol = JupyterDisplaySymbol;
        const resultObj = result[symbol]();

        const resultType = resultObj['text/plain'];
        const expected = 'Hello, world!';

        expect(resultType).toBe(expected);
    });
  });
  describe('renderMimeObject', () => {
    it('can render a mime object', () => {
      const result = JupyterUtils.renderMimeObject({
        'text/plain': 'Hello, world!'
      });

      const symbol = JupyterDisplaySymbol;
      const resultObj = result[symbol]();

      const resultType = resultObj['text/plain'];
      const expected = 'Hello, world!';

      expect(resultType).toBe(expected);
    });
  });
  describe('markdown', () => {
    it('can render a markdown string', () => {
      const result = JupyterUtils.markdown('Hello, world!');

      const symbol = JupyterDisplaySymbol;
      const resultObj = result[symbol]();

      const resultType = resultObj['text/markdown'];
      const expected = 'Hello, world!';

      expect(resultType).toBe(expected);
    });
  });
  describe('richText', () => {
    it('can render both strings', () => {
      const plainText = 'plain text';
      const htmlText = 'html text';
      const result = JupyterUtils.richText(plainText, htmlText);

      const symbol = JupyterDisplaySymbol;
      const resultObj = result[symbol]();

      const plainResult = resultObj['text/plain'];
      const plainExpected = plainText
      expect(plainResult).toBe(plainExpected);

      const htmlResult = resultObj['text/html'];
      const htmlExpected = htmlText;
      expect(htmlResult).toBe(htmlExpected);
    });
  });
});
