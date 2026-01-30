import { createApp } from 'vue'
import '../assets/style.css'

const App = {
  template: `
    <div class="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-2xl text-center">
        <h1 class="text-4xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
          Vue + Tailwind
        </h1>
        <p class="text-emerald-200/60 mb-6">
          This project is running with Vue 3 and Tailwind.
        </p>
        <button 
          @click="count++"
          class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-full font-bold"
        >
          Count is: {{ count }}
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      count: 0
    }
  }
}

createApp(App).mount('#app')
