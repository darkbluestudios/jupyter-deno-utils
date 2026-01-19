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
