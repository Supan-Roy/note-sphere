import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Cloud,
  Code2,
  Copy,
  Download,
  FileDown,
  FileText,
  Flame,
  Focus,
  GitBranch,
  Heading2,
  Italic,
  Layers3,
  Link2,
  Loader2,
  MessageSquareQuote,
  Mic,
  PenSquare,
  Quote,
  Sparkles,
  AlignLeft,
  Wand2,
  Highlighter,
  Check,
  CalendarClock,
  MoreHorizontal,
  CircleCheckBig,
  ListOrdered,
  List,
  Type,
  Bold,
  Slash,
  Minus,
  Underline,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Note } from "../types";

interface NoteComposerProps {
  onBack: () => void;
  onSaveCloud: (note: Note) => void;
  onViewNotes: () => void;
}

type CommandId = "heading" | "quote" | "code" | "todo";
type ToolbarMark = "bold" | "italic" | "underline" | "strikethrough" | "orderedList" | "bulletList" | "code";
type AiAction =
  | "summarize"
  | "improve"
  | "quiz"
  | "flashcards"
  | "expand"
  | "grammar"
  | "revision";

interface SlashCommand {
  id: CommandId;
  label: string;
  hint: string;
  icon: React.ReactNode;
}

interface ToolbarItem {
  id: ToolbarMark;
  label: string;
  icon: React.ReactNode;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

function deriveTags(title: string, content: string) {
  const words = `${title} ${content}`
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((word) => word.length > 4);

  return Array.from(new Set(words)).slice(0, 5);
}

function summarize(content: string) {
  const clean = content.trim();
  if (!clean) return "A personal note created in the editor.";
  return clean.length > 180 ? `${clean.slice(0, 180).trim()}...` : clean;
}

function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function readingTime(words: number) {
  return Math.max(1, Math.ceil(words / 200));
}

function formatSavedTime(date: Date | null) {
  if (!date) return "Not saved yet";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(date);
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="pointer-events-none rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-base font-semibold text-[var(--text-main)]">{value}</p>
    </div>
  );
}

const slashCommands: SlashCommand[] = [
  { id: "heading", label: "Heading", hint: "Turn the block into a title", icon: <Heading2 className="w-4 h-4" /> },
  { id: "quote", label: "Quote", hint: "Create a clean quote block", icon: <Quote className="w-4 h-4" /> },
  { id: "code", label: "Code", hint: "Insert a code block", icon: <Code2 className="w-4 h-4" /> },
  { id: "todo", label: "Todo", hint: "Add a checklist item", icon: <Check className="w-4 h-4" /> },
];

const toolbarItems: ToolbarItem[] = [
  { id: "bold", label: "Bold", icon: <Bold className="w-4 h-4" /> },
  { id: "italic", label: "Italic", icon: <Italic className="w-4 h-4" /> },
  { id: "underline", label: "Underline", icon: <Underline className="w-4 h-4" /> },
  { id: "strikethrough", label: "Strikethrough", icon: <Minus className="w-4 h-4" /> },
  { id: "code", label: "Code", icon: <Code2 className="w-4 h-4" /> },
  { id: "orderedList", label: "Numbered", icon: <ListOrdered className="w-4 h-4" /> },
  { id: "bulletList", label: "Bullets", icon: <List className="w-4 h-4" /> },
];

const aiActions: Array<{ id: AiAction; title: string; description: string; icon: React.ReactNode; tone: string }> = [
  { id: "summarize", title: "Summarize Note", description: "Turn long notes into crisp takeaways.", icon: <FileText className="w-4 h-4" />, tone: "from-indigo-500/20 to-indigo-500/5" },
  { id: "improve", title: "Improve Writing", description: "Polish clarity, tone, and flow.", icon: <Wand2 className="w-4 h-4" />, tone: "from-violet-500/20 to-violet-500/5" },
  { id: "quiz", title: "Generate Quiz", description: "Build recall questions from the note.", icon: <BookOpen className="w-4 h-4" />, tone: "from-cyan-500/20 to-cyan-500/5" },
  { id: "flashcards", title: "Generate Flashcards", description: "Extract fast study cards.", icon: <Layers3 className="w-4 h-4" />, tone: "from-emerald-500/20 to-emerald-500/5" },
  { id: "expand", title: "Expand Explanation", description: "Deepen weak or short sections.", icon: <Flame className="w-4 h-4" />, tone: "from-amber-500/20 to-amber-500/5" },
  { id: "grammar", title: "Fix Grammar", description: "Clean up wording instantly.", icon: <Check className="w-4 h-4" />, tone: "from-rose-500/20 to-rose-500/5" },
  { id: "revision", title: "Create Revision Notes", description: "Generate exam-ready study notes.", icon: <Focus className="w-4 h-4" />, tone: "from-sky-500/20 to-sky-500/5" },
];

