import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  Send, 
  Bookmark, 
  Heart, 
  Share2, 
  Download,
  AlertCircle,
  BrainCircuit,
  GraduationCap,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Note } from "../types";

interface NoteDetailProps {
  note: Note;
  onBack: () => void;
  onStartChat: () => void;
}

export function NoteDetail({ note, onBack, onStartChat }: NoteDetailProps) {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: `Hello! I'm your AI study companion for **${note.title}**. Ask me anything about this note's content!` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: note.content || note.aiAnalysis?.summary || "",
          history: messages
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex animate-in slide-in-from-right duration-500">
      {/* Note Content Section */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 overflow-hidden">
        <div className="px-8 py-4 flex items-center justify-between border-b border-white/5">
          <button onClick={onBack} className="flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onStartChat}
              className="bg-red-600 px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discuss Full Analysis</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg"><Heart className="w-4 h-4" /></button>
            <button className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-white/5 rounded-lg"><Bookmark className="w-4 h-4" /></button>
            <button className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-white/5 rounded-lg"><Share2 className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button className="bg-indigo-600 px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:bg-indigo-700 transition-all">
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 scrollbar-thin">
          <div className="max-w-3xl mx-auto space-y-12">
            <header className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                  {note.category || "Academic"}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest border border-white/5">
                  Internal ID: {note.id}
                </span>
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-[var(--text-main)] leading-[1.1]">{note.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                      {note.ownerName.charAt(0)}
                   </div>
                   <span className="text-sm font-bold text-[var(--text-dim)]">{note.ownerName}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                <span className="text-sm text-[var(--text-dim)]">Shared publicly • 3 days ago</span>
              </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <ScoreBox label="Knowledge" score={note.aiAnalysis?.scores.knowledge || 0} icon={BrainCircuit} color="indigo" />
                <ScoreBox label="Readability" score={note.aiAnalysis?.scores.readability || 0} icon={GraduationCap} color="emerald" />
                <ScoreBox label="Completeness" score={note.aiAnalysis?.scores.completeness || 0} icon={CheckCircle2} color="purple" />
                <ScoreBox label="Exam Prep" score={note.aiAnalysis?.scores.examReadiness || 0} icon={Sparkles} color="orange" />
            </div>

            <div className="space-y-6">
               <h2 className="text-xl font-bold border-l-4 border-l-indigo-500 pl-4 text-[var(--text-main)]">AI Abstract</h2>
               <p className="text-[var(--text-dim)] text-lg leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 mt-6">
                 {note.aiAnalysis?.summary}
               </p>
            </div>

            <div className="space-y-6">
               <h2 className="text-xl font-bold border-l-4 border-l-purple-500 pl-4 text-[var(--text-main)]">Extracted Concepts</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {note.aiAnalysis?.keyConcepts.map((concept, i) => (
                   <div key={i} className="glass-card p-4 hover:bg-white/10 transition-colors cursor-pointer group">
                      <p className="font-bold text-[var(--text-main)] group-hover:text-indigo-500 transition-colors">{concept}</p>
                      <p className="text-xs text-[var(--text-dim)] mt-1 transition-colors">Found in 4 different sections of the note.</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="glass-card p-6 border-l-4 border-l-red-500/50 bg-red-500/5">
               <div className="flex items-center gap-2 text-red-400 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-bold">Missing Knowledge Bridge</h3>
               </div>
               <p className="text-sm text-gray-400 mb-4">
                 Gemini identifies that your note is missing following critical topics for exam readiness:
               </p>
               <div className="flex flex-wrap gap-2">
                 {note.aiAnalysis?.missingTopics.map((topic, i) => (
                   <span key={i} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold">
                    {topic}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Companion Sidebar */}
      <aside className="w-96 glass-sidebar flex flex-col z-10 transition-all">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
               <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-bold text-[var(--text-main)]">Ask This Note</h3>
          </div>
          <button className="p-2 text-[var(--text-dim)] hover:text-[var(--text-main)]"><ChevronDown className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-white/5 text-gray-300 border border-white/5"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
             <div className="flex justify-start">
                <div className="bg-white/5 p-3 rounded-2xl">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 pt-0">
          <div className="relative">
            <textarea 
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask a question about this note..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none scrollbar-none"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 bottom-2 p-2 rounded-xl text-indigo-400 hover:bg-white/10 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center">Gemini 3 Flash • Context-aware study partner</p>
        </div>
      </aside>
    </div>
  );
}

function ScoreBox({ label, score, icon: Icon, color }: any) {
  return (
    <div className={`glass-card p-4 border-b-4 border-b-${color}-500/50 h-full`}>
       <div className="flex items-center justify-between mb-2">
          <Icon className={`w-4 h-4 text-${color}-400`} />
          <span className="text-lg font-bold text-[var(--text-main)]">{score}%</span>
       </div>
       <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">{label}</p>
    </div>
  );
}

function CheckCircle2(props: any) {
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
