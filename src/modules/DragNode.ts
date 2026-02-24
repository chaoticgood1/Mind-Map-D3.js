import * as d3 from 'd3';
import { Data, HierarchyNode } from '../Data';
import { nodeData } from '../registry';
import { get } from 'svelte/store';

export const DragNode = {
  init() {
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
        // console.log(`COLLIDING with ${collidedNode.data.label}`);
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
        
        // Call the collidesWith function and check if it was successful
        const collisionHandled = collidesWith(collidedNode, d);
        if (!collisionHandled) {
          // Collision was not handled (e.g., invalid operation), return to original position
          console.log(`Collision not handled - returning "${d.data.label}" to original position`);
          
          // Return to original position
          d.x = d.dragStartX || 0;
          d.y = d.dragStartY || 0;
          
          // Update the transform with animation
          const nodeGroup = d3.select(this.parentNode as SVGGElement);
          nodeGroup.transition()
            .duration(300)
            .attr("transform", `translate(${d.dragStartX || 0},${d.dragStartY || 0})`);
          
          // Clear the manually positioned flag since we're returning to original
          (d as any).manuallyPositioned = false;
        }
      } else {
        // No collision detected - return to original position
        console.log(`No collision detected - returning "${d.data.label}" to original position`);
        
        // Return to original position
        d.x = d.dragStartX || 0;
        d.y = d.dragStartY || 0;
        
        // Update the transform with animation
        const nodeGroup = d3.select(this.parentNode as SVGGElement);
        nodeGroup.transition()
          .duration(300)
          .attr("transform", `translate(${d.dragStartX || 0},${d.dragStartY || 0})`);
        
        // Clear the manually positioned flag since we're returning to original
        (d as any).manuallyPositioned = false;
      }
    });
  }
}



function checkCollision(draggedNode: HierarchyNode, draggedCircleElement: d3.Selection<SVGCircleElement, any, any, any>): HierarchyNode | null {
  let collidedNode: HierarchyNode | null = null;
  
  // console.log(`=== Checking collision for dragged node "${draggedNode.data.label}" at (${draggedNode.x}, ${draggedNode.y}) ===`);
  
  // Get the dragged circle radius once
  const draggedRadius = parseFloat(draggedCircleElement.attr('r')) || 8;
  // console.log(`Dragged circle radius: ${draggedRadius}`);
  
  let checkCount = 0;
  d3.selectAll('circle').each(function() {
    checkCount++;
    const circle = d3.select(this);
    const nodeData = circle.datum() as HierarchyNode;
    
    // Skip checking collision with the dragged node itself
    if (nodeData === draggedNode) {
      // console.log(`Skipping self: ${nodeData.data.label}`);
      return;
    }
    
    // Get actual visual positions from the DOM transforms
    const draggedCircleTransform = d3.select(draggedCircleElement.node()!.parentNode as SVGGElement).attr("transform");
    const draggedMatch = draggedCircleTransform.match(/translate\(([^,]+),([^)]+)\)/);
    const draggedX = draggedMatch ? parseFloat(draggedMatch[1]) : draggedNode.x;
    const draggedY = draggedMatch ? parseFloat(draggedMatch[2]) : draggedNode.y;
    
    const targetNode = circle.node() as SVGCircleElement;
    if (!targetNode || !targetNode.parentNode) return;
    const targetParentNode = targetNode.parentNode as SVGGElement;
    const targetCircleTransform = d3.select(targetParentNode).attr("transform");
    const targetMatch = targetCircleTransform.match(/translate\(([^,]+),([^)]+)\)/);
    const targetX = targetMatch ? parseFloat(targetMatch[1]) : nodeData.x;
    const targetY = targetMatch ? parseFloat(targetMatch[2]) : nodeData.y;
    
    // Get the actual radius of the target circle
    // const targetRadius = parseFloat(circle.attr('r')) || 10;
    const targetRadius = 10;
    
    // Calculate distance between centers
    const distance = Math.sqrt(Math.pow(draggedX - targetX, 2) + Math.pow(draggedY - targetY, 2));
    
    // console.log(`Check #${checkCount}: Against "${nodeData.data.label}" at (${targetX}, ${targetY}), distance: ${distance}, draggedRadius: ${draggedRadius}, targetRadius: ${targetRadius}`);
    
    // Check if circles are touching or overlapping based on actual radii
    const collisionThreshold = draggedRadius + targetRadius;
    
    // console.log(`Distance: ${distance} <= Threshold: ${collisionThreshold}? ${distance <= collisionThreshold}`);
    
    if (distance <= collisionThreshold) {
      collidedNode = nodeData;
      // console.log(`!!! COLLISION DETECTED with node: ${nodeData.data.label} at distance: ${distance}, threshold: ${collisionThreshold} !!!`);
    }
  });
  
  // console.log(`=== Final collision result: ${collidedNode ? collidedNode.data.label : 'None'} ===`);
  return collidedNode;
}



