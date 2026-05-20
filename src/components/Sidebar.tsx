import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  FileText, 
  Share2, 
  UploadCloud, 
  Wand2, 
  MessageSquareText, 
  Network, 
  Library, 
  Bookmark, 
  User, 
  Settings,
  GraduationCap
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "semester", label: "Semester Builder", icon: GraduationCap },
  { id: "my-notes", label: "My Notes", icon: FileText },
  { id: "shared-notes", label: "Sharing Room", icon: Share2 },
  { id: "upload", label: "Upload Center", icon: UploadCloud },
  { id: "toolkit", label: "AI Study Toolkit", icon: Wand2 },
  { id: "ask", label: "Ask Your Notes", icon: MessageSquareText },
  { id: "graph", label: "Knowledge Graph", icon: Network },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 glass-sidebar h-screen sticky top-0 flex flex-col p-4 z-20">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[var(--text-main)] uppercase tracking-wider">Note Sphere</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                  : "text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--text-main)]"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text-main)] truncate">Academic User</p>
            <p className="text-[10px] text-[var(--text-dim)] truncate">Free Plan • 12 Notes</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
