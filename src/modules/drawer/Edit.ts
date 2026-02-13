import { nodeStore } from './NodeStore';

// Re-export node store actions for external use
export const {
  selectNode,
  updateNode,
  addNode,
  deleteNode,
  reset
} = nodeStore;

// Additional edit-specific utilities can be added here
export function isNodeEditable(node: any): boolean {
  return node && node.data && typeof node.data.label === 'string';
}

export function validateNodeInput(title: string, body: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push('Title is required');
  }
  
  if (title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (body.length > 1000) {
    errors.push('Body must be less than 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

