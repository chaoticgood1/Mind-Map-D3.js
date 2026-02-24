import * as d3 from 'd3';
import { Data, HierarchyNode } from '../Data';
import { nodeData } from '../registry';
import { get } from 'svelte/store';

export const DragNode = {
  init() {
    return d3.drag<SVGCircleElement, HierarchyNode>()
    .subject(function(event, d) {
      const nodeGroup = d3.select(this.parentNode as SVGGElement);
      const transform = nodeGroup.attr("transform");
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      
      if (match) {
        return { 
          x: parseFloat(match[1]), 
          y: parseFloat(match[2]) 
        };
      }
      
      return { x: d.x, y: d.y };
    })
    .on("start", function(event, d) {
      d3.select(this).style("cursor", "grabbing");
      
      const nodeGroup = d3.select(this.parentNode as SVGGElement);
      const currentTransform = nodeGroup.attr("transform");
      const match = currentTransform.match(/translate\(([^,]+),([^)]+)\)/);
      
      if (match) {
        d.dragStartX = parseFloat(match[1]);
        d.dragStartY = parseFloat(match[2]);
      } else {
        d.dragStartX = d.x;
        d.dragStartY = d.y;
      }
    })
    .on("drag", function(event, d) {
      const svg = d3.select('svg');
      const mousePos = d3.pointer(event, svg.node() as SVGSVGElement);
      
      const gView = d3.select('g.view-container');
      const transform = gView.attr("transform");
      
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
      
      const adjustedX = (mousePos[0] - translateX) / scale;
      const adjustedY = (mousePos[1] - translateY) / scale;
      
      d.x = adjustedX;
      d.y = adjustedY;
      
      const nodeGroup = d3.select(this.parentNode as SVGGElement);
      nodeGroup.attr("transform", `translate(${adjustedX},${adjustedY})`);
      
      const collidedNode = checkCollision(d, d3.select(this));
      const currentCircle = d3.select(this);
      
      if (collidedNode) {
        currentCircle.style('fill', 'red');
      } else {
        currentCircle.style('fill', null);
      }
      
      (d as any).manuallyPositioned = true;
    })
    .on("end", function(event, d) {
      d3.select(this).style("cursor", "grab");
      
      const wasMoved = (d.dragStartX !== undefined && d.dragStartY !== undefined && 
                       (d.x !== d.dragStartX || d.y !== d.dragStartY));
      
      if (!wasMoved) {
        return;
      }
      
      const collidedNode = checkCollision(d, d3.select(this));
      if (collidedNode) {
        const collisionHandled = collidesWith(collidedNode, d);
        if (!collisionHandled) {
          d.x = d.dragStartX || 0;
          d.y = d.dragStartY || 0;
          
          const nodeGroup = d3.select(this.parentNode as SVGGElement);
          nodeGroup.transition()
            .duration(300)
            .attr("transform", `translate(${d.dragStartX || 0},${d.dragStartY || 0})`);
          
          (d as any).manuallyPositioned = false;
        }
      } else {
        d.x = d.dragStartX || 0;
        d.y = d.dragStartY || 0;
        
        const nodeGroup = d3.select(this.parentNode as SVGGElement);
        nodeGroup.transition()
          .duration(300)
          .attr("transform", `translate(${d.dragStartX || 0},${d.dragStartY || 0})`);
        
        (d as any).manuallyPositioned = false;
      }
    });
  }
}



function checkCollision(draggedNode: HierarchyNode, draggedCircleElement: d3.Selection<SVGCircleElement, any, any, any>): HierarchyNode | null {
  let collidedNode: HierarchyNode | null = null;
  
  const draggedRadius = parseFloat(draggedCircleElement.attr('r')) || 8;
  let checkCount = 0;
  d3.selectAll('circle').each(function() {
    checkCount++;
    const circle = d3.select(this);
    const nodeData = circle.datum() as HierarchyNode;
    
    if (nodeData === draggedNode) {
      return;
    }
    
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
    
    const targetRadius = 10;
    
    const distance = Math.sqrt(Math.pow(draggedX - targetX, 2) + Math.pow(draggedY - targetY, 2));
    
    const collisionThreshold = draggedRadius + targetRadius;
    
    if (distance <= collisionThreshold) {
      collidedNode = nodeData;
    }
  });
  
  return collidedNode;
}



function collidesWith(targetNode: HierarchyNode, draggedNodeData: HierarchyNode): boolean {
  
  const targetCircleElement = d3.selectAll('circle').filter((d: any) => d === targetNode).node() as SVGCircleElement;
  const draggedCircleElement = d3.selectAll('circle').filter((d: any) => d === draggedNodeData).node() as SVGCircleElement;
  
  if (!targetCircleElement || !draggedCircleElement) {
  } else {
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
  
  if (areSiblings(currentData, targetNode, draggedNodeData)) {
    if (targetNode.x > draggedNodeData.x) {
      swapSiblingPositions(currentData, targetNode, draggedNodeData);
      return true;
    } else {
      addToNewParent(currentData, targetNode, draggedNodeData);
      return true;
    }
  }
  
  if (isAlreadyParent(currentData, targetNode, draggedNodeData)) {
    return false;
  }
  
  if (isDescendant(currentData, currentData.find(node => node.id === draggedNodeData.data.id), targetNode.data.id)) {
    return false;
  }
  
  removeFromCurrentParent(currentData, draggedNodeData);
  addToNewParent(currentData, targetNode, draggedNodeData);
  return true;
}

function areSiblings(currentData: Data[], node1: HierarchyNode, node2: HierarchyNode): boolean {
  
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
  
  if (parentIndex !== -1) {
    const parent = currentData[parentIndex];
    const index1 = parent.childrenIds.indexOf(node1.data.id);
    const index2 = parent.childrenIds.indexOf(node2.data.id);
    
    if (index1 !== -1 && index2 !== -1) {
      [parent.childrenIds[index1], parent.childrenIds[index2]] = [parent.childrenIds[index2], parent.childrenIds[index1]];
      nodeData.update(data => data);
    }
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
  
  if (parentNode.childrenIds.includes(targetId)) return true;
  
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
  }
}

function addToNewParent(currentData: Data[], targetNode: HierarchyNode, draggedNodeData: HierarchyNode): void {
  const targetNodeIndex = currentData.findIndex(node => node.id === targetNode.data.id);
  
  if (targetNodeIndex !== -1 && draggedNodeData.data.id) {
    currentData[targetNodeIndex].childrenIds = [...(currentData[targetNodeIndex].childrenIds || []), draggedNodeData.data.id];
    nodeData.update(data => data);
  }
}