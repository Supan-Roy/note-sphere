import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Sparkles, Loader2, Brain, FileText, Search } from "lucide-react";
import { Note } from "../types";

export function AskNotes({ notes, initialNoteId, onAddNote }: { notes: Note[], initialNoteId: string | null, onAddNote?: (note: Note) => void }) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    initialNoteId || (notes.length > 0 ? notes[0].id : null)
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if initialNoteId changes (e.g. user navigates multiple times)
  useEffect(() => {
    if (initialNoteId) {
      setSelectedNoteId(initialNoteId);
    }
  }, [initialNoteId]);
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: "Select a note and ask me anything! I can summarize, explain concepts, or help with exam prep." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  function makeId() { return Math.random().toString(36).slice(2,11); }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const f = files[0];
    const id = makeId();
    const newNote: Note = {
      id,
      title: f.name,
      ownerId: 'user1',
      ownerName: 'You',
      type: f.type.includes('pdf') ? 'pdf' : (f.type.startsWith('image') ? 'image' : 'text'),
      content: '',
      rawText: '',
      tags: [],
      isPublic: false,
      likesCount: 0,
      bookmarksCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (onAddNote) onAddNote(newNote);
    setSelectedNoteId(id);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!selectedNote) {
       alert("Please select a note to chat about first!");
       return;
    }

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           message: input,
           context: `Note Title: ${selectedNote.title}. Content: ${selectedNote.content || selectedNote.aiAnalysis?.summary}`,
           history: messages.slice(1)
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. High server load, maybe?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex animate-in fade-in duration-700">
      {/* Sidebar: Note Selection */}
      <aside className="w-80 glass-sidebar flex flex-col border-r border-white/5">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
             <Brain className="w-5 h-5 text-indigo-400" />
             Study Context
          </h2>
          <p className="text-xs text-[var(--text-dim)] mt-1">Select the note you want to talk to.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
           {notes.length === 0 ? (
             <div className="text-center py-10 opacity-30">
                <FileText className="w-10 h-10 mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">No Notes Found</p>
                <p className="text-[10px] mt-1">Upload a note to start chatting.</p>
             </div>
           ) : (
             notes.map(note => (
               <button
                 key={note.id}
                 onClick={() => setSelectedNoteId(note.id)}
                 className={`w-full text-left p-3 rounded-xl transition-all border ${
                   selectedNoteId === note.id 
                     ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/10" 
                     : "bg-white/5 border-transparent text-[var(--text-dim)] hover:bg-white/10"
                 }`}
               >
                 <p className="text-sm font-bold truncate">{note.title}</p>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-medium text-[var(--text-dim)]">{note.type}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                    <span className="text-[10px] text-[var(--text-dim)]">{new Date(note.createdAt).toLocaleDateString()}</span>
                 </div>
               </button>
             ))
           )}
        </div>
        
          <div className="p-4 border-t border-white/5 space-y-3">
            <input ref={fileInputRef} type="file" onChange={handleFileInput} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 rounded-xl bg-white/5 text-sm font-semibold hover:bg-white/10">Upload a note</button>
            <div>
             <div className="glass-card p-4 bg-indigo-500/5">
               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">AI Agent Active</p>
               <p className="text-[11px] text-gray-500 leading-tight">I use Gemini Flash to parse your documents in real-time.</p>
             </div>
            </div>
          </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-main)] relative">
        {!selectedNote && notes.length > 0 && (
          <div className="absolute inset-0 z-10 bg-[var(--bg-main)]/80 backdrop-blur-sm flex items-center justify-center">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                   <Sparkles className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">Select a note to begin</h3>
                <p className="text-sm text-[var(--text-dim)] max-w-xs mx-auto">Click on one of your notes in the left sidebar to load it into the AI's memory.</p>
             </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                   <FileText className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">No content uploaded</h3>
                <p className="text-sm text-[var(--text-dim)] max-w-xs mx-auto">Go to the Upload Center to add your study materials before using the AI assistant.</p>
             </div>
          </div>
        )}

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                 msg.role === 'user' 
                   ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/20' 
                   : 'glass-card border-none bg-white/5 text-[var(--text-main)] rounded-tl-none'
               }`}>
                 {msg.content}
               </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="glass-card bg-white/5 p-4 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
               </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent">
          <div className="max-w-3xl mx-auto relative">
            <div className="flex gap-2 mb-3">
              <button onClick={() => { setInput(`Please summarize the following note: ${selectedNote ? selectedNote.title : ''}`); handleSend(); }} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">Summarize</button>
              <button onClick={() => { setInput(`Generate a 5-question multiple choice quiz from note: ${selectedNote ? selectedNote.title : ''}`); handleSend(); }} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">Generate Quiz</button>
              <button onClick={() => { setInput(`Extract key concepts and create flashcards for note: ${selectedNote ? selectedNote.title : ''}`); handleSend(); }} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">Flashcards</button>
              <button onClick={() => { setInput(`Explain the main concepts in simple terms from note: ${selectedNote ? selectedNote.title : ''}`); handleSend(); }} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">Explain</button>
            </div>

             <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder={selectedNote ? `Discuss "${selectedNote.title}"...` : "Select a note first..."}
               disabled={!selectedNote || isLoading}
               className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 transition-all shadow-2xl"
             />
             <button 
               onClick={handleSend}
               disabled={!selectedNote || isLoading || !input.trim()}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
             >
               <Send className="w-5 h-5" />
             </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-4 text-center">
            AI Assistant powered by Gemini 3 Flash • Trained on academic contexts
          </p>
        </div>
      </div>
    </div>
  );
}
