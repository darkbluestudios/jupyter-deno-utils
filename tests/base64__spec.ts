import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import base64 from "../src/base64.ts";

describe("base64", () => {
  it("can convert a string to base64", () => {
    const value = "Hello";
    const expected = "SGVsbG8=";
    const result = base64.toBase64(value);
    expect(result).toBe(expected);
  });
  it("return a string from base64", () => {
    const value = "SGVsbG8=";
    const expected = "Hello";
    const result = base64.fromBase64(value);
    expect(result).toBe(expected);
  });
});
