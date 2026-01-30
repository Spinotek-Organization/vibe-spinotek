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
      class="w-full h-full bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-colors duration-300 relative group/container"
      :class="{'ring-2 ring-blue-500/40 border-blue-500/50': isSelected}"
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
              
              <!-- Login / Register Template -->
              <template v-if="['login', 'register'].includes(block.type)">
                 <div class="h-2 w-1/3 bg-slate-200 dark:bg-white/10 rounded self-center mb-2"></div>
                 <div class="space-y-2 w-3/4 self-center">
                    <div class="h-5 w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded"></div>
                    <div class="h-5 w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded"></div>
                    <div v-if="block.type === 'register'" class="h-5 w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded"></div>
                    <div class="h-5 w-full bg-blue-500/20 rounded mt-1"></div>
                 </div>
              </template>

              <!-- Dashboard Template -->
              <template v-else-if="block.type === 'dashboard'">
                 <div class="flex gap-2 h-full">
                   <div class="w-8 h-full bg-slate-200 dark:bg-white/5 rounded-l"></div>
                   <div class="flex-1 space-y-2 py-1 pr-1">
                      <div class="flex justify-between mb-2">
                        <div class="h-2 w-1/3 bg-slate-200 dark:bg-white/10 rounded"></div>
                        <div class="h-2 w-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                      </div>
                      <div class="grid grid-cols-2 gap-1.5">
                         <div class="h-8 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/5"></div>
                         <div class="h-8 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/5"></div>
                         <div class="h-8 col-span-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/5"></div>
                      </div>
                   </div>
                 </div>
              </template>

               <!-- List / Table Template -->
              <template v-else-if="block.type === 'list'">
                 <div class="space-y-1.5">
                    <div class="flex justify-between items-center mb-2">
                       <div class="h-2 w-1/4 bg-slate-200 dark:bg-white/10 rounded"></div>
                       <div class="h-4 w-12 bg-blue-500/20 rounded"></div>
                    </div>
                    <div class="h-4 w-full bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center px-1">
                       <div class="w-full h-1 bg-slate-100 dark:bg-white/10 rounded"></div>
                    </div>
                    <div class="h-4 w-full bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center px-1">
                       <div class="w-3/4 h-1 bg-slate-100 dark:bg-white/10 rounded"></div>
                    </div>
                    <div class="h-4 w-full bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center px-1">
                       <div class="w-1/2 h-1 bg-slate-100 dark:bg-white/10 rounded"></div>
                    </div>
                 </div>
              </template>

              <!-- Analytics / Chart Template -->
              <template v-else-if="block.type === 'analytics'">
                 <div class="flex flex-col h-full gap-2">
                    <div class="flex justify-between items-center">
                       <div class="h-2 w-1/3 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                    <div class="flex-1 flex items-end gap-1 px-2 border-l border-b border-slate-200 dark:border-white/10 pb-1">
                       <div class="w-1/5 h-1/3 bg-blue-500/20 rounded-t"></div>
                       <div class="w-1/5 h-2/3 bg-blue-500/40 rounded-t"></div>
                       <div class="w-1/5 h-1/2 bg-blue-500/30 rounded-t"></div>
                       <div class="w-1/5 h-3/4 bg-blue-500/50 rounded-t"></div>
                       <div class="w-1/5 h-full bg-blue-500/60 rounded-t"></div>
                    </div>
                 </div>
              </template>

              <!-- Details Template -->
              <template v-else-if="block.type === 'details'">
                 <div class="flex flex-col gap-3">
                    <div class="h-16 w-full bg-slate-200 dark:bg-white/5 rounded-xl border border-slate-300 dark:border-white/10 flex items-center justify-center">
                       <div class="w-8 h-8 bg-blue-500/10 rounded-lg animate-pulse"></div>
                    </div>
                    <div class="space-y-1.5">
                       <div class="h-2 w-1/2 bg-slate-200 dark:bg-white/10 rounded"></div>
                       <div class="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded"></div>
                       <div class="h-1.5 w-3/4 bg-slate-100 dark:bg-white/5 rounded"></div>
                    </div>
                 </div>
              </template>

              <!-- Settings Template -->
              <template v-else-if="block.type === 'settings'">
                 <div class="space-y-2.5">
                    <div v-for="i in 3" :key="i" class="flex items-center justify-between p-1.5 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                       <div class="h-1.5 w-1/3 bg-slate-200 dark:bg-white/10 rounded"></div>
                       <div class="w-5 h-2.5 bg-blue-500/20 rounded-full flex items-center px-0.5">
                          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full" :class="i === 2 ? 'ml-auto' : ''"></div>
                       </div>
                    </div>
                 </div>
              </template>

              <!-- Payment / Checkout Template -->
              <template v-else-if="block.type === 'payment'">
                 <div class="flex flex-col gap-3 py-1">
                    <div class="h-12 w-full bg-blue-600/5 dark:bg-blue-400/5 border-2 border-dashed border-blue-500/20 rounded-xl flex items-center px-3 gap-3">
                       <div class="w-8 h-5 bg-blue-500/20 rounded"></div>
                       <div class="h-1.5 flex-1 bg-blue-500/10 rounded"></div>
                    </div>
                    <div class="flex justify-between items-center px-1">
                       <div class="h-2 w-1/4 bg-slate-200 dark:bg-white/10 rounded"></div>
                       <div class="h-2 w-1/5 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                    <div class="h-8 w-full bg-blue-500 dark:bg-blue-600 text-[8px] flex items-center justify-center font-black rounded-lg text-white">PROCEED</div>
                 </div>
              </template>

              <!-- Messaging / Inbox Template -->
              <template v-else-if="block.type === 'messaging'">
                 <div class="space-y-2">
                    <div v-for="i in 3" :key="i" class="flex gap-2 items-start opacity-70">
                       <div class="w-6 h-6 bg-slate-200 dark:bg-white/10 rounded-full shrink-0"></div>
                       <div class="flex-1 space-y-1">
                          <div class="h-1.5 w-1/4 bg-slate-300 dark:bg-white/20 rounded"></div>
                          <div class="h-1 w-full bg-slate-100 dark:bg-white/5 rounded"></div>
                       </div>
                    </div>
                 </div>
              </template>

              <!-- Success Template -->
              <template v-else-if="block.type === 'success'">
                 <div class="h-full flex flex-col justify-center items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                       <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                       </svg>
                    </div>
                    <div class="h-2 w-1/3 bg-slate-200 dark:bg-white/10 rounded"></div>
                    <div class="h-6 w-full bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"></div>
                 </div>
              </template>

              <!-- Profile Template -->
              <template v-else-if="block.type === 'profile'">
                 <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
                       <div class="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                       <svg class="w-8 h-8 text-slate-400 dark:text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div class="h-2 w-1/3 bg-slate-200 dark:bg-white/10 rounded"></div>
                    <div class="flex gap-2 w-full mt-1">
                       <div class="h-5 flex-1 bg-blue-500/20 rounded"></div>
                       <div class="h-5 flex-1 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10"></div>
                    </div>
                 </div>
              </template>

              <!-- Search Template -->
              <template v-else-if="block.type === 'search'">
                 <div class="space-y-3">
                    <div class="h-10 w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center px-3 gap-2">
                       <div class="w-3.5 h-3.5 border-2 border-slate-300 dark:border-white/20 rounded-full"></div>
                       <div class="h-1.5 w-1/4 bg-slate-100 dark:bg-white/10 rounded"></div>
                    </div>
                    <div v-for="i in 2" :key="i" class="flex gap-3 items-center opacity-60">
                       <div class="w-8 h-8 bg-slate-200 dark:bg-white/5 rounded-lg"></div>
                       <div class="flex-1 space-y-1.5">
                          <div class="h-1.5 w-1/3 bg-slate-300 dark:bg-white/20 rounded"></div>
                          <div class="h-1 w-1/2 bg-slate-100 dark:bg-white/10 rounded"></div>
                       </div>
                    </div>
                 </div>
              </template>

              <!-- Calendar Template -->
              <template v-else-if="block.type === 'calendar'">
                 <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-center mb-1">
                       <div class="h-2 w-1/4 bg-slate-200 dark:bg-white/10 rounded"></div>
                       <div class="flex gap-1"><div class="w-2 h-2 bg-slate-200 dark:bg-white/10 rounded"></div><div class="w-2 h-2 bg-slate-200 dark:bg-white/10 rounded"></div></div>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center">
                       <div v-for="i in 21" :key="i" class="aspect-square bg-slate-50 dark:bg-white/[0.03] rounded-md flex items-center justify-center border border-slate-100 dark:border-white/5">
                          <div v-if="[4, 12, 18].includes(i)" class="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_4px_rgba(59,130,246,0.5)]"></div>
                       </div>
                    </div>
                 </div>
              </template>

              <!-- Map Template -->
              <template v-else-if="block.type === 'map'">
                 <div class="h-full relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(59,130,246,0.05)_100%)]"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-500 animate-bounce">
                       <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    </div>
                    <div class="absolute bottom-2 left-2 right-2 h-6 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-lg flex items-center px-2">
                       <div class="h-1 w-1/2 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                 </div>
              </template>

              <!-- Activity Feed Template -->
              <template v-else-if="block.type === 'feed'">
                 <div class="space-y-4">
                    <div v-for="i in 3" :key="i" class="relative pl-4 border-l border-slate-200 dark:border-white/10">
                       <div class="absolute left-[-4.5px] top-0 w-2 h-2 rounded-full border border-blue-500 bg-white dark:bg-black"></div>
                       <div class="space-y-1">
                          <div class="h-1.5 w-1/4 bg-slate-200 dark:bg-white/10 rounded"></div>
                          <div class="h-1 w-3/4 bg-slate-100 dark:bg-white/5 rounded"></div>
                       </div>
                    </div>
                 </div>
              </template>

              <!-- File Upload Template -->
              <template v-else-if="block.type === 'upload'">
                 <div class="h-full border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div class="w-8 h-8 text-blue-500/50"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg></div>
                    <div class="h-1.5 w-1/3 bg-slate-300 dark:bg-white/10 rounded"></div>
                 </div>
              </template>

              <!-- Modal Template -->
              <template v-else-if="block.type === 'modal'">
                 <div class="h-full relative flex items-center justify-center">
                    <div class="absolute inset-0 bg-slate-900/10 dark:bg-black/40 blur-[2px] rounded-lg"></div>
                    <div class="relative w-4/5 h-3/4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-xl shadow-2xl flex flex-col p-2">
                       <div class="h-2 w-1/2 bg-blue-500/20 rounded mb-2"></div>
                       <div class="flex-1 space-y-1">
                          <div class="h-1 w-full bg-slate-100 dark:bg-white/5 rounded"></div>
                          <div class="h-1 w-3/4 bg-slate-100 dark:bg-white/5 rounded"></div>
                       </div>
                       <div class="h-4 w-full bg-blue-500/20 rounded mt-2"></div>
                    </div>
                 </div>
              </template>

              <!-- Pricing Template -->
              <template v-else-if="block.type === 'pricing'">
                 <div class="flex gap-2 h-full">
                    <div v-for="i in 2" :key="i" class="flex-1 border border-slate-200 dark:border-white/10 rounded-lg p-2 flex flex-col gap-2" :class="i===2 ? 'bg-blue-500/5 border-blue-500/30' : ''">
                       <div class="h-1.5 w-1/2 bg-slate-300 dark:bg-white/10 rounded"></div>
                       <div class="h-4 w-3/4 bg-slate-400 dark:bg-white/20 rounded"></div>
                       <div class="space-y-1 mt-auto">
                          <div class="h-1 w-full bg-slate-100 dark:bg-white/5 rounded"></div>
                          <div class="h-1 w-full bg-slate-100 dark:bg-white/5 rounded"></div>
                       </div>
                    </div>
                 </div>
              </template>

              <!-- FAQ Template -->
              <template v-else-if="block.type === 'faq'">
                 <div class="space-y-2">
                    <div v-for="i in 3" :key="i" class="p-2 border border-slate-100 dark:border-white/5 rounded-lg flex justify-between items-center bg-white dark:bg-white/[0.02]">
                       <div class="h-1.5 w-3/4 bg-slate-300 dark:bg-white/10 rounded"></div>
                       <div class="w-2 h-2 border-r border-b border-slate-400 dark:border-white/20 rotate-45 mb-1"></div>
                    </div>
                 </div>
              </template>

              <!-- Verification Template -->
              <template v-else-if="block.type === 'verify'">
                 <div class="h-full flex flex-col justify-center items-center gap-4">
                    <div class="flex gap-2">
                       <div v-for="i in 4" :key="i" class="w-8 h-10 border-2 border-slate-200 dark:border-white/10 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center">
                          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                       </div>
                    </div>
                    <div class="h-1.5 w-1/2 bg-slate-200 dark:bg-white/10 rounded"></div>
                 </div>
              </template>

              <!-- Stats Card Template -->
              <template v-else-if="block.type === 'stats'">
                 <div class="flex flex-col gap-2 justify-center h-full">
                    <div class="h-1.5 w-1/3 bg-slate-400 dark:bg-white/20 rounded"></div>
                    <div class="text-xl font-black text-slate-800 dark:text-blue-400">84.2%</div>
                    <div class="flex items-center gap-1.5">
                       <div class="w-3 h-3 text-green-500"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V14a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z"/></svg></div>
                       <div class="h-1 w-1/4 bg-green-500/20 rounded"></div>
                    </div>
                 </div>
              </template>

              <!-- Media Player Template -->
              <template v-else-if="block.type === 'media'">
                 <div class="h-full relative overflow-hidden rounded-xl bg-slate-900 group/player">
                    <div class="absolute inset-0 flex items-center justify-center">
                       <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-110">
                          <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3a.5.5 0 00-.5.5v13a.5.5 0 00.74.433l11-6.5a.5.5 0 000-.866l-11-6.5A.5.5 0 004.5 3z"/></svg>
                       </div>
                    </div>
                    <div class="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full overflow-hidden">
                       <div class="h-full w-1/3 bg-blue-500"></div>
                    </div>
                 </div>
              </template>

              <!-- Terminal Template -->
              <template v-else-if="block.type === 'terminal'">
                 <div class="h-full bg-slate-950 rounded-xl p-3 font-mono text-[6px] text-green-500/80 leading-tight border border-white/5">
                    <div class="flex gap-1 mb-2">
                       <div class="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                       <div class="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                       <div class="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <div>> INITIALIZING CORE...</div>
                    <div class="text-blue-400">> RECENT LOGS LOADED</div>
                    <div class="animate-pulse">> _</div>
                 </div>
              </template>

              <!-- Invoice Template -->
              <template v-else-if="block.type === 'invoice'">
                 <div class="flex flex-col gap-2 py-1">
                    <div class="flex justify-between items-center mb-1">
                       <div class="h-2 w-1/4 bg-slate-400 dark:bg-white/20 rounded"></div>
                       <div class="h-1.5 w-1/5 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                    <div v-for="i in 3" :key="i" class="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1">
                       <div class="h-1 w-1/2 bg-slate-100 dark:bg-white/5 rounded"></div>
                       <div class="h-1 w-4 bg-slate-100 dark:bg-white/5 rounded"></div>
                    </div>
                    <div class="flex justify-between items-center mt-auto pt-1">
                       <div class="h-2 w-1/4 bg-blue-500/20 rounded"></div>
                       <div class="h-3 w-1/3 bg-blue-500/10 rounded"></div>
                    </div>
                 </div>
              </template>

              <!-- Maintenance Template -->
              <template v-else-if="block.type === 'maintenance'">
                 <div class="h-full flex flex-col justify-center items-center gap-3">
                    <div class="relative">
                       <div class="w-10 h-10 text-yellow-500/50 animate-spin-slow">
                          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       </div>
                    </div>
                    <div class="h-1.5 w-1/2 bg-yellow-500/20 rounded"></div>
                 </div>
              </template>

              <!-- Default Fallback -->
              <template v-else>
                 <div class="h-full flex flex-col justify-center items-center opacity-30">
                    <div class="w-8 h-1.5 bg-slate-400 dark:bg-white/20 rounded mb-1"></div>
                    <div class="w-12 h-1.5 bg-slate-400 dark:bg-white/20 rounded mb-1"></div>
                 </div>
              </template>
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

const props = defineProps(['block', 'isSelected', 'zoomLevel']);
const emit = defineEmits(['update', 'select', 'delete', 'port-mousedown', 'port-mouseup']);

const nodeRef = ref(null);

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
