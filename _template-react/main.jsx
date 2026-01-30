import React from 'react'
import ReactDOM from 'react-dom/client'
import '../assets/style.css' // Using shared styles

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-2xl">
        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          React + Tailwind
        </h1>
        <p className="text-slate-400 mb-6">
          This project is running with React and Tailwind from the root node_modules.
        </p>
        <button 
          onClick={() => alert('React is working!')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded-full font-bold"
        >
          Click Me
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