export function NoteComposer({ onBack, onSaveCloud, onViewNotes }: NoteComposerProps) {
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState("");
  const [savedNote, setSavedNote] = useState<Note | null>(null);
  const [shareState, setShareState] = useState("");
  const [savingState, setSavingState] = useState<"idle" | "saving" | "synced">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [activeMarks, setActiveMarks] = useState<Record<ToolbarMark, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    orderedList: false,
    bulletList: false,
    code: false,
  });
  const [activeCommandQuery, setActiveCommandQuery] = useState("");
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [activeAiAction, setActiveAiAction] = useState<AiAction | null>(null);
  const [aiStatus, setAiStatus] = useState("Sphere AI is ready to help.");
  const [aiBusy, setAiBusy] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>(["Draft opened", "Workspace ready"]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const commandMenuRef = useRef<HTMLDivElement | null>(null);
  const commandSelectionRef = useRef<Range | null>(null);
  const [editorFocused, setEditorFocused] = useState(false);

  const canSave = content.trim().length > 0 || title.trim().length > 0;
  const wordCount = useMemo(() => countWords(editorRef.current?.innerText || content), [content, title]);
  const readingMinutes = readingTime(wordCount);
  const complexityScore = Math.min(98, Math.max(38, Math.round((content.length / 7) + wordCount / 6)));
  const knowledgeScore = Math.min(98, Math.max(45, Math.round((wordCount * 1.3) + (content.length / 20))));
  const lastSavedLabel = formatSavedTime(lastSavedAt);

  const downloadFileName = useMemo(() => {
    return `${title.trim() || "note"}.txt`.replace(/\s+/g, "-").toLowerCase();
  }, [title]);

  const noteHtml = () => editorRef.current?.innerHTML || content;
  const noteText = () => editorRef.current?.innerText || content;

  const pushRecentAction = (action: string) => {
    setRecentActions((prev) => [action, ...prev.filter((item) => item !== action)].slice(0, 4));
  };

  const generateNoteWithAi = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingNote(true);
    setAiError(null);
    setAiBusy(true);
    setAiStatus("Generating beautiful study notes for you...");
    pushRecentAction("Generating with AI");

    try {
      const response = await fetch("/api/generate-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentTitle: title,
          currentContent: noteText(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate note");
      }

      const data = await response.json();
      
      if (data.title) {
        setTitle(data.title);
      }
      
      if (data.content) {
        if (editorRef.current) {
          editorRef.current.innerHTML = data.content;
        }
        setContent(data.content);
        setAiStatus("Note generated successfully! Feel free to edit.");
        pushRecentAction("AI Note Generated");
        setShareState("✓ Note generated with AI");
      } else {
        throw new Error("Invalid response format from server");
      }
      
      setAiPrompt("");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong.");
      setAiStatus("AI generation failed. Please try again.");
    } finally {
      setIsGeneratingNote(false);
      setAiBusy(false);
    }
  };

  const updateMarks = () => {
    if (typeof document === "undefined") return;
    
    // Only update marks if editor is focused
    if (document.activeElement !== editorRef.current) {
      setActiveMarks({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        orderedList: false,
        bulletList: false,
        code: false,
      });
      return;
    }
    
    try {
      setActiveMarks({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikethrough"),
        orderedList: document.queryCommandState("insertOrderedList"),
        bulletList: document.queryCommandState("insertUnorderedList"),
        code: document.queryCommandState("formatBlock") && /pre|code/i.test(document.queryCommandValue("formatBlock") || ""),
      });
    } catch {
      // ignore unsupported command states
    }
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const exec = (command: string, value?: string) => {
    focusEditor();
    try {
      if (command === "strikethrough") {
        // Strikethrough support with styling
        document.execCommand("styleWithCSS", false, "true");
        document.execCommand("strikethrough", false, "true");
      } else if (command === "formatBlock") {
        // Ensure formatBlock works properly with h2, blockquote, pre tags
        const val = value?.startsWith("<") ? value : `<${value}>`;
        document.execCommand("formatBlock", false, val);
        // Force update for Firefox compatibility
        document.execCommand("formatBlock", false, val);
      } else if (command === "insertOrderedList") {
        document.execCommand("insertOrderedList", false, undefined);
      } else if (command === "insertUnorderedList") {
        document.execCommand("insertUnorderedList", false, undefined);
      } else if (command === "insertHTML") {
        document.execCommand("insertHTML", false, value);
      } else {
        // For basic formatting: bold, italic, underline
        document.execCommand(command, false, undefined);
      }
    } catch (e) {
      console.warn(`Command ${command} failed:`, e);
    }
    // Add a small delay to ensure command is applied before syncing
    setTimeout(() => {
      syncContent();
      updateMarks();
      focusEditor();
    }, 5);
  };

  const syncContent = () => {
    const html = noteHtml();
    setContent(html);
  };

  const insertBlock = (type: CommandId) => {
    focusEditor();
    switch (type) {
      case "heading":
        document.execCommand("formatBlock", false, "h2");
        break;
      case "quote":
        document.execCommand("formatBlock", false, "blockquote");
        break;
      case "code":
        document.execCommand("formatBlock", false, "pre");
        break;
      case "todo":
        document.execCommand("insertHTML", false, `<div class="todo-line">☐ Task item</div>`);
        break;
    }
    syncContent();
    setIsCommandMenuOpen(false);
    setActiveCommandQuery("");
    pushRecentAction(`Inserted /${type}`);
  };

  const saveToDevice = () => {
    const text = `${title.trim() || "Untitled Note"}\n\n${noteText()}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setShareState("Saved to your device.");
    pushRecentAction("Exported to device");
  };

  const saveToCloud = () => {
    if (!canSave) {
      setShareState("Write something first, then save it.");
      return;
    }

    setSavingState("saving");
    const noteId = savedNote?.id || makeId();
    const note: Note = {
      id: noteId,
      title: title.trim() || "Untitled Note",
      ownerId: "user1",
      ownerName: "Supan",
      type: "text",
      content: noteHtml(),
      rawText: noteText(),
      tags: deriveTags(title, content),
      isPublic: false,
      category: "Personal",
      aiAnalysis: {
        summary: summarize(content),
        keyConcepts: deriveTags(title, content),
        scores: {
          knowledge: Math.min(95, Math.max(40, Math.round(content.length / 8))),
          readability: 82,
          completeness: Math.min(95, Math.max(50, Math.round(content.length / 10))),
          examReadiness: 55,
        },
        missingTopics: [],
      },
      likesCount: savedNote?.likesCount ?? 0,
      bookmarksCount: savedNote?.bookmarksCount ?? 0,
      createdAt: savedNote?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    window.setTimeout(() => {
      onSaveCloud(note);
      setSavedNote(note);
      const now = new Date();
      setLastSavedAt(now);
      setSavingState("synced");
      setShareState("✓ Synced to Cloud");
      pushRecentAction("Synced to cloud");
    }, 650);
  };

  const duplicateNote = () => {
    if (!savedNote && !canSave) return;
    const copyTitle = `${title.trim() || "Untitled Note"} Copy`;
    setTitle(copyTitle);
    pushRecentAction("Duplicated draft");
    setShareState("Draft duplicated locally.");
  };

  const shareNote = async () => {
    const noteToShare = savedNote ?? {
      id: makeId(),
      title: title.trim() || "Untitled Note",
      ownerId: "user1",
      ownerName: "Supan",
      type: "text" as const,
      content: noteHtml(),
      rawText: noteText(),
      tags: deriveTags(title, content),
      isPublic: false,
      category: "Personal",
      aiAnalysis: {
        summary: summarize(content),
        keyConcepts: deriveTags(title, content),
        scores: {
          knowledge: Math.min(95, Math.max(40, Math.round(content.length / 8))),
          readability: 82,
          completeness: Math.min(95, Math.max(50, Math.round(content.length / 10))),
          examReadiness: 55,
        },
        missingTopics: [],
      },
      likesCount: 0,
      bookmarksCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Note;

    const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(noteToShare))));
    const shareLink = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      setShareState("Share link copied to clipboard.");
    } catch {
      setShareState(shareLink);
    }
    pushRecentAction("Copied share link");
  };

  const exportMarkdown = () => {
    const md = `# ${title.trim() || "Untitled Note"}\n\n${noteText().replace(/\n+/g, "\n\n")}`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${downloadFileName.replace(/\.txt$/, "")}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setShareState("Exported as markdown.");
    pushRecentAction("Exported markdown");
  };

  const runAiAction = (action: AiAction) => {
    setActiveAiAction(action);
    setAiBusy(true);
    const label = aiActions.find((item) => item.id === action)?.title || action;
    setAiStatus(`Sphere AI is working on ${label.toLowerCase()}...`);
    window.setTimeout(() => {
      setAiBusy(false);
      setActiveAiAction(null);
      setAiStatus(`${label} complete — ready for the next pass.`);
      pushRecentAction(label);
      setShareState(`${label} generated.`);
    }, 1400);
  };

  const onEditorInput = () => {
    syncContent();
    updateMarks();
    const text = noteText();
    const trailing = text.slice(Math.max(0, text.length - 24));
    const slashMatch = trailing.match(/(^|\s)\/(\w*)$/);
    setIsCommandMenuOpen(Boolean(slashMatch));
    setActiveCommandQuery(slashMatch?.[2] || "");
    if (text.length > 0) pushRecentAction("Edited draft");
    if (savingState === "synced") setSavingState("idle");
  };

  const filteredCommands = slashCommands.filter((item) => item.id.startsWith(activeCommandQuery.toLowerCase()));

  useEffect(() => {
    const handleSelection = () => updateMarks();
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (commandMenuRef.current && !commandMenuRef.current.contains(target)) {
        setIsCommandMenuOpen(false);
      }
      if (toolbarRef.current && !toolbarRef.current.contains(target)) {
        updateMarks();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
        <header className="mb-4 flex flex-col gap-4 rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] px-5 py-4 shadow-lg lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-card)] hover:shadow-lg">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="hidden h-10 w-px bg-white/10 sm:block" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[var(--accent-primary)]">Premium writing workspace</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-dim)]">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${savingState === "synced" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"}`}>
                  {savingState === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleCheckBig className="w-3.5 h-3.5" />}
                  {savingState === "saving" ? "Syncing" : savingState === "synced" ? "Draft" : "Draft"}
                </span>
                <span>{wordCount} words</span>
                <span>{readingMinutes} min read</span>
                <span>Last saved {lastSavedLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 shadow-sm shadow-emerald-500/10">
              {savingState === "saving" ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Syncing to Cloud</span>
              ) : (
                <span className="inline-flex items-center gap-2"><Check className="w-4 h-4" /> ✓ Synced to Cloud</span>
              )}
            </div>
            <button onClick={onViewNotes} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-card)]">
              <FileText className="w-4 h-4" />
              View Notes
            </button>
            <button onClick={saveToCloud} className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg">
              <Cloud className="w-4 h-4" />
              Save to Cloud
            </button>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_400px]">
          <main className="relative rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute inset-0 rounded-lg hidden" />
            <div className="relative flex h-full flex-col gap-5">
              <div className="space-y-4 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] p-5 sm:p-6 select-none">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.34em] text-[var(--accent-primary)]">
                      <PenSquare className="w-3.5 h-3.5" />
                      Create Note
                      <span className="rounded-full border border-[var(--border-main)] bg-[var(--bg-main)] px-2.5 py-1 text-[10px] tracking-[0.28em] text-[var(--text-dim)]">Draft • {wordCount} words • {readingMinutes} min read</span>
                    </div>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Editable Note Title"
                      className="w-full select-auto bg-transparent text-4xl font-semibold tracking-tight text-[var(--text-main)] outline-none placeholder:text-[rgba(169,180,199,0.45)] sm:text-5xl"
                    />
                    <p className="max-w-3xl text-base leading-7 text-[var(--text-dim)]">
                      A premium AI-powered writing and study workspace for deep notes, revision, and research.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 xl:w-[300px]">
                    <StatCard label="Status" value={savingState === "saving" ? "Syncing" : "Saved"} icon={<CircleCheckBig className="w-4 h-4" />} />
                    <StatCard label="Reading" value={`${readingMinutes} min`} icon={<CalendarClock className="w-4 h-4" />} />
                    <StatCard label="Words" value={String(wordCount)} icon={<Type className="w-4 h-4" />} />
                    <StatCard label="Saved" value={savingState === "saving" ? "Working" : "Now"} icon={<Cloud className="w-4 h-4" />} />
                  </div>
                </div>
              </div>

              <div ref={toolbarRef} className="sticky top-4 z-20 -mx-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] p-2 shadow-lg">
                <div className="flex flex-col gap-2">
                  {/* Primary Formatting Tools */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)] p-1">
                      {toolbarItems.slice(0, 5).map((item) => {
                        const active = activeMarks[item.id];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (item.id === "code") {
                                exec("formatBlock", "pre");
                              } else if (item.id === "orderedList") {
                                exec("insertOrderedList");
                              } else if (item.id === "bulletList") {
                                exec("insertUnorderedList");
                              } else if (item.id === "strikethrough") {
                                exec("strikethrough");
                              } else {
                                exec(item.id);
                              }
                            }}
                            className={`inline-flex items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium transition-all hover:shadow-lg ${active ? "bg-[var(--accent-primary)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]"}`}
                            title={item.label}
                          >
                            {item.icon}
                            <span className="hidden md:inline">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Lists Group */}
                    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
                      {toolbarItems.slice(5, 7).map((item) => {
                        const active = activeMarks[item.id];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (item.id === "orderedList") {
                                exec("insertOrderedList");
                              } else if (item.id === "bulletList") {
                                exec("insertUnorderedList");
                              } else {
                                exec(item.id);
                              }
                            }}
                            className={`inline-flex items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium transition-all hover:shadow-lg ${active ? "bg-indigo-500 text-white shadow-indigo-500/20" : "text-[var(--text-dim)] hover:bg-white/10 hover:text-[var(--text-main)]"}`}
                            title={item.label}
                          >
                            {item.icon}
                            <span className="hidden md:inline">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex-1" />

                    {/* Block Elements & Actions */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-end">
                      <button 
                        onClick={() => exec("formatBlock", "h2")} 
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)] px-2.5 py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]"
                        title="Heading"
                      >
                        <Heading2 className="w-4 h-4" />
                        <span className="hidden lg:inline">Heading</span>
                      </button>
                      <button 
                        onClick={() => exec("formatBlock", "blockquote")} 
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)] px-2.5 py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]"
                        title="Quote"
                      >
                        <MessageSquareQuote className="w-4 h-4" />
                        <span className="hidden lg:inline">Quote</span>
                      </button>
                      <button 
                        onClick={() => exec("insertHTML", '<div class="todo-line" style="display:flex;align-items:center;gap:8px;margin:4px 0;">☐ <span>Task item</span></div>')} 
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)] px-2.5 py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]"
                        title="Todo"
                      >
                        <Slash className="w-4 h-4" />
                        <span className="hidden lg:inline">Todo</span>
                      </button>
                      <div className="h-5 w-px bg-white/10" />
                      <button 
                        onClick={() => setActiveAiAction("improve")} 
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-2.5 py-2 text-xs sm:text-sm font-medium text-[var(--accent-primary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-primary)]/20 hover:shadow-lg"
                        title="AI Tools"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden lg:inline">AI</span>
                      </button>
                      <button 
                        onClick={shareNote} 
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)] px-2.5 py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden lg:inline">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isCommandMenuOpen && filteredCommands.length > 0 && (
                  <motion.div
                    ref={commandMenuRef}
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute left-6 top-[220px] z-30 w-[min(100%,430px)] rounded-[24px] border border-white/10 bg-slate-950/95 p-3 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                  >
                    <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
                      <Slash className="w-3.5 h-3.5" />
                      Slash commands
                    </div>
                    <div className="space-y-2">
                      {filteredCommands.map((command) => (
                        <button key={command.id} type="button" onClick={() => insertBlock(command.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-500/30 hover:bg-indigo-500/10">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-indigo-300">{command.icon}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold text-[var(--text-main)]">/{command.id}</span>
                              <ChevronRight className="w-4 h-4 text-[var(--text-dim)]" />
                            </div>
                            <p className="text-sm text-[var(--text-dim)]">{command.label} · {command.hint}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={editorShellRef} className="relative flex-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] p-1 transition-all duration-300 focus-within:border-[var(--accent-primary)]">
                <div className="relative h-full rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] px-5 py-5 sm:px-7 sm:py-8">
                  <div className="mb-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-[var(--text-dim)]">
                    <span className="inline-flex items-center gap-2"><AlignLeft className="w-3.5 h-3.5" /> Type / for commands</span>
                    <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 normal-case tracking-normal">Focus mode</span>
                  </div>
                  <div
                    ref={(el) => {
                      if (el) editorRef.current = el;
                    }}
                    contentEditable
                    role="textbox"
                    aria-multiline="true"
                    suppressContentEditableWarning
                    onFocus={() => setEditorFocused(true)}
                    onBlur={() => setEditorFocused(false)}
                    onInput={onEditorInput}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsCommandMenuOpen(false);
                      }
                    }}
                    data-placeholder='Start writing your note…\nType / for commands'
                    className="note-editor min-h-[720px] w-full rounded-[22px] border-0 bg-transparent px-1 text-[17px] leading-[1.85] tracking-[0.01em] text-[var(--text-main)] outline-none placeholder:text-[rgba(169,180,199,0.44)]"
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Study Note",
                  "Lecture Summary",
                  "Exam Revision",
                  "Research Draft",
                ].map((template) => (
                  <button
                    key={template}
                    onClick={() => {
                      setTitle(template);
                      focusEditor();
                      document.execCommand("insertText", false, "\n\n");
                      pushRecentAction(`Loaded ${template}`);
                    }}
                    className="group rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)]/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[var(--text-main)]">{template}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-dim)] transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-dim)]">Quick template to get started faster.</p>
                  </button>
                ))}
              </div>
            </div>
          </main>

          <aside className="space-y-5">
            {/* Generate with AI Card */}
            <section className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg relative overflow-hidden">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--accent-primary)]/10 blur-2xl pointer-events-none" />
              
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--accent-primary)]">AI Note Generator</p>
                  <h2 className="text-lg font-semibold text-[var(--text-main)]">Generate with AI</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="ai-prompt-input" className="sr-only">Describe note prompt</label>
                  <div className={`relative overflow-hidden rounded-xl p-[2px] bg-[var(--border-main)] transition-all duration-300 ${isPromptFocused ? "shadow-[0_0_15px_rgba(66,133,244,0.2)]" : "shadow-md"}`}>
                    {/* Multi-color Google Colors spinning wheel in the background */}
                    <div 
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350%] h-[350%] aspect-square origin-center z-0 animate-spin"
                      style={{ 
                        backgroundImage: 'conic-gradient(from 0deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)',
                        animationDuration: isGeneratingNote ? '1s' : isPromptFocused ? '2s' : '3.5s',
                        opacity: 1,
                        transition: 'opacity 0.4s ease-in-out',
                      }} 
                    />
                    {/* Inner textarea container covering the spinning background */}
                    <div className="relative z-10 rounded-[10px] bg-[var(--bg-elevated)] overflow-hidden">
                      <textarea
                        id="ai-prompt-input"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onFocus={() => setIsPromptFocused(true)}
                        onBlur={() => setIsPromptFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            generateNoteWithAi();
                          }
                        }}
                        placeholder="Describe what note you want to generate...\n(e.g., 'A study guide for celular respiration split in phases')"
                        maxLength={500}
                        disabled={isGeneratingNote}
                        className="w-full h-24 bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-main)] outline-none resize-none border-0 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-[10px] text-[var(--text-dim)]">Enter to generate</span>
                    <span className="text-[10px] text-[var(--text-dim)]">{aiPrompt.length}/500</span>
                  </div>
                </div>

                {aiError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    {aiError}
                  </div>
                )}

                <button
                  onClick={generateNoteWithAi}
                  disabled={isGeneratingNote || !aiPrompt.trim()}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-300 ${isGeneratingNote || !aiPrompt.trim() ? "bg-emerald-600 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/30"}`}
                >
                  {isGeneratingNote ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating note...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--accent-primary)]">Sphere AI Assistant</p>
                  <h2 className="text-lg font-semibold text-[var(--text-main)]">AI writing tools</h2>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] p-4">
                <p className="text-sm text-[var(--text-dim)]">{aiBusy ? "Processing with Sphere AI…" : aiStatus}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={false}
                    animate={{ width: aiBusy ? "100%" : "32%" }}
                    transition={{ duration: aiBusy ? 1.2 : 0.4, ease: "easeInOut" }}
                    className="h-full rounded-full bg-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                {aiActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => runAiAction(action.id)}
                    className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${action.tone} p-4 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-black/20`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--text-main)]">
                        {aiBusy && activeAiAction === action.id ? <Loader2 className="w-4 h-4 animate-spin" /> : action.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-[var(--text-main)]">{action.title}</span>
                          <ChevronRight className="w-4 h-4 text-[var(--text-dim)] transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-dim)]">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--accent-primary)]">Save & Export</p>
                  <h3 className="text-lg font-semibold text-[var(--text-main)]">Action hierarchy</h3>
                </div>
                <MoreHorizontal className="w-4 h-4 text-[var(--text-dim)]" />
              </div>
              <div className="grid gap-3">
                <ActionButton onClick={saveToCloud} icon={<Cloud className="w-4 h-4" />} label="Save to Cloud" primary />
                <ActionButton onClick={saveToDevice} icon={<Download className="w-4 h-4" />} label="Download" />
                <ActionButton onClick={shareNote} icon={<Link2 className="w-4 h-4" />} label="Share" />
                <ActionButton onClick={duplicateNote} icon={<Copy className="w-4 h-4" />} label="Duplicate" />
                <ActionButton onClick={exportMarkdown} icon={<FileDown className="w-4 h-4" />} label="Export" />
              </div>
              <div className="mt-4 rounded-lg border border-[var(--border-main)] bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                {shareState || "✓ Synced to Cloud"}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--accent-primary)]">Document Analytics</p>
                  <h3 className="text-lg font-semibold text-[var(--text-main)]">Workspace insights</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Word Count" value={String(wordCount)} />
                <Metric label="Reading Time" value={`${readingMinutes} min`} />
                <Metric label="Complexity Score" value={`${complexityScore}%`} />
                <Metric label="Knowledge Score" value={`${knowledgeScore}%`} />
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--accent-primary)]">Recent Actions</p>
                  <h3 className="text-lg font-semibold text-[var(--text-main)]">Activity stream</h3>
                </div>
              </div>
              <div className="space-y-2">
                {recentActions.map((action) => (
                  <div key={action} className="flex items-center gap-3 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-dim)]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)]" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, primary = false }: { onClick: () => void; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg ${primary ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white hover:brightness-110" : "border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"}`}
    >
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <ChevronRight className="w-4 h-4 opacity-60" />
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[var(--text-main)]">{value}</p>
    </div>
  );
}
