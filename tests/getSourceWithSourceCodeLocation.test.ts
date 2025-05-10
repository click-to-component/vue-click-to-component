import { describe, expect, test } from "@jest/globals";
import { getSourceWithSourceCodeLocation } from "../src/getSourceWithSourceCodeLocation";
import htmlTags from "html-tags";

function getSourceWithSourceCodeLocationBySource(source: string) {
  return getSourceWithSourceCodeLocation({
    source,
    filePath: "test.vue",
    htmlTags,
  });
}

describe("getSourceWithSourceCodeLocation", () => {
  test("<image /> should not add source code location", () => {
    const sourceWithSourceCodeLocation =
      getSourceWithSourceCodeLocationBySource("<template><image /></template>");

    expect(sourceWithSourceCodeLocation).toMatchSnapshot();
  });

  test("<image\\r> should not add source code location", () => {
    const sourceWithSourceCodeLocation =
      getSourceWithSourceCodeLocationBySource("<template><image\r></template>");

    expect(sourceWithSourceCodeLocation).toMatchSnapshot();
  });

  test("<img /> should add source code location", () => {
    const sourceWithSourceCodeLocation =
      getSourceWithSourceCodeLocationBySource("<template><img /></template>");

    expect(sourceWithSourceCodeLocation).toMatchSnapshot();
  });

  test("<img/> should add source code location", () => {
    const sourceWithSourceCodeLocation =
      getSourceWithSourceCodeLocationBySource("<template><img/></template>");

    expect(sourceWithSourceCodeLocation).toMatchSnapshot();
  });

  test("<img> should add source code location", () => {
    const sourceWithSourceCodeLocation =
      getSourceWithSourceCodeLocationBySource("<template><img></template>");

    expect(sourceWithSourceCodeLocation).toMatchSnapshot();
  });

  test("<img\\r> should add source code location", () => {
    const sourceWithSourceCodeLocation =
      getSourceWithSourceCodeLocationBySource("<template><img\r></template>");

    expect(sourceWithSourceCodeLocation).toMatchSnapshot();
  });

  test("<img\\t> should add source code location", () => {
    const sourceWithSourceCodeLocation =
      getSourceWithSourceCodeLocationBySource("<template><img\t></template>");

    expect(sourceWithSourceCodeLocation).toMatchSnapshot();
  });
});
