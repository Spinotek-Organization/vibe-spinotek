<template>
  <div 
    class="flex-1 relative bg-slate-50 dark:bg-[#050505] overflow-hidden select-none transition-colors duration-300 overscroll-behavior-none"
    style="overscroll-behavior: none;"
    @dragover.prevent
    @drop="handleDrop"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @wheel="handleWheel"
    @click="selectedBlockId = null"
  >
    <!-- Zoomable Container -->
    <div 
      class="absolute inset-0 origin-top-left"
      :style="{ 
        transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
        willChange: 'transform'
      }"
    >
        <!-- High-Tech Holographic Grid -->
        <div class="absolute pointer-events-none transition-opacity duration-1000" 
             :style="{ 
                 backgroundImage: `
                    linear-gradient(to right, rgba(148, 163, 184, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(148, 163, 184, 0.03) 1px, transparent 1px),
                    linear-gradient(to right, rgba(59, 130, 246, 0.01) 2px, transparent 2px),
                    linear-gradient(to bottom, rgba(59, 130, 246, 0.01) 2px, transparent 2px)
                 `, 
                 backgroundSize: '24px 24px, 24px 24px, 120px 120px, 120px 120px',
                 width: '10000px', height: '10000px',
                 left: '-5000px', top: '-5000px'
             }">
        </div>

        <!-- SVG Layer for Connections -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
          <!-- Active Drawing Line -->
          <path 
            v-if="drawingConnection"
            :d="getDrawingPath()"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2.5"
            stroke-dasharray="8,8"
            class="animate-dash filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] pointer-events-none"
          />

          <!-- Existing Connections -->
          <g v-for="conn in connections" :key="conn.id" class="group/line cursor-pointer pointer-events-auto">
            <!-- Invisible wide path for easier hover selection -->
            <path 
              v-if="getLineCoords(conn)"
              :d="getLinePath(conn)"
              fill="none"
              stroke="transparent" 
              stroke-width="24"
              class="pointer-events-auto"
              @click.stop="$emit('delete-connection', conn.id)"
            />
            
            <!-- Glow Layer -->
            <path 
              v-if="getLineCoords(conn)"
              :d="getLinePath(conn)"
              fill="none"
              stroke="#3b82f6" 
              stroke-width="4"
              class="opacity-0 group-hover/line:opacity-20 transition-opacity blur-[4px]"
            />

            <!-- Visible Line -->
            <path 
              v-if="getLineCoords(conn)"
              :d="getLinePath(conn)"
              fill="none"
              stroke="#94a3b8" 
              stroke-width="2"
              class="pointer-events-auto dark:stroke-slate-500 transition-colors group-hover/line:stroke-blue-500 group-hover/line:stroke-opacity-100"
            />

            <!-- Connection Points -->
            <circle 
              v-if="getLineCoords(conn)" 
              :cx="getLineCoords(conn).end.x" 
              :cy="getLineCoords(conn).end.y" 
              r="4" 
              class="fill-blue-500 filter drop-shadow-[0_0_4px_rgba(59,130,246,0.8)] transition-transform duration-300 group-hover/line:scale-125"
            />
            
            <!-- Delete Icon at Midpoint (Only visible on hover) -->
            <foreignObject
              v-if="getLineCoords(conn)"
              :x="getMidPoint(conn).x - 16" 
              :y="getMidPoint(conn).y - 16" 
              width="32" 
              height="32"
              class="opacity-0 group-hover/line:opacity-100 transition-all duration-300 scale-75 group-hover/line:scale-100 pointer-events-auto"
            >
              <div 
                 xmlns="http://www.w3.org/1999/xhtml" 
                 class="w-8 h-8 bg-white dark:bg-black border-2 border-red-500 rounded-xl flex items-center justify-center text-red-500 shadow-2xl hover:bg-red-500 hover:text-white transition-all cursor-pointer group/delete"
                 @click.stop="$emit('delete-connection', conn.id)"
                 @mousedown.stop
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </div>
            </foreignObject>
          </g>
        </svg>

        <!-- Block Layer -->
        <div class="absolute inset-0 z-10">
          <Block 
            v-for="block in blocks" 
            :key="block.id"
            :block="block"
            :is-selected="selectedBlockId === block.id"
            :zoom-level="zoomLevel"
            @update="updateBlock"
            @select="selectedBlockId = $event"
            @delete="$emit('delete-block', $event)"
            @port-mousedown="handlePortMouseDown"
            @port-mouseup="handlePortMouseUp"
          />
        </div>
    </div>

    <!-- Fancy Zoom Controls -->
    <div class="absolute bottom-10 left-10 z-50 flex flex-col gap-3 p-2 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
       <button @click="zoomIn" class="w-10 h-10 flex items-center justify-center hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl text-slate-600 dark:text-white/60 hover:text-blue-500 transition-all active:scale-90" title="Zoom In">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
       </button>
       <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>
       <button @click="zoomOut" class="w-10 h-10 flex items-center justify-center hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl text-slate-600 dark:text-white/60 hover:text-blue-500 transition-all active:scale-90" title="Zoom Out">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"></path></svg>
       </button>
       <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>
        <button @click="resetZoom" class="w-10 h-10 flex items-center justify-center hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl text-slate-900 dark:text-white transition-all active:scale-90" title="Reset (100%)">
          <span class="text-[10px] font-black">{{ Math.round(zoomLevel * 100) }}%</span>
       </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import Block from './Block.vue';

