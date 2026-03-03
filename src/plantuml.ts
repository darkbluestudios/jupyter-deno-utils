/**
 * PlantUML - Render diagrams in Jupyter Lab
 * Renderer for PlantUML - a rendering engine that converts text to diagrams.
 *
 * Setting defaults: protocol, host, setDefaultFormat, getDefaultFormat
 * Rendering: generateURL(string, options), render(string, options)
 *
 * @module plantuml
 */

import plantumlEncoder from "plantuml-encoder";

export type PlantUMLFormat = "svg" | "png";

export interface PlantUMLOptions {
  format?: PlantUMLFormat;
  showURL?: boolean;
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

const emptyPlantUML = `@startuml\n@enduml`;

let defaultFormat: PlantUMLFormat = "svg";

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

class PlantUMLController {
  protocol:string = "http://";
  host:string = "localhost:8080";

  reset(): void {
    defaultFormat = "svg";
    PlantUML.protocol = "http://";
    PlantUML.host = "localhost:8080";
  }

  getDefaultFormat(): PlantUMLFormat {
    return defaultFormat;
  }

  setDefaultFormat(format: string): PlantUMLFormat {
    defaultFormat = checkFormat(format);
    return defaultFormat;
  }

  generateURL(plantUMLText?: string | null, plantUMLOptions?: PlantUMLOptions | null): string {
    const cleanOptions = plantUMLOptions ?? {};
    let format = cleanOptions.format ?? "svg";
    format = checkFormat(format);
    const plantUMLTextStr = plantUMLText ?? emptyPlantUML;
    const encodedStr = plantumlEncoder.encode(plantUMLTextStr);
    return `${PlantUML.protocol}${PlantUML.host}/plantuml/${format}/${encodedStr}`;
  }

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

const PlantUML:PlantUMLController = new PlantUMLController();

export default PlantUML;

export const getContext = () => CONTEXT;
