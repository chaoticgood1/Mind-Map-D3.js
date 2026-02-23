import * as d3 from 'd3';
import { Data, HierarchyNode } from '../Data';
import { selectedNode } from '../registry';
import { get } from 'svelte/store';

export function initNode(
  root: HierarchyNode,
  gNode: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode,
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
    .attr("transform", _d => `translate(${source.y0 ?? source.y},${source.x0 ?? source.x})`)
    .attr("fill-opacity", 0)
    
  // Initialize drag behavior
  const drag = dragInit();

  nodeEnter.append("circle")
    .attr("r", 8)
    // .attr("fill", d => d._children ? "#555" : "#999")
    .style("cursor", "grab")
    .call(drag)
    .on("click", (event, d) => {
      // Prevent click if this was part of a drag operation
      if (event.defaultPrevented) return;

      console.log("click circle")

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
    .attr("transform", d => d.manuallyPositioned ? d3.select(`[data-node-id="${d.id}"]`).attr('transform') || `translate(${d.y},${d.x})` : `translate(${d.y},${d.x})`)
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
    .attr("transform", _d => `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0)
    .on("end", function() {
      selectedNode.set(new Data());
    });
}

function checkCollision(draggedNode: HierarchyNode, draggedCircleElement: d3.Selection<SVGCircleElement, any, any, any>): HierarchyNode | null {
  let collidedNode: HierarchyNode | null = null;
  
  console.log(`=== Checking collision for dragged node "${draggedNode.data.label}" at (${draggedNode.x}, ${draggedNode.y}) ===`);
  
  // Get the dragged circle radius once
  const draggedRadius = parseFloat(draggedCircleElement.attr('r')) || 8;
  console.log(`Dragged circle radius: ${draggedRadius}`);
  
  let checkCount = 0;
  d3.selectAll('circle').each(function() {
    checkCount++;
    const circle = d3.select(this);
    const nodeData = circle.datum() as HierarchyNode;
    
    // Skip checking collision with the dragged node itself
    if (nodeData === draggedNode) {
      console.log(`Skipping self: ${nodeData.data.label}`);
      return;
    }
    
    const draggedX = draggedNode.x;
    const draggedY = draggedNode.y;
    const targetX = nodeData.x;
    const targetY = nodeData.y;
    
    // Get the actual radius of the target circle
    const targetRadius = parseFloat(circle.attr('r')) || 8;
    
    // Calculate distance between centers
    const distance = Math.sqrt(Math.pow(draggedX - targetX, 2) + Math.pow(draggedY - targetY, 2));
    
    console.log(`Check #${checkCount}: Against "${nodeData.data.label}" at (${targetX}, ${targetY}), distance: ${distance}, draggedRadius: ${draggedRadius}, targetRadius: ${targetRadius}`);
    
    // Check if circles are touching or overlapping based on actual radii
    const collisionThreshold = draggedRadius + targetRadius;
    
    console.log(`Distance: ${distance} <= Threshold: ${collisionThreshold}? ${distance <= collisionThreshold}`);
    
    if (distance <= collisionThreshold) {
      collidedNode = nodeData;
      console.log(`!!! COLLISION DETECTED with node: ${nodeData.data.label} at distance: ${distance}, threshold: ${collisionThreshold} !!!`);
    }
  });
  
  console.log(`=== Final collision result: ${collidedNode ? collidedNode.data.label : 'None'} ===`);
  return collidedNode;
}

function dragInit(): d3.DragBehavior<SVGCircleElement, HierarchyNode, d3.SubjectPosition, any> {
  return d3.drag<SVGCircleElement, HierarchyNode>()
    .subject(function(event, d) {
      // Get the current transform of the node group
      const nodeGroup = d3.select(this.parentNode as SVGGElement);
      const transform = nodeGroup.attr("transform");
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      
      if (match) {
        return { 
          x: parseFloat(match[1]), 
          y: parseFloat(match[2]) 
        };
      }
      
      // Fallback to node data position
      return { x: d.x, y: d.y };
    })
    .on("start", function(event, d) {
      // console.log("Drag started for node:", d.data.label);
      d3.select(this).style("cursor", "grabbing");
      
      // Store original position from the current transform
      const nodeGroup = d3.select(this.parentNode as SVGGElement);
      const currentTransform = nodeGroup.attr("transform");
      const match = currentTransform.match(/translate\(([^,]+),([^)]+)\)/);
      
      if (match) {
        d.dragStartX = parseFloat(match[1]);
        d.dragStartY = parseFloat(match[2]);
        // console.log(`Stored original position: (${d.dragStartX}, ${d.dragStartY})`);
      } else {
        // Fallback to node data position
        d.dragStartX = d.x;
        d.dragStartY = d.y;
        // console.log(`Using node data position: (${d.dragStartX}, ${d.dragStartY})`);
      }
    })
    .on("drag", function(event, d) {
      // Get the SVG element to compute mouse position relative to it
      const svg = d3.select('svg');
      const mousePos = d3.pointer(event, svg.node() as SVGSVGElement);
      
      // Get the current zoom transform from the view container
      const gView = d3.select('g.view-container');
      const transform = gView.attr("transform");
      
      // Parse the transform to get scale and translate values
      let scale = 1, translateX = 0, translateY = 0;
      if (transform) {
        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
        const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        
        if (scaleMatch) scale = parseFloat(scaleMatch[1]);
        if (translateMatch) {
          translateX = parseFloat(translateMatch[1]);
          translateY = parseFloat(translateMatch[2]);
        }
      }
      
      // Apply inverse transform to get position in the untransformed coordinate system
      const adjustedX = (mousePos[0] - translateX) / scale;
      const adjustedY = (mousePos[1] - translateY) / scale;
      
      // console.log("Dragging node:", d.data.label, "to:", adjustedX, adjustedY);
      
      // Update node position with adjusted coordinates
      d.x = adjustedX;
      d.y = adjustedY;
      
      // Update the transform of the node group
      const nodeGroup = d3.select(this.parentNode as SVGGElement);
      nodeGroup.attr("transform", `translate(${adjustedX},${adjustedY})`);
      
      // Check for collision during dragging
      const collidedNode = checkCollision(d, d3.select(this));
      const currentCircle = d3.select(this);
      
      if (collidedNode) {
        // Change color to red when colliding
        currentCircle.style('fill', 'red');
        console.log(`COLLIDING with ${collidedNode.data.label}`);
      } else {
        // Reset to default color when not colliding
        currentCircle.style('fill', null);
      }
      
      // Mark as manually positioned
      (d as any).manuallyPositioned = true;
    })
    .on("end", function(event, d) {
      // console.log("Drag ended for node:", d.data.label, "at:", d.x, d.y);
      d3.select(this).style("cursor", "grab");
      
      // Check if node was actually moved before doing collision detection
      const wasMoved = (d.dragStartX !== undefined && d.dragStartY !== undefined && 
                       (d.x !== d.dragStartX || d.y !== d.dragStartY));
      
      if (!wasMoved) {
        console.log(`Node "${d.data.label}" was not moved - no action needed`);
        return;
      }
      
      // Only check collision if node was actually moved
      const collidedNode = checkCollision(d, d3.select(this));
      if (collidedNode) {
        // console.log(`Node "${d.data.label}" collided with "${collidedNode.data.label}"`);
        
        // Call the collidesWith function
        collidesWith(collidedNode, d);
      } else {
        // No collision detected - return to original position
        console.log(`No collision detected - returning "${d.data.label}" to original position`);
        
        // Return to original position
        d.x = d.dragStartX;
        d.y = d.dragStartY;
        
        // Update the transform with animation
        const nodeGroup = d3.select(this.parentNode as SVGGElement);
        nodeGroup.transition()
          .duration(300)
          .attr("transform", `translate(${d.dragStartX},${d.dragStartY})`);
        
        // Clear the manually positioned flag since we're returning to original
        (d as any).manuallyPositioned = false;
      }
    });
}

export function collidesWith(targetNode: HierarchyNode, draggedNodeData: HierarchyNode): void {
  console.log(`collidesWith() called: ${targetNode.data.label} collided with ${draggedNodeData.data.label}`);
  
  // const targetCircle = d3.selectAll('circle').filter((nodeData: any) => nodeData === targetNode);
  // const draggedCircle = d3.selectAll('circle').filter((nodeData: any) => nodeData === draggedNodeData);
  
  // targetCircle
  //   .transition()
  //   .duration(200)
  //   .attr('r', 12)
  //   .transition()
  //   .duration(200)
  //   .attr('r', 8);
    
  // draggedCircle
  //   .transition()
  //   .duration(200)
  //   .attr('r', 12)
  //   .transition()
  //   .duration(200)
  //   .attr('r', 8);

  
}