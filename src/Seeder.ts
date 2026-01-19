import { Data } from './Data';

export function generateFlatData(maxDepth: number, maxChildren: number = 5): Data[] {
  const flatList: Data[] = [];
  let currentId = 1; // Scoped to this function call

  function spawn(depth: number): string[] {
    if (depth >= maxDepth) return [];

    // Randomize children (at least 1 if it's the root to ensure a tree)
    const numChildren = depth === 1 ?
        Math.max(1, Math.floor(Math.random() * maxChildren)) :
        Math.floor(Math.random() * (maxChildren + 1));

    const childrenIds: string[] = [];

    for (let i = 0; i < numChildren; i++) {
      const id = ++currentId; // Increment immediately
      const childId = id.toString();

      flatList.push({
        id: childId,
        label: `Node ${id} (D${depth})`,
        childrenIds: []
      });

      childrenIds.push(childId);
      // Recursively get grandchildren and set them on the child
      const grandChildren = spawn(depth + 1);
      if (grandChildren.length > 0) {
        const childNode = flatList.find(node => node.id === childId);
        if (childNode) {
          childNode.childrenIds = grandChildren;
        }
      }
    }

    return childrenIds;
  }

  // Add the Root
  const rootId = "1";
  flatList.push({
    id: rootId,
    label: "Root Node",
    childrenIds: []
  });

  // Generate children for root and set them on root
  const rootChildren = spawn(1);
  const rootNode = flatList.find(node => node.id === rootId);
  if (rootNode) {
    rootNode.childrenIds = rootChildren;
  }

  return flatList;
}