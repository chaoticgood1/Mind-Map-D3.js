import * as d3 from 'd3';
import * as Seeder from './Seeder';
import * as NodeManager from './renderer/NodeManager';
import { Data, HierarchyNode } from './Data';
import * as AddNode from './AddNode';
import { mount } from 'svelte';
import App from './App.svelte';
import { circleNode, selectedNode, updateNodes } from './registry';

// Constants moved to top-level so all functions can see them
const width = window.innerWidth;
const height = window.innerHeight;
const marginTop = 20;
const marginRight = 120;
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

  const flatData = Seeder.generateFlatData(5, 4);
  root = initRoot(flatData);
  svg = initSvg(container);
  
  gView = svg.append("g").attr("class", "view-container");
  gLink = initGLink(gView);
  gNode = initGNode(gView);
  initZoom(svg, gView);

  update(svg, root, gNode, gLink, root);
}

function initZoom(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  gView: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 3]) // Limit zoom in/out (0.5x to 3x)
    .on("zoom", (event) => {
      // Apply the transform (drag/zoom) to our master container
      gView.attr("transform", event.transform);
    });

  svg.call(zoom as any);
  
  // Optional: Start the tree centered
  svg.call(zoom.transform as any, d3.zoomIdentity.translate(marginLeft, marginTop));
}


function update(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  root: HierarchyNode, 
  gNode: d3.Selection<SVGGElement, unknown, null, undefined>,
  gLink: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode,
) {
  initTreeLayout(root);
  const transition = initTransition(svg, root);

  NodeManager.initNode(root, svg, gNode, gLink, source, transition);
  initLink(root, gLink, source, transition);
  cacheOldPosition(root);
}

function initTreeLayout(root: HierarchyNode) {
  const treeLayout = d3.tree<Data>().nodeSize([horizontalSpacing, verticalSpacing]);
  treeLayout(root);
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
    .attr("viewBox", [-marginLeft, left.x - marginTop, width, height]);
}

function initLink(
  root: HierarchyNode,
  gLink: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode,
  transition: d3.Transition<SVGSVGElement, unknown, null, undefined>
) {
  const links = root.links();
  const link = gLink.selectAll<SVGPathElement, d3.HierarchyLink<Data>>("path")
    .data(links, (d: any) => d.target.id);

  const diagonal = d3.linkHorizontal<any, any>().x(d => d.y).y(d => d.x);
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
}

function cacheOldPosition(root: HierarchyNode) {
  root.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}





function initRoot(flatData: Data[]) {
  const stratify = d3.stratify<Data>()
  .id(d => d.id.toString())
  .parentId(d => d.parentId?.toString() || null);

  const root = stratify(flatData) as unknown as HierarchyNode;

  root.x0 = 0;
  root.y0 = 0;

  root.descendants().forEach((d: any) => {
    d._children = d.children;
  });

  return root;
}

function initSvg(container: HTMLDivElement) {
  return d3.select(container).append("svg")
    .attr("width", width)
    .style("max-width", "100%")
    .style("height", height)
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

mount(App, {
  target: document.getElementById('app')!,
});

function init() {
  renderTree();
  AddNode.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}



circleNode.subscribe((value: any | null) => {
  if (value !== null) {
    update(svg, root, gNode, gLink, value);
  }
});