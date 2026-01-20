import * as d3 from 'd3';
import { HierarchyNode } from '../Data';

export function init() {
  // Create drag behavior for node circles
  const drag = d3.drag<SVGCircleElement, HierarchyNode>()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded);

  // Apply drag behavior to all existing circles
  d3.selectAll('circle').call(drag);

  // Set up a mutation observer to apply drag to newly created circles
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as Element;
            if (element.tagName === 'circle') {
              d3.select(element as SVGCircleElement).call(drag);
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

function dragStarted(event: d3.D3DragEvent<SVGCircleElement, HierarchyNode, HierarchyNode>, d: HierarchyNode) {
  // Prevent the click event from firing
  event.sourceEvent.stopPropagation();

  // Bring the node group to the front
  const nodeGroup = d3.select(event.sourceEvent.target.parentNode as SVGGElement);
  nodeGroup.raise();

  // Change cursor during drag
  d3.select(document.body).style('cursor', 'grabbing');
}

function dragged(event: d3.D3DragEvent<SVGCircleElement, HierarchyNode, HierarchyNode>, d: HierarchyNode) {
  // Get the current zoom transform
  const gView = d3.select('g.view-container');
  const transform = d3.zoomTransform(gView.node() as SVGGElement);

  // Convert mouse position to SVG coordinates
  const mousePos = d3.pointer(event.sourceEvent, gView.node() as SVGGElement);

  // Update the node group position to follow the mouse
  const nodeGroup = d3.select(event.sourceEvent.target.parentNode as SVGGElement);
  nodeGroup.attr('transform', `translate(${mousePos[0]},${mousePos[1]})`);
}

function dragEnded(event: d3.D3DragEvent<SVGCircleElement, HierarchyNode, HierarchyNode>, d: HierarchyNode) {
  // Reset cursor
  d3.select(document.body).style('cursor', null);

  // Reset the node group to its original position
  const nodeGroup = d3.select(event.sourceEvent.target.parentNode as SVGGElement);
  nodeGroup.attr('transform', `translate(${d.y},${d.x})`);
}