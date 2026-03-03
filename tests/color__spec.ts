import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import ColorUtils from "../src/color.ts";

interface ColorInfo {
  name: string;
  hex: string;
  hexa: string;
  hex3: string;
  hex3a: string;
  rgb: string;
  rgba: string;
  arr: [number, number, number, number];
  obj: { r: number; g: number; b: number; a: number };
}

function createColorInfo(
  name: string,
  hex: string,
  hexa: string,
  hex3: string,
  hex3a: string,
  rgb: string,
  rgba: string,
  arr: [number, number, number, number],
  obj: { r: number; g: number; b: number; a: number }
): ColorInfo {
  return { name, hex, hexa, hex3, hex3a, rgb, rgba, arr, obj };
}

const OPAQUE_COLOR = createColorInfo(
  "opaqueColor",
  "#4499bb",
  "#4499bbff",
  "#49b",
  "#49bf",
  "rgb( 68, 153, 187)",
  "rgba(68, 153, 187, 1)",
  [68, 153, 187, 1],
  { r: 68, g: 153, b: 187, a: 1 }
);
const CLEAR_COLOR = createColorInfo(
  "clearColor",
  "#4499BB",
  "#4499BB00",
  "#49B",
  "#49B0",
  "rgb( 68, 153, 187)",
  "rgb(68, 153, 187, 0)",
  [68, 153, 187, 0],
  { r: 68, g: 153, b: 187, a: 0 }
);
const OPAQUE_WHITE = createColorInfo(
  "opaqueWhite",
  "#FFFFFF",
  "#FFFFFFFF",
  "#FFF",
  "#FFFF",
  "rgb( 255, 255, 255)",
  "rgb(255, 255, 255, 1)",
  [255, 255, 255, 1],
  { r: 255, g: 255, b: 255, a: 1 }
);
const OPAQUE_BLACK = createColorInfo(
  "opaqueBlack",
  "#000000",
  "#000000FF",
  "#000",
  "#000F",
  "rgb( 0, 0, 0)",
  "rgb(0, 0, 0, 1)",
  [0, 0, 0, 1],
  { r: 0, g: 0, b: 0, a: 1 }
);
const SEMI_OPAQUE_BLACK = createColorInfo(
  "opaqueBlack",
  "#000000",
  "#00000088",
  "#000",
  "#0008",
  "rgb( 0, 0, 0)",
  "rgba(0, 0, 0, 0.700)",
  [0, 0, 0, 0.7],
  { r: 0, g: 0, b: 0, a: 0.7 }
);

