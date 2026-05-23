import { motion } from "motion/react";
import { 
  LayoutDashboard,
  PenLine,
  LibraryBig,
  Share2,
  UploadCloud,
  Wand2,
  MessageSquareText,
  Network,
  Library,
  FileText,
  Sparkles,
  ArrowRight,
  Trash2,
  Clock3,
  Archive,
} from "lucide-react";
import { NoteCard } from "./NoteCard";
import { Note, TrashItem } from "../types";

const DUMMY_NOTES: Note[] = [
  {
    id: "1",
    title: "Intro to Quantum Computing",
    ownerId: "user1",
    ownerName: "Supan",
    type: "pdf",
    content: "",
    tags: ["Physics", "Computing", "Quantum"],
    isPublic: true,
    aiAnalysis: {
      summary: "An overview of qubit operations, superposition, and entanglement in modern quantum algorithms.",
      keyConcepts: ["Qubits", "Grover's Algorithm", "Entanglement"],
      scores: {
        knowledge: 92,
        readability: 85,
        completeness: 88,
        examReadiness: 95
      },
      missingTopics: ["Shor's Algorithm"]
    },
    likesCount: 24,
    bookmarksCount: 12,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    title: "Advanced Data Structures",
    ownerId: "user1",
    ownerName: "Supan",
    type: "image",
    content: "",
    tags: ["Computer Science", "Algorithms"],
    isPublic: true,
    aiAnalysis: {
      summary: "Comparison of B-Trees vs Red-Black Trees for high-concurrency database systems.",
      keyConcepts: ["Trees", "Optimization", "Indexes"],
      scores: {
        knowledge: 78,
        readability: 92,
        completeness: 70,
        examReadiness: 65
      },
      missingTopics: ["B+ Trees"]
    },
    likesCount: 15,
    bookmarksCount: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function Dashboard({ notes, trashItems = [], onNoteOpen, onChatOpen, onCreateNote, onViewNotes, onNavigate, onDeleteNote, onRestoreTrash, onEmptyTrash, onUploadFiles, onShareNote, title = "Welcome back, Supan" }: { notes: Note[], trashItems?: TrashItem[], onNoteOpen: (note: Note) => void, onChatOpen: (id: string) => void, onCreateNote: () => void, onViewNotes: () => void, onNavigate?: (tab: string) => void, onDeleteNote?: (id: string) => void, onRestoreTrash?: (itemId: string) => void, onEmptyTrash?: () => void, onUploadFiles?: () => void, onShareNote?: (note: Note) => void, title?: string }) {
  // If we have real notes, we only show real ones. 
  // If we have zero notes, we show dummy notes ONLY on the main dashboard overview.
  // In "My Notes", if we have zero, we show an empty state.
  const isMyNotes = title === "My Notes";
  const isTrash = title === "Trash Bin";
  const hasNotes = notes.length > 0;
  const displayNotes = hasNotes ? notes : (isMyNotes ? [] : DUMMY_NOTES);
  if (isTrash) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        <section className="space-y-4">
          <div className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
                  <Trash2 className="h-3.5 w-3.5" />
                  Trash Bin
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">Deleted items</h3>
                <p className="text-sm text-[var(--text-dim)]">Items will be deleted after 30 days automatically.</p>
              </div>
              <button
                onClick={onEmptyTrash}
                disabled={trashItems.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Empty bin
              </button>
            </div>
          </div>

          {trashItems.length === 0 ? (
            <div className="glass-card border-dashed border-[var(--border-main)] p-8 text-center">
              <Archive className="mx-auto h-10 w-10 text-[var(--text-dim)]" />
              <h3 className="mt-4 text-xl font-bold text-[var(--text-main)]">Trash is empty</h3>
              <p className="mt-2 text-[var(--text-dim)]">Deleted notes, files, courses, and semesters will appear here before permanent removal.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {trashItems.map((item) => (
                <div key={item.id} className="glass-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">{item.kind}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--text-main)]">{item.title}</h3>
                    </div>
                    <Trash2 className="h-4 w-4 text-[var(--text-dim)]" />
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-dim)]">From {item.source}</p>
                  {item.details && <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.details}</p>}
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--text-dim)]">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5" />
                      Auto-delete in 30 days
                    </div>
                    <button
                      onClick={() => onRestoreTrash?.(item.id)}
                      className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-all hover:bg-[var(--bg-card)]"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }
    const featureCards = [
    {
      title: "Manage Semesters",
      description: "Organize classes, courses, and academic terms in a structured workspace.",
      icon: Library,
      onClick: () => onNavigate && onNavigate('semester'),
      badge: "Planning",
    },
    {
      title: "My Tasks",
      description: "Track due dates, notes, and study reminders in your personal task board.",
      icon: LibraryBig,
      onClick: () => onNavigate && onNavigate('tasks'),
      badge: "Productivity",
    },
    {
      title: "My Notes",
      description: "Browse saved notes, open details, and share content from one central place.",
      icon: FileText,
      onClick: () => onNavigate ? onNavigate('my-notes') : onViewNotes(),
      badge: "Library",
    },
    {
      id: "preparation",
      title: "Preparation Mode",
      description: "Select a note or upload a file instantly, then generate quizzes, summaries, and timed live exams with Gemini.",
      icon: Sparkles,
      onClick: () => onNavigate && onNavigate('preparation'),
      badge: "Study",
    },
    {
      title: "Sharing Room",
      description: "Collaborate in shared rooms and manage public note collections.",
      icon: Share2,
      onClick: () => onNavigate && onNavigate('shared-notes'),
      badge: "Community",
    },
    {
      title: "Note Toolkit",
      description: "Generate summaries, flashcards, roadmaps, quizzes, and OCR with one click.",
      icon: Wand2,
      onClick: () => onNavigate ? onNavigate('toolkit') : onViewNotes(),
      badge: "AI Suite",
    },
    {
      title: "Ask Your Notes",
      description: "Chat with your study materials and surface answers instantly.",
      icon: MessageSquareText,
      onClick: () => onNavigate && onNavigate('ask'),
      badge: "AI Chat",
    },
    {
      title: "Knowledge Graph",
      description: "Visualize concept connections and navigate study relationships beautifully.",
      icon: Network,
      onClick: () => onNavigate && onNavigate('graph'),
      badge: "Explore",
    },
    {
      title: "Trash Bin",
      description: "Review deleted notes and files before permanent removal.",
      icon: Trash2,
      onClick: () => onNavigate && onNavigate('trash'),
      badge: "Cleanup",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <header className="glass-card p-5 sm:p-8 border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_32%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-main)]">{title}</h1>
            {!isMyNotes && (
              <p className="text-[var(--text-dim)] max-w-xl">
                Access your study tools, notes, tasks, and graph explorer from one professional dashboard.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onCreateNote}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-300"
            >
              <PenLine className="w-4 h-4" />
              Create Note
            </button>
            <button
              onClick={onUploadFiles}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-600/30 transition-all duration-300"
            >
              <UploadCloud className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={onViewNotes}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-600/30 transition-all duration-300"
            >
              <LibraryBig className="w-4 h-4" />
              View Notes
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        {!isMyNotes && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--text-dim)]" />
                Quick Access
              </h2>
              <p className="text-sm text-[var(--text-dim)]">Your main study tools, surfaced as polished shortcuts.</p>
            </div>
            <button onClick={onViewNotes} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">Open Notes <ArrowRight className="w-4 h-4" /></button>
          </div>
        )}

        {isMyNotes ? (
          <div>
            {displayNotes.length === 0 ? (
              <div className="glass-card p-8 border border-white/5 text-center">
                <h3 className="text-xl font-bold text-[var(--text-main)]">No notes yet</h3>
                <p className="text-[var(--text-dim)]">You don't have any saved notes. Use Create Note or the Upload button to add notes to My Notes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {displayNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onOpen={onNoteOpen} onChat={() => onChatOpen(note.id)} onShare={onShareNote ? () => onShareNote(note) : undefined} onDelete={() => onDeleteNote ? onDeleteNote(note.id) : undefined} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.title}
                whileHover={{ y: -4, scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                onClick={feature.onClick}
                className="group relative overflow-hidden text-left glass-card p-6 border border-white/10 min-h-[190px] transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="dashboard-feature-icon-wrap h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/20">
                      <Icon className="dashboard-feature-icon w-6 h-6 text-[var(--text-main)]" />
                    </div>
                    <span className="dashboard-feature-badge rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/80 transition-colors duration-300 group-hover:bg-white/15 group-hover:border-white/20">
                      {feature.badge}
                    </span>
                  </div>

                  <div className="mt-6 space-y-2">
                    <h3 className="text-xl font-bold text-[var(--text-main)] transition-colors group-hover:text-[var(--text-main)]">{feature.title}</h3>
                    <p className="text-sm leading-6 text-[var(--text-dim)] transition-colors group-hover:text-[var(--text-dim)]">{feature.description}</p>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between text-sm font-semibold text-[var(--text-main)] transition-colors group-hover:text-[var(--text-main)]">
                    <span>Open feature</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
        )}
      </section>
    </div>
  );
}
