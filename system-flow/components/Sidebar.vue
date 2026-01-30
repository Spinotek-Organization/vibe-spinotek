<template>
  <aside class="w-72 border-r border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl flex flex-col z-40 transition-all duration-500 relative">
    <!-- Decorative side accent -->
    <div class="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
      <div v-for="(group, gIndex) in groupedLibrary" :key="group.category" 
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
    </div>

    <div class="mt-auto p-6 border-t border-slate-100 dark:border-white/5">
      <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-600/5 border border-blue-200 dark:border-blue-500/10">
        <p class="text-[9px] text-blue-600 dark:text-blue-300 italic leading-relaxed">Tip: Drag items onto the canvas to start building.</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { 
  LayoutIcon, UserIcon, LogInIcon, ClipboardListIcon, BarChart3Icon, 
  FileTextIcon, SettingsIcon, CreditCardIcon, CheckCircleIcon, MailIcon,
  SearchIcon, CalendarIcon, MapIcon, ActivityIcon, TagIcon, HelpCircleIcon,
  UploadIcon, ExternalLinkIcon, AlertCircleIcon, UserPlusIcon,
  FingerprintIcon, PieChartIcon, PlayCircleIcon, TerminalIcon, ReceiptIcon, HammerIcon
} from 'lucide-vue-next';

const groupedLibrary = [
  {
    category: 'Auth & Profile',
    items: [
      { type: 'login', label: 'Login', icon: LogInIcon },
      { type: 'register', label: 'Register', icon: UserPlusIcon },
      { type: 'profile', label: 'Profile', icon: UserIcon },
      { type: 'verify', label: 'OTP Verify', icon: FingerprintIcon },
    ]
  },
  {
    category: 'Dashboard & Feed',
    items: [
      { type: 'dashboard', label: 'Dashboard', icon: LayoutIcon },
      { type: 'analytics', label: 'Charts', icon: BarChart3Icon },
      { type: 'feed', label: 'Activity', icon: ActivityIcon },
      { type: 'stats', label: 'Stats Card', icon: PieChartIcon },
    ]
  },
  {
    category: 'Data & Content',
    items: [
      { type: 'list', label: 'List View', icon: ClipboardListIcon },
      { type: 'details', label: 'Details', icon: FileTextIcon },
      { type: 'search', label: 'Search', icon: SearchIcon },
      { type: 'calendar', label: 'Calendar', icon: CalendarIcon },
      { type: 'map', label: 'Map view', icon: MapIcon },
      { type: 'media', label: 'Video Player', icon: PlayCircleIcon },
    ]
  },
  {
    category: 'System & Tools',
    items: [
      { type: 'settings', label: 'Settings', icon: SettingsIcon },
      { type: 'messaging', label: 'Inbox', icon: MailIcon },
      { type: 'upload', label: 'Upload', icon: UploadIcon },
      { type: 'modal', label: 'Modal', icon: ExternalLinkIcon },
      { type: 'terminal', label: 'Console', icon: TerminalIcon },
    ]
  },
  {
    category: 'Business',
    items: [
      { type: 'payment', label: 'Checkout', icon: CreditCardIcon },
      { type: 'pricing', label: 'Pricing', icon: TagIcon },
      { type: 'invoice', label: 'Invoice', icon: ReceiptIcon },
    ]
  },
  {
    category: 'Status & Help',
    items: [
      { type: 'success', label: 'Success', icon: CheckCircleIcon },
      { type: 'error', label: 'Error State', icon: AlertCircleIcon },
      { type: 'faq', label: 'FAQ', icon: HelpCircleIcon },
      { type: 'maintenance', label: 'Service', icon: HammerIcon },
    ]
  }
];

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
</style>
