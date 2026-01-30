<template>
  <div 
    ref="nodeRef"
    :id="block.id"
    class="absolute group isolate select-none touch-none"
    :class="[isSelected ? 'z-50' : 'z-20']"
    :style="{
      left: `${block.x}px`,
      top: `${block.y}px`,
      width: `${block.width}px`,
      height: `${block.height}px`,
    }"
  >
    <!-- Selection Highlight -->
    <div 
      v-if="isSelected"
      class="absolute -inset-[3px] rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 opacity-40 blur-[2px] pointer-events-none animate-pulse"
    ></div>

    <!-- Main Container -->
    <div 
      class="w-full h-full bg-white/90 dark:bg-[#121212]/90 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-300 relative group/container"
      :class="{'ring-2 ring-blue-500/50 border-blue-500 shadow-blue-500/20': isSelected}"
    >
      <!-- Scanning Line Effect -->
      <div v-if="isSelected" class="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
         <div class="absolute inset-x-0 h-[2px] bg-blue-400/20 blur-[1px] top-[-10%] animate-scan"></div>
      </div>

      <!-- Title Bar (DRAG HANDLE) -->
      <div 
        class="drag-handle h-9 min-h-[36px] px-4 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03] cursor-grab active:cursor-grabbing backdrop-blur-md"
      >
        <div class="flex items-center gap-2.5 pointer-events-none">
          <!-- Status light -->
          <div class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
          <span class="text-[10px] font-black font-mono tracking-[0.2em] text-slate-800 dark:text-blue-400/80 uppercase">{{ block.title }}</span>
        </div>
        
        <div class="flex gap-1.5 items-center">
           <div class="w-10 h-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
           <span class="text-[8px] font-bold font-mono text-slate-400 dark:text-white/20 uppercase">{{ block.type }} v1.0</span>
        </div>
      </div>

      <!-- Content Area -->
      <div 
        class="flex-1 p-5 relative flex flex-col cursor-default"
      >
        <!-- Description (Read Only) -->
        <p class="text-[10px] text-slate-500 dark:text-white/50 leading-relaxed line-clamp-2 mb-3 font-medium pointer-events-none select-none italic">{{ block.desc }}</p>

        <!-- Template Mockup (Visual Only - Based on Type) -->
        <div class="mt-auto pt-2 flex-1 flex flex-col pointer-events-none opacity-80 decoration-slate-200">
           <div class="flex-1 rounded-lg border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/40 p-3 flex flex-col gap-2 relative overflow-hidden">
              <component :is="resolveBlockComponent(block.type)" :type="block.type" />
           </div>
        </div>
      </div>
    </div>

    <!-- Connection Ports (4 Sides) -->
    <div 
      v-for="port in ['top', 'right', 'bottom', 'left']"
      :key="port"
      class="port-handle absolute w-4 h-4 rounded-full flex items-center justify-center cursor-crosshair z-50 transition-all duration-300 hover:scale-150"
      :data-block-id="block.id"
      :data-port="port"
      :class="{
        '-top-2 left-1/2 -translate-x-1/2': port === 'top',
        '-bottom-2 left-1/2 -translate-x-1/2': port === 'bottom',
        '-right-2 top-1/2 -translate-y-1/2': port === 'right',
        '-left-2 top-1/2 -translate-y-1/2': port === 'left',
        'opacity-0 group-hover:opacity-100': !isSelected
      }"
      @mousedown.stop.prevent="emitPortStart($event, port)"
      @click.stop
    >
      <div class="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full animate-ping opacity-25"></div>
      <div class="relative w-2 h-2 bg-white dark:bg-black border-2 border-blue-500 dark:border-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
    </div>

    <!-- Resize Handle (Bottom Right) -->
    <div 
      class="resize-handle absolute bottom-1 right-1 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1 opacity-0 group-hover:opacity-100"
      @mousedown.stop
    >
       <div class="w-2 h-2 border-r-2 border-b-2 border-slate-400 dark:border-white/30 pointer-events-none"></div>
    </div>

    <!-- Delete Button -->
    <button 
      @click.stop="$emit('delete', block.id)"
      class="delete-btn absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm z-50 hover:bg-red-600 cursor-pointer"
      @mousedown.stop
    >
      <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import interact from 'interactjs';

