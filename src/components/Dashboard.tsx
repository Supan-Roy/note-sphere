import { motion } from "motion/react";
import { Sparkles, TrendingUp, History, Zap, BrainCircuit, Trophy } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { Note } from "../types";

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

export function Dashboard({ notes, onNoteOpen, onChatOpen, title = "Welcome back, Supan" }: { notes: Note[], onNoteOpen: (note: Note) => void, onChatOpen: (id: string) => void, title?: string }) {
  // If we have real notes, we only show real ones. 
  // If we have zero notes, we show dummy notes ONLY on the main dashboard overview.
  // In "My Notes", if we have zero, we show an empty state.
  const isMyNotes = title === "My Notes";
  const hasNotes = notes.length > 0;
  const displayNotes = hasNotes ? notes : (isMyNotes ? [] : DUMMY_NOTES);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)] mb-2">{title}</h1>
          <p className="text-[var(--text-dim)]">
            {isMyNotes 
              ? `Management center for your ${notes.length} uploaded knowledge assets.`
              : `Your AI Study Toolkit is ready. You have ${displayNotes.length} notes to review today.`
            }
          </p>
        </div>
        {!isMyNotes && (
          <div className="flex gap-4">
            <div className="glass-card px-6 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest leading-none mb-1">Study Streak</p>
                <p className="text-xl font-bold text-[var(--text-main)]">12 Days</p>
              </div>
            </div>
            <div className="glass-card px-6 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest leading-none mb-1">Knowledge IQ</p>
                <p className="text-xl font-bold text-[var(--text-main)] italic">Level 4</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Quick Insights - Only on Dashboard */}
      {!isMyNotes && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-[var(--text-main)]">AI Insight</h3>
            </div>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Based on your recent uploads, you're strong in <span className="text-indigo-300 font-semibold">Algorithms</span>, 
              but you might want to review <span className="text-purple-300 font-semibold">Dynamic Programming</span> deeper.
            </p>
          </div>
          
          <div className="glass-card p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-[var(--text-main)]">Exam Readiness</h3>
            </div>
            <progress className="w-full h-2 rounded-full appearance-none bg-black/5 overflow-hidden [&::-webkit-progress-bar]:bg-black/5 [&::-webkit-progress-value]:bg-emerald-500" value="82" max="100"></progress>
            <p className="text-xs text-[var(--text-dim)] mt-3 flex justify-between">
              <span>Overall Score: 82%</span>
              <span>Target: 90%</span>
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-[var(--text-main)]">Top Collection</h3>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-[var(--text-main)]">CS</div>
               <p className="text-sm font-semibold text-[var(--text-dim)]">Computer Science Mastery</p>
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2">Shared with 42 others</p>
          </div>
        </section>
      )}

      {/* Notes Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--text-dim)]" />
            {isMyNotes ? "All Uploaded Contexts" : "Recently Uploaded"}
          </h2>
          {!isMyNotes && <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300">View All</button>}
        </div>

        {isMyNotes && displayNotes.length === 0 ? (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <History className="w-10 h-10 text-[var(--text-dim)] opacity-20" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-xl font-bold text-[var(--text-main)]">No notes found</h3>
              <p className="text-sm text-[var(--text-dim)] mt-2">You haven't uploaded any notes yet. Visit the Upload Center to begin.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNotes.map(note => (
              <NoteCard key={note.id} note={note} onOpen={onNoteOpen} onChat={() => onChatOpen(note.id)} />
            ))}
            {!isMyNotes && (
              <motion.button 
                whileHover={{ scale: 1.01 }}
                className="glass-card border-dashed flex flex-col items-center justify-center p-8 gap-4 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:border-indigo-500/50 hover:bg-white/[0.02] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-bold">Process New Note</p>
                  <p className="text-xs">PDF, Images, or Audio</p>
                </div>
              </motion.button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
