<template>
  <div class="flex items-center gap-4">
    <!-- Templates Dropdown -->
    <div class="relative group/templates">
      <button class="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all text-blue-500 group-hover/templates:border-blue-500 shadow-sm shadow-blue-500/5">
        <LayoutTemplateIcon class="w-3.5 h-3.5" />
        <span class="text-[10px] font-black uppercase tracking-widest">Templates</span>
        <ChevronDownIcon class="w-3 h-3 opacity-50 group-hover/templates:rotate-180 transition-transform duration-300" />
      </button>

      <!-- Dropdown Menu -->
      <div class="absolute top-full right-0 mt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover/templates:opacity-100 group-hover/templates:translate-y-0 group-hover/templates:pointer-events-auto transition-all duration-300 z-[110]">
        <div class="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 backdrop-blur-3xl">
          <div class="px-3 py-2 text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 mb-1">
            Structural Presets
          </div>
          
          <button 
            v-for="t in templates" 
            :key="t.id"
            @click="$emit('apply-template', t.id)"
            class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 rounded-xl transition-colors group/item"
          >
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/item:scale-110 transition-transform">
              <component :is="t.icon" class="w-4 h-4" />
            </div>
            <div class="flex flex-col items-start px-2">
              <span class="text-[10px] font-black text-slate-700 dark:text-white uppercase">{{ t.name }}</span>
              <span class="text-[8px] text-slate-400 dark:text-white/30">{{ t.desc }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="h-4 w-[1px] bg-slate-200 dark:bg-white/10"></div>

    <!-- Dark/Light Toggle -->
    <button 
      @click="toggleDarkMode" 
      class="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-white/60"
    >
      <component :is="state.isDarkMode ? SunIcon : MoonIcon" class="w-3.5 h-3.5" />
    </button>

    <!-- Export/Import -->
    <button @click="exportData" class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg transition-all text-slate-600 dark:text-white/80">
      <DownloadIcon class="w-3 h-3" />
      <span class="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Export</span>
    </button>

    <label class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer transition-all text-slate-600 dark:text-white/80">
      <UploadIcon class="w-3 h-3" />
      <span class="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Import</span>
      <input type="file" @change="handleImport" class="hidden" accept=".json" />
    </label>
    
    <!-- Reset Button -->
    <button 
      @click="$emit('reset-request')"
      class="w-8 h-8 rounded-lg border border-red-500/20 flex items-center justify-center hover:bg-red-500/10 text-red-500 transition-all active:scale-90"
      title="Reset Canvas"
    >
      <RefreshCcwIcon class="w-3.5 h-3.5" />
    </button>

    <button class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-blue-500/20">
      SHARE FLOW
    </button>
  </div>
</template>

<script setup>
import { 
  SunIcon, MoonIcon, DownloadIcon, UploadIcon, 
  LayoutTemplateIcon, RefreshCcwIcon, ChevronDownIcon,
  ShieldCheckIcon, ShoppingCartIcon, ServerIcon
} from 'lucide-vue-next';
import { onMounted, watch } from 'vue';

const props = defineProps(['state', 'exportData', 'importData']);
defineEmits(['reset-request', 'apply-template']);

const templates = [
  { id: 'auth', name: 'Auth Flow', desc: 'Login & Verification', icon: ShieldCheckIcon },
  { id: 'ecommerce', name: 'Commerce', desc: 'Product to Success', icon: ShoppingCartIcon },
  { id: 'saas', name: 'SaaS Layout', desc: 'Dashboard Hub', icon: ServerIcon },
];

const toggleDarkMode = () => {
    props.state.isDarkMode = !props.state.isDarkMode;
};

const updateHtmlClass = () => {
    if (props.state.isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

onMounted(() => {
    updateHtmlClass();
});

watch(() => props.state.isDarkMode, updateHtmlClass);

const handleImport = (e) => {
  if (e.target.files.length > 0) {
    props.importData(e.target.files[0]);
  }
};
</script>
