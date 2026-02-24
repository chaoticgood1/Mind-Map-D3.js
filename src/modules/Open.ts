import { nodeData } from '../registry';
import { Data } from '../Data';

export function init() {
  window.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'o') {
      ev.preventDefault();
      openFile();
    }
  });
}

async function openFile() {
  try {
    if ('showOpenFilePicker' in window) {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        }],
        multiple: false
      });
      const file = await handle.getFile();
      const content = await file.text();
      updateNodeData(content);
    } else {
      // Fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const content = await file.text();
          updateNodeData(content);
        }
      };
      input.click();
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to open file:', err);
    }
  }
}

function updateNodeData(content: string) {
  try {
    const data = JSON.parse(content);
    
    // Convert loaded data to match the expected Data structure
    const convertedData = convertToDataFormat(data);
    
    if (convertedData.length > 0) {
      nodeData.set(convertedData);
    } else {
      console.error('No valid nodes found in file');
    }
  } catch (err) {
    console.error('Failed to parse JSON:', err);
  }
}

function convertToDataFormat(data: any): Data[] {
  // If it's already in the correct format, return as-is
  if (Array.isArray(data) && data.every(node => 
    node.id && 
    typeof node.id === 'string' &&
    Array.isArray(node.childrenIds)
  )) {
    return data;
  }

  // Handle hierarchical tree structure (nested children)
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return convertHierarchicalToFlat([data]);
  }

  // Handle array of hierarchical nodes
  if (Array.isArray(data) && data.length > 0 && data[0].children) {
    return convertHierarchicalToFlat(data);
  }

  console.error('Unsupported data format');
  return [];
}

function convertHierarchicalToFlat(nodes: any[]): Data[] {
  const flatList: Data[] = [];
  let idCounter = 1;

  function processNode(node: any): string {
    const nodeId = node.id || idCounter.toString();
    idCounter++;

    const dataNode: Data = {
      id: nodeId,
      label: node.label || node.name || node.title || `Node ${nodeId}`,
      body: node.body || node.description || '',
      childrenIds: []
    };

    flatList.push(dataNode);

    // Process children
    if (node.children && Array.isArray(node.children)) {
      const childIds = node.children.map((child: any) => processNode(child));
      dataNode.childrenIds = childIds;
    }

    return nodeId;
  }

  // Process all top-level nodes
  nodes.forEach(node => processNode(node));

  return flatList;
}
