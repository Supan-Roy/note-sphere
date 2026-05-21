import { motion } from "motion/react";
import { FileType, MoreVertical, Heart, Bookmark, MessageSquare, ArrowUpRight, MessageSquareText, Trash2, Share2 } from "lucide-react";
import { Note } from "../types";

interface NoteCardProps {
  note: Note;
  onOpen: (note: Note) => void;
  onChat?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  key?: string;
}

export function NoteCard({ note, onOpen, onChat, onShare, onDelete }: NoteCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onOpen(note)}
      className="glass-card group flex flex-col h-full overflow-hidden cursor-pointer"
    >
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileType className="w-5 h-5 text-indigo-400" />
          </div>
          <button className="text-[var(--text-dim)] hover:text-[var(--text-main)]">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-indigo-500 transition-colors">
          {note.title}
        </h3>
        
        <p className="text-sm text-[var(--text-dim)] line-clamp-2 mb-4 leading-relaxed">
          {note.aiAnalysis?.summary || "Analyzing this note with AI..."}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {note.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-[var(--text-dim)] border border-white/5">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Quality</p>
            <p className={`text-lg font-bold ${getScoreColor(note.aiAnalysis?.scores.knowledge || 0)}`}>
              {note.aiAnalysis?.scores.knowledge || 0}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Readiness</p>
            <p className={`text-lg font-bold ${getScoreColor(note.aiAnalysis?.scores.examReadiness || 0)}`}>
              {note.aiAnalysis?.scores.examReadiness || 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-red-400 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-bold">{note.likesCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-indigo-400 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold">4</span>
          </div>
          {onChat && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onChat();
              }}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-400 transition-colors ml-2"
            >
              <MessageSquareText className="w-4 h-4" />
              <span className="text-xs font-bold">Chat</span>
            </button>
          )}
        </div>
          <div className="flex items-center gap-3">
            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                title="Share note"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            )}
            <button className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300">
              Open Details
              <ArrowUpRight className="w-3 h-3" />
            </button>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
      </div>
    </motion.div>
  );
}
