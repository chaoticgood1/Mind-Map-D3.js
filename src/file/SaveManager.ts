import { get } from 'svelte/store';
import { nodeData } from '../registry';

export function init() {
  window.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') {
      ev.preventDefault();
      saveToFile();
    }
  });
}

async function saveToFile() {
  const data = get(nodeData);
  const json = JSON.stringify(data, null, 2);

  try {
    // Try using File System Access API
    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'mindmap.json',
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    } else {
      // Fallback for browsers without File System Access API
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mindmap.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    // User might have cancelled the picker
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to save file:', err);
    }
  }
}
