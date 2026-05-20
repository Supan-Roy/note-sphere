import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  MessageSquare, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  Zap, 
  Send,
  MoreVertical,
  CheckCircle2,
  Brain,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  Share2
} from "lucide-react";
import { Room, Quiz, QuizQuestion } from "../types";

export function RoomDetail({ room, onBack, onUpdateRoom, currentUserId }: { room: Room, onBack: () => void, onUpdateRoom: (room: Room) => void, currentUserId?: string }) {
  const [activeTab, setActiveTab] = useState<"feed" | "quiz" | "chat">("feed");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDifficulty, setQuizDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: `Welcome to the study collective for **${room.title}**. I am Gemini, your room intelligence. I can help you understand shared notes, create quizzes, or answer questions based on this room's knowledge hub.` }
  ]);
  const [chatInput, setChatInput] = useState("");

  const roomNotes = room.sharedNotes || [];
  const subRooms = room.subRooms || [];

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    // Simulate multi-file analysis/upload
    setTimeout(() => {
      const newNotes = Array.from(files).map((f: File, i) => ({
        id: `rn-${Math.random()}-${i}`,
        title: f.name,
        type: f.type.includes("pdf") ? "pdf" : "image",
        author: "You",
        createdAt: new Date()
      }));
      onUpdateRoom({
        ...room,
        sharedNotes: [...newNotes, ...roomNotes]
      });
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
  };

  const [isCreatingSubRoom, setIsCreatingSubRoom] = useState(false);
  const [newSubRoomTitle, setNewSubRoomTitle] = useState("");

  const handleCreateSubRoom = () => {
    if (!newSubRoomTitle) return;
    onUpdateRoom({
      ...room,
      subRooms: [...subRooms, { id: `sr-${Date.now()}`, title: newSubRoomTitle, memberCount: 1 }]
    });
    setNewSubRoomTitle("");
    setIsCreatingSubRoom(false);
  };

  const handleShareRoom = () => {
    const url = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(url);
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 3000);
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuiz(null);
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           context: room.description + " Concepts: Physics, Electromagnetism, Quantum Mechanics", // Mock context for demo
           difficulty: quizDifficulty,
           count: 5 
        })
      });
      const data = await response.json();
      setQuiz(data);
      setCurrentQuizIndex(0);
      setQuizScore(0);
      setActiveTab("quiz");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", content: chatInput };
    setChatMessages([...chatMessages, userMsg]);
    setChatInput("");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           message: chatInput,
           context: room.description + " Shared resources: " + room.title,
           history: chatMessages.slice(1) // skip the welcome message for AI history
        })
      });
      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the brain right now." }]);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#030712]/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <h1 className="text-xl font-bold text-[var(--text-main)]">{room.title}</h1>
               <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded uppercase tracking-widest border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">AI Protected</span>
            </div>
            <p className="text-xs text-[var(--text-dim)]">Room Code: <span className="font-mono text-[var(--text-dim)]">{room.code}</span> • {room.members.length} Members Online</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleShareRoom}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 min-w-[120px] justify-center relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {showShareSuccess ? (
                <motion.div
                  key="success"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Share Room</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <TabButton active={activeTab === "feed"} onClick={() => setActiveTab("feed")} icon={Zap} label="Feed" />
            <TabButton active={activeTab === "quiz"} onClick={() => setActiveTab("quiz")} icon={Brain} label="AI Quiz" />
            <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={MessageSquare} label="Ask Room" />
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            multiple 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-red-600 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-red-600/20 flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Post Files"}
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar Left: Members & Stats */}
         <aside className="w-64 glass-sidebar p-6 space-y-8 flex-shrink-0 animate-in slide-in-from-left duration-700">
            <div className="space-y-4">
               <h3 className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Room Analytics</h3>
               <div className="space-y-3">
                 <AnalyticsItem label="Note Quality" value="94%" pulse />
                 <AnalyticsItem label="Exam Prep" value="A+" />
                 <AnalyticsItem label="Activity" value="High" />
               </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Collaborators</h3>
                   <span className="text-[10px] font-bold text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded">5 New</span>
                </div>
                <div className="space-y-3">
                   {room.members.map((m, i) => {
                     const isCurrent = m === currentUserId;
                     const avatarText = isCurrent ? 'You' : String(m).slice(0,2).toUpperCase();
                     const displayName = isCurrent ? 'You' : `User_${m}`;
                     return (
                       <div key={i} className="flex items-center gap-2 group cursor-pointer">
                          <div className={`w-8 h-8 rounded-full ${isCurrent ? 'ring-2 ring-emerald-400' : 'bg-gradient-to-br from-indigo-500 to-purple-500'} border border-white/10 flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition-transform`}>
                             {avatarText}
                          </div>
                          <span className={`${isCurrent ? 'text-[var(--text-main)] font-semibold' : 'text-[var(--text-dim)]'} text-xs group-hover:text-[var(--text-main)] transition-colors`}>{displayName}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto animate-pulse"></div>
                       </div>
                     );
                   })}
                </div>
            </div>
         </aside>

         {/* Content Feed */}
         <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/5">
            <AnimatePresence mode="wait">
                {activeTab === "feed" && (
                  <motion.div 
                    key="feed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto space-y-8"
                  >
                    {/* Sub-Rooms Section */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-2">
                          <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 italic">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Internal Study Spheres
                          </h2>
                          <button 
                            onClick={() => setIsCreatingSubRoom(true)}
                            className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-indigo-400 hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3" />
                            Launch Sphere
                          </button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {subRooms.map(sr => (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              key={sr.id}
                              className="glass-card p-4 text-left border-indigo-500/10 hover:border-indigo-500/30 transition-all group"
                            >
                               <p className="text-sm font-bold text-[var(--text-main)] group-hover:text-indigo-500 transition-colors">{sr.title}</p>
                               <div className="flex items-center gap-2 mt-2">
                                  <div className="flex -space-x-1">
                                     {[...Array(sr.memberCount)].map((_, i) => (
                                       <div key={i} className="w-4 h-4 rounded-full bg-indigo-600 border border-[var(--bg-main)] text-[6px] flex items-center justify-center text-white font-bold">{i+1}</div>
                                     ))}
                                  </div>
                                  <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-tighter">{sr.memberCount} active</span>
                               </div>
                            </motion.button>
                          ))}
                       </div>
                    </div>

                    <AnimatePresence>
                      {isCreatingSubRoom && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="glass-card p-6 border-indigo-500/20 space-y-4 overflow-hidden"
                        >
                           <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-widest">New Study Sphere</h3>
                           <div className="flex gap-4">
                              <input 
                                type="text"
                                value={newSubRoomTitle}
                                onChange={(e) => setNewSubRoomTitle(e.target.value)}
                                placeholder="Name your internal sphere..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <button 
                                onClick={handleCreateSubRoom}
                                className="bg-indigo-600 px-6 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 font-bold"
                              >
                                Create
                              </button>
                              <button 
                                onClick={() => setIsCreatingSubRoom(false)}
                                className="px-4 text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text-main)]"
                              >
                                Cancel
                              </button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shared Wisdom Section */}
                    <div className="glass-card p-6 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/20">
                       <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2 italic">
                         <Sparkles className="w-5 h-5 text-cyan-400" />
                         Shared Wisdom
                       </h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {roomNotes.map((note) => (
                            <RoomNoteCard key={note.id} title={note.title} type={note.type} author={note.author} />
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-sm font-bold text-[var(--text-main)] pl-2">Recent Discussion</h3>
                       {[1,2].map(i => (
                         <div key={i} className="glass-card p-5 space-y-4 border-white/5">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold italic">User</div>
                                  <div>
                                     <p className="text-xs font-bold text-[var(--text-dim)]">Student_{i}</p>
                                     <p className="text-[10px] text-[var(--text-dim)] opacity-60">32 minutes ago in General</p>
                                  </div>
                               </div>
                               <button className="text-[var(--text-dim)] hover:text-[var(--text-main)]"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                               This room has amazing resources for the midterm. Gemini's summary of the Wave Function note really cleared things up for me!
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                               <button className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dim)] hover:text-indigo-400 transition-colors uppercase tracking-widest"><TrendingUp className="w-3.5 h-3.5" /> 12 Thanks</button>
                               <button className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dim)] hover:text-cyan-400 transition-colors uppercase tracking-widest"><MessageSquare className="w-3.5 h-3.5" /> 4 Replies</button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === "quiz" && (
                 <motion.div 
                   key="quiz"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="max-w-2xl mx-auto py-10"
                 >
                    {!quiz ? (
                       <div className="glass-card p-12 text-center space-y-8 border-indigo-500/20">
                          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                             <Brain className="w-10 h-10 text-indigo-400" />
                          </div>
                          <div className="space-y-4">
                             <h2 className="text-3xl font-bold text-white">AI Knowledge Battle</h2>
                             <p className="text-gray-500">Gemini will scan all room notes and generate a customized quiz to test your mastery.</p>
                          </div>
                          <div className="flex items-center justify-center gap-4">
                             {["Easy", "Medium", "Hard"].map(d => (
                               <button 
                                key={d}
                                onClick={() => setQuizDifficulty(d as any)}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  quizDifficulty === d 
                                    ? "bg-indigo-500 text-white border-indigo-500 shadow-xl shadow-indigo-500/30" 
                                    : "bg-white/5 text-gray-500 border-white/10 hover:text-gray-300"
                                }`}
                               >
                                 {d}
                               </button>
                             ))}
                          </div>
                          <button 
                            onClick={handleGenerateQuiz}
                            disabled={isGeneratingQuiz}
                            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-indigo-700"
                          >
                             {isGeneratingQuiz ? (
                               <>
                                 <Loader2 className="w-5 h-5 animate-spin" />
                                 <span>Initializing Deep Scan...</span>
                               </>
                             ) : (
                               <>
                                 <Sparkles className="w-5 h-5" />
                                 <span>Generate 5 Questions Now</span>
                               </>
                             )}
                          </button>
                       </div>
                    ) : (
                       <div className="space-y-8">
                          <div className="flex items-center justify-between pb-6 border-b border-white/10">
                             <div>
                                <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
                                <p className="text-xs text-gray-500">Question {currentQuizIndex + 1} of {quiz.questions.length}</p>
                             </div>
                             <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                                {Math.round(((currentQuizIndex + 1) / quiz.questions.length) * 100)}%
                             </div>
                          </div>

                          <div className="glass-card p-8 space-y-6">
                             <p className="text-lg font-medium text-gray-200 leading-relaxed">
                               {quiz.questions[currentQuizIndex].question}
                             </p>
                             <div className="space-y-3">
                               {quiz.questions[currentQuizIndex].options.map((opt, i) => (
                                 <button 
                                   key={i}
                                   onClick={() => {
                                      if (i === quiz.questions[currentQuizIndex].correctAnswer) setQuizScore(s => s + 1);
                                      if (currentQuizIndex < quiz.questions.length - 1) {
                                         setCurrentQuizIndex(prev => prev + 1);
                                      } else {
                                         alert(`Quiz Finished! Your Score: ${quizScore + (i === quiz.questions[currentQuizIndex].correctAnswer ? 1 : 0)} / ${quiz.questions.length}`);
                                         setQuiz(null);
                                      }
                                   }}
                                   className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-left text-sm font-medium text-gray-300 transition-all flex items-center gap-4 group"
                                 >
                                    <div className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold transition-colors">{String.fromCharCode(65 + i)}</div>
                                    <span>{opt}</span>
                                 </button>
                               ))}
                             </div>
                          </div>
                       </div>
                    )}
                 </motion.div>
               )}

               {activeTab === "chat" && (
                 <motion.div 
                   key="chat"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="h-full flex flex-col max-w-3xl mx-auto"
                 >
                    <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-20 scrollbar-thin">
                       {chatMessages.map((msg, i) => (
                         <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                               msg.role === "user" 
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                                : "bg-white/5 text-gray-300 border border-white/5"
                            }`}>
                               {msg.content}
                               {msg.role === "assistant" && (
                                  <div className="mt-3 flex gap-2">
                                     <button className="text-[9px] uppercase font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-indigo-500/10 rounded">Cite Notes</button>
                                     <button className="text-[9px] uppercase font-bold text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-cyan-500/10 rounded">Simplify</button>
                                  </div>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="p-4 bg-[#030712] border-t border-white/5 flex gap-3 relative">
                       <input 
                         type="text" 
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                         placeholder="Ask anything based on room knowledge context..."
                         className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                       />
                       <button 
                        onClick={handleSendChat}
                        className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                       >
                          <Send className="w-5 h-5" />
                       </button>
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-4">
                          <QuickAction label="Explain Recursion" onClick={() => setChatInput("Explain Recursion from our notes.")} />
                          <QuickAction label="Key Formulas" onClick={() => setChatInput("Show me all key formulas from the shared notes.")} />
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Sidebar Right: Room Intelligence */}
         <aside className="w-80 glass-sidebar p-6 space-y-6 flex-shrink-0 animate-in slide-in-from-right duration-700">
            <div className="glass-card p-5 border-l-4 border-l-indigo-500 space-y-4">
               <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-gray-200">Room Genius</h3>
               </div>
               <p className="text-xs text-gray-500 leading-relaxed">
                 Gemini has synthesized 12 notes. High focus detected on <span className="text-indigo-400 font-bold">Relativistic Mechanics</span> this week.
               </p>
               <button className="w-full py-2 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/20">View Room Digest</button>
            </div>

            <div className="space-y-4">
               <h3 className="text-[10px] uppercase font-bold text-gray-600 tracking-widest">Mastery Leaderboard</h3>
               <div className="space-y-3">
                 <LeaderboardItem name="Supan" points={1240} rank={1} />
                 <LeaderboardItem name="Sarah K" points={980} rank={2} />
                 <LeaderboardItem name="Jordan L" points={850} rank={3} />
               </div>
            </div>

            <div className="pt-6 border-t border-white/5">
                <div className="glass-card p-4 border-white/5 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-cyan-400" />
                   </div>
                   <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Privacy Status</p>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">End-to-End Encrypted</p>
                   </div>
                </div>
            </div>
         </aside>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
        active 
          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function AnalyticsItem({ label, value, pulse }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-dim)]">{label}</span>
      <div className="flex items-center gap-2">
         {pulse && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>}
         <span className="text-xs font-bold text-[var(--text-main)]">{value}</span>
      </div>
    </div>
  );
}

function RoomNoteCard({ title, type, author }: any) {
  return (
    <div className="glass-card p-3 flex items-center gap-3 hover:bg-white/5 transition-all group cursor-pointer border-white/5">
       <div className={`w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all`}>
          <FileText className={`w-4 h-4 ${type === "pdf" ? "text-red-400" : "text-indigo-400"}`} />
       </div>
       <div className="min-w-0">
          <p className="text-[11px] font-bold text-[var(--text-main)] truncate">{title}</p>
          <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-widest font-bold">{author}</p>
       </div>
       <span className="ml-auto text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-400/20 uppercase font-bold">New</span>
    </div>
  );
}

function LeaderboardItem({ name, points, rank }: any) {
  return (
    <div className="flex items-center gap-3 group">
       <span className={`text-[10px] font-bold italic w-4 ${rank === 1 ? "text-yellow-400" : "text-gray-600"}`}>#{rank}</span>
       <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[8px] font-bold text-gray-400">{name.charAt(0)}</div>
       <span className="text-xs text-gray-400">{name}</span>
       <span className="ml-auto text-[10px] font-bold text-gray-200">{points} pts</span>
    </div>
  );
}

function QuickAction({ label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all shadow-xl backdrop-blur-md"
    >
      {label}
    </button>
  );
}
