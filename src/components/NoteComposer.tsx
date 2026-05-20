import { useMemo, useState, useRef } from "react";
import { ArrowLeft, Cloud, Download, Link2, Sparkles, PenSquare, FileText } from "lucide-react";
import { Note } from "../types";

interface NoteComposerProps {
  onBack: () => void;
  onSaveCloud: (note: Note) => void;
  onViewNotes: () => void;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

function deriveTags(title: string, content: string) {
  const words = `${title} ${content}`
    .split(/\s+/)
    .map(word => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(word => word.length > 4);

  return Array.from(new Set(words)).slice(0, 5);
}

function summarize(content: string) {
  const clean = content.trim();
  if (!clean) return "A personal note created in the editor.";
  return clean.length > 180 ? `${clean.slice(0, 180).trim()}...` : clean;
}

export function NoteComposer({ onBack, onSaveCloud, onViewNotes }: NoteComposerProps) {
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState(""); // HTML content from editor
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [savedNote, setSavedNote] = useState<Note | null>(null);
  const [shareState, setShareState] = useState<string>("");

  const canSave = content.trim().length > 0 || title.trim().length > 0;

  const downloadFileName = useMemo(() => {
    return `${title.trim() || "note"}.txt`.replace(/\s+/g, "-").toLowerCase();
  }, [title]);

  const saveToDevice = () => {
    const text = `${title.trim() || "Untitled Note"}\n\n${editorRef.current ? editorRef.current.innerText : content}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setShareState("Saved to your device.");
  };

  const saveToCloud = () => {
    if (!canSave) {
      setShareState("Write something first, then save it.");
      return;
    }

    const noteId = savedNote?.id || makeId();
    const note: Note = {
      id: noteId,
      title: title.trim() || "Untitled Note",
      ownerId: "user1",
      ownerName: "Supan",
      type: "text",
      content: editorRef.current ? editorRef.current.innerHTML : content,
      rawText: editorRef.current ? editorRef.current.innerText : content,
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
          examReadiness: 55
        },
        missingTopics: []
      },
      likesCount: savedNote?.likesCount ?? 0,
      bookmarksCount: savedNote?.bookmarksCount ?? 0,
      createdAt: savedNote?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    onSaveCloud(note);
    setSavedNote(note);
    setShareState("Saved to My Notes.");
  };

  const shareNote = async () => {
    const noteToShare = savedNote ?? {
      id: makeId(),
      title: title.trim() || "Untitled Note",
      ownerId: "user1",
      ownerName: "Supan",
      type: "text" as const,
      content: editorRef.current ? editorRef.current.innerHTML : content,
      rawText: editorRef.current ? editorRef.current.innerText : content,
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
          examReadiness: 55
        },
        missingTopics: []
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
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button onClick={onViewNotes} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all">
          <FileText className="w-4 h-4" />
          View Notes
        </button>
      </div>

      <section className="glass-card p-8 border border-white/5">
        <div className="flex flex-col gap-2 mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">
            <PenSquare className="w-3.5 h-3.5" />
            Create Note
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Write, save, and share your note</h1>
          <p className="text-[var(--text-dim)] max-w-2xl">Use the editor below to draft your note, save it to your device, save it to My Notes, or copy a share link for others.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Note Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear title"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-main)] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Editor</label>

              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => document.execCommand('bold')} className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-sm">Bold</button>
                <button type="button" onClick={() => document.execCommand('italic')} className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-sm">Italic</button>
                <button type="button" onClick={() => document.execCommand('insertOrderedList')} className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-sm">Numbered</button>
                <button type="button" onClick={() => document.execCommand('insertUnorderedList')} className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-sm">Bullets</button>
                <select defaultValue="p" onChange={(e) => document.execCommand('formatBlock', false, e.target.value)} className="bg-white/5 border border-white/5 text-sm rounded-md px-2 py-1">
                  <option value="p">Text</option>
                  <option value="h3">Large</option>
                  <option value="h4">Medium</option>
                </select>
              </div>

              <div
                ref={(el) => { if (el) editorRef.current = el; }}
                contentEditable
                role="textbox"
                suppressContentEditableWarning
                onInput={() => setContent(editorRef.current ? editorRef.current.innerHTML : "")}
                className="min-h-[380px] w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-[var(--text-main)] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y leading-7"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-main)]">Save options</h2>
                  <p className="text-sm text-[var(--text-dim)]">Choose how you want to keep this note.</p>
                </div>
              </div>

              <div className="grid gap-3">
                <button onClick={saveToCloud} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-all">
                  <Cloud className="w-4 h-4" />
                  Save to Cloud
                </button>
                <button onClick={saveToDevice} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all">
                  <Download className="w-4 h-4" />
                  Save to Device
                </button>
                <button onClick={shareNote} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/15 transition-all">
                  <Link2 className="w-4 h-4" />
                  Share Note
                </button>
              </div>

              {savedNote && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
                  Saved in My Notes. Use Share Note to copy a link anyone can open.
                </div>
              )}

              {shareState && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[var(--text-dim)] break-all">
                  {shareState}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 space-y-3">
              <h3 className="font-semibold text-[var(--text-main)]">What happens next</h3>
              <ul className="space-y-2 text-sm text-[var(--text-dim)] leading-relaxed list-disc pl-5">
                <li>Cloud save keeps the note in My Notes.</li>
                <li>Device save downloads a `.txt` file to your computer.</li>
                <li>Share copies a link that opens this note directly when the app is open.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
