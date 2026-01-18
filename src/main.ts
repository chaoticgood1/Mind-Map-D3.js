import * as d3 from 'd3';
import { generateFlatData } from './Seeder'; // Assuming you saved your seeder here
import { Data, HierarchyNode } from './Data';



/**
 * 2. MAIN RENDER FUNCTION
 */
async function renderTree() {
  const container = document.querySelector<HTMLDivElement>('#app');
  if (!container) return;
  container.innerHTML = '';

  // Generate the flat data using your seeder
  const flatData = generateFlatData(4, 4);

  // CONVERT FLAT DATA TO HIERARCHY
  // D3 needs to know which property is the ID and which is the Parent ID
  const stratify = d3.stratify<Data>()
    .id(d => d.id.toString())
    .parentId(d => d.parentId?.toString() || null);

  const root = stratify(flatData) as unknown as HierarchyNode;

  // Setup dimensions
  const width = 928;
  const marginTop = 20;
  const marginRight = 120;
  const marginBottom = 20;
  const marginLeft = 80;

  const dx = 15;
  const dy = width / 5;
  const tree = d3.tree<Data>().nodeSize([dx, dy]);
  const diagonal = d3.linkHorizontal<any, any>().x(d => d.y).y(d => d.x);

  const svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("viewBox", [-marginLeft, -marginTop, width, dx])
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font", "12px sans-serif")
    .style("user-select", "none");

  const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1.5);

  const gNode = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  function update(event: any, source: HierarchyNode) {
    const duration = 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const height = right.x - left.x + marginTop + marginBottom;

    const transition = svg.transition()
      .duration(duration)
      .attr("height", height)
      .attr("viewBox", [-marginLeft, left.x - marginTop, width, height]);

    // Nodes Update
    const node = gNode.selectAll<SVGGElement, HierarchyNode>("g")
      .data(nodes, (d: any) => d.id);

    const nodeEnter = node.enter().append("g")
      .attr("transform", _d => `translate(${source.y0 ?? source.y},${source.x0 ?? source.x})`)
      .attr("fill-opacity", 0)
      .on("click", (e, d) => {
        d.children = d.children ? undefined : d._children;
        update(e, d);
      });

    nodeEnter.append("circle")
      .attr("r", 4)
      .attr("fill", d => d._children ? "#555" : "#999");

    nodeEnter.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d._children ? -8 : 8)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .text((d: any) => d.data.label) // Use 'label' from your seeder
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke");

    node.merge(nodeEnter).transition(transition)
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("fill-opacity", 1);

    node.exit().transition(transition).remove()
      .attr("transform", _d => `translate(${source.y},${source.x})`)
      .attr("fill-opacity", 0);

    // Links Update
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

    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Initialize
  root.x0 = dx / 2;
  root.y0 = 0;
  
  // Collapse logic for seeder data
  root.descendants().forEach((d: any) => {
    d._children = d.children;
    // if (d.depth > 0) d.children = undefined; 
  });

  update(null, root);
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderTree);
} else {
  renderTree();
}