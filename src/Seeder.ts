import { Data } from './Data';

export function generateFlatData(maxDepth: number, maxChildren: number = 5): Data[] {
  const flatList: Data[] = [];
  let currentId = 1; // Scoped to this function call

  function spawn(parentId: number, depth: number) {
    if (depth >= maxDepth) return;

    // Randomize children (at least 1 if it's the root to ensure a tree)
    const numChildren = depth === 1 ? 
        Math.max(1, Math.floor(Math.random() * maxChildren)) : 
        Math.floor(Math.random() * (maxChildren + 1));

    for (let i = 0; i < numChildren; i++) {
      const id = ++currentId; // Increment immediately
      
      flatList.push({
        id: id,
        label: `Node ${id} (D${depth})`,
        parentId: parentId
      });

      spawn(id, depth + 1);
    }
  }

  // Add the Root
  const rootId = 1;
  flatList.push({
    id: rootId,
    label: "Root Node",
    parentId: null as any // Type cast for your interface if needed
  });

  spawn(rootId, 1);
  return flatList;
}