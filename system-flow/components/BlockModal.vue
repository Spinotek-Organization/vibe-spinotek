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
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          @click="handleClose"
        ></div>

        <!-- Panel -->
        <Transition
          appear
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-8"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-8"
        >
          <div 
            v-if="show"
            class="relative w-full max-w-md transform overflow-hidden rounded-[32px] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 p-8 text-left shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] transition-all"
            @click.stop
          >
            <!-- Close Button -->
            <button 
              @click="handleClose"
              class="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90"
            >
              <svg class="w-5 h-5 text-slate-500 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <!-- Header -->
            <div class="mb-8">
              <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Block Details</h3>
              <p class="text-slate-500 dark:text-white/40 mt-1">Refine the title and purpose of your component.</p>
            </div>

            <!-- Form -->
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em] ml-1">Title</label>
                <input 
                  ref="titleInput"
                  v-model="localTitle" 
                  type="text"
                  class="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                  placeholder="e.g. User Authentication"
                  @keyup.enter="onSave"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em] ml-1">Description Logic</label>
                <textarea 
                  v-model="localDesc" 
                  rows="4"
                  class="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-inner"
                  placeholder="Describe how this block behaves..."
                ></textarea>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-10 flex gap-4">
              <button 
                @click="onSave"
                class="flex-[2] px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/30 active:scale-95"
              >
                Save Changes
              </button>
              <button 
                @click="onDelete"
                class="flex-1 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center"
                title="Delete Block"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  block: Object
});

const emit = defineEmits(['close', 'save', 'delete']);

const show = ref(false);
const localTitle = ref('');
const localDesc = ref('');
const titleInput = ref(null);

// Sync visual state with prop to enable smooth transitions
watch(() => props.isOpen, async (val) => {
  if (val) {
    show.value = true;
    await nextTick();
    // Use a small timeout to ensure the transition has started and input is visible
    setTimeout(() => {
      titleInput.value?.focus();
    }, 150);
  } else {
    show.value = false;
  }
});

// Initial state sync
onMounted(() => {
  if (props.isOpen) show.value = true;
});

const localId = ref(null);

// Sync local state when block changes
watch(() => props.block, (newBlock) => {
  if (newBlock) {
    localId.value = newBlock.id;
    localTitle.value = newBlock.title || '';
    localDesc.value = newBlock.desc || '';
    console.log('BlockModal: Syncing block data for ID:', localId.value);
  }
}, { immediate: true });

const handleClose = () => {
  emit('close');
};

const onSave = () => {
  console.log('BlockModal:onSave attempt for ID:', localId.value);
  if (!localId.value) {
    console.error('BlockModal: Save blocked, no ID found');
    return;
  }
  emit('save', {
    id: localId.value,
    title: localTitle.value,
    desc: localDesc.value
  });
};

const onDelete = () => {
  console.log('BlockModal:onDelete attempt for ID:', localId.value);
  if (!localId.value) {
    console.error('BlockModal: Delete blocked, no ID found');
    return;
  }
  emit('delete', localId.value);
};
</script>