const props = defineProps(['blocks', 'connections', 'selectedBlockId']);
const emit = defineEmits(['update-block', 'add-connection', 'delete-block', 'update-selected-id', 'add-block-dropped', 'delete-connection']);

const selectedBlockId = computed({
  get: () => props.selectedBlockId,
  set: (val) => emit('update-selected-id', val)
});

const zoomLevel = ref(1);
const panOffset = reactive({ x: 0, y: 0 });
const mousePosition = reactive({ x: 0, y: 0 });

const handleWheel = (e) => {
    // If we are over an element that should scroll internally (like a textarea), don't pan
    if (e.target.closest('textarea, .no-pan')) return;
    
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
        // Zoom
        const zoomSensitivity = 0.0015;
        const delta = -e.deltaY * zoomSensitivity;
        const newZoom = Math.min(Math.max(zoomLevel.value + delta, 0.1), 3);
        zoomLevel.value = newZoom;
    } else {
        // Pan - Now 1:1 because translate is applied before scale in CSS
        // This removes the 'heavy' feeling and makes trackpad natural
        panOffset.x -= e.deltaX;
        panOffset.y -= e.deltaY;
    }
}

const zoomIn = () => {
    zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3);
};

const zoomOut = () => {
    zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1);
};

const resetZoom = () => {
    zoomLevel.value = 1;
    panOffset.x = 0;
    panOffset.y = 0;
};

// Drawing connection state: { sourceId, sourcePort: 'top'|'right'|'bottom'|'left', startX, startY }
const drawingConnection = ref(null);

const handleDrop = (e) => {
  const type = e.dataTransfer.getData('application/spinotek-block');
  if (type) {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewX = e.clientX - rect.left;
    const viewY = e.clientY - rect.top;
    
    // New Math: View = (Canvas * Zoom) + Pan
    // Canvas = (View - Pan) / Zoom
    const x = ((viewX - panOffset.x) / zoomLevel.value) - 140; 
    const y = ((viewY - panOffset.y) / zoomLevel.value) - 100;
    
    emit('add-block-dropped', { type, x, y });
  }
};

const handleMouseMove = (e) => {
  if (!drawingConnection.value) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const viewX = e.clientX - rect.left;
  const viewY = e.clientY - rect.top;
  
  // Math for mousePosition: Canvas = (View - Pan) / Zoom
  mousePosition.x = (viewX - panOffset.x) / zoomLevel.value;
  mousePosition.y = (viewY - panOffset.y) / zoomLevel.value;
};

const handleMouseUp = (e) => {
  if (drawingConnection.value) {
      setupConnectionDrop(e);
  }
};

// Start dragging from a port
const handlePortMouseDown = ({ id, port, x, y }) => {
  drawingConnection.value = { 
    sourceId: id, 
    sourcePort: port, 
    startX: x, 
    startY: y 
  };
};

// Drop on a target port
const handlePortMouseUp = () => {
  if (!drawingConnection.value) return;

  // Use elementFromPoint to see if we dropped on a port handle
  // Since the SVG is pointer-events-none, we hit the DOM elements below
  // We need the mouse coordinates from the event that triggered this or current global mouse?
  // Since this is triggered by the window mouseup listener (managed by CanvasArea template @mouseup),
  // we can use the last known mousePosition relative to viewport or client?
  // Actually, 'mousePosition' is relative to canvas. We need clientX/Y for elementFromPoint.
  // But we only have canvas-relative mousePosition in state.
  // Let's change strategy: Update mousePosition to include clientX/Y in 'handleMouseMove'
  // Or: Add a global window listener for mouseup? 
  // Easier: The 'handleMouseUp' is triggered on the div.
  // Wait, if we release mouse OVER a port, the port element should receive the event if it has pointer-events.
  // But we are drawing an SVG line on top? No, SVG is pointer-events-none.
  
  // Let's use the 'elementFromPoint' strategy with the last event if possible? 
  // We don't have the event object here in this function scope easily unless passed.
  // Let's pass the event to handleMouseUp (which is called by @mouseup).

  // NEW STRATEGY:
  // The User drags from a source port. We are tracking 'drawingConnection'.
  // When they mouseup, we check what is under the cursor.
  // We need to pass the event to handleMouseUp.
};

