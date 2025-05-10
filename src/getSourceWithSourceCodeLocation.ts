import { parseFragment } from "parse5";

function getSourceWithSourceCodeLocation({
  source,
  filePath,
  htmlTags,
}: {
  source: string;
  filePath: string;
  htmlTags: readonly string[];
}) {
  const ast = parseFragment(source, {
    sourceCodeLocationInfo: true,
  });

  let allNodes: any[] = [ast];
  let nodeIndex = 0;
  while (allNodes.length > nodeIndex) {
    allNodes = allNodes.concat(
      allNodes[nodeIndex]?.childNodes || [],
      allNodes[nodeIndex]?.content?.childNodes || [],
    );

    nodeIndex++;
  }

  const startOffsetSet = new Set();

  const sortedNodes = allNodes
    .filter((node) => {
      if (!node?.sourceCodeLocation?.startOffset) {
        return false;
      }

      const { startOffset } = node.sourceCodeLocation;

      if (startOffsetSet.has(startOffset)) {
        return false;
      }

      startOffsetSet.add(startOffset);

      if (!htmlTags.includes(node?.nodeName)) {
        return false;
      }

      // Make sure the length of nodeName is equal to the length of the real nodeName in the source
      // For example, <image /> will be parsed as img in the ast
      // Tag name state: https://html.spec.whatwg.org/multipage/parsing.html#tag-name-state
      // eslint-disable-next-line no-control-regex
      if (!/[\u0009\u000A\u000C\u0020\u002F\u003E\u000D]/.test(source[startOffset + node.nodeName.length + 1])) {
        return false;
      }

      return true;
    })
    .sort(
      (a, b) =>
        b.sourceCodeLocation.startOffset - a.sourceCodeLocation.startOffset,
    );

  let result = source;

  sortedNodes.forEach((node) => {
    const { startOffset, startLine, startCol } = node.sourceCodeLocation;
    const sourceCodeLocation = ` data-__source-code-location="${filePath}:${startLine}:${startCol}" `;
    const insertPos = startOffset + node.nodeName.length + 1;
    result =
      result.substring(0, insertPos) +
      sourceCodeLocation +
      result.substring(insertPos);
  });

  return result;
}

export { getSourceWithSourceCodeLocation };
