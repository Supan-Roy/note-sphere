import { Search, Upload, Bell, Zap, ChevronDown, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

export function Topbar({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean, toggleDarkMode: () => void }) {
  return (
    <header className="h-16 glass-sidebar sticky top-0 px-8 flex items-center justify-between z-10 transition-colors">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search notes, concepts, or ask a question..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600 text-[var(--text-main)]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-[10px] bg-white/10 text-[var(--text-dim)] px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold">⌘K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
          />
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">AI Ready</span>
        </div>

        <button className="p-2 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-white/5 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[var(--bg-main)]"></span>
        </button>

        <button className="bg-red-600 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-2"></div>

        <button className="flex items-center gap-2 pl-2 pr-1 h-10 hover:bg-white/5 rounded-xl transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
            S
          </div>
          <ChevronDown className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors" />
        </button>
      </div>
    </header>
  );
}
