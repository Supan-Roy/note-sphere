import { useState, useEffect, useRef } from "react";
import { Menu, Search, Upload, Bell, ChevronDown, Sun, Moon, User } from "lucide-react";

export function Topbar({ isDarkMode, toggleDarkMode, onUpload, onToggleSidebar, isSidebarCollapsed, isMobileScreen }: { isDarkMode: boolean, toggleDarkMode: () => void, onUpload: () => void, onToggleSidebar: () => void, isSidebarCollapsed: boolean, isMobileScreen: boolean }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // when profile popover opens, show the testing notice inside it
    if (isProfileOpen) setShowLoginNotice(true);
  }, [isProfileOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!isProfileOpen) return;
      const target = event.target as Node;
      if (profileButtonRef.current?.contains(target)) return;
      if (profileMenuRef.current?.contains(target)) return;
      setIsProfileOpen(false);
      setShowLoginNotice(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isProfileOpen]);
  const currentDateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="min-h-16 glass-sidebar sticky top-0 px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 z-10 transition-colors relative overflow-visible">
      <div
        className={`pointer-events-none absolute inset-0 ${isDarkMode
          ? "bg-gradient-to-r from-slate-950/70 via-slate-900/50 to-slate-950/70"
          : "bg-gradient-to-r from-white/85 via-white/75 to-slate-50/90"
        }`}
      />
      <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-3 lg:max-w-4xl">
        {!isMobileScreen && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--text-dim)] transition-all hover:bg-white/10 hover:text-[var(--text-main)]"
            aria-label={isSidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="relative group z-10 flex min-w-0 flex-1 basis-full sm:basis-auto max-w-none lg:max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] group-focus-within:text-indigo-300 transition-colors" />
          <input 
            type="text" 
            placeholder="Search notes, concepts, or ask a question..." 
            className="w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/40 transition-all"
          />
        </div>

        <div className={`hidden lg:flex min-w-[220px] items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${isDarkMode ? "text-white" : "text-black"}`} style={{color: isDarkMode ? '#ffffff' : '#000000'}}>
          <span className="font-semibold" aria-hidden>{currentDateLabel}</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 sm:gap-4 ml-auto">
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-[var(--text-dim)] hover:text-blue-300 hover:bg-white/5 rounded-xl transition-all"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-white/5 rounded-xl transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[var(--bg-main)]"></span>
        </button>

        <button onClick={onUpload} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.22)] hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>

        <div className="h-4 w-px bg-[var(--border-main)] mx-2"></div>

        {/* notice moved inside profile popover */}

        <button
          ref={profileButtonRef}
          onClick={() => setIsProfileOpen((value) => !value)}
          className="flex items-center gap-2 rounded-2xl pl-2 pr-1 h-10 hover:bg-white/5 transition-colors group border border-white/5 bg-white/[0.03]"
          aria-expanded={isProfileOpen}
          aria-label="View profile"
        >
          <img
            src="https://www.supanroy.com/Supan%20-%20Profile%20Main.jpg"
            alt="Supan Roy"
            className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-lg shadow-indigo-500/20"
          />
          <div className="hidden xl:flex flex-col items-start leading-tight pr-1">
            <span className="text-xs font-semibold text-[var(--text-main)]">View Profile</span>
            <span className="text-[10px] text-[var(--text-dim)]">Supan Roy</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-transform ${isProfileOpen ? "rotate-180" : "rotate-0"}`} />
        </button>

        {isProfileOpen && (
          <div ref={profileMenuRef} className="absolute right-0 top-full mt-3 w-[290px] rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.42)] z-50">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20 overflow-hidden bg-white/10">
                <img src="https://www.supanroy.com/Supan%20-%20Profile%20Main.jpg" alt="Supan Roy" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Supan Roy</p>
                <p className="text-xs text-blue-100/80">Daffodil International University</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              {!showLoginNotice ? (
                <button onClick={() => setShowLoginNotice(true)} className="w-full flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 text-white hover:bg-white/15 transition-colors">
                  <User className="w-4 h-4 text-indigo-300" />
                  <span>View Profile</span>
                </button>
              ) : (
                <div
                  className="w-full rounded-2xl p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,1), rgba(255,247,237,1))',
                    border: '1px solid rgba(251,191,36,0.35)',
                    color: '#0f172a',
                  }}
                >
                  <p className="text-sm">Signup/login is intentionally not implemented for testing. - Thanks Supan Roy</p>
                  <div className="mt-2 text-right">
                    <button onClick={() => setShowLoginNotice(false)} className="text-xs text-indigo-500 hover:underline">Close</button>
                  </div>
                </div>
              )}

              <p className="px-1 text-xs leading-5 text-[var(--text-dim)]">
                Full name: <span className="text-[var(--text-main)] font-semibold">Supan Roy</span>
                <br />
                Institution: <span className="text-[var(--text-main)] font-semibold">Daffodil International University</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
