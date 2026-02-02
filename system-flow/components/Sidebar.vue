<template>
  <aside class="w-72 h-full border-r border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl flex flex-col z-40 transition-all duration-500 relative">
    <!-- Decorative side accent -->
    <div class="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
      <!-- Search Bar -->
      <div class="mb-8 relative group">
        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon class="w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari komponen..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-white/20"
        />
      </div>

      <div v-for="(group, gIndex) in filteredLibrary" :key="group.category" 
           :class="{'mt-10': gIndex > 0}">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
          <h2 class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.25em] opacity-80">{{ group.category }}</h2>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="item in group.items" 
            :key="item.type"
            draggable="true"
            @dragstart="onDragStart($event, item.type)"
            class="group cursor-grab active:cursor-grabbing"
          >
            <div class="relative aspect-square bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:scale-105 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group-active:scale-95">
              <!-- Glow background effect -->
              <div class="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              
              <component :is="item.icon" class="w-7 h-7 text-slate-400 dark:text-white/40 group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-3 transition-colors duration-300" />
              <span class="text-[9px] font-black text-slate-500 dark:text-white/50 uppercase tracking-tighter group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-center">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredLibrary.length === 0" class="py-20 flex flex-col items-center text-center">
         <div class="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-slate-300 dark:text-white/20">
            <SearchIcon class="w-6 h-6" />
         </div>
         <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Komponen tidak ditemukan</p>
      </div>
    </div>

    <div class="mt-auto p-6 border-t border-slate-100 dark:border-white/5 relative overflow-hidden">
      <!-- High-Tech Scan Line Animation -->
      <div class="absolute top-0 left-0 right-0 h-[1px] bg-blue-500/20 animate-scan pointer-events-none"></div>

      <a href="https://spinotek.com/contact" target="_blank" class="block group/cta relative">
        <div class="absolute -inset-2 bg-blue-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover/cta:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative p-5 rounded-3xl bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/5 shadow-2xl transition-all duration-500 group-hover/cta:border-blue-500/40 group-hover/cta:-translate-y-2 overflow-hidden">
          <!-- Glass Overlay for depth -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent pointer-events-none"></div>
          
          <div class="flex items-center gap-3 mb-4">
            <div class="relative w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover/cta:scale-110 transition-transform duration-500 shadow-inner">
               <img src="/assets/images/favicon.png" alt="Spinotek" class="w-6 h-6 object-contain" />
               <div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-black animate-pulse"></div>
            </div>
            <div class="flex flex-col">
               <span class="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Spinotek</span>
               <span class="text-[7px] font-black text-blue-500 uppercase tracking-widest leading-none">Software Company</span>
            </div>
          </div>

          <p class="text-[11px] text-slate-600 dark:text-white/50 leading-relaxed font-semibold mb-4">
            Bangun <span class="relative inline-block mx-0.5"><span class="absolute bottom-0.5 left-0 right-0 h-[35%] bg-blue-500/20 dark:bg-blue-500/40 -skew-x-12 rounded-sm border-r-2 border-blue-500/50"></span><span class="relative text-slate-900 dark:text-white font-black">Produk Digital</span></span> Untuk Kebutuhan Bisnis Kamu.
          </p>

          <div class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all group-hover/cta:shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <span class="text-[9px] font-black uppercase tracking-widest flex-1">Hubungi Kami</span>
            <ExternalLinkIcon class="w-3 h-3" />
          </div>
        </div>
      </a>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  FlagIcon, SparklesIcon, SearchIcon, FileTextIcon,
  BriefcaseIcon, ClipboardCheckIcon, TargetIcon, CalendarIcon,
  FilterIcon, MegaphoneIcon, CopyIcon, BarChart3Icon,
  UserIcon, UsersIcon, MessageSquareIcon, VideoIcon,
  FilmIcon, ImageIcon, FileIcon, ExternalLinkIcon,
  PlayCircleIcon, CheckCircleIcon, AlertCircleIcon, SettingsIcon
} from 'lucide-vue-next';

const searchQuery = ref('');

const groupedLibrary = [
  {
    category: 'Strategy & Goal',
    items: [
      { type: 'goal', label: 'Main Goal', icon: FlagIcon },
      { type: 'vision', label: 'Vision & Mission', icon: SparklesIcon },
      { type: 'research', label: 'Research', icon: SearchIcon },
      { type: 'brief', label: 'Project Brief', icon: FileTextIcon },
    ]
  },
  {
    category: 'Planning & Ops',
    items: [
      { type: 'project', label: 'Project', icon: BriefcaseIcon },
      { type: 'task', label: 'Task Item', icon: ClipboardCheckIcon },
      { type: 'milestone', label: 'Milestone', icon: TargetIcon },
      { type: 'schedule', label: 'Schedule', icon: CalendarIcon },
    ]
  },
  {
    category: 'Growth & Market',
    items: [
       { type: 'funnel', label: 'Funnel', icon: FilterIcon },
       { type: 'campaign', label: 'Campaign', icon: MegaphoneIcon },
       { type: 'ad_set', label: 'Ad Set', icon: CopyIcon },
       { type: 'analytics', label: 'Growth Data', icon: BarChart3Icon },
    ]
  },
  {
    category: 'Team & Social',
    items: [
      { type: 'person', label: 'Person', icon: UserIcon },
      { type: 'team', label: 'Team Box', icon: UsersIcon },
      { type: 'chat', label: 'Communication', icon: MessageSquareIcon },
      { type: 'meeting', label: 'Sync Up', icon: VideoIcon },
    ]
  },
  {
    category: 'Assets & Media',
    items: [
      { type: 'media', label: 'Video Asset', icon: FilmIcon },
      { type: 'image', label: 'Visual', icon: ImageIcon },
      { type: 'doc', label: 'Document', icon: FileIcon },
      { type: 'link', label: 'External', icon: ExternalLinkIcon },
    ]
  },
  {
    category: 'Status & Flow',
    items: [
      { type: 'start', label: 'Trigger', icon: PlayCircleIcon },
      { type: 'complete', label: 'Achieved', icon: CheckCircleIcon },
      { type: 'error', label: 'Blocker', icon: AlertCircleIcon },
      { type: 'process', label: 'In Progress', icon: SettingsIcon },
    ]
  }
];

const filteredLibrary = computed(() => {
  if (!searchQuery.value.trim()) return groupedLibrary;
  
  const query = searchQuery.value.toLowerCase();
  return groupedLibrary.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(query) || 
      item.type.toLowerCase().includes(query)
    )
  })).filter(group => group.items.length > 0);
});

const onDragStart = (e, type) => {
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('application/spinotek-block', type);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.2);
}
@keyframes scan {
  0% { transform: translateY(-100px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(300px); opacity: 0; }
}
.animate-scan {
  animation: scan 4s linear infinite;
}
</style>
