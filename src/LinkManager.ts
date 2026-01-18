import { Link, Node } from "./Data";

export function getLinks(nodes: Node[]): Link[] {
  const links: Link[] = [];
  const linkSet = new Set<string>(); // To avoid duplicate links

  // Create a map for quick node lookup by ID
  const nodeMap = new Map<number, Node>();
  nodes.forEach(node => {
    nodeMap.set(node.data.id, node);
  });

  // Generate links from ancestor/descendant relationships
  nodes.forEach(node => {
    const currentNode = node;

    // Create links from ancestors to this node
    currentNode.data.ancestors.forEach(ancestorId => {
      const ancestorNode = nodeMap.get(ancestorId);
      if (ancestorNode) {
        // Create a unique key for this link (smaller ID first to avoid duplicates)
        const linkKey = ancestorId < currentNode.data.id
          ? `${ancestorId}-${currentNode.data.id}`
          : `${currentNode.data.id}-${ancestorId}`;

        if (!linkSet.has(linkKey)) {
          linkSet.add(linkKey);
          links.push({
            source: ancestorNode,
            target: currentNode
          });
        }
      }
    });

    // Create links from this node to descendants
    currentNode.data.descendants.forEach(descendantId => {
      const descendantNode = nodeMap.get(descendantId);
      if (descendantNode) {
        // Create a unique key for this link (smaller ID first to avoid duplicates)
        const linkKey = currentNode.data.id < descendantId
          ? `${currentNode.data.id}-${descendantId}`
          : `${descendantId}-${currentNode.data.id}`;

        if (!linkSet.has(linkKey)) {
          linkSet.add(linkKey);
          links.push({
            source: currentNode,
            target: descendantNode
          });
        }
      }
    });
  });

  return links;
}