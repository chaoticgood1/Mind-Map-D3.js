import { MapData, Node, NodeData } from "./Data";

// Constants for positioning
const HORIZONTAL_GAP = 40;  // Distance between columns
const VERTICAL_GAP = 12;    // Distance between nodes in a column

export function getNodes(data: MapData): Node[] {
  const nodes: Node[] = [];

  // Calculate levels for each node based on their relationships
  const nodeLevels = calculateNodeLevels(data.nodes);

  // Group nodes by level for positioning
  const levelCounts: { [level: number]: number } = {};
  const levelTrackers: { [level: number]: number } = {};

  // Count nodes per level
  data.nodes.forEach(nodeData => {
    const level = nodeLevels.get(nodeData.id) || 0;
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });

  // Sort nodes by level for consistent ordering
  const sortedNodes = [...data.nodes].sort((a, b) => {
    const levelA = nodeLevels.get(a.id) || 0;
    const levelB = nodeLevels.get(b.id) || 0;
    return levelA - levelB;
  });

  // Create Node objects with positioning
  sortedNodes.forEach(nodeData => {
    const level = nodeLevels.get(nodeData.id) || 0;
    levelTrackers[level] = (levelTrackers[level] || 0) + 1;

    // Position calculation (assuming window dimensions, adjust as needed)
    // const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    // const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const windowWidth = 0;
    const windowHeight = 0;

    const fx = level * HORIZONTAL_GAP + (windowWidth / 2);
    const columnHeight = (levelCounts[level] - 1) * VERTICAL_GAP;
    const startY = (windowHeight - columnHeight) / 2;
    const fy = startY + ((levelTrackers[level] - 1) * VERTICAL_GAP);

    nodes.push({
      data: nodeData,
      level: level,
      x: fx,
      y: fy
    });
  });

  return nodes;
}

function calculateNodeLevels(nodeData: NodeData[]): Map<number, number> {
  const levels = new Map<number, number>();
  const visited = new Set<number>();

  // Find root node (node with no ancestors)
  const rootNode = nodeData.find(node => node.ancestors.length === 0);
  if (rootNode) {
    levels.set(rootNode.id, 0);
    calculateLevelsRecursive(rootNode, nodeData, levels, visited, 0);
  }

  // Handle any disconnected nodes
  nodeData.forEach(node => {
    if (!levels.has(node.id)) {
      levels.set(node.id, 0); // Default to level 0
      calculateLevelsRecursive(node, nodeData, levels, visited, 0);
    }
  });

  return levels;
}

function calculateLevelsRecursive(
  currentNode: NodeData,
  allNodes: NodeData[],
  levels: Map<number, number>,
  visited: Set<number>,
  currentLevel: number
): void {
  if (visited.has(currentNode.id)) return;
  visited.add(currentNode.id);

  // Process descendants (higher levels)
  currentNode.descendants.forEach(descendantId => {
    const descendant = allNodes.find(n => n.id === descendantId);
    if (descendant && !levels.has(descendantId)) {
      levels.set(descendantId, currentLevel + 1);
      calculateLevelsRecursive(descendant, allNodes, levels, visited, currentLevel + 1);
    }
  });

  // Process ancestors (lower levels)
  currentNode.ancestors.forEach(ancestorId => {
    const ancestor = allNodes.find(n => n.id === ancestorId);
    if (ancestor && !levels.has(ancestorId)) {
      levels.set(ancestorId, currentLevel - 1);
      calculateLevelsRecursive(ancestor, allNodes, levels, visited, currentLevel - 1);
    }
  });
}