import * as d3 from 'd3';

export interface Data {
  id: string;
  label: string;
  body: string;
  childrenIds: string[];
}

// This interface represents the node after D3 processes it
export interface HierarchyNode extends d3.HierarchyPointNode<Data> {
  x0?: number;
  y0?: number;
  _children?: this[]; // For collapsing
  dragStartX?: number; // For drag operations
  dragStartY?: number; // For drag operations
}