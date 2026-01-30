<template>
  <div :class="{'dark': state.isDarkMode}" class="h-screen flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 bg-white dark:bg-[#050505] font-sans selection:bg-blue-500/30">
    <Header 
      :state="state" 
      :is-sidebar-open="isSidebarOpen"
      :export-data="exportData" 
      :import-data="importData" 
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      @reset-request="isResetModalOpen = true"
      @apply-template="applyTemplate"
    />

    <div class="flex-1 flex overflow-hidden relative">
      <!-- Sidebar with transition -->
      <div 
        class="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-slate-200/60 dark:border-white/10"
        :style="{ width: isSidebarOpen ? '288px' : '0px', opacity: isSidebarOpen ? 1 : 0 }"
      >
        <Sidebar class="w-72" />
      </div>
      
      <CanvasArea 
        class="flex-1"
        :blocks="state.blocks"
        :connections="state.connections"
        :selected-block-id="state.selectedBlockId"
        @update-block="handleUpdateBlock"
        @add-connection="handleConnect"
        @delete-connection="removeConnection"
        @delete-block="removeBlock"
        @update-selected-id="handleBlockSelect"
        @add-block-dropped="handleAddBlockDropped"
      />

      <!-- Block Edit Modal -->
      <BlockModal 
        :is-open="isModalOpen"
        :block="state.blocks.find(b => b.id === state.selectedBlockId)"
        @close="isModalOpen = false"
        @save="handleModalSave"
        @delete="handleModalDelete"
      />

      <!-- Reset Confirmation -->
      <ConfirmationModal 
        :is-open="isResetModalOpen"
        title="Reset System Flow?"
        message="This will clear your entire workspace. Make sure you have exported your data if you wish to keep it."
        confirm-text="Purge Canvas"
        @close="isResetModalOpen = false"
        @confirm="handleReset"
      />

      <!-- Notifications -->
      <Notification :toasts="toasts" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from 'vue';
import { useFlowStore } from './composables/useFlowStore';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import CanvasArea from './components/CanvasArea.vue';
import BlockModal from './components/BlockModal.vue';
import Notification from './components/Notification.vue';
import ConfirmationModal from './components/ConfirmationModal.vue';

const { state, load, save, addBlock, removeBlock, addConnection, removeConnection, exportData, importData } = useFlowStore();
const isModalOpen = ref(false);
const isSidebarOpen = ref(true);
const isResetModalOpen = ref(false);
const toasts = reactive([]);

const handleReset = () => {
  state.blocks = [];
  state.connections = [];
  save();
  isResetModalOpen.value = false;
  showToast("Canvas restored to factory defaults", "success");
};

const applyTemplate = (templateName) => {
  const templates = {
    auth: {
      blocks: [
        { id: 't1', type: 'login', title: 'User Login', x: 100, y: 100, width: 240, height: 180 },
        { id: 't2', type: 'verify', title: 'MFA Security', x: 450, y: 100, width: 240, height: 180 },
        { id: 't3', type: 'register', title: 'New Member', x: 100, y: 350, width: 240, height: 180 },
        { id: 't4', type: 'profile', title: 'Member Area', x: 800, y: 100, width: 240, height: 180 },
      ],
      connections: [
        { id: 'l1', from: 't1', fromPort: 'right', to: 't2', toPort: 'left' },
        { id: 'l2', from: 't2', fromPort: 'right', to: 't4', toPort: 'left' },
        { id: 'l3', from: 't3', fromPort: 'top', to: 't1', toPort: 'bottom' },
      ]
    },
    ecommerce: {
      blocks: [
        { id: 'e1', type: 'search', title: 'Global Search', x: 50, y: 100, width: 240, height: 180 },
        { id: 'e2', type: 'list', title: 'Product Results', x: 350, y: 100, width: 240, height: 180 },
        { id: 'e3', type: 'details', title: 'Product Page', x: 650, y: 100, width: 240, height: 180 },
        { id: 'e4', type: 'payment', title: 'Payment Desk', x: 950, y: 100, width: 240, height: 180 },
        { id: 'e5', type: 'success', title: 'Order Complete', x: 1250, y: 100, width: 240, height: 180 },
      ],
      connections: [
        { id: 'el1', from: 'e1', fromPort: 'right', to: 'e2', toPort: 'left' },
        { id: 'el2', from: 'e2', fromPort: 'right', to: 'e3', toPort: 'left' },
        { id: 'el3', from: 'e3', fromPort: 'right', to: 'e4', toPort: 'left' },
        { id: 'el4', from: 'e4', fromPort: 'right', to: 'e5', toPort: 'left' },
      ]
    },
    saas: {
      blocks: [
        { id: 's1', type: 'dashboard', title: 'Global Console', x: 300, y: 50, width: 240, height: 180 },
        { id: 's2', type: 'analytics', title: 'Usage Metrics', x: 50, y: 300, width: 240, height: 180 },
        { id: 's3', type: 'stats', title: 'Quick Summary', x: 550, y: 300, width: 240, height: 180 },
        { id: 's4', type: 'settings', title: 'System Config', x: 300, y: 550, width: 240, height: 180 },
      ],
      connections: [
        { id: 'sl1', from: 's1', fromPort: 'left', to: 's2', toPort: 'top' },
        { id: 'sl2', from: 's1', fromPort: 'right', to: 's3', toPort: 'top' },
        { id: 'sl3', from: 's1', fromPort: 'bottom', to: 's4', toPort: 'top' },
      ]
    }
  };

  const selected = templates[templateName];
  if (selected) {
    state.blocks = [...selected.blocks];
    state.connections = [...selected.connections];
    save();
    showToast(`Template '${templateName.toUpperCase()}' applied`, "success");
  }
};

