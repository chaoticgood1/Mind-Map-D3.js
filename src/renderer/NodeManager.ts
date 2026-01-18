import * as d3 from 'd3';
import { Data, HierarchyNode } from '../Data';
import { circleNode, selectedNode, updateNodes } from '../registry';


export function initNode(
  root: HierarchyNode,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  gNode: d3.Selection<SVGGElement, unknown, null, undefined>,
  gLink: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode,
  transition: d3.Transition<SVGSVGElement, unknown, null, undefined>
) {
  const nodes = root.descendants().reverse();
  const node = gNode.selectAll<SVGGElement, HierarchyNode>("g")
    .data(nodes, (d: any) => d.id);

  const nodeEnter = node
    .enter()
    .append("g")
    .attr("transform", _d => `translate(${source.y0 ?? source.y},${source.x0 ?? source.x})`)
    .attr("fill-opacity", 0)
    

  nodeEnter.append("circle")
    .attr("r", 8)
    .attr("fill", d => d._children ? "#555" : "#999")
    .on("click", (_e, d) => {
      d.children = d.children ? undefined : d._children;
      // FIX: Pass all required references back into the update function
      // update(svg, root, gNode, gLink, d);
      circleNode.set(d);
    });

  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", 10)
    // .attr("x", d => d._children ? -8 : 8)
    // .attr("text-anchor", d => d._children ? "end" : "start")
    .text((d: any) => d.data.label)
    .style("fill", "white")
    .on("click", (_e, d) => {
      selectedNode.set(d);
    });

  node.merge(nodeEnter).transition(transition)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1);

  node.exit().transition(transition).remove()
    .attr("transform", _d => `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0);
}