const setupConnectionDrop = (e) => {
    // Check if we dropped on a port-handle
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.closest('.port-handle')) {
        const portEl = el.closest('.port-handle');
        const targetId = portEl.dataset.blockId;
        const targetPort = portEl.dataset.port;
        
        if (targetId && targetId !== drawingConnection.value.sourceId) {
            emit('add-connection', { 
                from: drawingConnection.value.sourceId, 
                fromPort: drawingConnection.value.sourcePort,
                to: targetId, 
                toPort: targetPort
            });
        }
    }
    drawingConnection.value = null;
    drawingConnection.refId = null;
}

const updateBlock = (payload) => {
  emit('update-block', payload);
};

// --- Geometry Helpers ---

const getPortOffset = (block, port) => {
  if (!block) return { x: 0, y: 0 };
  const w = block.width;
  const h = block.height;

  let px = 0, py = 0;
  if(port === 'top') { px = w/2; py = 0; }
  else if(port === 'right') { px = w; py = h/2; }
  else if(port === 'bottom') { px = w/2; py = h; }
  else if(port === 'left') { px = 0; py = h/2; }

  return { x: block.x + px, y: block.y + py };
};

const getLineCoords = (conn) => {
  const from = props.blocks.find(b => b.id === conn.from);
  const to = props.blocks.find(b => b.id === conn.to);
  if (!from || !to) return null;

  const start = getPortOffset(from, conn.fromPort || 'bottom');
  const end = getPortOffset(to, conn.toPort || 'top'); // default fallback if needed

  return { start, end, fromPort: conn.fromPort || 'bottom', toPort: conn.toPort || 'top' };
};

const getControlPoint = (x, y, port) => {
  const dist = 60; // Curve strength
  if (port === 'top') return { x, y: y - dist };
  if (port === 'bottom') return { x, y: y + dist };
  if (port === 'left') return { x: x - dist, y };
  if (port === 'right') return { x: x + dist, y };
  return { x, y };
}

const getLinePath = (conn) => {
  const c = getLineCoords(conn);
  const cp1 = getControlPoint(c.start.x, c.start.y, c.fromPort);
  const cp2 = getControlPoint(c.end.x, c.end.y, c.toPort);
  return `M ${c.start.x} ${c.start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${c.end.x} ${c.end.y}`;
};

const getMidPoint = (conn) => {
  const c = getLineCoords(conn);
  // Simple midpoint approximation (Linear)
  // For Bezier it's more complex (t=0.5), but linear is usually 'good enough' to place a badge near the center visually unless curve is extreme
  // Let's try to be slightly smarter: average of start, end, and control points?
  // Actually, cubic bezier at t=0.5 is: (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
  const t = 0.5;
  const p0 = c.start;
  const p3 = c.end;
  const p1 = getControlPoint(p0.x, p0.y, c.fromPort);
  const p2 = getControlPoint(p3.x, p3.y, c.toPort);

  const x = Math.pow(1-t, 3)*p0.x + 3*Math.pow(1-t, 2)*t*p1.x + 3*(1-t)*Math.pow(t, 2)*p2.x + Math.pow(t, 3)*p3.x;
  const y = Math.pow(1-t, 3)*p0.y + 3*Math.pow(1-t, 2)*t*p1.y + 3*(1-t)*Math.pow(t, 2)*p2.y + Math.pow(t, 3)*p3.y;
  
  return { x, y };
};

const getDrawingPath = () => {
  if (!drawingConnection.value) return '';
  const start = { x: drawingConnection.value.startX, y: drawingConnection.value.startY };
  const end = { x: mousePosition.x, y: mousePosition.y };
  
  const cp1 = getControlPoint(start.x, start.y, drawingConnection.value.sourcePort);
  
  // Dynamic CP2 based on mouse direction closer to end? 
  // For free drawing, we just make it a simple curve from start port 
  const cp2 = { x: end.x, y: end.y }; 

  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
};
</script>

<style scoped>
.animate-dash {
  animation: dash 0.5s linear infinite;
}
@keyframes dash {
  from { stroke-dashoffset: 10; }
  to { stroke-dashoffset: 0; }
}
</style>
