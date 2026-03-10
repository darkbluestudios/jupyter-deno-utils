/**
 * Bare Bones utility for converting and interpolating between colors.
 *
 * This is very helpful for graphs and diagrams.
 *
 * (apologies for my `colour` spelling friends, but please note
 * that this is accessible through both utils.color or utils.colour.
 *
 * There are 6 types of formats supported:
 * * Hex - 6-8 character hexadecimal colors as RRGGBB or RRGGBBAA, like red for #ff0000 or #ff000080 for semi-transparency
 * * Hex3 - 3-4 character hexadecimal colors: RGB or RGBA, like red for #F00 or #F008 for semi-transparency
 * * RGB - color with format `rgb(RR,GG,BB)` - like red for `rgb(255,0,0)`
 * * RGBA - RGB format with alpha: `rgba(RR,GG,BB,AA)` - like red for `rgba(255,0,0,0.5)` for semi-transparency
 * * ARRAY - 3 to 4 length array, with format: `[r,g,b]` or `[r,g,b,a]` - like red for [255,0,0] or [255,0,0,0.5] for semi-transparency
 * * OBJECT - objects with properties: r, g, b and optionally: a (the object is not modified and only those properties are checked)
 *
 * These align to the {@link COLOR_VALIDATION} enum.
 *
 * You can also set the default type to convert to, by assigning {@link defaultFormat}
 * to one of the {@link FORMATS} values.
 *
 * See other common libraries for working with color on NPM:
 * like [d3/color](https://d3js.org/d3-color)
 * or [d3-scale-chromatic scales](https://d3js.org/d3-scale-chromatic)
 * or [d3-color-interpolation](https://d3js.org/d3-interpolate/color)
 *
 * * Parsing color formats
 *   * {@link parse} - intelligently parse any of the types to an array format
 *   * {@link parseHex3} - parse a 3-4 character Hexadecimal color
 *   * {@link parseHex} - parse a 6-8 character Hexadecimal color
 *   * {@link parseRGB} - parses a RGB format color, like `rgb(255,0,0)`
 *   * {@link parseRGBA} - parses a RGBA format color, like `rgba(255,0,0,0.5)`
 *   * {@link parseColorArray} - converts a 3 or 4 length array into a colorArray
 *   * {@link parseColorObject} - captures the r,g,b,a fields from an object
 * * Convert
 *   * {@link convert} - intelligently converts any formats into another format
 *   * {@link toHex} - converts any of the formats to a 6 character Hexadecimal color
 *   * {@link toHexA} - converts any of the formats to an 8 character Hexadecimal color (with alpha)
 *   * {@link toRGB} - converts any of the formats to an RGB color
 *   * {@link toRGBA} - converts any of the formats to an RGBA color
 *   * {@link toColorArray} - converts any of the formats to an array of [r,g,b,a]
 *   * {@link toColorObject} - converts any of the formats to an object
 *      with properties: {r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]}
 * * interpolate
 *   * {@link interpolate} - gradually converts one color to another
 *   * {@link interpolator} - create a function you can then call with a percentage over and over again.
 *   * {@link generateSequence} - generate a sequence of colors from one to another, in X number of steps
 *   * {@link interpolationStrategy} - the function to use for interpolation,
 *      a function of signature (fromColor:Number[0-255], toColor:Number[0-255], percentage:Number[0-1]):Number[0-255]
 *   * {@link INTERPOLATION_STRATEGIES} - a list of strategies for interpolation you can choose from
 *
 * ```
 * utils.svg.render({ width: 800, height: 100,
 *     onReady: ({el, width, height, SVG }) => {
 *         const fromColor = '#ff0000';
 *         const toColor = 'rgb(0, 255, 0)';
 *
 *         const numBoxes = 5;
 *         const boxWidth = width / numBoxes;
 *         const boxHeight = 100;
 *
 *         // utils.color.interpolationStrategy = utils.color.INTERPOLATION_STRATEGIES.linear;
 *         // utils.color.defaultFormat = utils.color.FORMATS.hex;
 *
 *         const colorSequence = utils.color.generateSequence(fromColor, toColor, numBoxes);
 *         // [ '#ff0000', '#9d6200', '#4bb400', '#13ec00', '#00ff00' ]
 *
 *         colorSequence.forEach((boxColor, boxIndex) => {
 *             el.rect(boxWidth, boxHeight)
 *                 .fill(boxColor)
 *                 .translate(boxIndex * boxWidth);
 *         });
 *     }
 * });
 * ```
 *
 * ![Example SVG](img/interpolationExample.svg)
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

/**
 * Validation helpers for detecting color format types.
 * - isHex: detects 3, 6, or 8 character hex strings
 * - isRGB: detects rgb/rgba string format
 * - isColorArray: detects arrays
 * - isColorObject: detects objects with r, g, b properties
 */
