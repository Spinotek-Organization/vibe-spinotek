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
      @notify="showToast($event.message, $event.type)"
    />

    <div class="flex-1 flex overflow-hidden relative">
      <!-- Sidebar with transition -->
      <!-- Sidebar with transition -->
      <div 
        class="absolute md:relative z-20 h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#050505] shadow-2xl md:shadow-none"
        :class="{'w-72 opacity-100': isSidebarOpen, 'w-0 opacity-0': !isSidebarOpen}"
      >
        <Sidebar class="w-72" />
      </div>
      
      <CanvasArea 
        class="flex-1"
        :blocks="state.blocks"
        :connections="state.connections"
        :selected-block-id="state.selectedBlockId"
        :is-exporting="state.isExporting"
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
        title="Reset Vibe Flow?"
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
const isSidebarOpen = ref(window.innerWidth > 768); // Auto-close on mobile
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
    project_mgmt: [
      { id: 'p1', type: 'goal', title: 'Q1 Vision', desc: 'Define long-term objectives and KPIs.', x: 50, y: 100, width: 240, height: 180 },
      { id: 'p2', type: 'brief', title: 'Market Brief', desc: 'Strategic analysis and user research.', x: 350, y: 100, width: 240, height: 180 },
      { id: 'p3', type: 'project', title: 'Product Launch', desc: 'Core execution and development phase.', x: 650, y: 100, width: 240, height: 180 },
      { id: 'p4', type: 'milestone', title: 'Beta Release', desc: 'Limited release and feedback loop.', x: 950, y: 100, width: 240, height: 180 },
      { id: 'p5', type: 'complete', title: 'Global Live', desc: 'Full-scale market production live.', x: 1250, y: 100, width: 240, height: 180 },
    ],
    marketing: [
      { id: 'm1', type: 'funnel', title: 'Ads Awareness', desc: 'Targeting top-of-funnel audiences.', x: 50, y: 100, width: 220, height: 160 },
      { id: 'm2', type: 'campaign', title: 'Social Drive', desc: 'Viral expansion and organic growth.', x: 350, y: 100, width: 220, height: 160 },
      { id: 'm3', type: 'doc', title: 'Landing Page', desc: 'High conversion entry points.', x: 650, y: 100, width: 220, height: 160 },
      { id: 'm4', type: 'person', title: 'Leads Conv', desc: 'Nurturing interested prospects.', x: 950, y: 100, width: 220, height: 160 },
      { id: 'm5', type: 'analytics', title: 'ROI Report', desc: 'Performance tracking and audit.', x: 1250, y: 100, width: 220, height: 160 },
    ],
    onboarding: [
      { id: 'o1', type: 'team', title: 'Talent Pool', desc: 'Strategic recruitment and sourcing.', x: 300, y: 50, width: 240, height: 180 },
      { id: 'o2', type: 'chat', title: 'Initial Sync', desc: 'Expectation setting and meeting.', x: 50, y: 300, width: 240, height: 180 },
      { id: 'o3', type: 'doc', title: 'Rules & NDA', desc: 'Governance and legal compliance.', x: 550, y: 300, width: 240, height: 180 },
      { id: 'o4', type: 'meeting', title: 'Townhall', desc: 'Global alignment and culture building.', x: 300, y: 550, width: 240, height: 180 },
    ],
    erp: [
      { id: 'erp1', type: 'process', title: 'Admin Gateway', desc: 'Secure entry point for managers.', x: 0, y: 300, width: 220, height: 160 },
      { id: 'erp2', type: 'vision', title: 'Main Console', desc: 'Centralized steering and monitoring.', x: 300, y: 300, width: 220, height: 160 },
      { id: 'erp3', type: 'research', title: 'Customer Search', desc: 'Advanced CRM and lead directory.', x: 300, y: 50, width: 220, height: 160 },
      { id: 'erp4', type: 'project', title: 'Product Inventory', desc: 'Real-time stock and logistics data.', x: 300, y: 550, width: 220, height: 160 },
      { id: 'erp5', type: 'brief', title: 'Customer Profile', desc: 'Detailed 360 view of client assets.', x: 600, y: 50, width: 220, height: 160 },
      { id: 'erp6', type: 'analytics', title: 'Inventory Analytics', desc: 'Predictive modeling and stock forecasting.', x: 600, y: 550, width: 220, height: 160 },
      { id: 'erp7', type: 'process', title: 'Process Logs', desc: 'Immutable audit trail for all events.', x: 600, y: 300, width: 220, height: 160 },
      { id: 'erp8', type: 'complete', title: 'Payment Processing', desc: 'Secure multi-gateway settlement.', x: 900, y: 300, width: 220, height: 160 },
      { id: 'erp9', type: 'doc', title: 'Digital Receipt', desc: 'Automated invoice generation.', x: 1200, y: 200, width: 220, height: 160 },
      { id: 'erp10', type: 'complete', title: 'Transaction Sync', desc: 'Distributed ledger synchronization.', x: 1200, y: 400, width: 220, height: 160 },
    ]
  };

  const selectedBlocks = templates[templateName];
  if (selectedBlocks) {
    // Reset state clearly
    state.blocks = [];
    state.connections = [];
    state.selectedBlockId = null;

    // Apply blocks
    state.blocks = selectedBlocks.map(b => ({ ...b }));

    // Auto-generate connections for linear templates (Project and Marketing)
    if (templateName === 'project_mgmt' || templateName === 'marketing') {
        const prefix = templateName === 'project_mgmt' ? 'p' : 'm';
        for (let i = 1; i < 5; i++) {
            state.connections.push({
                id: `cl_${templateName}_${i}`,
                from: `${prefix}${i}`,
                fromPort: 'right',
                to: `${prefix}${i+1}`,
                toPort: 'left',
                label: ''
            });
        }
    } else if (templateName === 'onboarding') {
        state.connections = [
            { id: 'ol1', from: 'o1', fromPort: 'left', to: 'o2', toPort: 'top', label: '' },
            { id: 'ol2', from: 'o1', fromPort: 'right', to: 'o3', toPort: 'top', label: '' },
            { id: 'ol3', from: 'o1', fromPort: 'bottom', to: 'o4', toPort: 'top', label: '' },
        ];
    } else if (templateName === 'erp') {
        state.connections = [
            { id: 'erl1', from: 'erp1', fromPort: 'right', to: 'erp2', toPort: 'left', label: '' },
            { id: 'erl2', from: 'erp2', fromPort: 'top', to: 'erp3', toPort: 'bottom', label: '' },
            { id: 'erl3', from: 'erp2', fromPort: 'bottom', to: 'erp4', toPort: 'top', label: '' },
            { id: 'erl4', from: 'erp3', fromPort: 'right', to: 'erp5', toPort: 'left', label: '' },
            { id: 'erl5', from: 'erp4', fromPort: 'right', to: 'erp6', toPort: 'left', label: '' },
            { id: 'erl6', from: 'erp2', fromPort: 'right', to: 'erp7', toPort: 'left', label: '' },
            { id: 'erl7', from: 'erp7', fromPort: 'right', to: 'erp8', toPort: 'left', label: '' },
            { id: 'erl8', from: 'erp5', fromPort: 'bottom', to: 'erp8', toPort: 'top', label: '' },
            { id: 'erl9', from: 'erp6', fromPort: 'top', to: 'erp8', toPort: 'bottom', label: '' },
            { id: 'erl10', from: 'erp8', fromPort: 'right', to: 'erp9', toPort: 'left', label: '' },
            { id: 'erl11', from: 'erp9', fromPort: 'bottom', to: 'erp10', toPort: 'top', label: '' },
        ];
    }

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
  
  // Check for shared flow in URL
  const params = new URLSearchParams(window.location.search);
  const flowData = params.get('flow');
  if (flowData) {
    try {
      let decodedString;
      if (window.LZString && flowData.length > 0) {
        // Try decompressing first
        decodedString = LZString.decompressFromEncodedURIComponent(flowData);
        // If it fails (returns null or empty), fallback to btoa
        if (!decodedString) decodedString = atob(flowData);
      } else {
        decodedString = atob(flowData);
      }

      const decoded = JSON.parse(decodedString);
      
      // Handle New Compact Array Format [ [blocks], [connections] ]
      if (Array.isArray(decoded) && decoded.length === 2) {
        state.blocks = decoded[0].map(b => ({
          id: b[0], type: b[1], x: b[2], y: b[3], width: b[4], height: b[5], title: b[6], desc: b[7]
        }));
        state.connections = decoded[1].map(c => ({
          id: c[0], from: c[1], to: c[2], fromPort: c[3], toPort: c[4], label: c[5]
        }));
        save();
        showToast("Short-link flow imported!", "success");
      } 
      // Handle Legacy Object Format
      else if (decoded.blocks && decoded.connections) {
        state.blocks = decoded.blocks;
        state.connections = decoded.connections;
        save();
        showToast("Shared flow imported successfully!", "success");
      }
      
      // Clean URL without reload
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (e) {
      console.error("Failed to parse shared flow", e);
      showToast("Invalid share link", "error");
    }
  }
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

/* Screenshot Export Utility */
.exporting-mode .no-screenshot {
  display: none !important;
}
</style>
