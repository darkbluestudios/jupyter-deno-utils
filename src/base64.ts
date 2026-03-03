/**
 * Simple library for working with base64 strings
 *
 * * toBase64(str) - convert a string to base64
 * * fromBase64(str) - parse a base64 encoded string
 *
 * @module base64
 * @example
 * const str = 'Hello';
 * base64.toBase64(str); // 'SGVsbG8=';
 *
 * const b64Str = 'SGVsbG8=';
 * base64.fromBase64(b64Str); // 'Hello';
 */

import { decodeBase64, encodeBase64 } from "@std/encoding";

/**
 * Convert a string to base64 (UTF-8 encoded).
 * @param str - string to be converted
 * @returns base64 encoding of the string
 */
export function toBase64(str: string): string {
  return encodeBase64(new TextEncoder().encode(str));
}

/**
 * Decode a base64 string back to a string.
 * @param str - base64 encoded string
 * @returns decoded string
 */
export function fromBase64(str: string): string {
  return new TextDecoder().decode(decodeBase64(str));
}

const base64 = { toBase64, fromBase64 };
export default base64;
