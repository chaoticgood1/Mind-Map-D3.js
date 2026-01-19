import { nodeData } from '../registry';

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
    if (Array.isArray(data)) {
      nodeData.set(data);
    } else {
      console.error('Invalid file format: Expected an array of nodes.');
    }
  } catch (err) {
    console.error('Failed to parse JSON:', err);
  }
}
