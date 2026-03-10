import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { assertSpyCalls, spy, type Spy } from "@std/testing/mock";
// import { ConsoleI, mockConsole, removeConsoleMock } from "./__testHelper/JupyterContext.ts";
import { getContext } from "../src/plantuml.ts";
import PlantUML from "../src/plantuml.ts";
// import { mock } from "node:test";

const OLD_FETCH = globalThis.fetch;

function createFakeResponse(body: string | ArrayBuffer): Response {
  return {
    text: () => Promise.resolve(typeof body === "string" ? body : ""),
    arrayBuffer: () =>
      Promise.resolve(
        typeof body === "string" ? new ArrayBuffer(0) : body
      ),
    ok: true,
    status: 200
  } as Response;
}

describe("PlantUML", () => {
  beforeEach(() => {
    PlantUML.reset();
  });

  describe("defaults", () => {
    it("has default format", () => {
      expect(PlantUML.getDefaultFormat()).toBe("svg");
    });
    it("has default prootocol", () => {
      expect(PlantUML.protocol).toBe("http://");
    });
    it("has default host", () => {
      expect(PlantUML.host).toBe("localhost:8080");
    });

    it("can set the default format to png", () => {
      const newFormat = "png";
      PlantUML.setDefaultFormat(newFormat);
      const result = PlantUML.getDefaultFormat();
      expect(result).toBe(newFormat);
    });
    it("can set the default format to svg", () => {
      const newFormat = "svg";
      PlantUML.setDefaultFormat(newFormat);
      const result = PlantUML.getDefaultFormat();
      expect(result).toBe(newFormat);
    });
    it("can change the default format", () => {
      const initialFormat = PlantUML.getDefaultFormat();
      const newFormat = "png";

      expect(newFormat).not.toBe(initialFormat);

      PlantUML.setDefaultFormat(newFormat);

      const result = PlantUML.getDefaultFormat();

      expect(result).not.toBe(initialFormat);
    });
    it("fails to set default format if invalid", () => {
      const error =
        "Unexpected PlantUML format:vitamin. Expected are: svg, png";
      const invalid = "vitamin";
      expect(() => PlantUML.setDefaultFormat(invalid)).toThrow(error);
    });
  });

  describe("can generate a URL", () => {
    it("with options", () => {
      const plantUMLText = "Some Plant UML Text";
      const options = { format: "png" as const };
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";
      const expected =
        "https://www.plantumlServer.com/plantuml/png/2yxFJLK8o4dCAr48zVLH24cjA040";
      const result = PlantUML.generateURL(plantUMLText, options);
      expect(result).toBe(expected);
    });

    it("with png", () => {
      const plantUMLText = "Some Plant UML Text";
      const options = { format: "png" as const };
      const expected =
        "http://localhost:8080/plantuml/png/2yxFJLK8o4dCAr48zVLH24cjA040";
      const result = PlantUML.generateURL(plantUMLText, options);
      expect(result).toBe(expected);
    });
    it("with svg", () => {
      const plantUMLText = "Some Plant UML Text";
      const options = { format: "svg" as const };
      const expected =
        "http://localhost:8080/plantuml/svg/2yxFJLK8o4dCAr48zVLH24cjA040";
      const result = PlantUML.generateURL(plantUMLText, options);
      expect(result).toBe(expected);
    });
    it("but throw an error with an invalid format", () => {
      const plantUMLText = "Some Plant UML Text";
      const options = { format: "vitamin" as unknown as "svg" };
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";

      const error =
        "Unexpected PlantUML format:vitamin. Expected are: svg, png";
      expect(() => PlantUML.generateURL(plantUMLText, options)).toThrow(error);
    });

    it("without options", () => {
      const plantUMLText = "Some Plant UML Text";
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";
      const expected =
        "https://www.plantumlServer.com/plantuml/svg/2yxFJLK8o4dCAr48zVLH24cjA040";
      const result = PlantUML.generateURL(plantUMLText);
      expect(result).toBe(expected);
    });
    it("does not throw an error with empty plantuml text", () => {
      expect(() => PlantUML.generateURL()).not.toThrow();
    });
  });

  describe("can render an image", () => {
    const CONTEXT = getContext();
    const getSpy = function(fn: (_s:string) => void ):Spy {
      return fn as Spy;
    }

    beforeEach(() => {
      
      CONTEXT.console.log = spy(console, 'log');
      CONTEXT.$$.png = spy(CONTEXT.$$, 'png');
      CONTEXT.$$.svg = spy(CONTEXT.$$, 'svg');

      (globalThis as unknown as { fetch: (url: string) => Promise<Response> }).fetch = () =>
        Promise.resolve(createFakeResponse("<svg/>"));
    });
    afterEach(() => {
      const CONTEXT = getContext();

      const restoreSpy = function restoreSpy(fn: (_v:string) => unknown ):void {
        const spyFn:Spy = fn as Spy;
        spyFn.restore();
      };

      restoreSpy(CONTEXT.console.log);
      restoreSpy(CONTEXT.$$.png);
      restoreSpy(CONTEXT.$$.svg);
      
      (globalThis as unknown as { fetch: typeof OLD_FETCH }).fetch = OLD_FETCH;
    });
    it("can mock the console", () => {
      console.log("test");
      assertSpyCalls(getSpy(CONTEXT.console.log), 1);
    });
    it("as svg with options", async () => {
      const plantUMLText = "Some PlantUML Text";
      const options = { format: "svg" as const };
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";

      await PlantUML.render(plantUMLText, options);
    });
    it("as png with options", async () => {
      const plantUMLText = "Some PlantUML Text";
      const options = { format: "png" as const };
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";

      (globalThis as unknown as { fetch: (url: string) => Promise<Response> }).fetch = () =>
        Promise.resolve(createFakeResponse(new ArrayBuffer(0)));

      await PlantUML.render(plantUMLText, options);
    });
    it("without options", async () => {
      const plantUMLText = "Some PlantUML Text";
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";

      await PlantUML.render(plantUMLText);
    });

    it("sends console if using showURL", async () => {
      const plantUMLText = "Some PlantUML Text";
      const options = { format: "svg" as const, showURL: true };
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";

      await PlantUML.render(plantUMLText, options);
      assertSpyCalls(getSpy(CONTEXT.console.log), 1);
      expect(getSpy(CONTEXT.console.log).calls[0].args[0]).toContain("url:");
      // expect(mockConsole.log.calls[0].args[0]).toContain("url:");
    });
    it("sends console if using debug", async () => {
      const plantUMLText = "Some PlantUML Text";
      const options = { format: "svg" as const, debug: true };
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";

      await PlantUML.render(plantUMLText, options);
      assertSpyCalls(getSpy(CONTEXT.console.log), 1);
      expect(getSpy(CONTEXT.console.log).calls[0].args[0]).toContain("url:");
    });
  });
});
