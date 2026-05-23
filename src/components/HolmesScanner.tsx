import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scan, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  ListTodo, 
  FolderSearch, 
  Share2, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  BookOpen,
  Trash2,
  Calendar,
  Layers,
  SearchCode
} from "lucide-react";
import { Note, Room, Semester, TaskItem, TrashItem } from "../types";

interface HolmesScannerProps {
  notes: Note[];
  tasks: TaskItem[];
  rooms: Room[];
  semesters: Semester[];
  trashItems: TrashItem[];
}

interface ScanResult {
  summary: string;
  markdownResult: string;
  findingsCount: number;
  threatLevel: string;
  recommendations: string[];
}

export function HolmesScanner({ notes, tasks, rooms, semesters, trashItems }: HolmesScannerProps) {
  const [prompt, setPrompt] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const quickPrompts = [
    {
      id: "inventory",
      title: "File Inventory Audit",
      desc: "Categorize all available files & notes",
      query: "Find and catalog all available files, notes, and study objects in my workspace. Count them and list my storage categories.",
      icon: FolderSearch,
      color: "border-sky-500/30 text-sky-400 bg-sky-500/5 hover:bg-sky-500/10"
    },
    {
      id: "entropy",
      title: "High-Entropy Notes",
      desc: "Detect notes needing quality draft improvement",
      query: "Find drafts, empty content, or notes with low completeness/readiness scores that need immediate improvement.",
      icon: AlertTriangle,
      color: "border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
    },
    {
      id: "sharing",
      title: "Room & Shared Analytics",
      desc: "Audit public links and crossroom sharing",
      query: "Which notes are shared across rooms or link shared publicly? Give me a list of rooms and public credentials.",
      icon: Share2,
      color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10"
    },
    {
      id: "tasks",
      title: "Task & Semester Blocker",
      desc: "Highlight due tasks & course files due soon",
      query: "What urgent tasks and course files are due soon? Highlight any blockers or missing materials.",
      icon: Calendar,
      color: "border-teal-500/30 text-teal-400 bg-teal-500/5 hover:bg-teal-500/10"
    },
    {
      id: "readiness",
      title: "Exam Readiness Diagnosis",
      desc: "Subject coverage and readiness evaluation",
      query: "Review all my study materials and tags. Conduct a readiness evaluation and tell me which subjects need more coverage.",
      icon: TrendingUp,
      color: "border-fuchsia-500/30 text-fuchsia-400 bg-[var(--fuchsia-accent)]/5 hover:bg-fuchsia-500/10"
    },
    {
      id: "trash",
      title: "Trash & Expiring Materials",
      desc: "Evaluate list of items about to be deleted",
      query: "Check my trash bin for any materials that are about to expire. Give me a clear warning of what might be lost.",
      icon: Trash2,
      color: "border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10"
    },
  ];

  const handleRunScan = async (queryText: string) => {
    if (!queryText.trim() || isScanning) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    // Dynamic loading animations standard for high-craftsmanship feel
    const steps = [
      "Securing Sherlock's magnifying lens...",
      "Sifting through dust in Note Sphere corridors...",
      "Parsing academic logs & semesters metadata...",
      "Checking Room shares and trash files configuration...",
      "Analyzing note completeness and quality scores...",
      "Deducing final workspace threat assessment indices..."
    ];

    let currentStepIndex = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIndex = (currentStepIndex + 1) % steps.length;
      setLoadingStep(steps[currentStepIndex]);
    }, 1200);

    try {
      // Condense user structures to keep payload small and compliant
      const notesPayload = notes.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        tags: n.tags,
        completenessScore: n.aiAnalysis?.scores?.completeness || 60,
        examReadinessScore: n.aiAnalysis?.scores?.examReadiness || 50,
        isPublic: n.isPublic,
        wordCount: n.content ? n.content.split(/\s+/).length : 0,
        created: n.createdAt
      }));

      const tasksPayload = tasks.map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        notes: t.notes
      }));

      const roomsPayload = rooms.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        sharedNotesCount: r.sharedNotes?.length || 0,
        membersCount: r.members?.length || 0,
        isPublic: r.isPublic
      }));

      const semestersPayload = semesters.map(s => ({
        id: s.id,
        name: s.name,
        courses: s.courses.map(c => ({
          id: c.id,
          name: c.name,
          materialsCount: c.materials?.length || 0
        }))
      }));

      const trashPayload = trashItems.map(t => ({
        id: t.id,
        kind: t.kind,
        title: t.title,
        source: t.source,
        expires: t.expiresAt
      }));

      const response = await fetch("/api/scan-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          notes: notesPayload,
          tasks: tasksPayload,
          rooms: roomsPayload,
          semesters: semestersPayload,
          trashItems: trashPayload
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact Sherlock Holmes workspace scanner service");
      }

      const data = await response.json();
      setScanResult(data);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || "Holmes' magnifying lens encountered an obstruction.");
    } finally {
      clearInterval(interval);
      setIsScanning(false);
    }
  };

  const getThreatColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("exemplary") || l.includes("perfect") || l.includes("organized")) {
      return "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
    }
    if (l.includes("minor") || l.includes("inefficiencies") || l.includes("warning")) {
      return "bg-amber-500/10 border-amber-500/40 text-amber-400";
    }
    if (l.includes("critical") || l.includes("missing") || l.includes("threat")) {
      return "bg-rose-500/10 border-rose-500/40 text-rose-400";
    }
    return "bg-sky-500/10 border-sky-500/40 text-sky-400";
  };

  // Safe custom function to render simple markdown to pretty HTML tags
  const renderMarkdown = (md: string) => {
    if (!md) return null;
    const lines = md.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-bold text-[var(--text-main)] mt-4 mb-2 flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-sky-400 shrink-0" />{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-bold text-[var(--accent-primary)] mt-5 mb-2.5 border-b border-[var(--border-main)]/30 pb-1">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-lg font-black text-[var(--text-main)] mt-6 mb-3">{line.replace("# ", "")}</h2>;
      }
      // Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const text = line.trim().slice(2);
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-3">
            <span className="text-amber-400 font-bold shrink-0 mt-1">•</span>
            <span className="text-xs text-[var(--text-secondary)] leading-relaxed">{renderBoldAndCode(text)}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line.trim())) {
        const num = line.trim().match(/^\d+/)?.[0] || "1";
        const text = line.replace(/^\d+\.\s/, "");
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-3">
            <span className="text-sky-400 font-semibold shrink-0 text-xs mt-0.5">{num}.</span>
            <span className="text-xs text-[var(--text-secondary)] leading-relaxed">{renderBoldAndCode(text)}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard Paragraph
      return (
        <p key={idx} className="text-xs text-[var(--text-secondary)] my-2 leading-relaxed">
          {renderBoldAndCode(line)}
        </p>
      );
    });
  };

  const renderBoldAndCode = (text: string) => {
    // Basic substitution for **bold** and `code` patterns safely
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-[var(--text-main)] font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-pink-400 font-medium">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div id="holmes-scanner-view" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Magnificent Header block with atmospheric detective/radar animations */}
      <header className="relative mb-8 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-36 -top-36 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl items-center justify-center text-white shadow-xl shadow-blue-500/10 border border-cyan-400/25 relative overflow-hidden group">
              <Scan className="w-8 h-8 group-hover:scale-110 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Dynamic radar scanning horizontal bar overlay */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-bounce w-full" style={{ animationDuration: "1.5s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-dim)] font-mono font-semibold">Workspace Diagnostic Engine</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text-main)] mt-1.5 font-sans">
                Holmes Scanner
              </h1>
              <p className="mt-1.5 text-xs text-[var(--text-dim)] max-w-xl leading-relaxed">
                Unlock profound consulting intelligence across your entire study environment. Detect available files, cross-examine room sharing credentials, identify drafting anomalies, and diagnose exam gaps instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto px-4 py-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-elevated)] min-w-[200px]">
            <SearchCode className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">Status Index</p>
              <p className="text-xs font-bold text-[var(--text-main)] mt-0.5">
                {notes.length} Notes • {tasks.length} Active Tasks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Detective Form with the spinning Google-Colors multi-color boundary borders */}
      <section className="mb-8 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 md:p-8 shadow-xl relative overflow-hidden">
        <label htmlFor="scan-prompt-input" className="block text-sm font-bold text-[var(--text-main)] mb-3 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Launch Detective Space Scan
        </label>

        {/* Input box wrap styled with custom spinning active Google gradient wheel always visible */}
        <div className={`relative p-[3px] rounded-xl overflow-hidden transition-all duration-300 ${isInputFocused ? "shadow-2xl shadow-blue-500/10" : "shadow-md"}`}>
          {/* MULTI COLOR GOOGLE COLORS ANIMATION (Full visible always, increased speed as requested!) */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-[400%] aspect-square origin-center z-0 animate-spin"
            style={{ 
              backgroundImage: 'conic-gradient(from 0deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)',
              animationDuration: isScanning ? '0.8s' : isInputFocused ? '1.5s' : '2.5s', // Super charged rapid speeds
              opacity: 1 // Full visible always
            }} 
          />

          {/* Inner container shielding the dynamic spinning wheel */}
          <div className="relative z-10 rounded-[10px] bg-[var(--bg-elevated)] overflow-hidden">
            <textarea
              id="scan-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRunScan(prompt);
                }
              }}
              placeholder="Query Sherlock Holmes on your notes and semesters... (e.g., 'Identify academic files shared and find note drafts needing quality checks')"
              maxLength={600}
              disabled={isScanning}
              className="w-full h-28 bg-transparent p-4 text-sm text-[var(--text-main)] outline-none resize-none border-0 focus:ring-0 focus:outline-none placeholder:text-[var(--text-dim)]/40"
            />
            
            <div className="border-t border-[var(--border-main)]/30 px-4 py-3 bg-[var(--bg-card)]/50 flex justify-between items-center">
              <span className="text-[10px] text-[var(--text-dim)]">Shift+Enter for line break • Enter to trigger</span>
              <button
                onClick={() => handleRunScan(prompt)}
                disabled={isScanning || !prompt.trim()}
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold text-white transition-all duration-300 ${isScanning || !prompt.trim() ? "bg-emerald-600 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/35"}`}
              >
                {isScanning ? (
                  <>
                    <motion.div 
                      className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" 
                    />
                    Deducing Case...
                  </>
                ) : (
                  <>
                    <Scan className="w-3.5 h-3.5" />
                    Inspect Space
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {scanError && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400 font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            {scanError}
          </div>
        )}

        {/* Quick Investigations Section with beautifully colored badges */}
        <div className="mt-8 border-t border-[var(--border-main)]/30 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)] mb-4 block">
            Sherlock's Quick Case Audits
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickPrompts.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPrompt(p.query);
                    handleRunScan(p.query);
                  }}
                  disabled={isScanning}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40 disabled:pointer-events-none ${p.color}`}
                >
                  <div className="p-2 rounded-lg bg-black/10 shrink-0">
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-[var(--text-main)]">{p.title}</p>
                    <p className="text-[10px] text-[var(--text-dim)] leading-tight mt-0.5 line-clamp-2">{p.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic interactive Scan Progress Indicator */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20/40 p-12 text-center shadow-xl flex flex-col items-center justify-center"
          >
            <div className="relative mb-6 h-20 w-20 flex items-center justify-center">
              <Scan className="w-10 h-10 text-cyan-400 animate-pulse z-10" />
              {/* Dynamic radar rings sweeps */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/15 animate-ping" style={{ animationDuration: "1s" }} />
            </div>
            <h3 className="text-lg font-bold text-cyan-100 font-sans tracking-tight">Active Detective Workspace Diagnostics</h3>
            <p className="mt-2 text-xs text-cyan-300/80 max-w-sm h-6">
              {loadingStep}
            </p>
            {/* Styled incremental bar */}
            <div className="mt-5 w-64 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Investigation Results */}
      <AnimatePresence>
        {scanResult && !isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            {/* Diagnostic stats on the right (bento styled) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Threat assessment card */}
              <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg overflow-hidden relative">
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
                
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">Diagnostic Threat Rating</h3>
                <div className={`mt-3 border px-4 py-3 rounded-xl flex items-center gap-3 font-bold text-sm ${getThreatColor(scanResult.threatLevel)}`}>
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>{scanResult.threatLevel}</span>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--border-main)]/30 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-dim)]">Files Verified</span>
                    <p className="text-xl font-extrabold text-[var(--text-main)] mt-0.5">{scanResult.findingsCount} items</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-dim)]">Detective Grade</span>
                    <p className="text-xl font-extrabold text-cyan-400 mt-0.5">Grade A</p>
                  </div>
                </div>
              </div>

              {/* Action recommendations checklist card */}
              <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-4 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Sherlock's Next Actions
                </h3>
                <div className="space-y-3">
                  {scanResult.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2.5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-main)]/50 hover:border-[var(--accent-primary)]/20 transition-all">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed markdown output card */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 md:p-8 shadow-lg overflow-hidden relative">
                <div className="absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

                {/* Lit deductive quote */}
                <div className="border-l-4 border-cyan-500 bg-cyan-500/5 px-4 py-3 rounded-r-xl italic font-serif text-[13px] text-[var(--text-secondary)]/90 leading-relaxed mb-6">
                  “{scanResult.summary}”
                </div>

                {/* Substantive findings */}
                <div id="scanner-markdown-section" className="markdown-body p-1 border border-[var(--border-main)]/30 rounded-xl bg-[var(--bg-elevated)]/30 p-4">
                  {renderMarkdown(scanResult.markdownResult)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