export const COLOR_VALIDATION = {
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

/**
 * Enum strings of types expected
 *
 * There are 6 types of formats supported:
 * * HEX - 6 character hexadecimal colors as RRGGBB, like red for #ff0000
 *   * alternatively - 3 character hexadecimal colors #RGB are supported: like red for #F00
 * * HEXA - 8 character hexadecimal colors as RRGGBBAA, like red for #ff000080 with semi-transparency
 *   * alternatively - 4 character hexadecimal colors #RGBA are supported: #F008
 * * RGB - color with format `rgb(RR,GG,BB)` - like red for `rgb(255,0,0)`
 * * RGBA - RGB format with alpha: `rgba(RR,GG,BB,AA)` - like red for `rgba(255,0,0,0.5)` for semi-transparency
 * * ARRAY - 3 to 4 length array, with format: `[r,g,b]` or `[r,g,b,a]` - like red for [255,0,0] or [255,0,0,0.5] for semi-transparency
 * * OBJECT - objects with properties: r, g, b and optionally: a (the object is not modified and only those properties are checked)
 *
 * For example:
 *
 * ```
 * baseColor = '#b1d1f3';
 *
 * utils.color.convert(baseColor, utils.color.FORMATS.HEX); // '#b1d1f3'
 * utils.color.convert(baseColor, utils.color.FORMATS.HEXA); // #b1d1f3ff
 * utils.color.convert(baseColor, utils.color.FORMATS.RGB); // rgb( 177, 209, 243)
 * utils.color.convert(baseColor, utils.color.FORMATS.RGBA); // rgba(177, 209, 243, 1)
 * utils.color.convert(baseColor, utils.color.FORMATS.ARRAY); // [ 177, 209, 243, 1 ]
 * utils.color.convert(baseColor, utils.color.FORMATS.OBJECT); // { r: 177, g: 209, b: 243, a: 1 }
 * ```
 *
 * @see {@link defaultFormat}
 */
export const FORMATS = {
  HEX: "HEX" as const,
  HEXA: "HEXA" as const,
  RGB: "RGB" as const,
  RGBA: "RGBA" as const,
  ARRAY: "ARRAY" as const,
  OBJECT: "OBJECT" as const
};

const PI2 = Math.PI * 0.5;

/**
 * Different types of interpolation strategies:
 *
 * ![example](img/interpolationStrategies.svg)
 *
 * * linear - linear interpolation between one value to another (straight line)
 * * easeInOut - slows in to the change and slows out near the end
 * * easeIn - slow then fast
 * * easeOut - fast then slow
 *
 * @see {@link interpolationStrategy} - which strategy to use
 */
export const INTERPOLATION_STRATEGIES = {
  linear: (a: number, b: number, pct: number) => a + (b - a) * pct,
  easeInOut: (a: number, b: number, pct: number):number =>
    a + (b - a) * (Math.cos(pct * Math.PI + Math.PI) * 0.5 + 0.5),
  easeIn: (a: number, b: number, pct: number):number =>
    a + (b - a) * (1 - Math.cos(pct * PI2)),
  easeOut: (a: number, b: number, pct: number):number =>
    a + (b - a) * Math.sin(pct * PI2)
};

/**
 * Default format used when converting to types
 * (allowing the conversion type to be optional)
 *
 * ```
 * baseColor = '#b1d1f3';
 * utils.color.defaultFormat = utils.color.FORMATS.RGBA;
 *
 * utils.color.convert(baseColor); // rgba(177, 209, 243, 1)
 * ```
 *
 * @see {@link FORMATS}
 */
export let defaultFormat: FormatType = FORMATS.HEX;

export const setDefaultFormat = (newFormat:FormatType): void => {
  defaultFormat = newFormat;
}

/**
 * Default interpolation strategy used when interpolating
 * from one color to another.
 *
 * (Defaults to linear)
 *
 * ![example](img/interpolationStrategies.svg)
 *
 * For example, you can specify how you would like to interpolate
 * and even which format you'd like to receive the results in.
 *
 * ```
 * //-- same as utils.color.INTERPOLATION_STRATEGIES.linear;
 * red = '#FF0000';
 * green = '#00FF00';
 * linear = (a, b, pct) => a + (b - a) * pct;
 * format = utils.color.FORMATS.ARRAY;
 * utils.color.interpolate(red, green, 0, linear, format); // [255, 0, 0, 1]
 * ```
 *
 * or instead, you can set this property and set the default
 *
 * ```
 * // or set the default
 * utils.color.interpolationStrategy = linear;
 * utils.color.defaultFormat = utils.color.FORMATS.ARRAY;
 *
 * //-- note that the interpolation strategy or format isn't passed
 * utils.color.interpolate(red, green, 0.5); // [127.5, 127.5, 0, 1]
 * ```
 *
 * @see {@link INTERPOLATION_STRATEGIES}
 */
export let interpolationStrategy: InterpolationStrategyFn =
  INTERPOLATION_STRATEGIES.linear;

export const setInterpolationStrategy = (i:InterpolationStrategyFn):void => {
  interpolationStrategy = i;
}

/**
 * Parses a 3-4 character Hexadecimal color.
 *
 * For example: #F00 for Red or #F008 for semi-transparent red.
 *
 * ```
 * red = `#F00`;
 * transparentRed = `#F00F`;
 * green = `#0F0`;
 *
 * utils.color.parseHex3(red, 0.5); // [255, 0, 0, 0.5];
 * utils.color.parseHex3(transparentRed); // [255, 0, 0, 1];
 * utils.color.parseHex3(green); // [0, 255, 0, 1];
 * ```
 *
 * @param hexStr - 3 or 4 character Hexadecimal Color like `#F00` or `#F008`
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 * @see {@link FORMATS}
 */
export function parseHex3(
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

/**
 * Parses a 6 or 8 character Hexadecimal color.
 *
 * For example: #FF0000 for Red or #FF000080 for semi-transparent red.
 *
 * ```
 * red = `#FF0000`;
 * transparentRed = `#FF0000FF`;
 * green = `#00FF00`;
 *
 * utils.color.parseHex(red, 0.5); // [255, 0, 0, 0.5];
 * utils.color.parseHex(transparentRed); // [255, 0, 0, 1];
 * utils.color.parseHex(green); // [0, 255, 0, 1];
 * ```
 *
 * @param hexStr - 6 or 8 character Hexadecimal Color like: #FF0000
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 * @see {@link FORMATS}
 */
export function parseHex(
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

/**
 * Parses a color of format `rgb(r, g, b)` or `rgba(r, g, b, a)`
 *
 * For example: `rgb(255, 0, 0)` for Red
 *
 * ```
 * red = `rgb(255, 0, 0, 1)`;
 * green = `rgb(0, 255, 0)`;
 *
 * utils.color.parse(red); // [255, 0, 0];
 * utils.color.parse(green, 0.9); // [0, 255, 0, 0.9];
 * ```
 *
 * @param rgbStr - string in rgb or rgba format
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 * @see {@link FORMATS}
 */
export function parseRGB(
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

/** Alias for parseRGB. Parses rgba(r,g,b,a) format. @see parseRGB */
export const parseRGBA = parseRGB;

/**
 * Parses a 3 or 4 length array of numbers, in format of [Red:Number[0-255], Green:Number[0-255], Blue:Number[0-255], Alpha:Number[0-1]]
 *
 * For example: `[255, 0, 0]` for Red, or `[255, 0, 0, 0.5]` for a semi-transparent red
 *
 * ```
 * red = [255, 0, 0];
 * transparentRed = [255, 0, 0, 0];
 * green = [0, 255, 0];
 *
 * utils.color.parseColorArray(red, 0.5); // [255, 0, 0, 0.5];
 * utils.color.parseColorArray(transparentRed); // [255, 0, 0, 0];
 * utils.color.parseColorArray(green); // [0, 255, 0, 1];
 * ```
 *
 * @param targetArray - 3 or 4 length array of numbers
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 * @see {@link FORMATS}
 */
export function parseColorArray(
  targetArray: unknown,
  optionalAlpha: number = 1
): ColorArray | undefined {
  if (!Array.isArray(targetArray)) return undefined;
  const [r, g, b, a = optionalAlpha] = targetArray;
  return [r, g, b, a];
}

/**
 * Captures properties: `r:Number[0-255]`, `g:Number[0-255]`, `b:Number[0-255]`, `a:Number[0-1]` from an object.
 *
 * Only those properties are checked and the object is not modified
 *
 * For example: `{ r: 255, g: 0, b: 0}` for Red or `{ r: 255, g: 0, b: 0, a: 0.5 }` for a semi-transparent red
 *
 * ```
 * red = { r: 255, g: 0, b: 0 };
 * green = { r: 0, g: 255, b: 0, a: 1};
 * transparentBlue = { r: 0, g: 0, b: 255, a: 0};
 *
 * utils.color.parseColorObject(red, 0.5); // [255, 0, 0, 0.5];
 * utils.color.parseColorObject(red); // [255, 0, 0, 1];
 * utils.color.parseColorObject(green); // [0, 255, 0, 1];
 * utils.color.parseColorObject(transparentBlue); // [0, 0, 255, 0];
 * ```
 *
 * @param target - object with r, g, b and optionally a properties
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 * @see {@link FORMATS}
 */
export function parseColorObject(
  target: unknown,
  optionalAlpha: number = 1
): ColorArray | undefined {
  if (!COLOR_VALIDATION.isColorObject(target)) return undefined;
  const { r, g, b, a = optionalAlpha } = target;
  return [r, g, b, a];
}

/**
 * Parses any of the types of available formats, and returns an array.
 *
 * There are 6 types of formats supported:
 * * Hex - 6-8 character hexadecimal colors as RRGGBB or RRGGBBAA, like red for #ff0000 or #ff000080 for semi-transparency
 * * Hex3 - 3-4 character hexadecimal colors: RGB or RGBA, like red for #F00 or #F008 for semi-transparency
 * * RGB - color with format `rgb(RR,GG,BB)` - like red for `rgb(255,0,0)`
 * * RGBA - RGB format with alpha: `rgba(RR,GG,BB,AA)` - like red for `rgba(255,0,0,0.5)` for semi-transparency
 * * ARRAY - 3 to 4 length array, with format: `[r,g,b]` or `[r,g,b,a]` - like red for [255,0,0] or [255,0,0,0.5] for semi-transparency
 * * OBJECT - objects with properties: r, g, b and optionally: a (the object is not modified and only those properties are checked)
 *
 * by passing a value of any of those types, they will be recognized and parsed accordingly.
 *
 * The result array format is an array 3 or 4 length array of numbers,
 * in format of [Red:Number[0-255], Green:Number[0-255], Blue:Number[0-255], Alpha:Number[0-1]]
 *
 * ```
 * red = '#FF000088';
 * green = { r: 0, g: 255, b: 0};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.parse(red); // [255, 0, 0, 0.53]
 * utils.color.parse(green); // [0, 255, 0, 1]
 * utils.color.parse(blue); // [0, 0, 255, 1]
 * ```
 *
 * @param target - any of the formats provided (string, array, or object)
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 * @see {@link FORMATS}
 */
export function parse(target: ColorInput, optionalAlpha: number = 1): ColorArray | undefined {
  return (
    parseColorArray(target, optionalAlpha) ||
    parseHex(target as string, optionalAlpha) ||
    parseRGB(target as string, optionalAlpha) ||
    parseColorObject(target, optionalAlpha)
  );
}

/**
 * Converts any of the formats available,
 * and converts it into a 6 character hexadecimal string (no alpha)
 *
 * ```
 * red = '#FF000088';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.toHex(red); // `#FF0000`
 * utils.color.toHex(green); // `#00FF00`
 * utils.color.toHex(blue); // `#0000FF`
 * ```
 *
 * @param target - any of the Formats provided
 * @returns 6 character Hexadecimal color: #RRGGBB
 */
export function toHex(target: ColorInput): string {
  const arr = parse(target) ?? [0, 0, 0, 1];
  const [r, g, b] = arr;
  const hexOut = (num: number) => num.toString(16).padStart(2, "0");
  return `#${hexOut(r)}${hexOut(g)}${hexOut(b)}`;
}

/**
 * Converts any of the formats available,
 * and converts it into an 8 character hexadecimal string with alpha
 *
 * ```
 * red = '#FF000088';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.toHexA(red); // `#FF000088`
 * utils.color.toHexA(green); // `#00FF0080`
 * utils.color.toHexA(blue); // `#0000FFFF`
 * ```
 *
 * @param target - any of the Formats provided
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns 8 character Hexadecimal color: #RRGGBBAA
 */
export function toHexA(target: ColorInput, optionalAlpha: number = 1): string {
  const arr = parse(target, optionalAlpha) ?? [0, 0, 0, optionalAlpha];
  const [r, g, b, a] = arr;
  const hexOut = (num: number) => num.toString(16).padStart(2, "0");
  return `#${hexOut(r)}${hexOut(g)}${hexOut(b)}${hexOut(Math.round(a * 255))}`;
}

/**
 * Converts any of the formats available,
 * and converts it into an rgb string (no alpha)
 *
 * ```
 * red = '#FF000088';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.toRGB(red); // `rgb( 255, 0, 0)`
 * utils.color.toRGB(green); // `rgb( 0, 255, 0)`
 * utils.color.toRGB(blue); // `rgb( 0, 0, 255)`
 * ```
 *
 * @param target - any of the Formats provided
 * @returns an rgb string (no alpha)
 */
export function toRGB(target: ColorInput): string {
  const arr = parse(target) ?? [0, 0, 0, 1];
  const [r, g, b] = arr;
  return `rgb( ${r}, ${g}, ${b})`;
}

/**
 * Converts any of the formats available,
 * and converts it into an rgba string (includes alpha)
 *
 * ```
 * red = '#FF000080';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.toRGBA(red); // `rgba(255, 0, 0, 0.5)`
 * utils.color.toRGBA(green); // `rgba(0, 255, 0, 0.5)`
 * utils.color.toRGBA(blue); // `rgba(0, 0, 255, 1)`
 * ```
 *
 * @param target - any of the Formats provided
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns an rgba string (includes alpha)
 */
export function toRGBA(target: ColorInput, optionalAlpha: number = 1): string {
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

/**
 * Converts any of the formats available,
 * and converts it into an array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 *
 * ```
 * red = '#FF000080';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.toColorArray(red); // [255, 0, 0, 0.5]
 * utils.color.toColorArray(green); // [0, 255, 0, 0.5]
 * utils.color.toColorArray(blue); // [0, 0, 255, 1]
 * ```
 *
 * @param target - any of the Formats provided
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns array of format [r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]]
 */
export function toColorArray(target: ColorInput, optionalAlpha: number = 1): ColorArray {
  return parse(target, optionalAlpha) ?? [0, 0, 0, optionalAlpha];
}

/**
 * Converts any of the formats available,
 * and converts it into an object with the following properties:
 *
 * Object {
 *  r: Number[0-255],
 *  g: Number[0-255],
 *  b: Number[0-255],
 *  a: Number[0-1]
 * }
 *
 * ```
 * red = '#FF000080';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.toColorObject(red); // { r: 255, g: 0, b: 0, a: 0.5 }
 * utils.color.toColorObject(green); // { r: 0, g: 255, b: 0, a: 0.5 }
 * utils.color.toColorObject(blue); // { r: 0, g: 0, b: 255, a: 1 }
 * ```
 *
 * @param target - any of the Formats provided
 * @param optionalAlpha - value [0-1] to use for the alpha, if not provided (default 1)
 * @returns object with properties {r:Number[0-255], g: Number[0-255], b: Number[0-255], a: Number[0-1]}
 */
export function toColorObject(
  target: ColorInput,
  optionalAlpha: number = 1
): ColorObject {
  const [r, g, b, a] = parse(target, optionalAlpha) ?? [0, 0, 0, optionalAlpha];
  return { r, g, b, a };
}

/**
 * Converts any of the formats available,
 * and converts it to any other format.
 *
 * This is by far the most versatile.
 *
 * ```
 * red = '#FF000080';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * utils.color.convert(red, utils.color.FORMATS.OBJECT); // { r: 255, g: 0, b: 0, a: 0.5 }
 * utils.color.convert(green, utils.color.FORMATS.ARRAY); // [0, 255, 0, 0.5]
 * utils.color.convert(blue, utils.color.FORMATS.HEXA); // `#0000FFFF`
 * ```
 *
 * NOTE: you can also set the default format on the color utility,
 * so you don't have to specify the format each time.
 *
 * ```
 * red = '#FF000080';
 * green = { r: 0, g: 255, b: 0, a: 0.5};
 * blue = 'rgb(0, 0, 255, 1)';
 *
 * //-- converts to hex because color.defaultFormat is set to hex by default
 * utils.color.convert(red); // #FF000080
 *
 * utils.color.defaultFormat = utils.color.FORMATS.ARRAY
 * utils.color.convert(green); // [0, 255, 0, 0.5]
 * utils.color.convert(blue); // [0, 0, 255, 1]
 * ```
 *
 * @param target - any of the Formats provided
 * @param formatType - optional format to convert to, if not using the default
 * @returns any of the format types provided
 *
 * @see {@link defaultFormat} - to set the default format
 */
export function convert(
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

/**
 * Interpolates from one color to another color, by a percentage (from 0-1)
 *
 * ```
 * red = `#FF0000`;
 * green = `#00FF00`;
 *
 * utils.color.interpolate(red, green, 0); // `#FF0000`
 * utils.color.interpolate(red, green, 0.5); // `#808000`
 * utils.color.interpolate(red, green, 1); // `#00FF00`
 * ```
 *
 * You can also specify how you would like to interpolate
 * and even which format you'd like to receive the results in.
 *
 * ```
 * //-- same as utils.color.INTERPOLATION_STRATEGIES.linear;
 * linear = (a, b, pct) => a + (b - a) * pct;
 * format = utils.color.FORMATS.ARRAY;
 *
 * utils.color.interpolate(red, green, 0, linear, format); // [255, 0, 0, 1]
 *
 * // or set the default
 * utils.color.interpolationStrategy = linear;
 * utils.color.defaultFormat = utils.color.FORMATS.ARRAY;
 *
 * utils.color.interpolate(red, green, 0.5); // [127.5, 127.5, 0, 1]
 * ```
 *
 * @param fromColor - the color to interpolate from
 * @param toColor - the color to interpolate to
 * @param percent - value from 0-1 on where we should be on the sliding scale
 * @param interpolationFn - function of signature (fromVal:Number[0-255], toVal:Number[0-255], pct:Number[0-1]):Number[0-255]
 * @param formatType - the format to convert the result to
 * @returns any of the formats provided
 *
 * @see {@link interpolationStrategy} - the default interpolation used to calculate how the percentages come up with the color
 * @see {@link defaultFormat} - the default format to use if not specified
 */
export function interpolate(
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

/**
 * Curried function for color interpolation, so only the percent between [0-1] inclusive is needed.
 *
 * Meaning that you can do something like this:
 *
 * ```
 * black = `#000000`;
 * white = `#FFFFFF`;
 *
 * colorFn = utils.color.interpolator(black, white);
 *
 * colorFn(0);   // '#000000';
 * colorFn(0.5); // '#808080';
 * colorFn(1);   // '#FFFFFF';
 * ```
 *
 * Instead of something like this with the interpolate function
 *
 * ```
 * utils.color.interpolate(black, white, 0); // `#000000`
 * utils.color.interpolate(black, white, 0.5); // `#808080`
 * utils.color.interpolate(black, white, 1); // `#FFFFFF`
 * ```
 *
 * @param fromColor - the color to interpolate from
 * @param toColor - the color to interpolate to
 * @param interpolationFn - function of signature (fromVal:Number[0-255], toVal:Number[0-255], pct:Number[0-1]):Number[0-255]
 * @param formatType - the format to convert the result to
 * @returns function of signature: (Number) => {string|array|object}
 * @see {@link interpolate} - as this is a curried version of that function.
 */
export function interpolator(
  fromColor: ColorInput,
  toColor: ColorInput,
  interpolationFn: InterpolationStrategyFn = interpolationStrategy,
  formatType: FormatType = defaultFormat
): (pct: number) => string | ColorArray | ColorObject {
  return function interpolatorImpl(pct: number) {
    return interpolate(fromColor, toColor, pct, interpolationFn, formatType);
  };
}

/**
 * Generates a sequential array of colors interpolating fromColor to toColor,
 *
 * ```
 * black = `#000000`;
 * white = `#FFFFFF`;
 *
 * categoricalColors = utils.color.generateSequence(black, white, 5);
 * // [[ 0, 0, 0, 1 ],
 * //   [ 64, 64, 64, 1 ],
 * //   [ 128, 128, 128, 1 ],
 * //   [ 191, 191, 191, 1 ],
 * //   [ 255, 255, 255, 1 ]]
 * ```
 *
 * Note that the default format of the colors produced can be set by the default
 *
 * ```
 * black = `#000000`;
 * white = `#FFFFFF`;
 *
 * utils.color.defaultFormat = 'HEX';
 *
 * categoricalColors = utils.color.generateSequence(black, white, 5);
 * // ['#000000', '#404040', '#808080', '#bfbfbf', '#ffffff']
 * ```
 *
 * @param fromColor - the color to interpolate from
 * @param toColor - the color to interpolate to
 * @param lengthOfSequence - how many steps in the sequence to generate
 * @param interpolationFn - function of signature (fromVal:Number[0-255], toVal:Number[0-255], pct:Number[0-1]):Number[0-255]
 * @param formatType - the format to convert the result to
 * @returns array of colors in the specified format
 * @see {@link interpolate}
 */
export function generateSequence(
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

/**
 * Simple sequence of colors to use when plotting categorical values.
 *
 * Used based on the Tableau color scheme.
 *
 * For example:
 *
 * ```
 * utils.color.SEQUENCE[0]
 * ```
 */
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
