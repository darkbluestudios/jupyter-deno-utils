/**
 * Interface for a jupyter mime type export
 * 
 * @see https://docs.deno.com/runtime/reference/cli/jupyter/#rich-content-output
 */
export interface JupyterRichContent {
  'text/plain'?: string,
  'text/html'?: string,
  'text/markdown'?: string
}

export const JupyterDisplaySymbol =
  Symbol.for("Jupyter.display") as unknown as symbol;

export interface JupyterRenderObject {
  [JupyterDisplaySymbol](): JupyterRichContent;
}

/** Display context provided by Jupyter (e.g. global $$ or context) for rendering HTML etc. */
export interface JupyterDisplayContext {
  html: (htmlText: string) => void;
}
