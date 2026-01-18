import * as d3 from 'd3';
import { generateFlatData } from './Seeder';
import { Data, HierarchyNode } from './Data';

// Constants moved to top-level so all functions can see them
const width = 928;
const marginTop = 20;
const marginRight = 120;
const marginBottom = 20;
const marginLeft = 80;
const dx = 15;
const dy = width / 5;

// Shared D3 generators
const treeLayout = d3.tree<Data>().nodeSize([dx, dy]);
const diagonal = d3.linkHorizontal<any, any>().x(d => d.y).y(d => d.x);

async function renderTree() {
  const container = document.querySelector<HTMLDivElement>('#app');
  if (!container) return;
  container.innerHTML = '';

  const flatData = generateFlatData(4, 4);

  const stratify = d3.stratify<Data>()
    .id(d => d.id.toString())
    .parentId(d => d.parentId?.toString() || null);

  const root = stratify(flatData) as unknown as HierarchyNode;

  const svg = initSvg(container);
  const gLink = initGLink(svg);
  const gNode = initGNode(svg);

  // Initialize positions
  root.x0 = dx / 2;
  root.y0 = 0;
  
  root.descendants().forEach((d: any) => {
    d._children = d.children;
    // Everything stays unfolded because the line below is commented out
    // if (d.depth > 0) d.children = undefined; 
  });

  // Pass all required refs to update, and use 'root' as the initial source
  update(svg, root, gNode, gLink, root);
}

function update(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  root: HierarchyNode, 
  gNode: d3.Selection<SVGGElement, unknown, null, undefined>,
  gLink: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode, // Removed event from arguments to simplify recursive calls
) {
  const duration = 250;
  const nodes = root.descendants().reverse();
  const links = root.links();

  // Run the tree layout
  treeLayout(root);

  let left = root;
  let right = root;
  root.eachBefore(node => {
    if (node.x < left.x) left = node as any;
    if (node.x > right.x) right = node as any;
  });

  const height = right.x - left.x + marginTop + marginBottom;

  const transition = svg.transition()
    .duration(duration)
    .attr("height", height)
    .attr("viewBox", [-marginLeft, left.x - marginTop, width, height]);

  // --- Nodes Section ---
  const node = gNode.selectAll<SVGGElement, HierarchyNode>("g")
    .data(nodes, (d: any) => d.id);

  const nodeEnter = node.enter().append("g")
    .attr("transform", _d => `translate(${source.y0 ?? source.y},${source.x0 ?? source.x})`)
    .attr("fill-opacity", 0)
    .on("click", (_e, d) => {
      d.children = d.children ? undefined : d._children;
      // FIX: Pass all required references back into the update function
      update(svg, root, gNode, gLink, d);
    });

  nodeEnter.append("circle")
    .attr("r", 4)
    .attr("fill", d => d._children ? "#555" : "#999");

  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d._children ? -8 : 8)
    .attr("text-anchor", d => d._children ? "end" : "start")
    .text((d: any) => d.data.label)
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .attr("paint-order", "stroke");

  node.merge(nodeEnter).transition(transition)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1);

  node.exit().transition(transition).remove()
    .attr("transform", _d => `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0);

  // --- Links Section ---
  const link = gLink.selectAll<SVGPathElement, d3.HierarchyLink<Data>>("path")
    .data(links, (d: any) => d.target.id);

  const linkEnter = link.enter().append("path")
    .attr("d", _d => {
      const o = { x: source.x0 ?? source.x, y: source.y0 ?? source.y };
      return diagonal({ source: o, target: o });
    });

  link.merge(linkEnter).transition(transition).attr("d", diagonal as any);

  link.exit().transition(transition).remove()
    .attr("d", _d => {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    });

  // Stash the old positions for transitions.
  root.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Helpers
function initSvg(container: HTMLDivElement) {
  return d3.select(container).append("svg")
    .attr("width", width)
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font", "12px sans-serif")
    .style("user-select", "none");
}

function initGLink(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
  return svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1.5);
}

function initGNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
  return svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderTree);
} else {
  renderTree();
}