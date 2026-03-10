/**
 * PlantUML Render diagrams in Jupyter Lab
 * Renderer for PlantUML - a rendering engine that converts text to diagrams.
 *
 * ![Screenshot of plantUML](img/plantumlSequence.png)
 *
 * * Setting defaults:
 *   * {@link PlantUML.protocol} - ex: 'http://'
 *   * {@link PlantUML.host} - ex: 'localhost:8080'
 *   * {@link PlantUML.setDefaultFormat} - whether to use 'png' or 'svg' as default
 *   * {@link PlantUML.getDefaultFormat} - get the current default
 * * rendering
 *   * {@link PlantUML.generateURL} - determine a url to generate the image
 *   * {@link PlantUML.render} - render the results in a jupyter cell
 *
 * # Types of Diagrams Supported
 *
 * All PlantUML diagrams are supported - as they are managed by the server.
 *
 * ![Screenshot of types of PlantUML Diagrams](img/plantUmlDiagrams.jpg)
 *
 * Such as:
 * [Sequence diagrams](https://plantuml.com/sequence-diagram),
 * [Usecase diagrams](https://plantuml.com/use-case-diagram),
 * [Class diagrams](https://plantuml.com/class-diagram),
 * [Object diagrams](https://plantuml.com/object-diagram),
 * [Activity diagrams](https://plantuml.com/activity-diagram-beta),
 * [Component diagrams](https://plantuml.com/component-diagram),
 * [Deployment diagrams](https://plantuml.com/deployment-diagram),
 * [State diagrams](https://plantuml.com/state-diagram),
 * [Timing diagrams](https://plantuml.com/timing-diagram),
 * and many others...
 *
 * # Running your own PlantUML Server
 *
 * **This library requires a PlantUML server to render the images,
 * however the images will be preserved upon export.**
 *
 * (We are currently evaluating additional options like MermaidJS.
 * They are available still through ijs.htmlScript,
 * but are still determining a sufficient option)
 *
 * [PlantUML PicoWeb](https://plantuml.com/picoweb) is a very simple PlantUML Server.
 *
 * [Learn more here](https://plantuml.com/picoweb)
 */

import plantumlEncoder from "plantuml-encoder";

/** Output format for PlantUML rendering: 'svg' or 'png' */
export type PlantUMLFormat = "svg" | "png";

/**
 * Options for PlantUML rendering
 */
export interface PlantUMLOptions {
  /** 'svg' | 'png' (default 'svg') */
  format?: PlantUMLFormat;
  /** whether to show the URL at the bottom (default false) */
  showURL?: boolean;
  /** whether to provide debugging information (default false) */
  debug?: boolean;
}

/** Display context: $$.png / $$.svg and console.log */
interface PlantUMLDisplayContext {
  $$: { 
    png: (pngBody: string) => void;
    svg: (svgBody: string) => void
  };
  console: { log: (msg: string) => void };
}

const JUPYTER_DISPLAY = Symbol.for("Jupyter.display");
const renderSymbol = function renderSymbol(mimeType: string, value: unknown) {
  return {
    [JUPYTER_DISPLAY]() {
      const obj: Record<string, unknown> = {};
      obj[mimeType] = value;
    }
  };
};

const CONTEXT:PlantUMLDisplayContext = {
  console: {
    log: console.log
  },
  $$: {
    png(pngBody: string) {
      return renderSymbol("image/png", pngBody);
    },
    svg(svgBody: string) {
      return renderSymbol("image/svg+xml", svgBody);
    }
  }
};

/** Simple / empty plantuml diagram */
const emptyPlantUML = `@startuml\n@enduml`;

/** Default format for retrieving values (svg | png) */
let defaultFormat: PlantUMLFormat = "svg";

/**
 * Verify that a format is acceptable
 * @param format - format to check
 * @returns the format if valid
 * @throws Error if the format is not acceptable (svg or png)
 */
