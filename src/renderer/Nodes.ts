import * as d3 from 'd3';
import { Data, HierarchyNode } from '../Data';
import { selectedNode } from '../registry';
import { get } from 'svelte/store';


export function initNode(
  root: HierarchyNode,
  gNode: d3.Selection<SVGGElement, unknown, null, undefined>,
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
    // .attr("fill", d => d._children ? "#555" : "#999")
    .on("click", (_e, d) => {
      d.children = d.children ? undefined : d._children;
      selectedNode.set(d);
    });
  
  
  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", 10)
    // .attr("x", d => d._children ? -8 : 8)
    // .attr("text-anchor", d => d._children ? "end" : "start")
    .text((d: any) => d.data.label)
    .attr("fill", "white")
    .on("click", (_e, d) => {
      selectedNode.set(d);
    });

  const nodeUpdate = node
    .merge(nodeEnter)
    .transition(transition)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1)
    .style("font-weight", (d) => {
      const value = get(selectedNode);
      if (value === d)
        return "bold";
      return "normal";
    })

  nodeUpdate.select("text")
    .attr("fill", (d) => {
      const value = get(selectedNode);
      if (value === d)
        return "#00FF00";
      return "#FFFFFF";
    });

  nodeUpdate.select("circle")
    .attr("fill", (d) => {
      const value = get(selectedNode);
      if (value === d)
        return "#00FF00";
      return "#FFFFFF";
    });

  node
    .exit()
    .transition(transition)
    .remove()
    .attr("transform", _d => `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0);
}