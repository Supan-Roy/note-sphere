import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  ListChecks, 
  FileText, 
  Map, 
  X, 
  Share2,
  PenTool,
  Download
} from "lucide-react";

const tools = [
  { type: "summary", title: "Concise Summary", description: "Transform lengthy chapters into balanced, structured summaries focused on high-yield topics.", icon: FileText, color: "indigo" },
  { type: "flashcards", title: "Smart Flashcards", description: "Automatically extract key terms and definitions into an interactive Anki-style deck.", icon: Brain, color: "emerald" },
  { type: "mcqs", title: "Exam Simulator", description: "Generate multiple-choice questions with AI-powered distractors and detailed explanations.", icon: ListChecks, color: "purple" },
  { type: "roadmap", title: "Learning Roadmap", description: "A semantic journey through your notes, broken down into sequential milestones and goals.", icon: Map, color: "cyan" },
  { type: "ocr", title: "Handwritten OCR", description: "Digitize your handwritten notes with high precision using Gemini's latest vision models. Export as professional PDF.", icon: PenTool, color: "orange" },
];
import { Note } from "../types";

interface ToolkitCardProps {
  title: string;
  description: string;
  icon: any;
  color: string;
  type: string;
  onGenerate: (type: string) => void;
  isGenerating?: boolean;
  key?: string;
}

export function ToolkitCard({ title, description, icon: Icon, color, type, onGenerate, isGenerating }: ToolkitCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-card p-6 flex flex-col gap-4 border-l-4 border-l-${color}-500 group relative overflow-hidden`}
    >
      {isGenerating && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Sparkles className={`w-8 h-8 text-${color}-400`} />
          </motion.div>
          <p className="text-xs font-bold mt-2 text-white uppercase tracking-widest animate-pulse">Gemini Generating...</p>
        </div>
      )}

      <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      
      <div>
        <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>

      <button 
        onClick={() => onGenerate(type)}
        disabled={isGenerating}
        className={`mt-4 flex items-center justify-between w-full px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all border border-white/5 active:scale-95`}
      >
        <span>Generate Now</span>
        <ArrowRight className="w-3 h-3" />
      </button>

      {/* Background Decor */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-${color}-500/5 blur-3xl rounded-full`}></div>
    </motion.div>
  );
}

export function StudyToolkit({ notes }: { notes: Note[] }) {
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const [result, setResult] = useState<{ type: string, content: any, title: string } | null>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleGenerate = async (type: string) => {
    if (type === "ocr") {
      ocrInputRef.current?.click();
      return;
    }

    if (!selectedNote) {
       alert("Please select or upload a note first!");
       return;
    }
    setGeneratingType(type);
    
    try {
      if (type === "mcqs") {
         const response = await fetch("/api/generate-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               context: selectedNote.content || selectedNote.aiAnalysis?.summary,
               difficulty: "Medium",
               count: 5 
            })
          });
          const data = await response.json();
          setResult({ type: "quiz", content: data, title: data.title });
      } else {
        // Simple chat-based generation for other types
        const prompts: any = {
          summary: "Create an ultra-concise, Cornell-style summary of this text. Use bullet points and highlight key definitions.",
          flashcards: "Extract 5-7 double-sided flashcards from this text in the format Q: [question] A: [answer].",
          roadmap: "Create a 5-step learning roadmap for mastering the concepts in this text. Include estimated time and sub-goals."
        };

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompts[type] || "Summarize this.",
            context: selectedNote.content || selectedNote.aiAnalysis?.summary
          })
        });
        const data = await response.json();
        setResult({ type: "text", content: data.text, title: `${type.toUpperCase()} Result` });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate. AI might be overwhelmed!");
    } finally {
      setGeneratingType(null);
    }
  };

  const handleGenerateOCR = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGeneratingType("ocr");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/handwritten-ocr", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult({ type: "text", content: data.text, title: "Digitized Handwritten Note" });
    } catch (err: any) {
      console.error(err);
      alert("OCR Failed: " + err.message);
    } finally {
      setGeneratingType(null);
      if (ocrInputRef.current) ocrInputRef.current.value = "";
    }
  };

  const downloadPDF = () => {
    if (!result || !result.content) return;
    const doc = new jsPDF();
    const margin = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(result.title, margin, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    let contentStr = "";
    if (result.type === "quiz") {
      contentStr = result.content.questions.map((q: any, i: number) => {
        return `Q${i+1}: ${q.question}\nOptions:\n${q.options.map((o: string, oi: number) => `- ${o}${oi === q.correctAnswer ? ' (Correct)' : ''}`).join('\n')}\nExplanation: ${q.explanation}\n\n`;
      }).join('');
    } else {
      contentStr = result.content;
    }

    const splitText = doc.splitTextToSize(contentStr, pageWidth - (margin * 2));
    let cursorY = 45;
    
    splitText.forEach((line: string) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });
    
    doc.save(`${result.title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            AI Study Toolkit
          </h1>
          <p className="text-[var(--text-dim)]">Supercharge your learning with one-click AI transformations.</p>
        </div>

        {notes.length > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-widest">Target Note:</span>
            <select 
              value={selectedNoteId || ""} 
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            >
              {notes.map(n => <option key={n.id} value={n.id} className="bg-[#030712]">{n.title}</option>)}
            </select>
          </div>
        ) : (
          <div className="glass-card px-4 py-2 border-indigo-500/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">No Notes Uploaded</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map(tool => (
          <ToolkitCard 
            key={tool.type} 
            {...tool} 
            onGenerate={handleGenerate} 
            isGenerating={generatingType === tool.type} 
          />
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-2xl p-8 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{result.title}</h2>
                <button onClick={() => setResult(null)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-dim)] transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {result.type === "quiz" ? (
                <div className="space-y-6">
                  {result.content.questions.map((q: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <p className="text-sm font-bold text-[var(--text-main)]">Q{i+1}: {q.question}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt: string, oi: number) => (
                          <div key={oi} className={`p-3 rounded-lg text-xs ${oi === q.correctAnswer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-[var(--text-dim)]'}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] italic mt-2">Insight: {q.explanation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 prose prose-invert max-w-none text-sm text-[var(--text-dim)] leading-relaxed whitespace-pre-wrap">
                  {result.content}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2));
                    alert("Result copied to clipboard!");
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Copy Result
                </button>
                <button 
                  onClick={downloadPDF}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button onClick={() => setResult(null)} className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-[var(--text-dim)] font-bold hover:bg-white/10 transition-all">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={ocrInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleGenerateOCR} 
      />

      {notes.length === 0 && (
        <div className="glass-card p-12 border-dashed flex flex-col items-center justify-center text-center space-y-4 opacity-50">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Brain className="w-8 h-8 text-gray-600" />
          </div>
          <div className="max-w-sm">
            <p className="font-bold text-gray-400 italic">Upload a note in the Upload Center first to enable these AI tools.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// End of Toolkit
