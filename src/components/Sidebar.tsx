import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  FileText, 
  Trash2,
  Share2, 
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
  Sparkles,
  Scan,
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
  { id: "preparation", label: "Preparation Mode", icon: Sparkles },
  { id: "shared-notes", label: "Sharing Room", icon: Share2 },
  { id: "toolkit", label: "Note Toolkit", icon: Wand2 },
  { id: "ask", label: "Ask Your Notes", icon: MessageSquareText },
  { id: "graph", label: "Knowledge Graph", icon: Network },
  { id: "trash", label: "Trash Bin", icon: Trash2 },
];

export function Sidebar({ activeTab, setActiveTab, isCollapsed, onToggleCollapse, onBuyPlan, isMobileScreen }: SidebarProps) {
  const isHolmesActive = activeTab === "holmes-scanner";

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} glass-sidebar h-screen fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:self-start flex flex-col p-4 z-50 relative transition-all duration-300`}>
      <div className={`relative mb-8 flex flex-col ${isCollapsed ? "items-center gap-3" : "gap-3 px-2"}`}>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="w-full flex items-center gap-3 rounded-lg transition-all hover:bg-[var(--bg-elevated)] active:scale-95"
          title="Return to Dashboard"
        >
          <div className={`${isCollapsed ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-lg"} bg-[var(--accent-primary)] flex items-center justify-center shadow-none`}>
            <GraduationCap className={`sidebar-logo-icon !text-white !fill-white !stroke-white ${isCollapsed ? "w-5 h-5" : "w-6 h-6"}`} />
          </div>
          {!isCollapsed && <span className="font-semibold text-[var(--text-main)]">Note Sphere</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className={`${isCollapsed ? "static" : "absolute right-2 top-0"} inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all hover:text-[var(--text-main)]`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="relative flex-1 space-y-0.5 overflow-y-auto pr-1 sidebar-scroll">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPreparation = item.id === "preparation";

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`sidebar-nav-item w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"} py-2 rounded-lg transition-all duration-200 ${
                isPreparation
                  ? isActive
                    ? "bg-gradient-to-r from-pink-600 via-fuchsia-600 to-amber-500 text-white font-bold border border-fuchsia-400/40 shadow-[0_10px_25px_rgba(217,70,239,0.3)]"
                    : "sidebar-preparation border border-fuchsia-500/25 text-fuchsia-300 hover:border-fuchsia-400 hover:bg-gradient-to-r hover:from-fuchsia-500/20 hover:to-pink-500/10 font-medium"
                  : isActive 
                    ? "bg-[var(--bg-elevated)] text-[var(--accent-primary)] border-[var(--border-main)]" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] border-transparent"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`sidebar-nav-icon w-5 h-5 transition-transform ${isPreparation ? (isActive ? "text-white" : "text-fuchsia-400") : isActive ? "text-[var(--accent-primary)]" : ""}`} />
              {!isCollapsed && <span className="sidebar-nav-label text-sm font-medium">{item.label}</span>}
              {isActive && !isCollapsed && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isPreparation ? "bg-amber-300 animate-pulse" : "bg-[var(--accent-primary)]"}`} />
              )}
            </button>
          );
        })}

        {/* Separated & Vivid-Colored Special Holmes Scanner Menu Option right after Trash Bin */}
        <div className="pt-2.5 mt-2.5 border-t border-[var(--border-main)]/40">
          <button
            onClick={() => setActiveTab("holmes-scanner")}
            className={`sidebar-nav-item w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"} py-2.5 rounded-lg transition-all duration-300 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold border border-cyan-400/40 shadow-[0_5px_22px_rgba(6,182,212,0.35)] hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 hover:scale-[1.01]`}
            title={isCollapsed ? "Holmes Scanner" : undefined}
          >
            <Scan className={`sidebar-nav-icon sidebar-holmes-icon !text-white !fill-white !stroke-white w-5 h-5 transition-transform ${isHolmesActive ? "scale-110" : ""}`} />
            {!isCollapsed && (
              <span className="sidebar-nav-label text-sm font-bold tracking-wide flex items-center gap-1.5 !text-white">
                Holmes Scanner
                <span className="shrink-0 flex h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_8px_#22d3ee]" />
              </span>
            )}
            {isHolmesActive && !isCollapsed && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>
        </div>
      </nav>

      <div className="relative mt-auto pt-4 border-t border-[var(--border-main)]">
        <button
          onClick={onBuyPlan}
          className="glass-card w-full p-4 flex items-center gap-3.5 bg-[var(--bg-elevated)] border border-[var(--border-main)] text-left transition-all hover:bg-[var(--bg-card)] active:scale-95 rounded-lg"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-xs font-semibold text-[var(--text-main)] leading-snug">Upgrade</p>
              <p className="text-[10px] text-[var(--text-dim)] leading-snug">Premium features</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
