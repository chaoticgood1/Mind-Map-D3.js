import * as d3 from 'd3';
import { HierarchyNode } from '../Data';

let isDragging = false;
let draggedNode: HierarchyNode | null = null;
let draggedElement: SVGGElement | null = null;

export function init() {
  // Use manual mouse event handling instead of D3 drag
  setupManualDrag();
}

function setupManualDrag() {
  // Remove any existing drag behaviors
  d3.selectAll('circle').on('.drag', null);

  // Set up manual drag on all circles
  d3.selectAll('circle').each(function() {
    (this as SVGCircleElement).addEventListener('mousedown', handleMouseDown as EventListener);
  });

  // Set up mutation observer for new circles
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as Element;
            if (element.tagName === 'circle') {
              (element as SVGCircleElement).addEventListener('mousedown', handleMouseDown as EventListener);
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function handleMouseDown(event: Event) {
  if (isDragging) return;

  const mouseEvent = event as MouseEvent;
  mouseEvent.preventDefault();
  mouseEvent.stopPropagation();

  const circle = mouseEvent.target as SVGCircleElement;
  const nodeGroup = circle.parentNode as SVGGElement;
  const nodeData = d3.select(circle).datum() as HierarchyNode;

  // Start dragging
  isDragging = true;
  draggedNode = nodeData;
  draggedElement = nodeGroup;

  // Save the initial position to the node
  draggedNode.dragStartX = draggedNode.x;
  draggedNode.dragStartY = draggedNode.y;

  // Bring to front
  d3.select(nodeGroup).raise();

  // Change cursor
  document.body.style.cursor = 'grabbing';

  // Add global mouse event listeners
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  console.log("Drag started at:", draggedNode.x, draggedNode.y);
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging || !draggedElement || !draggedNode) return;

  const gView = d3.select('g.view-container').node() as SVGGElement;
  const mousePos = d3.pointer(event, gView);

  d3.select(draggedElement)
    .attr('transform', `translate(${mousePos[0]},${mousePos[1]})`);

  // console.log("Manual drag move, delta:", deltaX, deltaY);
  console.log(`mouse position: ${mousePos}`);
  const elementPosition = d3.select(draggedElement).attr('transform');
  console.log(`elementPosition: ${elementPosition}`);
}

function handleMouseUp(event: MouseEvent) {
  if (!isDragging || !draggedElement || !draggedNode) return;

  if (draggedNode.dragStartX && draggedNode.dragStartY) {
    d3.select(draggedElement)
      .attr('transform', `translate(${draggedNode.dragStartY},${draggedNode.dragStartX})`);
  }

  console.log("Manual drag ended at:", draggedNode.dragStartX, draggedNode.dragStartY);

  draggedNode.dragStartX = undefined;
  draggedNode.dragStartY = undefined;

  isDragging = false;
  draggedNode = null;
  draggedElement = null;

  document.body.style.cursor = '';
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}