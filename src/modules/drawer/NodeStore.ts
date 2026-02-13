import { writable, derived } from 'svelte/store';
import { HierarchyNode } from '../../Data';

interface NodeState {
  selected: HierarchyNode | null;
  editingTitle: string;
  editingBody: string;
  isDirty: boolean;
}

function createNodeStore() {
  const { subscribe, set, update } = writable<NodeState>({
    selected: null,
    editingTitle: '',
    editingBody: '',
    isDirty: false
  });

  return {
    subscribe,
    
    // Actions
    selectNode: (node: HierarchyNode | null) => update(state => ({
      ...state,
      selected: node,
      editingTitle: node?.data.label || '',
      editingBody: node?.data.body || '',
      isDirty: false
    })),
    
    updateNode: (title: string, body: string) => update(state => {
      if (state.selected) {
        state.selected.data.label = title;
        state.selected.data.body = body;
        window.dispatchEvent(new CustomEvent('update-tree'));
      }
      return { 
        ...state, 
        editingTitle: title, 
        editingBody: body,
        isDirty: state.selected ? 
          (state.selected.data.label !== title || state.selected.data.body !== body) : false
      };
    }),
    
    addNode: (parentNode: HierarchyNode) => {
      // TODO: Implement add node logic
      console.log('Adding node to parent:', parentNode);
    },
    
    deleteNode: () => update(state => {
      if (state.selected) {
        // TODO: Implement delete node logic
        console.log('Deleting node:', state.selected);
        return { ...state, selected: null, editingTitle: '', editingBody: '', isDirty: false };
      }
      return state;
    }),
    
    reset: () => set({
      selected: null,
      editingTitle: '',
      editingBody: '',
      isDirty: false
    })
  };
}

export const nodeStore = createNodeStore();

// Derived stores for convenience
export const selectedNode = derived(nodeStore, $nodeStore => $nodeStore.selected);
export const editingTitle = derived(nodeStore, $nodeStore => $nodeStore.editingTitle);
export const editingBody = derived(nodeStore, $nodeStore => $nodeStore.editingBody);
export const isDirty = derived(nodeStore, $nodeStore => $nodeStore.isDirty);
