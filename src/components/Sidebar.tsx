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
    <aside className={`${isCollapsed ? "w-20" : "w-64"} glass-sidebar h-screen fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:self-start flex flex-col p-4 z-30 relative transition-all duration-300`}>
      <div className={`relative mb-8 flex flex-col ${isCollapsed ? "items-center gap-3" : "gap-3 px-2"}`}>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3"} rounded-lg transition-all hover:bg-[var(--bg-elevated)] active:scale-95`}
          title="Return to Dashboard"
        >
          <div className={`${isCollapsed ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-lg"} bg-[var(--accent-primary)] flex items-center justify-center shadow-none`}>
            <GraduationCap className={`text-white ${isCollapsed ? "w-5 h-5" : "w-6 h-6"}`} />
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

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`sidebar-nav-item w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"} py-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-[var(--bg-elevated)] text-[var(--accent-primary)] border-[var(--border-main)]" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] border-transparent"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`sidebar-nav-icon w-5 h-5 transition-transform ${isActive ? "text-[var(--accent-primary)]" : ""}`} />
              {!isCollapsed && <span className="sidebar-nav-label text-sm font-medium">{item.label}</span>}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
              )}
            </button>
          );
        })}
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
