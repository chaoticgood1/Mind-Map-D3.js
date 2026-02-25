import * as d3 from 'd3';
import { HierarchyNode } from '../Data';
import { selectedNode } from '../registry';
import { get } from 'svelte/store';
import { DragNode } from '../modules/DragNode';

export function initNode(
  root: HierarchyNode,
  gNode: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode | undefined,
  transition: d3.Transition<any, any, any, any>
) {
  const nodes = root.descendants().reverse();
  // console.log(nodes);
  const node = gNode.selectAll<SVGGElement, HierarchyNode>("g")
    .data(nodes, (d: any) => d.id);

  const nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("data-node-id", d => d.id || '')
    .attr("transform", _d => `translate(${source?.y0 ?? source?.y ?? 0},${source?.x0 ?? source?.x ?? 0})`)
    .attr("fill-opacity", 0)
    
  // Initialize drag behavior
  const drag = DragNode.init();

  nodeEnter.append("circle")
    .attr("r", 8)
    // .attr("fill", d => d._children ? "#555" : "#999")
    .style("cursor", "grab")
    .call(drag)
    .on("click", (event, d) => {
      // Prevent click if this was part of a drag operation
      if (event.defaultPrevented) return;

      d.children = d.children ? undefined : d._children;
      selectedNode.set(d);
      const editEvent = new CustomEvent('start-edit');
      window.dispatchEvent(editEvent);
    })
  
  
  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", 10)
    // .attr("x", d => d._children ? -8 : 8)
    // .attr("text-anchor", d => d._children ? "end" : "start")
    .text((d: any) => d.data.label)
    .attr("fill", "white")
    .on("click", (_e, d) => {
      selectedNode.set(d);
      const editEvent = new CustomEvent('start-edit');
      window.dispatchEvent(editEvent);
    })

  const nodeUpdate = node
    .merge(nodeEnter)
    .transition(transition)
    .attr("transform", d => (d as any).manuallyPositioned ? d3.select(`[data-node-id="${d.id}"]`).attr('transform') || `translate(${d.y},${d.x})` : `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1)
    .style("font-weight", (d) => {
      const value = get(selectedNode);
      if (value === d)
        return "bold";
      return "normal";
    })

  nodeUpdate.select("text")
    .text((d: any) => d.data.label)
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
    .attr("transform", _d => `translate(${source?.y ?? 0},${source?.x ?? 0})`)
    .attr("fill-opacity", 0)
    .on("end", function() {
      // selectedNode.set(new Data());
    });
}