describe("ColorUtil", () => {
  describe("Validation", () => {
    describe("simple", () => {
      it("can detect hex", () => {
        const test = "isHex" as keyof typeof ColorUtils.COLOR_VALIDATION;
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex)).toBe(true);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hexa)).toBe(true);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3)).toBe(true);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3a)).toBe(true);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgb)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgba)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.arr)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.obj)).toBe(false);
      });
      it("can detect rgb", () => {
        const test = "isRGB" as keyof typeof ColorUtils.COLOR_VALIDATION;
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hexa)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3a)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgb)).toBe(true);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgba)).toBe(true);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.arr)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.obj)).toBe(false);
      });
      it("can detect array", () => {
        const test = "isColorArray" as keyof typeof ColorUtils.COLOR_VALIDATION;
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hexa)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3a)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgb)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgba)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.arr)).toBe(true);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.obj)).toBe(false);
      });
      it("can detect object", () => {
        const test = "isColorObject" as keyof typeof ColorUtils.COLOR_VALIDATION;
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hexa)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.hex3a)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgb)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.rgba)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.arr)).toBe(false);
        expect(ColorUtils.COLOR_VALIDATION[test](OPAQUE_COLOR.obj)).toBe(true);
      });
    });
  });

  describe("parse", () => {
    describe("simple", () => {
      it("can parse hex (parseHex3)", () => {
        const test = "parseHex3" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown, a?: number) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.hexa)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.hex3)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.hex3a)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.rgb)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.rgba)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.arr)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.obj)).toStrictEqual(undefined);
      });
      it("can parse hex (parseHex)", () => {
        const test = "parseHex" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown, a?: number) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.hexa)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.hex3)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.hex3a)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.rgb)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.rgba)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.arr)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.obj)).toStrictEqual(undefined);
      });
      it("can parse rgb", () => {
        const test = "parseRGB" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown, a?: number) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.hexa)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.hex3)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.hex3a)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.rgb)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.rgba)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.arr)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.obj)).toStrictEqual(undefined);
      });
      it("can parse rgbA", () => {
        const test = "parseRGBA" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown, a?: number) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.rgb)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(fn(OPAQUE_COLOR.rgba)).toStrictEqual(OPAQUE_COLOR.arr);
      });
      it("can parse rgba with alphas", () => {
        expect(ColorUtils.parseRGB("rgba(255, 255, 255, 1)")).toStrictEqual([
          255, 255, 255, 1
        ]);
        expect(ColorUtils.parseRGB("rgba(255, 255, 255, 0.5)")).toStrictEqual([
          255, 255, 255, 0.5
        ]);
        expect(ColorUtils.parseRGB("rgba(255, 255, 255, 0)")).toStrictEqual([
          255, 255, 255, 0
        ]);
        expect(
          ColorUtils.parseRGB("rgba(249.9, 255, 255, 0)")
        ).toStrictEqual([249, 255, 255, 0]);
      });
      it("can parse color arrays", () => {
        const test = "parseColorArray" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown, a?: number) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.arr)).toStrictEqual(OPAQUE_COLOR.arr);
      });
      it("can parse color arrays with default alpha", () => {
        expect(
          ColorUtils.parseColorArray([100, 90, 80], 0.5)
        ).toStrictEqual([100, 90, 80, 0.5]);
      });
      it("can parse objects", () => {
        const test = "parseColorObject" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown, a?: number) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(undefined);
        expect(fn(OPAQUE_COLOR.obj)).toStrictEqual(OPAQUE_COLOR.arr);
      });
      it("can parse color objects with default alpha", () => {
        expect(
          ColorUtils.parseColorObject({ r: 100, g: 90, b: 80 }, 0.5)
        ).toStrictEqual([100, 90, 80, 0.5]);
      });
      it("can parse", () => {
        expect(ColorUtils.parse(OPAQUE_COLOR.hex)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(ColorUtils.parse(OPAQUE_COLOR.rgb)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(ColorUtils.parse(OPAQUE_COLOR.arr)).toStrictEqual(OPAQUE_COLOR.arr);
        expect(ColorUtils.parse(OPAQUE_COLOR.obj)).toStrictEqual(OPAQUE_COLOR.arr);
      });
    });
  });

  describe("convert", () => {
    describe("simple", () => {
      it("can convert hex", () => {
        const test = "toHex" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(OPAQUE_COLOR.hex);
        expect(fn(OPAQUE_COLOR.hexa)).toStrictEqual(OPAQUE_COLOR.hex);
        expect(fn(OPAQUE_COLOR.rgb)).toStrictEqual(OPAQUE_COLOR.hex);
        expect(fn(OPAQUE_COLOR.arr)).toStrictEqual(OPAQUE_COLOR.hex);
        expect(fn(OPAQUE_COLOR.obj)).toStrictEqual(OPAQUE_COLOR.hex);
      });
      it("can convert hexA", () => {
        const test = "toHexA" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(OPAQUE_COLOR.hexa);
        expect(fn(OPAQUE_COLOR.hexa)).toStrictEqual(OPAQUE_COLOR.hexa);
        expect(fn(OPAQUE_COLOR.obj)).toStrictEqual(OPAQUE_COLOR.hexa);
      });
      it("can convert hexA with explicit alpha", () => {
        expect(ColorUtils.toHexA(OPAQUE_COLOR.hex, 0.5)).toStrictEqual(
          "#4499bb80"
        );
      });
      it("can convert rgb", () => {
        const test = "toRGB" as keyof typeof ColorUtils;
        const fn = ColorUtils[test] as (v: unknown) => unknown;
        expect(fn(OPAQUE_COLOR.hex)).toStrictEqual(OPAQUE_COLOR.rgb);
        expect(fn(OPAQUE_COLOR.obj)).toStrictEqual(OPAQUE_COLOR.rgb);
      });
      it("can convert rgba", () => {
        expect(ColorUtils.toRGBA(OPAQUE_COLOR.hex)).toStrictEqual(
          OPAQUE_COLOR.rgba
        );
        expect(ColorUtils.toRGBA(SEMI_OPAQUE_BLACK.rgba)).toStrictEqual(
          SEMI_OPAQUE_BLACK.rgba
        );
      });
      it("can convert color array", () => {
        expect(ColorUtils.toColorArray(OPAQUE_COLOR.hex)).toStrictEqual(
          OPAQUE_COLOR.arr
        );
      });
      it("can convert color object", () => {
        expect(ColorUtils.toColorObject(OPAQUE_COLOR.hex)).toStrictEqual(
          OPAQUE_COLOR.obj
        );
      });
      it("can convert toColorObject with default alpha", () => {
        expect(
          ColorUtils.toColorObject({ r: 100, g: 90, b: 80 }, 0.5)
        ).toStrictEqual({ r: 100, g: 90, b: 80, a: 0.5 });
      });
      it("can convert using default type array", () => {
        ColorUtils.defaultFormat = ColorUtils.FORMATS.ARRAY;
        expect(ColorUtils.convert(OPAQUE_COLOR.hex)).toStrictEqual(
          OPAQUE_COLOR.arr
        );
        expect(ColorUtils.convert(OPAQUE_COLOR.obj)).toStrictEqual(
          OPAQUE_COLOR.arr
        );
      });
      it("can convert using explicit type hex", () => {
        expect(
          ColorUtils.convert(OPAQUE_COLOR.arr, ColorUtils.FORMATS.HEX)
        ).toStrictEqual(OPAQUE_COLOR.hex);
      });
      it("can convert using explicit type HEXA", () => {
        expect(
          ColorUtils.convert(OPAQUE_COLOR.arr, ColorUtils.FORMATS.HEXA)
        ).toStrictEqual(OPAQUE_COLOR.hexa);
      });
      it("can convert using explicit type RGB", () => {
        expect(
          ColorUtils.convert(OPAQUE_COLOR.arr, ColorUtils.FORMATS.RGB)
        ).toStrictEqual(OPAQUE_COLOR.rgb);
      });
      it("can convert using explicit type RGBA", () => {
        expect(
          ColorUtils.convert(OPAQUE_COLOR.arr, ColorUtils.FORMATS.RGBA)
        ).toStrictEqual(OPAQUE_COLOR.rgba);
      });
      it("can convert using explicit type array", () => {
        expect(
          ColorUtils.convert(OPAQUE_COLOR.arr, ColorUtils.FORMATS.ARRAY)
        ).toStrictEqual(OPAQUE_COLOR.arr);
      });
      it("can convert using explicit type object", () => {
        expect(
          ColorUtils.convert(OPAQUE_COLOR.arr, ColorUtils.FORMATS.OBJECT)
        ).toStrictEqual(OPAQUE_COLOR.obj);
      });
      it("can convert with an unknown value", () => {
        expect(
          ColorUtils.convert(OPAQUE_COLOR.arr, "blah" as "HEX")
        ).toStrictEqual(OPAQUE_COLOR.arr);
      });
      it("can convert with the default value", () => {
        ColorUtils.defaultFormat = ColorUtils.FORMATS.HEXA;
        expect(ColorUtils.convert(OPAQUE_COLOR.arr)).toStrictEqual(
          OPAQUE_COLOR.hexa
        );
      });
    });
  });

  describe("interpolate", () => {
    describe("complex", () => {
      it("can interpolate at 0 to white", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          OPAQUE_WHITE.arr,
          0,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([68, 153, 187, 1]);
      });
      it("can interpolate at 1 to white", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          OPAQUE_WHITE.arr,
          1,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([255, 255, 255, 1]);
      });
      it("can interpolate at 0.5 to white", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          OPAQUE_WHITE.arr,
          0.5,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([162, 204, 221, 1]);
      });
    });
    describe("simple", () => {
      it("can interpolate at default", () => {
        const results = ColorUtils.interpolate(
          CLEAR_COLOR.arr,
          OPAQUE_COLOR.arr
        );
        expect(results).toStrictEqual("#4499bb00");
      });
      it("stops at -1", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          CLEAR_COLOR.arr,
          -1,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([68, 153, 187, 1]);
      });
      it("can interpolate at 0", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          CLEAR_COLOR.arr,
          0,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([68, 153, 187, 1]);
      });
      it("can interpolate at 0.5", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          CLEAR_COLOR.arr,
          0.5,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([68, 153, 187, 0.5]);
      });
      it("can interpolate at 1", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          CLEAR_COLOR.arr,
          1,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([68, 153, 187, 0]);
      });
      it("stops at 2", () => {
        const results = ColorUtils.interpolate(
          OPAQUE_COLOR.arr,
          CLEAR_COLOR.arr,
          2,
          ColorUtils.INTERPOLATION_STRATEGIES.linear,
          ColorUtils.FORMATS.ARRAY
        );
        expect(results).toStrictEqual([68, 153, 187, 0]);
      });
    });
    describe("linear", () => {
      const linear = ColorUtils.INTERPOLATION_STRATEGIES.linear;
      it("can interpolate at 0", () => {
        expect(linear(0, 255, 0)).toBe(0);
      });
      it("can interpolate at 0.25", () => {
        expect(linear(0, 255, 0.25)).toBe(63.75);
      });
      it("can interpolate at 0.5", () => {
        expect(linear(0, 255, 0.5)).toBe(127.5);
      });
      it("can interpolate at 0.75", () => {
        expect(linear(0, 255, 0.75)).toBe(191.25);
      });
      it("can interpolate at 1", () => {
        expect(linear(0, 255, 1)).toBe(255);
      });
    });
    describe("ease-in-out", () => {
      const easeInOut = ColorUtils.INTERPOLATION_STRATEGIES.easeInOut;
      it("can interpolate at 0", () => {
        expect(easeInOut(0, 255, 0)).toBe(0);
      });
      it("can interpolate at 0.25", () => {
        expect(easeInOut(0, 255, 0.25)).toBeCloseTo(37.344);
      });
      it("can interpolate at 0.5", () => {
        expect(easeInOut(0, 255, 0.5)).toBeCloseTo(127.5);
      });
      it("can interpolate at 0.75", () => {
        expect(easeInOut(0, 255, 0.75)).toBeCloseTo(217.656);
      });
      it("can interpolate at 1", () => {
        expect(easeInOut(0, 255, 1)).toBe(255);
      });
    });
    describe("ease-in", () => {
      const easeIn = ColorUtils.INTERPOLATION_STRATEGIES.easeIn;
      it("can interpolate at 0", () => {
        expect(easeIn(0, 255, 0)).toBe(0);
      });
      it("can interpolate at 0.25", () => {
        expect(easeIn(0, 255, 0.25)).toBeCloseTo(19.4107);
      });
      it("can interpolate at 0.5", () => {
        expect(easeIn(0, 255, 0.5)).toBeCloseTo(74.6878);
      });
      it("can interpolate at 0.75", () => {
        expect(easeIn(0, 255, 0.75)).toBeCloseTo(157.4157);
      });
      it("can interpolate at 1", () => {
        expect(easeIn(0, 255, 1)).toBeCloseTo(255);
      });
    });
    describe("ease-out", () => {
      const easeOut = ColorUtils.INTERPOLATION_STRATEGIES.easeOut;
      it("can interpolate at 0", () => {
        expect(easeOut(0, 255, 0)).toBeCloseTo(0);
      });
      it("can interpolate at 0.25", () => {
        expect(easeOut(0, 255, 0.25)).toBeCloseTo(97.5843);
      });
      it("can interpolate at 0.5", () => {
        expect(easeOut(0, 255, 0.5)).toBeCloseTo(180.3122);
      });
      it("can interpolate at 0.75", () => {
        expect(easeOut(0, 255, 0.75)).toBeCloseTo(235.5893);
      });
      it("can interpolate at 1", () => {
        expect(easeOut(0, 255, 1)).toBe(255);
      });
    });
  });

  describe("interpolator", () => {
    it("can interpolate from one color to another (array format)", () => {
      const targetFn = ColorUtils.interpolator(
        OPAQUE_BLACK.arr,
        OPAQUE_WHITE.arr,
        ColorUtils.INTERPOLATION_STRATEGIES.linear,
        ColorUtils.FORMATS.ARRAY
      );
      expect(typeof targetFn).toBe("function");
      expect(targetFn(0.5)).toStrictEqual([128, 128, 128, 1]);
    });
    it("can interpolate from one color to another (default format)", () => {
      const targetFn = ColorUtils.interpolator(OPAQUE_BLACK.arr, OPAQUE_WHITE.arr);
      expect(typeof targetFn).toBe("function");
      expect(targetFn(0.5)).toStrictEqual("#808080ff");
    });
  });

  describe("generateSequence", () => {
    it("can generate a sequence (array format)", () => {
      const results = ColorUtils.generateSequence(
        OPAQUE_BLACK.arr,
        OPAQUE_WHITE.arr,
        4,
        ColorUtils.INTERPOLATION_STRATEGIES.linear,
        ColorUtils.FORMATS.ARRAY
      );
      expect(results).toStrictEqual([
        [0, 0, 0, 1],
        [85, 85, 85, 1],
        [170, 170, 170, 1],
        [255, 255, 255, 1]
      ]);
    });
    it("can generate a sequence (default format)", () => {
      const results = ColorUtils.generateSequence(
        OPAQUE_BLACK.arr,
        OPAQUE_WHITE.arr,
        4
      );
      expect(results).toStrictEqual([
        "#000000ff",
        "#555555ff",
        "#aaaaaaff",
        "#ffffffff"
      ]);
    });
    it("can generate empty sequence for length 0", () => {
      const results = ColorUtils.generateSequence(
        OPAQUE_BLACK.arr,
        OPAQUE_WHITE.arr,
        0,
        ColorUtils.INTERPOLATION_STRATEGIES.linear,
        ColorUtils.FORMATS.ARRAY
      );
      expect(results).toStrictEqual([]);
    });
    it("can generate a sequence from docs", () => {
      const results = ColorUtils.generateSequence(
        OPAQUE_BLACK.arr,
        OPAQUE_WHITE.arr,
        3,
        ColorUtils.INTERPOLATION_STRATEGIES.linear,
        ColorUtils.FORMATS.HEX
      );
      expect(results).toStrictEqual(["#000000", "#808080", "#ffffff"]);
    });
  });
});
