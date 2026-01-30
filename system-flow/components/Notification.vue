<template>
  <Teleport to="body">
    <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-[-100%] scale-90"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="flex items-center gap-4 px-6 py-3 bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] overflow-hidden min-w-[320px] relative group"
        >
          <!-- Progress bar decorative -->
          <div 
            class="absolute bottom-0 left-0 h-[2px] transition-all duration-3000 bg-current"
            :class="toast.type === 'error' ? 'text-red-500' : 'text-blue-500'"
            style="width: 100%; animation: shrink 3s linear forwards;"
          ></div>

          <!-- Status Icon -->
          <div 
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
            :class="toast.type === 'error' ? 'bg-red-500/10 text-red-500 shadow-red-500/20' : 'bg-blue-500/10 text-blue-500 shadow-blue-500/20'"
          >
            <svg v-if="toast.type !== 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          <!-- Message -->
          <div class="flex flex-col">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">{{ toast.type || 'Success' }}</span>
            <span class="text-xs font-bold text-slate-900 dark:text-white/90 leading-tight">{{ toast.message }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps(['toasts']);
</script>

<style scoped>
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
