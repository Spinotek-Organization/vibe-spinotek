import { reactive, watch, onMounted } from 'vue';

const STORAGE_KEY = 'spinotek_flow_data';

export function useFlowStore() {
  const state = reactive({
    blocks: [],
    connections: [],
    isDarkMode: true,
    zoom: 1,
    selectedBlockId: null,
  });

  // Load from LocalStorage
  const load = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        state.blocks = data.blocks || [];
        state.connections = data.connections || [];
        state.isDarkMode = data.isDarkMode !== undefined ? data.isDarkMode : true;
      } catch (e) {
        console.error("Failed to load flow data", e);
      }
    }
  };

  // Save to LocalStorage
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      blocks: state.blocks,
      connections: state.connections,
      isDarkMode: state.isDarkMode
    }));
  };

  // Watch for any changes and save
  watch(() => [state.blocks, state.connections, state.isDarkMode], save, { deep: true });

  const addBlock = (type, x, y) => {
    const id = `node_${Date.now()}`;
    state.blocks.push({
      id,
      type,
      x: x || 100,
      y: y || 100,
      width: 280,
      height: 200,
      title: type.charAt(0).toUpperCase() + type.slice(1) + ' View',
      desc: 'Edit this description to explain logic.',
    });
    state.selectedBlockId = id;
  };

  const removeBlock = (id) => {
    state.blocks = state.blocks.filter(b => b.id !== id);
    state.connections = state.connections.filter(c => c.from !== id && c.to !== id);
    if (state.selectedBlockId === id) state.selectedBlockId = null;
  };

  const addConnection = (from, to) => {
    // Avoid duplicates and self-connections
    if (from === to) return;
    const exists = state.connections.find(c => c.from === from && c.to === to);
    if (!exists) {
      state.connections.push({
        id: `link_${Date.now()}`,
        from,
        to,
        label: 'Action'
      });
    }
  };

  const removeConnection = (id) => {
    state.connections = state.connections.filter(c => c.id !== id);
  };

  const exportData = () => {
    const data = JSON.stringify({
      blocks: state.blocks,
      connections: state.connections,
      version: '1.0'
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wireflow-export-${Date.now()}.json`;
    a.click();
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        state.blocks = data.blocks || [];
        state.connections = data.connections || [];
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return {
    state,
    load,
    save,
    addBlock,
    removeBlock,
    addConnection,
    removeConnection,
    exportData,
    importData
  };
}