const showToast = (message, type = 'success') => {
  const id = Date.now();
  toasts.push({ id, message, type });
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  }, 3000);
};

const handleBlockSelect = (id) => {
  state.selectedBlockId = id;
  if (id) {
    isModalOpen.value = true;
  }
};

const handleModalSave = (payload) => {
  console.log('App:handleModalSave received payload:', payload);
  const block = state.blocks.find(b => b.id === payload.id);
  if (block) {
    block.title = payload.title;
    block.desc = payload.desc;
    save(); // Force save to localStorage
    isModalOpen.value = false;
    showToast("Changes saved successfully");
  } else {
    console.error('App:handleModalSave failed, block not found:', payload.id);
  }
};

const handleModalDelete = (id) => {
  console.log('App:handleModalDelete received id:', id);
  removeBlock(id);
  isModalOpen.value = false;
  showToast("Block deleted successfully", "success");
};

onMounted(() => {
  load();
});

const handleAddBlockDropped = ({ type, x, y }) => {
  addBlock(type, x, y);
};

const handleUpdateBlock = ({ id, updates }) => {
  const block = state.blocks.find(b => b.id === id);
  if (block) {
    Object.assign(block, updates);
  }
};

const handleConnect = ({ from, fromPort, to, toPort }) => {
  // If connection logic needs updating to store ports, we do it here
  // Store supports generic connection objects, so we just push it
  // We need to modify addConnection inside store if we want to save port info properly
  // Since 'addConnection' in store currently just takes (from, to), we might need to bypass it or update it.
  // Let's update the store logic slightly or just push manually here.
  // Better: Update store function.
  
  // Quick fix: Modify state directly via store action update? 
  // Let's modify the store function call to include ports if possible.
  // Actually, let's just make a new action inside the component context or assume the store handles objects.
  // Checks useFlowStore.js... addConnection takes (from, to). 
  // Let's rely on flexible arguments or just pass an object if I changed it? 
  // I didn't change useFlowStore.js heavily.
  // I will just add the connection manually with extra props for now, 
  // or better: update the store file too?
  // Let's look at `useFlowStore.js` content from my memory. 
  // `addConnection = (from, to) => { ... state.connections.push({from, to ...}) }`
  // I should update useFlowStore to accept ports.
  
  addConnectionWithPorts(from, fromPort, to, toPort);
};

const addConnectionWithPorts = (from, fromPort, to, toPort) => {
   if (from === to) return;
   // Check existence including ports? Or just block-to-block? 
   // Let's allow multiple connections between blocks if ports differ.
   const exists = state.connections.find(c => 
      c.from === from && c.to === to && c.fromPort === fromPort && c.toPort === toPort
   );
   if (!exists) {
     state.connections.push({
       id: `link_${Date.now()}`,
       from,
       fromPort,
       to,
       toPort,
       label: ''
     });
   }
};

</script>

<style>
body {
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none;
}
</style>
