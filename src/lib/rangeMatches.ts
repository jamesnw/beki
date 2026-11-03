export default function(search: string, element: HTMLElement) : Range[] {
  const cleanedSearch = search.trim().toLowerCase();

  const ranges: Range[] = [];
  if (!cleanedSearch || cleanedSearch.length < 2 || !element) return ranges;

  const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  // Go through this part
  let currentNode = treeWalker.nextNode();
  while (currentNode) {
    const nodeValue = currentNode.nodeValue?.toLowerCase() || "";
    let startIndex = 0;
    while ((startIndex = nodeValue.indexOf(cleanedSearch, startIndex)) !== -1) {
      const range = document.createRange();
      range.setStart(currentNode, startIndex);
      range.setEnd(currentNode, startIndex + cleanedSearch.length);
      ranges.push(range);
      startIndex += cleanedSearch.length;
    }
    currentNode = treeWalker.nextNode();
  }

  return ranges;
}