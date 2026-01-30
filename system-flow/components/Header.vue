<template>
  <div class="h-16 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between px-6 bg-white/40 dark:bg-[#050505]/60 backdrop-blur-xl z-[100] transition-all duration-500 relative">
    <!-- Cyberpunk Decorative Top Line -->
    <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

    <div class="flex items-center gap-5">
      <!-- Sidebar Toggle -->
      <button 
        @click="$emit('toggle-sidebar')"
        class="p-2 mr-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-blue-500 transition-all active:scale-95 flex items-center justify-center"
      >
        <PanelLeftIcon class="w-4 h-4 transition-transform duration-300" :class="{'rotate-180': !isSidebarOpen}" />
      </button>

      <!-- High-Tech Logo Container -->
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div class="relative w-9 h-9 bg-white dark:bg-black rounded-lg flex items-center justify-center border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
          <img src="/assets/images/favicon.png" alt="Logo" class="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <h1 class="text-xs font-black tracking-widest text-slate-900 dark:text-white uppercase">
            System <span class="text-blue-500">Flow</span>
          </h1>
          <div class="px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
            Live
          </div>
        </div>
        <p class="text-[9px] font-medium text-slate-500 dark:text-white/40">
          by <a href="https://spinotek.com" target="_blank" class="text-slate-800 dark:text-white/60 hover:text-blue-500 transition-colors underline-offset-4 decoration-blue-500/30 font-bold">Spinotek</a>
        </p>
      </div>
    </div>
    
    <HeaderActions 
      :state="state" 
      :export-data="exportData" 
      :import-data="importData" 
      @reset-request="$emit('reset-request')"
      @apply-template="$emit('apply-template', $event)"
    />
  </div>
</template>

<script setup>
import { PanelLeftIcon } from 'lucide-vue-next';
import HeaderActions from './HeaderActions.vue';

const props = defineProps(['state', 'exportData', 'importData', 'isSidebarOpen']);
defineEmits(['toggle-sidebar', 'reset-request', 'apply-template']);
</script>
