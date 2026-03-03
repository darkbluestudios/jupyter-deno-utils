/**
 * Bare Bones utility for converting and interpolating between colors.
 * Supports Hex, Hex3, RGB, RGBA, ARRAY, OBJECT formats.
 *
 * @module color
 */

/** [r, g, b, a] with r,g,b in 0-255, a in 0-1 */
export type ColorArray = [number, number, number, number];

export interface ColorObject {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type ColorInput = string | ColorArray | ColorObject;

export type FormatType =
  | "HEX"
  | "HEXA"
  | "RGB"
  | "RGBA"
  | "ARRAY"
  | "OBJECT";

export type InterpolationStrategyFn = (
  a: number,
  b: number,
  pct: number
) => number;

const COLOR_VALIDATION = {
  isHex: (str: unknown): boolean =>
    Array.isArray(str)
      ? false
      : /^#([0-9A-F]{8}$)|([0-9A-F]{6}$)|([0-9A-F]{3}$)/i.test(String(str)),
  isRGB: (str: unknown): boolean => /^rgba?\s*\(/.test(String(str)),
  isColorArray: (a: unknown): a is unknown[] => Array.isArray(a),
  isColorObject: (obj: unknown): obj is ColorObject =>
    typeof obj === "object" &&
    obj !== null &&
    Object.hasOwn(obj as object, "r") &&
    Object.hasOwn(obj as object, "g") &&
    Object.hasOwn(obj as object, "b")
};

const FORMATS = {
  HEX: "HEX" as const,
  HEXA: "HEXA" as const,
  RGB: "RGB" as const,
  RGBA: "RGBA" as const,
  ARRAY: "ARRAY" as const,
  OBJECT: "OBJECT" as const
};

const PI2 = Math.PI * 0.5;

export const INTERPOLATION_STRATEGIES = {
  linear: (a: number, b: number, pct: number) => a + (b - a) * pct,
  easeInOut: (a: number, b: number, pct: number):number =>
    a + (b - a) * (Math.cos(pct * Math.PI + Math.PI) * 0.5 + 0.5),
  easeIn: (a: number, b: number, pct: number):number =>
    a + (b - a) * (1 - Math.cos(pct * PI2)),
  easeOut: (a: number, b: number, pct: number):number =>
    a + (b - a) * Math.sin(pct * PI2)
};

let defaultFormat: FormatType = FORMATS.HEX;
let interpolationStrategy: InterpolationStrategyFn =
  INTERPOLATION_STRATEGIES.linear;

function parseHex3(
  hexStr: string,
  optionalAlpha: number = 1
): ColorArray | undefined {
  if (!COLOR_VALIDATION.isHex(hexStr)) return undefined;
  if (hexStr.length > 5) return parseHex(hexStr, optionalAlpha);
  const match = hexStr.match(/[a-fA-F0-9]/g);
  if (!match) return undefined;
  const alphaDefault = optionalAlpha * 255;
  const [r, g, b, a = alphaDefault] = match
    .map((hexPair) => Number.parseInt(hexPair, 16))
    .map((num) => num * 16 + num);
  return [r, g, b, a / 255];
}

function parseHex(
  hexStr: string,
  optionalAlpha: number = 1
): ColorArray | undefined {
  if (!COLOR_VALIDATION.isHex(hexStr)) return undefined;
  const alphaDefault = Math.round(optionalAlpha * 255);
  if (hexStr.length < 7) return parseHex3(hexStr, optionalAlpha);
  const match = hexStr.match(/[a-fA-F0-9]{2}/g);
  if (!match) return undefined;
  const [r, g, b, a = alphaDefault] = match.map((hexPair) =>
    Number.parseInt(hexPair, 16)
  );
  return [r, g, b, a / 255];
}

function parseRGB(
  rgbStr: string,
  optionalAlpha: number = 1
): ColorArray | undefined {
  if (!COLOR_VALIDATION.isRGB(rgbStr)) return undefined;
  const parts = rgbStr
    .replace(/[^0-9,.]/g, "")
    .split(",")
    .map((decStr, index) =>
      index < 3 ? Number.parseInt(decStr, 10) : Number.parseFloat(decStr)
    );
  const [r, g, b, a = optionalAlpha] = parts;
  return [r, g, b, a];
}

function parseColorArray(
  targetArray: unknown,
  optionalAlpha: number = 1
): ColorArray | undefined {
  if (!Array.isArray(targetArray)) return undefined;
  const [r, g, b, a = optionalAlpha] = targetArray;
  return [r, g, b, a];
}

function parseColorObject(
  target: unknown,
  optionalAlpha: number = 1
): ColorArray | undefined {
  if (!COLOR_VALIDATION.isColorObject(target)) return undefined;
  const { r, g, b, a = optionalAlpha } = target;
  return [r, g, b, a];
}

function parse(target: ColorInput, optionalAlpha: number = 1): ColorArray | undefined {
  return (
    parseColorArray(target, optionalAlpha) ||
    parseHex(target as string, optionalAlpha) ||
    parseRGB(target as string, optionalAlpha) ||
    parseColorObject(target, optionalAlpha)
  );
}

function toHex(target: ColorInput): string {
  const arr = parse(target) ?? [0, 0, 0, 1];
  const [r, g, b] = arr;
  const hexOut = (num: number) => num.toString(16).padStart(2, "0");
  return `#${hexOut(r)}${hexOut(g)}${hexOut(b)}`;
}

function toHexA(target: ColorInput, optionalAlpha: number = 1): string {
  const arr = parse(target, optionalAlpha) ?? [0, 0, 0, optionalAlpha];
  const [r, g, b, a] = arr;
  const hexOut = (num: number) => num.toString(16).padStart(2, "0");
  return `#${hexOut(r)}${hexOut(g)}${hexOut(b)}${hexOut(Math.round(a * 255))}`;
}

function toRGB(target: ColorInput): string {
  const arr = parse(target) ?? [0, 0, 0, 1];
  const [r, g, b] = arr;
  return `rgb( ${r}, ${g}, ${b})`;
}

function toRGBA(target: ColorInput, optionalAlpha: number = 1): string {
  const arr = parse(target, optionalAlpha) ?? [0, 0, 0, optionalAlpha];
  const [r, g, b, a] = arr;
  const aStr =
    a === undefined || a === null
      ? "1"
      : a === 1 || a === 0
        ? String(a)
        : a.toFixed(3);
  return `rgba(${r}, ${g}, ${b}, ${aStr})`;
}

function toColorArray(target: ColorInput, optionalAlpha: number = 1): ColorArray {
  return parse(target, optionalAlpha) ?? [0, 0, 0, optionalAlpha];
}

function toColorObject(
  target: ColorInput,
  optionalAlpha: number = 1
): ColorObject {
  const [r, g, b, a] = parse(target, optionalAlpha) ?? [0, 0, 0, optionalAlpha];
  return { r, g, b, a };
}

function convert(
  target: ColorInput,
  formatType: FormatType = defaultFormat
): string | ColorArray | ColorObject {
  if (formatType === FORMATS.ARRAY) return toColorArray(target);
  if (formatType === FORMATS.HEX) return toHex(target);
  if (formatType === FORMATS.HEXA) return toHexA(target);
  if (formatType === FORMATS.RGB) return toRGB(target);
  if (formatType === FORMATS.RGBA) return toRGBA(target);
  if (formatType === FORMATS.OBJECT) return toColorObject(target);
  return target as string | ColorArray | ColorObject;
}

function interpolate(
  fromColor: ColorInput,
  toColor: ColorInput,
  percent: number = 0,
  interpolationFn: InterpolationStrategyFn = interpolationStrategy,
  formatType: FormatType = defaultFormat
): string | ColorArray | ColorObject {
  const cleanPercent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
  const parsedA = parse(fromColor) ?? [0, 0, 0, 1];
  const parsedB = parse(toColor) ?? [0, 0, 0, 1];
  const newColor = parsedA.map((aValue, index) =>
    interpolationFn(aValue, parsedB[index], cleanPercent)
  ) as ColorArray;
  newColor[0] = Math.round(newColor[0]);
  newColor[1] = Math.round(newColor[1]);
  newColor[2] = Math.round(newColor[2]);
  return convert(newColor, formatType);
}

function interpolator(
  fromColor: ColorInput,
  toColor: ColorInput,
  interpolationFn: InterpolationStrategyFn = interpolationStrategy,
  formatType: FormatType = defaultFormat
): (pct: number) => string | ColorArray | ColorObject {
  return function interpolatorImpl(pct: number) {
    return interpolate(fromColor, toColor, pct, interpolationFn, formatType);
  };
}

function generateSequence(
  fromColor: ColorInput,
  toColor: ColorInput,
  lengthOfSequence: number,
  interpolationFn: InterpolationStrategyFn = interpolationStrategy,
  formatType: FormatType = defaultFormat
): (string | ColorArray | ColorObject)[] {
  if (lengthOfSequence <= 0) return [];
  const cleanLength = Math.floor(lengthOfSequence);
  const maxIndex = cleanLength - 1;
  return Array.from({ length: cleanLength }, (_, index) =>
    interpolate(
      fromColor,
      toColor,
      index / maxIndex,
      interpolationFn,
      formatType
    )
  );
}

export const SEQUENCE = [
  "#4e79a7",
  "#f28e2c",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab"
];

// @TODO
const ColorUtils = {
  COLOR_VALIDATION,
  FORMATS,
  INTERPOLATION_STRATEGIES,
  get defaultFormat() {
    return defaultFormat;
  },
  set defaultFormat(value: FormatType) {
    defaultFormat = value;
  },
  get interpolationStrategy() {
    return interpolationStrategy;
  },
  set interpolationStrategy(value: InterpolationStrategyFn) {
    interpolationStrategy = value;
  },
  parse,
  parseHex3,
  parseHex,
  parseRGB,
  parseRGBA: parseRGB,
  parseColorArray,
  parseColorObject,
  toHex,
  toHexA,
  toRGB,
  toRGBA,
  toColorArray,
  toColorObject,
  convert,
  interpolate,
  interpolator,
  generateSequence
};

export default ColorUtils;