function collidesWith(targetNode: HierarchyNode, draggedNodeData: HierarchyNode): boolean {
  // console.log(`collidesWith() called: ${targetNode.data.label} collided with ${draggedNodeData.data.label}`);
  
  // Get actual visual positions from the DOM transforms for accurate comparison
  const targetCircleElement = d3.selectAll('circle').filter((d: any) => d === targetNode).node() as SVGCircleElement;
  const draggedCircleElement = d3.selectAll('circle').filter((d: any) => d === draggedNodeData).node() as SVGCircleElement;
  
  if (!targetCircleElement || !draggedCircleElement) {
    console.log('Could not find circle elements, using hierarchy positions');
    console.log(`targetNode.x: ${targetNode.x}, draggedNodeData.x: ${draggedNodeData.x}`);
  } else {
    // Get actual transform positions
    const targetParentNode = targetCircleElement.parentNode as SVGGElement;
    const targetCircleTransform = d3.select(targetParentNode).attr("transform");
    const targetMatch = targetCircleTransform.match(/translate\(([^,]+),([^)]+)\)/);
    const targetActualX = targetMatch ? parseFloat(targetMatch[1]) : targetNode.x;
    
    const draggedParentNode = draggedCircleElement.parentNode as SVGGElement;
    const draggedCircleTransform = d3.select(draggedParentNode).attr("transform");
    const draggedMatch = draggedCircleTransform.match(/translate\(([^,]+),([^)]+)\)/);
    const draggedActualX = draggedMatch ? parseFloat(draggedMatch[1]) : draggedNodeData.x;
    
    targetNode.x = targetActualX;
    draggedNodeData.x = draggedActualX;
  }
  
  const currentData = get(nodeData);
  
  // Check if targetNode and draggedNodeData are siblings
  if (areSiblings(currentData, targetNode, draggedNodeData)) {
    // For siblings: if targetNode x > draggedNodeData x, swap positions; else make draggedNodeData child of targetNode
    if (targetNode.x > draggedNodeData.x) {
      swapSiblingPositions(currentData, targetNode, draggedNodeData);
      return true;
    }
  }
  
  // Check if targetNode is already the current parent
  if (isAlreadyParent(currentData, targetNode, draggedNodeData)) {
    // console.log(`Target node ${targetNode.data.label} is already the parent of ${draggedNodeData.data.label}, skipping reparenting`);
    return false;
  }
  
  // Check if targetNode is a descendant of draggedNodeData
  if (isDescendant(currentData, currentData.find(node => node.id === draggedNodeData.data.id), targetNode.data.id)) {
    // console.log(`Target node ${targetNode.data.label} is a descendant of ${draggedNodeData.data.label}, skipping reparenting to prevent cycles`);
    return false;
  }
  
  // Remove from current parent and add to new parent
  removeFromCurrentParent(currentData, draggedNodeData);
  addToNewParent(currentData, targetNode, draggedNodeData);
  return true;
}

function areSiblings(currentData: Data[], node1: HierarchyNode, node2: HierarchyNode): boolean {
  // console.log(`areSiblings() called for ${node1.data.label} and ${node2.data.label}`);
  
  const parent1Index = currentData.findIndex(node => 
    node.childrenIds && node.childrenIds.includes(node1.data.id)
  );
  const parent2Index = currentData.findIndex(node => 
    node.childrenIds && node.childrenIds.includes(node2.data.id)
  );
  
  return parent1Index !== -1 && parent1Index === parent2Index;
}

function swapSiblingPositions(currentData: Data[], node1: HierarchyNode, node2: HierarchyNode): void {
  const parentIndex = currentData.findIndex(node => 
    node.childrenIds && node.childrenIds.includes(node1.data.id)
  );
  
  if (parentIndex === -1) return;
  
  const parent = currentData[parentIndex];
  const index1 = parent.childrenIds.indexOf(node1.data.id);
  const index2 = parent.childrenIds.indexOf(node2.data.id);
  
  if (index1 !== -1 && index2 !== -1) {
    // Swap the positions in the children array
    [parent.childrenIds[index1], parent.childrenIds[index2]] = [parent.childrenIds[index2], parent.childrenIds[index1]];
    nodeData.update(data => data);
  }
}

function isAlreadyParent(currentData: Data[], targetNode: HierarchyNode, draggedNodeData: HierarchyNode): boolean {
  const currentParentIndex = currentData.findIndex(node => 
    node.childrenIds && node.childrenIds.includes(draggedNodeData.data.id)
  );
  const targetNodeIndex = currentData.findIndex(node => node.id === targetNode.data.id);
  return currentParentIndex !== -1 && targetNodeIndex === currentParentIndex;
}

function isDescendant(currentData: Data[], parentNode: Data | undefined, targetId: string): boolean {
  if (!parentNode || !parentNode.childrenIds || parentNode.childrenIds.length === 0) return false;
  
  // Check direct children
  if (parentNode.childrenIds.includes(targetId)) return true;
  
  // Check recursively through children
  for (const childId of parentNode.childrenIds) {
    const childNode = currentData.find(node => node.id === childId);
    if (childNode && isDescendant(currentData, childNode, targetId)) return true;
  }
  
  return false;
}

function removeFromCurrentParent(currentData: Data[], draggedNodeData: HierarchyNode): void {
  const currentParentIndex = currentData.findIndex(node => 
    node.childrenIds && node.childrenIds.includes(draggedNodeData.data.id)
  );
  
  if (currentParentIndex !== -1) {
    currentData[currentParentIndex].childrenIds = currentData[currentParentIndex].childrenIds.filter(
      id => id !== draggedNodeData.data.id
    );
    // console.log(`Removed ${draggedNodeData.data.label} from parent ${currentData[currentParentIndex].label}`);
  }
}

function addToNewParent(currentData: Data[], targetNode: HierarchyNode, draggedNodeData: HierarchyNode): void {
  const targetNodeIndex = currentData.findIndex(node => node.id === targetNode.data.id);
  
  if (targetNodeIndex !== -1 && draggedNodeData.data.id) {
    currentData[targetNodeIndex].childrenIds = [...(currentData[targetNodeIndex].childrenIds || []), draggedNodeData.data.id];
    nodeData.update(data => data);
    // console.log(`Set ${draggedNodeData.data.label} as child of ${targetNode.data.label}`);
  }
}