// Block Components
import LoginRegisterBlock from './blocks/LoginRegisterBlock.vue';
import DashboardBlock from './blocks/DashboardBlock.vue';
import ListBlock from './blocks/ListBlock.vue';
import AnalyticsBlock from './blocks/AnalyticsBlock.vue';
import DetailsBlock from './blocks/DetailsBlock.vue';
import SettingsBlock from './blocks/SettingsBlock.vue';
import PaymentBlock from './blocks/PaymentBlock.vue';
import MessagingBlock from './blocks/MessagingBlock.vue';
import SuccessBlock from './blocks/SuccessBlock.vue';
import ProfileBlock from './blocks/ProfileBlock.vue';
import SearchBlock from './blocks/SearchBlock.vue';
import CalendarBlock from './blocks/CalendarBlock.vue';
import MapBlock from './blocks/MapBlock.vue';
import FeedBlock from './blocks/FeedBlock.vue';
import UploadBlock from './blocks/UploadBlock.vue';
import ModalBlock from './blocks/ModalBlock.vue';
import PricingBlock from './blocks/PricingBlock.vue';
import FaqBlock from './blocks/FaqBlock.vue';
import VerifyBlock from './blocks/VerifyBlock.vue';
import StatsBlock from './blocks/StatsBlock.vue';
import MediaBlock from './blocks/MediaBlock.vue';
import TerminalBlock from './blocks/TerminalBlock.vue';
import InvoiceBlock from './blocks/InvoiceBlock.vue';
import MaintenanceBlock from './blocks/MaintenanceBlock.vue';
import DefaultBlock from './blocks/DefaultBlock.vue';

const props = defineProps(['block', 'isSelected', 'zoomLevel']);
const emit = defineEmits(['update', 'select', 'delete', 'port-mousedown', 'port-mouseup']);

const nodeRef = ref(null);

const resolveBlockComponent = (type) => {
  const map = {
    login: LoginRegisterBlock,
    register: LoginRegisterBlock,
    dashboard: DashboardBlock,
    list: ListBlock,
    analytics: AnalyticsBlock,
    details: DetailsBlock,
    settings: SettingsBlock,
    payment: PaymentBlock,
    messaging: MessagingBlock,
    success: SuccessBlock,
    profile: ProfileBlock,
    search: SearchBlock,
    calendar: CalendarBlock,
    map: MapBlock,
    feed: FeedBlock,
    upload: UploadBlock,
    modal: ModalBlock,
    pricing: PricingBlock,
    faq: FaqBlock,
    verify: VerifyBlock,
    stats: StatsBlock,
    media: MediaBlock,
    terminal: TerminalBlock,
    invoice: InvoiceBlock,
    maintenance: MaintenanceBlock,
  };
  return map[type] || DefaultBlock;
};

const selectBlock = () => {
    emit('select', props.block.id);
};

const emitPortStart = (e, port) => {
  let x = props.block.x;
  let y = props.block.y;
  const w = props.block.width;
  const h = props.block.height;

  if (port === 'top') { x += w/2; }
  else if (port === 'right') { x += w; y += h/2; }
  else if (port === 'bottom') { x += w/2; y += h; }
  else if (port === 'left') { y += h/2; }

  emit('port-mousedown', { id: props.block.id, port, x, y });
};

onMounted(() => {
  // Initialize InteractJS
  const interactable = interact(nodeRef.value);

  // TAP CONFIG (For selection and opening modal)
  interactable.on('tap', (event) => {
    // If we clicked a button (like Delete), don't trigger modal
    if (event.target.closest('button')) return;
    emit('select', props.block.id);
  });

  // DRAGGABLE CONFIG
  interactable.draggable({
    inertia: false, // Set to false to remove 'heavy' feeling momentum
    // CRITICAL: Only allow drag from the header (.drag-handle)
    allowFrom: '.drag-handle',
    // Ignore clicks on inputs/textareas to allow typing
    ignoreFrom: 'input, textarea, .port-handle, .resize-handle, .delete-btn',
    autoScroll: true,
    listeners: {
      move(event) {
        // Account for zoom level to keep dragging 1:1 with mouse
        const zoom = props.zoomLevel || 1;
        const x = props.block.x + event.dx / zoom;
        const y = props.block.y + event.dy / zoom;
        
        emit('update', { id: props.block.id, updates: { x, y } });
      }
    }
  });

  // RESIZABLE CONFIG
  interactable.resizable({
    // Only resize from the bottom-right handle
    edges: { right: '.resize-handle', bottom: '.resize-handle' },
    modifiers: [
      // Keep aspect ratio or size limits
      interact.modifiers.restrictSize({
        min: { width: 220, height: 160 },
        max: { width: 800, height: 800 }
      })
    ],
    listeners: {
      move(event) {
        let { width, height } = event.rect;
        // Emit update to parent
        emit('update', { id: props.block.id, updates: { width, height } });
      }
    }
  });
});

onBeforeUnmount(() => {
  interact(nodeRef.value).unset();
});
</script>

<style scoped>
/* Ensure inputs are selectable */
input, textarea {
  user-select: text;
  cursor: text;
}

@keyframes scan {
  0% { top: -10%; opacity: 0; }
  50% { opacity: 1; }
  100% { top: 110%; opacity: 0; }
}

.animate-scan {
  animation: scan 3s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
</style>
