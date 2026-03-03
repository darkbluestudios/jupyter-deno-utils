import { describe, it, beforeEach, afterAll } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { assertSpyCalls, spy, type Spy } from "@std/testing/mock";
import PlantUML from "../src/plantuml.ts";

const OLD_FETCH = globalThis.fetch;
const OLD_CONSOLE = globalThis.console;

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
    let mockConsole: { log: Spy<unknown, unknown[], unknown> };
    const displayStub = {
      png: spy(() => {}),
      svg: spy(() => {})
    };

    beforeEach(() => {
      mockConsole = { log: spy() };
      (
        globalThis as unknown as {
          $$?: { png: (b64: string) => void; svg: (s: string) => void };
          console?: { log: (msg: string) => void };
        }
      ).$$ = displayStub;
      (
        globalThis as unknown as { console: typeof mockConsole }
      ).console = { ...OLD_CONSOLE, ...mockConsole };

      (globalThis as unknown as { fetch: (url: string) => Promise<Response> }).fetch = () =>
        Promise.resolve(createFakeResponse("<svg/>"));
    });
    afterAll(() => {
      delete (globalThis as unknown as { $$?: unknown }).$$;
      (globalThis as unknown as { console: typeof OLD_CONSOLE }).console = OLD_CONSOLE;
      (globalThis as unknown as { fetch: typeof OLD_FETCH }).fetch = OLD_FETCH;
    });

    it("is in ijs context by default", () => {
      expect((globalThis as unknown as { $$?: unknown }).$$).toBeTruthy();
    });
    it("can be not in ijs context", () => {
      delete (globalThis as unknown as { $$?: unknown }).$$;
      expect((globalThis as unknown as { $$?: unknown }).$$).toBeUndefined();
    });
    it("can mock the console", () => {
      console.log("test");
      assertSpyCalls(mockConsole.log, 1);
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
      assertSpyCalls(mockConsole.log, 1);
      expect(mockConsole.log.calls[0].args[0]).toContain("url:");
    });
    it("sends console if using debug", async () => {
      const plantUMLText = "Some PlantUML Text";
      const options = { format: "svg" as const, debug: true };
      PlantUML.setDefaultFormat("svg");
      PlantUML.protocol = "https://";
      PlantUML.host = "www.plantumlServer.com";

      await PlantUML.render(plantUMLText, options);
      assertSpyCalls(mockConsole.log, 1);
      expect(mockConsole.log.calls[0].args[0]).toContain("url:");
    });
  });
});