function checkFormat(format: string): PlantUMLFormat {
  if (format === "svg" || format === "png") {
    return format as PlantUMLFormat;
  }
  throw new Error(
    `Unexpected PlantUML format:${format}. Expected are: svg, png`
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * PlantUML controller - manages protocol, host, format defaults and rendering.
 */
class PlantUMLController {
  /** The protocol used to access the PlantUML results (default: 'http://') */
  protocol: string = "http://";
  /** The host domain of the PlantUML server (default: 'localhost:8080') */
  host: string = "localhost:8080";

  /**
   * Resets the defaults: format, protocol, host
   */
  reset(): void {
    defaultFormat = "svg";
    PlantUML.protocol = "http://";
    PlantUML.host = "localhost:8080";
  }

  /**
   * Determines the default format to retrieve
   * @returns 'svg' | 'png'
   */
  getDefaultFormat(): PlantUMLFormat {
    return defaultFormat;
  }

  /**
   * Sets the default format to retrieve
   * @param format - which format to default from now on ('svg' | 'png')
   */
  setDefaultFormat(format: string): PlantUMLFormat {
    defaultFormat = checkFormat(format);
    return defaultFormat;
  }

  /**
   * Generates a URL for a given plantUMLText
   *
   * ```
   * //-- note there should be no space after '@' character
   * //-- ex: '@' + 'startuml' and '@' + 'enduml'
   * utils.plantuml.generateURL(`@startuml
   *   Alice -> Bob: Authentication Request
   *   Bob --> Alice: Authentication Response
   *
   *   Alice -> Bob: Another authentication Request
   *   Alice <-- Bob: Another authentication Response
   *   @enduml`);
   * // 'http://localhost:8080/plantuml/svg/SoWkIImgAStDuNBCoKnELT2rKt3AJx9IS2mjo...'
   * ```
   *
   * @param plantUMLText - the text to render
   * @param plantUMLOptions - the options to use
   * @param plantUMLOptions.format - the format to use for this render (default 'svg')
   * @returns URL to fetch the rendered image
   */
  generateURL(plantUMLText?: string | null, plantUMLOptions?: PlantUMLOptions | null): string {
    const cleanOptions = plantUMLOptions ?? {};
    let format = cleanOptions.format ?? "svg";
    format = checkFormat(format);
    const plantUMLTextStr = plantUMLText ?? emptyPlantUML;
    const encodedStr = plantumlEncoder.encode(plantUMLTextStr);
    return `${PlantUML.protocol}${PlantUML.host}/plantuml/${format}/${encodedStr}`;
  }

  /**
   * Renders a PlantUML Text
   *
   * ![Screenshot of plantUML](img/plantumlSequence.png)
   *
   * ```
   * //-- note there should be no space after '@' character
   * //-- ex: '@' + 'startuml' and '@' + 'enduml'
   * utils.plantuml.render(`@startuml
   *   Alice -> Bob: Authentication Request
   *   Bob --> Alice: Authentication Response
   *
   *   Alice -> Bob: Another authentication Request
   *   Alice <-- Bob: Another authentication Response
   *   @enduml`)
   * ```
   *
   * @param plantUMLText - the text to render
   * @param plantUMLOptions - the options to use
   * @param plantUMLOptions.format - the format to use for this render (default 'svg')
   * @param plantUMLOptions.showURL - whether to show the URL at the bottom (default false)
   * @param plantUMLOptions.debug - whether to provide debugging information (default false)
   */
  async render(plantUMLText?: string | null, plantUMLOptions?: PlantUMLOptions | null): Promise<void> {
    const cleanOptions = plantUMLOptions ?? {};
    let format = cleanOptions.format ?? "svg";
    const { showURL = false, debug = false } = cleanOptions;
    format = checkFormat(format);

    const ctx = CONTEXT;
    const { $$, console: cons } = ctx;

    const targetURL = PlantUML.generateURL(plantUMLText, plantUMLOptions);
    if (showURL || debug) cons.log(`url:${targetURL}`);

    const fetchFn = (globalThis as unknown as { fetch?: (url: string) => Promise<Response> }).fetch;
    if (!fetchFn) return;
    const result = await fetchFn(targetURL);

    if (format === "png") {
      const buf = await result.arrayBuffer();
      const b64 = arrayBufferToBase64(buf);
      $$.png(b64);
      return;
    }
    const svgStr = await result.text();
    $$.svg(svgStr);
  }
}

const PlantUML: PlantUMLController = new PlantUMLController();

export default PlantUML;

/** Returns the display context ($$.png, $$.svg, console) used for rendering */
export const getContext = () => CONTEXT;
