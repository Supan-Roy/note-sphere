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
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Crown,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onBuyPlan: () => void;
  isMobileScreen?: boolean;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "semester", label: "Manage Semesters", icon: GraduationCap },
  { id: "tasks", label: "My Tasks", icon: Library },
  { id: "my-notes", label: "My Notes", icon: FileText },
  { id: "shared-notes", label: "Sharing Room", icon: Share2 },
  { id: "upload", label: "Upload Center", icon: UploadCloud },
  { id: "toolkit", label: "Note Toolkit", icon: Wand2 },
  { id: "ask", label: "Ask Your Notes", icon: MessageSquareText },
  { id: "graph", label: "Knowledge Graph", icon: Network },
];

export function Sidebar({ activeTab, setActiveTab, isCollapsed, onToggleCollapse, onBuyPlan, isMobileScreen }: SidebarProps) {
  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} glass-sidebar h-screen fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:self-start flex flex-col p-4 z-30 relative overflow-hidden transition-all duration-300`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-violet-500/10" />
      <div className={`relative mb-10 flex flex-col ${isCollapsed ? "items-center gap-3" : "gap-3 px-2"}`}>
        <div className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3"}`}>
          <div className={`${isCollapsed ? "h-9 w-9 rounded-2xl" : "h-10 w-10 rounded-2xl"} sidebar-brand-icon bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/30 ring-1 ring-white/10`}>
            <GraduationCap className={`sidebar-brand-icon-symbol text-white ${isCollapsed ? "w-5 h-5" : "w-6 h-6"}`} />
          </div>
          {!isCollapsed && <span className="whitespace-nowrap text-lg font-bold tracking-tight text-[var(--text-main)] uppercase tracking-[0.14em]">Note Sphere</span>}
        </div>

        <button
          onClick={onToggleCollapse}
          className={`${isCollapsed ? "static" : "absolute right-2 top-0"} inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--text-dim)] transition-all hover:bg-white/10 hover:text-[var(--text-main)]`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="relative flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`sidebar-nav-item w-full flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-2xl transition-all duration-200 group border ${
                isActive 
                  ? "bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-violet-500/15 text-sky-300 border-blue-400/20 shadow-[0_12px_24px_rgba(59,130,246,0.08)]" 
                  : "border-transparent text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--text-main)]"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`sidebar-nav-icon w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              {!isCollapsed && <span className="sidebar-nav-label text-sm font-medium">{item.label}</span>}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`${isCollapsed ? "absolute right-2" : "ml-auto"} w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.55)]`}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative mt-auto pt-6 border-t border-white/5">
        <button
          onClick={onBuyPlan}
          className="glass-card sidebar-buy-card w-full p-3 flex items-center gap-3 bg-white/[0.04] text-left transition-all hover:bg-white/[0.06] hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="sidebar-buy-card-icon w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center border border-white/15 shadow-lg shadow-orange-500/20">
            <Crown className="sidebar-buy-card-icon-symbol w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-main)] truncate">Buy Plan</p>
              <p className="text-[10px] text-[var(--text-dim)] truncate">View pricing and plan details</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
