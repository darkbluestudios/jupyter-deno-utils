import { type JupyterRichContent, JupyterDisplaySymbol, type JupyterRenderObject } from "./types/jupyter.ts";


/**
 * Utilities specifically for working with deno within jupyter.
 * 
 * @param mimeType {string} - mime type to render
 * @param value {string} - value to be rendered
 * @returns {JupyterRenderObject}
 * @example
 * JupyterUtils.renderMimeType('text/plain', 'plain text');
 * // will render the plain text in the result context
 * @module jupyter
 */
export const renderMimeType = (mimeType: string, value: string): JupyterRenderObject => {
  return {
    [JupyterDisplaySymbol]() {
      const result: JupyterRichContent = {};
      result[mimeType] = value;
      return result;
    }
  };
};

/**
 * If you have multiple mime types to render, use this.
 * Set every property on the object to pass as the mimetypes to render.
 * @param mimeObject {object} - object with properties of the mime types to render
 * @returns {JupyterRenderObject}
 * @example
 * JupyterUtils.renderMimeObject({
 *   'text/plain': 'plain text',
 *   'text/html': 'html text'
 * });
 * // will render both plain text and html text in the result context
 */
export const renderMimeObject = (mimeObject: JupyterRichContent): JupyterRenderObject => {
  return {
    [JupyterDisplaySymbol]() {
      return mimeObject;
    }
  };
}

/**
 * Renders markdown text
 * 
 * @param markdownText {string} - markdown text to be rendered out
 * @returns {JupyterRenderObject}
 * @example
 * JupyterUtils.markdown(`# heading 1
 * This is your text`);
 */
export const markdown = (markdownText:string): JupyterRenderObject => renderMimeType('text/markdown', markdownText);

/**
 * Renders html text
 * 
 * @param htmlText {string} - html text to be rendered out
 * @returns {JupyterRenderObject}
 * @example
 * JupyterUtils.html(`<h1>heading 1</h1>
 * This is your text`);
 */
export const html = (htmlText:string): JupyterRenderObject => renderMimeType('text/html', htmlText);

/**
 * Renders both plain text and html text
 * 
 * @param plainText {string} - plain text to be rendered out
 * @param htmlText {string} - html to be rendered
 * @returns {JupyterRenderObject}
 * 
 * @example
 * JupyterUtils.richText('plain text', 'html text');
 * // if the result context is able to render html, it will render html.
 * // otherwise, it will render plain text.
 */
export const richText = (
  plainText: string,
  htmlText: string
): JupyterRenderObject => renderMimeObject({
  'text/plain': plainText,
  'text/html': htmlText
});
