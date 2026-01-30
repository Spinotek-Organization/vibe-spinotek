<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <!-- Background Decorative Glow -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[80px] pointer-events-none"></div>
            
            <div class="p-8">
              <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangleIcon class="w-8 h-8 text-red-500" />
              </div>
              
              <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                {{ title || 'Are you sure?' }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-white/40 leading-relaxed mb-8">
                {{ message || 'This action cannot be undone. All your progress on the current canvas will be permanently removed.' }}
              </p>
              
              <div class="flex gap-3">
                <button 
                  @click="$emit('close')"
                  class="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  @click="$emit('confirm')"
                  class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
                >
                  {{ confirmText || 'Confirm Reset' }}
                </button>
              </div>
            </div>
            
            <!-- Bottom Accent -->
            <div class="h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-30"></div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangleIcon } from 'lucide-vue-next';

defineProps(['isOpen', 'title', 'message', 'confirmText']);
defineEmits(['close', 'confirm']);
</script>
