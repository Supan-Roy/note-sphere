import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Loader2, Minus } from "lucide-react";

export function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [showIntroPulse, setShowIntroPulse] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: "assistant", content: "Hi! I'm Note Sphere AI. Ask me anything about your studies or notes." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const chatToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const introSeen = window.localStorage.getItem("noteSphere.chatIntroSeen") === "true";
    if (introSeen) return;

    setShowIntroPulse(true);
    const timeoutId = window.setTimeout(() => {
      setShowIntroPulse(false);
      window.localStorage.setItem("noteSphere.chatIntroSeen", "true");
    }, 2300);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const updateMobileState = () => {
      const mobile = window.innerWidth <= window.innerHeight;
      setIsMobileScreen(mobile);
      if (mobile) {
        setShowPrompt(false);
        setIsOpen(false);
      }
    };

    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;
      if (chatPanelRef.current?.contains(target)) return;
      if (chatToggleRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
           history: messages.slice(1) // skip welcome message
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect to the AI model. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatPanelRef}
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="mb-4 w-[350px] h-[500px] glass-card flex flex-col shadow-2xl border-indigo-500/30 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-main)] bg-red-600/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)] leading-tight">Note Sphere AI</p>
                  <p className="text-[10px] text-red-400 font-medium">Online & Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-[var(--text-dim)] transition-colors"
                id="close-chat"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-600/20' 
                      : 'bg-white/5 text-[var(--text-main)] border border-[var(--border-main)] rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-[var(--border-main)]">
                    <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border-main)] bg-black/20">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-white/5 border border-[var(--border-main)] rounded-xl py-2.5 pl-4 pr-12 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  id="chat-input"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  id="send-chat"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {showIntroPulse && !isOpen && (
          <div className="pointer-events-none absolute inset-0 -m-4">
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute inset-0 rounded-full border border-red-400/60"
                initial={{ scale: 1, opacity: 0.75 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, delay: ring * 0.32, ease: "easeOut" }}
              />
            ))}
          </div>
        )}

        <motion.button 
          ref={chatToggleRef}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowPrompt(false);
            setShowIntroPulse(false);
            window.localStorage.setItem("noteSphere.chatIntroSeen", "true");
          }}
          id="chat-toggle"
          className={`relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-white/5 text-[var(--text-dim)] border border-[var(--border-main)] rotate-90 w-14 h-14' 
              : isMobileScreen
                ? '!bg-red-600/90 !text-white border border-red-300/20 shadow-[0_18px_40px_rgba(220,38,38,0.38)] backdrop-blur-md w-14 h-14 ring-1 ring-white/10 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:via-white/5 before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-white/10 after:to-transparent after:pointer-events-none overflow-hidden'
                : '!bg-red-600/90 !text-white border border-red-300/20 shadow-[0_18px_40px_rgba(220,38,38,0.38)] backdrop-blur-md px-4.5 h-14 gap-2 ring-1 ring-white/10 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:via-white/5 before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-white/10 after:to-transparent after:pointer-events-none overflow-hidden'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="!w-6 !h-6 !text-white" />}
          {!isOpen && showPrompt && !isMobileScreen && (
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight !text-white">Talk with Sphere AI</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
