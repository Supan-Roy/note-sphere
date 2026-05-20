import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Image as ImageIcon, Music, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Note } from "../types";

export function UploadCenter({ onSaveNote, onGoToChat }: { onSaveNote: (note: Note) => void, onGoToChat: (noteId: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!result) return;
    const noteId = Math.random().toString(36).substr(2, 9);
    const newNote: Note = {
       id: noteId,
       title: result.title || "Untitled Note",
       ownerId: "user1",
       ownerName: "Supan",
       type: "pdf", // Default
       content: result.extractedText || "",
       tags: result.tags || [],
       isPublic: false,
       aiAnalysis: result,
       likesCount: 0,
       bookmarksCount: 0,
       createdAt: new Date(),
       updatedAt: new Date()
    };
    onSaveNote(newNote);
    setSavedNoteId(noteId);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : "pdf");

    try {
      const response = await fetch("/api/process-note", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong during AI analysis.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'audio/*': ['.mp3', '.wav', '.m4a']
    }
  } as any);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--text-main)]">Upload Center</h1>
        <p className="text-[var(--text-dim)]">Upload PDFs, handwritten notes, or lecture audio for multimodal AI parsing.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`group relative glass-card p-12 border-2 border-dashed transition-all cursor-pointer text-center space-y-4 ${
          isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20"
        }`}
      >
        <input {...getInputProps()} />
        <div className={`w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto transition-transform duration-300 ${
          isDragActive ? "scale-110" : "group-hover:scale-110"
        }`}>
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-indigo-400" />
          )}
        </div>
        
        <div>
          <p className="text-lg font-bold text-[var(--text-main)]">
            {isDragActive ? "Drop it here!" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-[var(--text-dim)] mt-1">or click to browse from your computer</p>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 text-gray-600">
          <div className="flex flex-col items-center gap-1">
            <File className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-widest">PDF</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Image</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Music className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Audio</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-indigo-500"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Gemini is analyzing your note...
                </p>
                <span className="text-xs text-[var(--text-dim)]">Step 2 of 4 : Semantic Parsing</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500"
                  animate={{ width: ["10%", "40%", "70%", "95%"] }}
                  transition={{ duration: 15, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3 text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-xl text-[var(--text-main)]">{result.title}</h3>
                    <p className="text-xs text-[var(--text-dim)]">AI Successfully Generated Summary & Scores</p>
                  </div>
                </div>
                {savedNoteId ? (
                   <div className="flex gap-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                         <span className="text-sm font-bold text-emerald-400">Note Saved!</span>
                      </div>
                      <button 
                        onClick={() => onGoToChat(savedNoteId)}
                        className="bg-indigo-600 px-6 py-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Discuss with AI
                      </button>
                   </div>
                ) : (
                  <button 
                    onClick={handleSave}
                    className="bg-red-600 px-6 py-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
                  >
                    Save to My Notes
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-bold text-[var(--text-dim)] tracking-widest">AI Summary</h4>
                  <p className="text-sm text-[var(--text-main)] leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 font-medium">
                    {result.summary}
                  </p>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-xs uppercase font-bold text-[var(--text-dim)] tracking-widest">Knowledge Scores</h4>
                  <div className="space-y-4">
                    <ScoreItem label="Knowledge Depth" score={result.scores.knowledge} />
                    <ScoreItem label="Readability" score={result.scores.readability} />
                    <ScoreItem label="Completeness" score={result.scores.completeness} />
                    <ScoreItem label="Exam Readiness" score={result.scores.examReadiness} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreItem({ label, score }: { label: string, score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs text-[var(--text-dim)] font-medium">{label}</span>
        <span className="text-sm font-bold text-[var(--text-main)]">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
        />
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
