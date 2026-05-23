import { useState, useEffect, useRef } from "react";
import { Menu, Search, Bell, ChevronDown, Sun, Moon, User } from "lucide-react";

export function Topbar({ isDarkMode, toggleDarkMode, onToggleSidebar, isSidebarCollapsed, isMobileScreen }: { isDarkMode: boolean, toggleDarkMode: () => void, onToggleSidebar: () => void, isSidebarCollapsed: boolean, isMobileScreen: boolean }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // when profile popover opens, show the testing notice inside it
    if (isProfileOpen) setShowLoginNotice(true);
  }, [isProfileOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedProfile = profileButtonRef.current?.contains(target) || profileMenuRef.current?.contains(target);
      const clickedNotification = notificationButtonRef.current?.contains(target) || notificationMenuRef.current?.contains(target);

      if (isProfileOpen && !clickedProfile) {
        setIsProfileOpen(false);
        setShowLoginNotice(false);
      }

      if (isNotificationsOpen && !clickedNotification) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isProfileOpen, isNotificationsOpen]);
  const currentDateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="glass-sidebar sticky top-0 px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 z-40 transition-colors relative border-b border-[var(--border-main)]">
      <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-3 lg:max-w-4xl">
        {!isMobileScreen && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all hover:text-[var(--text-main)]"
            aria-label={isSidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="relative group z-10 flex min-w-0 flex-1 basis-full sm:basis-auto max-w-none lg:max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input 
            type="text" 
            placeholder="Search notes, concepts, or ask a question..." 
            className="w-full min-w-0 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>

        <div className="hidden lg:flex min-w-[220px] items-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium">
          <span className="text-[var(--text-secondary)]">{currentDateLabel}</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 sm:gap-3 ml-auto">
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          ref={notificationButtonRef}
          onClick={() => {
            setIsNotificationsOpen((value) => !value);
            setIsProfileOpen(false);
            setShowLoginNotice(false);
          }}
          className="p-2 rounded-lg transition-colors relative text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
          aria-expanded={isNotificationsOpen}
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent-primary)]"></span>
        </button>

        {isNotificationsOpen && (
          <div
            ref={notificationMenuRef}
            className="absolute right-[72px] top-full mt-2 w-[280px] rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] z-50 shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-main)] p-4">
              <p className="text-sm font-semibold text-[var(--text-main)]">Notifications</p>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-xs text-[var(--text-dim)] hover:text-[var(--text-secondary)]">
                Close
              </button>
            </div>
            <div className="mt-2 rounded-lg px-4 py-8 text-center text-sm text-[var(--text-dim)]">
              No notifications yet
            </div>
          </div>
        )}

        <div className="h-4 w-px bg-[var(--border-main)] mx-1"></div>

        <button
          ref={profileButtonRef}
          onClick={() => setIsProfileOpen((value) => !value)}
          className="flex items-center gap-2 rounded-lg pl-2 pr-1 h-10 transition-all border border-[var(--border-main)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)]"
          aria-expanded={isProfileOpen}
          aria-label="View profile"
        >
          <img
            src="https://www.supanroy.com/Supan%20-%20Profile%20Main.jpg"
            alt="Supan Roy"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div className="hidden xl:flex flex-col items-start leading-tight pr-1">
            <span className="text-xs font-semibold text-[var(--text-main)]">Profile</span>
            <span className="text-[10px] text-[var(--text-dim)]">Supan Roy</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isProfileOpen ? "rotate-180" : "rotate-0"}`} />
        </button>

        {isProfileOpen && (
          <div
            ref={profileMenuRef}
            className="absolute right-0 top-full mt-2 w-[300px] rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] z-50 shadow-lg"
          >
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border-main)]">
              <img
                src="https://www.supanroy.com/Supan%20-%20Profile%20Main.jpg"
                alt="Supan Roy"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Supan Roy</p>
                <p className="text-xs text-[var(--text-dim)]">Daffodil International University</p>
              </div>
            </div>

            <div className="p-2 space-y-1 text-sm">
              {!showLoginNotice ? (
                <button onClick={() => setShowLoginNotice(true)} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]">
                  <User className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
              ) : (
                <div className={`w-full rounded-xl p-4 border text-sm shadow-lg relative overflow-hidden backdrop-blur-sm transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-amber-950/40 border-amber-500/70 text-amber-100" 
                    : "bg-amber-50 border-amber-400/80 text-amber-950"
                }`}>
                  {/* Tiny decorative glowing blob */}
                  <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full blur-lg pointer-events-none ${
                    isDarkMode ? "bg-amber-500/20" : "bg-amber-400/10"
                  }`} />
                  <div className="flex gap-2.5">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isDarkMode ? "bg-amber-500/30 text-amber-400" : "bg-amber-100 text-amber-700"
                    }`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-[10px] uppercase tracking-[0.2em] mb-1 ${
                        isDarkMode ? "text-amber-400" : "text-amber-700"
                      }`}>Testing Environment</p>
                      <p className={`text-xs leading-relaxed font-semibold ${
                        isDarkMode ? "text-amber-100/95" : "text-amber-900"
                      }`}>
                        Signup/login is intentionally not implemented for testing.
                      </p>
                      <p className={`mt-2 text-xs font-bold ${
                        isDarkMode ? "text-amber-300" : "text-amber-950"
                      }`}>
                        — Thanks, Supan Roy
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => setShowLoginNotice(false)} 
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                        isDarkMode 
                          ? "bg-amber-500/30 text-amber-200 hover:bg-amber-500/40 border border-amber-500/25" 
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200/50"
                      }`}
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              )}

              <button type="button" className="w-full flex items-center justify-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-medium transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]">
                <span>Logout</span>
              </button>

              <p className="px-1 text-xs text-[var(--text-dim)] mt-3">
                Full name: <span className="text-[var(--text-secondary)] font-medium">Supan Roy</span>
                <br />
                Institution: <span className={isDarkMode ? "text-[var(--text-main)] font-semibold" : "text-slate-700 font-semibold"}>Daffodil International University</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
