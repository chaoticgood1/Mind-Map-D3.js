import * as d3 from 'd3';
import * as Seeder from './Seeder';
import * as Nodes from './renderer/Nodes';
import { Data, HierarchyNode } from './Data';
import { mount } from 'svelte';
import App from './App.svelte';
import { nodeData, selectedNode } from './registry';
import { get } from 'svelte/store';
import * as Links from './renderer/Links';
import { Cancel } from './modules/Cancel';

// Constants moved to top-level so all functions can see them
const width = window.innerWidth;
const height = window.innerHeight;
const marginTop = 20;
const marginBottom = 20;
const marginLeft = 80;
const verticalSpacing = 150;
const horizontalSpacing = 20;
const duration = 250;


let root: HierarchyNode;
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let gView: d3.Selection<SVGGElement, unknown, null, undefined>;
let gLink: d3.Selection<SVGGElement, unknown, null, undefined>;
let gNode: d3.Selection<SVGGElement, unknown, null, undefined>;

async function renderTree() {
  const container = document.querySelector<HTMLDivElement>('#mindmap-container');
  if (!container) return;
  container.innerHTML = '';

  svg = initSvg(container);
  gView = svg.append("g").attr("class", "view-container");
  gLink = initGLink(gView);
  gNode = initGNode(gView);
  initZoom(svg, gView);


  let flatData = get(nodeData);
  if (flatData.length === 0) {
    flatData = Seeder.generateFlatData(5, 4);
    // flatData = Seeder.generateFlatData(2, 1);
    // console.log(flatData);
    nodeData.set(flatData);
  }
  root = initRoot(flatData);
  update(svg, root, gNode, gLink, root);
}

function initZoom(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  gView: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 3]) // Limit zoom in/out (0.5x to 3x)
    .filter((event) => {
      // Prevent dblclick zoom on nodes
      if (event.type === 'dblclick') {
        return !event.target.closest('g.node-group');
      }
      return !event.ctrlKey && !event.button;
    })
    .on("zoom", (event) => {
      // Apply the transform (drag/zoom) to our master container
      gView.attr("transform", event.transform);
    });

  svg.call(zoom as any);
  
  // Optional: Start the tree centered
  svg.call(zoom.transform as any, d3.zoomIdentity.translate(marginLeft, marginTop));
}

// Temporary type for D3 stratify (includes both childrenIds and parentId)
type DataWithParentId = Data & { parentId: string | null };

function initRoot(flatData: Data[]) {
  // Convert childrenIds structure to parentId structure for D3 stratify
  const dataWithParentId: DataWithParentId[] = flatData.map(node => ({
    ...node,
    parentId: null as string | null
  }));

  // Build parent-child relationships
  const parentMap = new Map<string, string>(); // childId -> parentId

  flatData.forEach(node => {
    node.childrenIds.forEach(childId => {
      parentMap.set(childId, node.id);
    });
  });

  // Set parentId on each node
  dataWithParentId.forEach(node => {
    const parentId = parentMap.get(node.id);
    if (parentId) {
      node.parentId = parentId;
    }
  });

  const stratify = d3.stratify<DataWithParentId>()
    .id(d => d.id.toString())
    .parentId(d => d.parentId?.toString() || null);

  const root = stratify(dataWithParentId) as unknown as HierarchyNode;
  root.x0 = 0;
  root.y0 = 0;

  // Sort the hierarchy based on childrenIds order to ensure tree layout respects sibling positions
  root.sort((a, b) => {
    if (!a.parent || !b.parent) return 0;
    const parentData = (a.parent as any).data;
    if (!parentData.childrenIds) return 0;
    const aIndex = parentData.childrenIds.indexOf(a.data.id);
    const bIndex = parentData.childrenIds.indexOf(b.data.id);
    return aIndex - bIndex;
  });

  root.descendants().forEach((d: any) => {
    d._children = d.children;
  });

  return root;
}

function update(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  root: HierarchyNode, 
  gNode: d3.Selection<SVGGElement, unknown, null, undefined>,
  gLink: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode | undefined,
) {
  root = initTreeLayout(root);
  const transition = initTransition(svg, root);

  Nodes.initNode(root, gNode, source, transition);
  Links.init(root, gLink, source);
  cacheOldPosition(root);
}

export function refreshTree() {
  if (root && svg && gNode && gLink) {
    update(svg, root, gNode, gLink, root);
  }
}

function initTreeLayout(root: HierarchyNode) {
  const treeLayout = d3.tree<Data>().nodeSize([horizontalSpacing, verticalSpacing]);

  // Apply the tree layout to get coordinates
  const layoutRoot = treeLayout(root);

  // The tree layout has been applied, nodes now have x, y coordinates
  return layoutRoot;
}

function initTransition(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  root: HierarchyNode
) {
  let left = root;
  let right = root;
  root.eachBefore(node => {
    if (node.x < left.x) left = node as any;
    if (node.x > right.x) right = node as any;
  });

  const height = right.x - left.x + marginTop + marginBottom;

  return svg.transition()
    .duration(duration)
    .attr("height", height)
    .attr("viewBox", `${-marginLeft} ${left.x - marginTop} ${width} ${height}`);
}

function cacheOldPosition(root: HierarchyNode) {
  root.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}


function initSvg(container: HTMLDivElement) {
  return d3.select(container).append("svg")
    .attr("width", width)
    .style("max-width", "100%")
    .style("height", height)
    .style("font", "12px sans-serif")
    .style("user-select", "none");
}

function initGLink(svg: d3.Selection<SVGGElement, unknown, null, undefined>) {
  return svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1.5);
}

function initGNode(svg: d3.Selection<SVGGElement, unknown, null, undefined>) {
  return svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");
}

mount(App, {
  target: document.getElementById('app')!,
});

function init() {
  renderTree();
  Cancel.init();
  import('./modules/Save').then(module => module.init());
  import('./modules/Open').then(module => module.init());
  import('./modules/Copy').then(module => module.init());
  import('./modules/Paste').then(module => module.init());
  
  import('./modules/Cancel').then(module => module.Cancel.init());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}





let isDataUpdating = false;

selectedNode.subscribe((value: any | undefined) => {
  if (value && !isDataUpdating) {
    update(svg, root, gNode, gLink, value);
  }
});

window.addEventListener('update-tree', () => {
  const node = get(selectedNode);
  if (node) {
    update(svg, root, gNode, gLink, node);
  }
});

nodeData.subscribe(() => {
  if (root && svg && gNode && gLink) {
    const flatData = get(nodeData);
    root = initRoot(flatData);
    
    // Maintain the current selection if it still exists in the new root
    const currentSelection = get(selectedNode);
    let source = undefined; // Default source for transition
    
    if (currentSelection) {
      const found = root.descendants().find(d => d.data.id === currentSelection.data.id);
      if (found) {
        source = found;
        // Update the selectedNode store with the NEW hierarchy node object
        // so that (get(selectedNode) === d) in Nodes.ts works!
        selectedNode.set(found);
      }
    }
    
    update(svg, root, gNode, gLink, source);
  }
});


