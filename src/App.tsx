/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { StudyToolkit } from "./components/StudyToolkit";
import { PreparationMode } from "./components/PreparationMode";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import { NoteDetail } from "./components/NoteDetail";
import { SemesterBuilder } from "./components/SemesterBuilder";
import { SharingRoom } from "./components/SharingRoom";
import { RoomDetail } from "./components/RoomDetail";
import { FloatingAI } from "./components/FloatingAI";
import { AskNotes } from "./components/AskNotes";
import { NoteComposer } from "./components/NoteComposer";
import { TaskaBoard } from "./components/TaskaBoard";
import { PlanPage } from "./components/PlanPage";
import { Footer } from "./components/Footer";
import { HolmesScanner } from "./components/HolmesScanner";
import { Note, Room, Semester, TaskItem, TrashItem } from "./types";

export default function App() {
  const currentUserId = "user1";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return window.innerWidth <= window.innerHeight;
    } catch {
      return false;
    }
  });
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    try {
      return window.innerWidth <= window.innerHeight;
    } catch {
      return false;
    }
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [initialChatNoteId, setInitialChatNoteId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ active: boolean; currentFile: string; completed: number; total: number }>({
    active: false,
    currentFile: "",
    completed: 0,
    total: 0,
  });
  const uploadAbortRef = useRef<AbortController | null>(null);
  const uploadCancelledRef = useRef(false);

  useEffect(() => {
    if (!isDarkMode) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const updateLayoutMode = () => {
      const mobile = window.innerWidth <= window.innerHeight;
      setIsMobileScreen(mobile);
      setIsSidebarCollapsed(mobile);
    };

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);

    return () => window.removeEventListener("resize", updateLayoutMode);
  }, []);

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem("noteSphere.notes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const stored = localStorage.getItem("noteSphere.tasks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
    try {
      const stored = localStorage.getItem("noteSphere.trash");
      const parsed = stored ? JSON.parse(stored) : [];
      const now = Date.now();
      return Array.isArray(parsed)
        ? parsed.filter((item) => new Date(item.expiresAt).getTime() > now)
        : [];
    } catch {
      return [];
    }
  });
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "room-1",
      title: "Physics Geniuses",
      description: "Advanced discussion on quantum mechanics and particle physics.",
      ownerId: "system",
      members: ["user1", "user2", "user3"],
      isPublic: true,
      code: "QUAN2025",
      createdAt: new Date(),
      sharedNotes: [
        { id: "rn1", title: "Maxwell's Equations Summary", type: "pdf", author: "Supan", createdAt: new Date() },
        { id: "rn2", title: "Intro to Qubits Lecture Notes", type: "image", author: "Sarah K", createdAt: new Date() },
        { id: "rn3", title: "Advanced Wave Functions", type: "pdf", author: "Jordan Lee", createdAt: new Date() }
      ],
      subRooms: [
        { id: "sr1", title: "Exam Prep: Unit 1", memberCount: 4 },
        { id: "sr2", title: "Project Group: Alpha", memberCount: 3 }
      ]
    }
  ]);

  const updateRoom = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    setSelectedRoom(updatedRoom);
  };

  const handleStartChat = (noteId: string) => {
    setInitialChatNoteId(noteId);
    setActiveTab("ask");
    setSelectedNote(null);
  };

  const isInlineNote = (note: Note) => note.type === "text";

  const openExternalNote = (note: Note) => {
    const targetUrl = note.storageUrl || window.URL.createObjectURL(new Blob([note.content || note.aiAnalysis?.summary || ""], { type: "text/plain" }));
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenNote = (note: Note) => {
    if (isInlineNote(note)) {
      setSelectedNote(note);
      return;
    }

    openExternalNote(note);
    setSelectedNote(null);
  };

  const shareNote = async (note: Note) => {
    const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(note))));
    const shareLink = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      window.prompt("Copy this share link", shareLink);
    }
  };

  const navigateToTab = (tab: string) => {
    setSelectedNote(null);
    setSelectedRoom(null);
    setActiveTab(tab);
  };

  useEffect(() => {
    try {
      localStorage.setItem("noteSphere.notes", JSON.stringify(notes));
    } catch {
      // ignore storage issues
    }
  }, [notes]);

  useEffect(() => {
    try {
      if (!isMobileScreen) {
        localStorage.setItem("noteSphere.sidebarCollapsed", String(isSidebarCollapsed));
      }
    } catch {
      // ignore storage issues
    }
  }, [isSidebarCollapsed, isMobileScreen]);

  useEffect(() => {
    try {
      localStorage.setItem("noteSphere.tasks", JSON.stringify(tasks));
    } catch {
      // ignore storage issues
    }
  }, [tasks]);

  useEffect(() => {
    const pruneAndStoreTrash = () => {
      const now = Date.now();
      setTrashItems((prev) => {
        const next = prev.filter((item) => new Date(item.expiresAt).getTime() > now);
        try {
          localStorage.setItem("noteSphere.trash", JSON.stringify(next));
        } catch {
          // ignore storage issues
        }
        return next;
      });
    };

    pruneAndStoreTrash();
    const timer = window.setInterval(pruneAndStoreTrash, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPayload = params.get("share");
    if (sharedPayload) {
      try {
        const decoded = decodeURIComponent(escape(window.atob(sharedPayload)));
        const sharedNote = JSON.parse(decoded) as Note;
        if (sharedNote.type === "text") {
          setSelectedNote(sharedNote);
        } else {
          openExternalNote(sharedNote);
        }
        setActiveTab("my-notes");
        return;
      } catch {
        // fall through to normal note lookup
      }
    }

    const noteId = params.get("note");
    if (!noteId) return;
    const sharedNote = notes.find((note: Note) => note.id === noteId);
    if (sharedNote) {
      setSelectedNote(sharedNote);
      setActiveTab("my-notes");
    }
  }, [notes]);

  const handleSaveCloudNote = (newNote: Note) => {
    setNotes((prev: Note[]) => [newNote, ...prev.filter((note: Note) => note.id !== newNote.id)]);
  };

  const processUploadedFile = async (file: File, signal?: AbortSignal) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const fileKind = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
        ? "audio"
        : extension === "txt" || extension === "md"
          ? "text"
          : extension === "ppt" || extension === "pptx"
            ? extension
            : extension === "doc" || extension === "docx"
              ? extension
              : "pdf";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileKind);

    const response = await fetch("/api/process-note", {
      method: "POST",
      body: formData,
      signal,
    });

    if (!response.ok) throw new Error(`Processing failed for ${file.name}`);

    const result = await response.json();
    const noteId = Math.random().toString(36).slice(2, 11);
    const newNote: Note = {
      id: noteId,
      title: result.title || file.name.replace(/\.[^.]+$/, "") || "Untitled Note",
      ownerId: currentUserId,
      ownerName: "Supan",
      type: fileKind,
      content: result.extractedText || "",
      rawText: result.extractedText || "",
      storageUrl: URL.createObjectURL(file),
      tags: result.tags || [],
      isPublic: false,
      aiAnalysis: result,
      likesCount: 0,
      bookmarksCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    handleSaveCloudNote(newNote);
  };

  const openDirectUploadPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a";
    input.onchange = async (event: any) => {
      const files = Array.from(event.target.files || []) as File[];
      if (!files.length) return;

      uploadCancelledRef.current = false;
      const controller = new AbortController();
      uploadAbortRef.current = controller;
      setUploadProgress({ active: true, currentFile: files[0].name, completed: 0, total: files.length });

      try {
        for (let index = 0; index < files.length; index += 1) {
          if (uploadCancelledRef.current) break;
          const file = files[index];
          setUploadProgress({ active: true, currentFile: file.name, completed: index, total: files.length });
          await processUploadedFile(file, controller.signal);
          setUploadProgress({ active: true, currentFile: file.name, completed: index + 1, total: files.length });
        }
      } catch (error) {
        if (!uploadCancelledRef.current) {
          console.error(error);
        }
      }
      finally {
        uploadAbortRef.current = null;
        setUploadProgress({ active: false, currentFile: "", completed: 0, total: 0 });
      }
    };
    input.click();
  };

  const cancelUpload = () => {
    uploadCancelledRef.current = true;
    uploadAbortRef.current?.abort();
    setUploadProgress({ active: false, currentFile: "", completed: 0, total: 0 });
  };

  const addToTrash = (item: Omit<TrashItem, "id" | "deletedAt" | "expiresAt">) => {
    const deletedAt = new Date();
    const expiresAt = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    setTrashItems((prev) => [
      {
        id: Math.random().toString(36).slice(2, 11),
        deletedAt,
        expiresAt,
        ...item,
      },
      ...prev,
    ]);
  };

  const restoreTrashItem = (itemId: string) => {
    const item = trashItems.find((entry) => entry.id === itemId);
    if (!item) return;

    if (item.payload?.note) {
      setNotes((prev) => [item.payload!.note!, ...prev.filter((note) => note.id !== item.payload!.note!.id)]);
    } else if (item.payload?.semester) {
      setSemesters((prev) => [item.payload!.semester!, ...prev.filter((semester) => semester.id !== item.payload!.semester!.id)]);
    } else if (item.payload?.course && item.payload.semesterId) {
      setSemesters((prev) => prev.map((semester) => {
        if (semester.id !== item.payload?.semesterId) return semester;
        const restoredCourse = item.payload!.course!;
        return {
          ...semester,
          courses: [restoredCourse, ...semester.courses.filter((course) => course.id !== restoredCourse.id)],
        };
      }));
    } else if (item.payload?.material && item.payload.semesterId && item.payload.courseId) {
      setSemesters((prev) => prev.map((semester) => {
        if (semester.id !== item.payload?.semesterId) return semester;
        return {
          ...semester,
          courses: semester.courses.map((course) => {
            if (course.id !== item.payload?.courseId) return course;
            const restoredMaterial = item.payload!.material!;
            const nextMaterials = [restoredMaterial, ...(course.materials || []).filter((material) => material.id !== restoredMaterial.id)];
            return { ...course, materials: nextMaterials };
          }),
        };
      }));
    }

    setTrashItems((prev) => prev.filter((entry) => entry.id !== itemId));
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find((item) => item.id === id);
    if (note) {
      addToTrash({
        kind: "note",
        title: note.title,
        source: "My Notes",
        details: `${note.type.toUpperCase()} note by ${note.ownerName}`,
        payload: { note },
      });
    }
    setNotes((prev: Note[]) => prev.filter((n: Note) => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleEmptyTrash = () => {
    setTrashItems([]);
    try {
      localStorage.removeItem("noteSphere.trash");
    } catch {
      // ignore storage issues
    }
  };

  const renderContent = () => {
    if (selectedNote) {
      return <NoteDetail note={selectedNote} onBack={() => setSelectedNote(null)} onStartChat={() => handleStartChat(selectedNote.id)} />;
    }

    if (selectedRoom) {
      return <RoomDetail room={selectedRoom} onBack={() => setSelectedRoom(null)} onUpdateRoom={updateRoom} currentUserId={currentUserId} />;
    }

    switch (activeTab) {
      case "dashboard":
      return <Dashboard notes={notes} trashItems={trashItems} onNoteOpen={handleOpenNote} onChatOpen={handleStartChat} onCreateNote={() => navigateToTab("create-note")} onViewNotes={() => navigateToTab("my-notes")} onNavigate={(tab) => navigateToTab(tab)} onDeleteNote={handleDeleteNote} onRestoreTrash={restoreTrashItem} onEmptyTrash={handleEmptyTrash} onUploadFiles={openDirectUploadPicker} onShareNote={shareNote} />;
      case "my-notes":
      return <Dashboard notes={notes} trashItems={trashItems} onNoteOpen={handleOpenNote} onChatOpen={handleStartChat} onCreateNote={() => navigateToTab("create-note")} onViewNotes={() => navigateToTab("my-notes")} onNavigate={(tab) => navigateToTab(tab)} onDeleteNote={handleDeleteNote} onRestoreTrash={restoreTrashItem} onEmptyTrash={handleEmptyTrash} onUploadFiles={openDirectUploadPicker} onShareNote={shareNote} title="My Notes" />;
      case "upload":
        return <Dashboard notes={notes} trashItems={trashItems} onNoteOpen={handleOpenNote} onChatOpen={handleStartChat} onCreateNote={() => navigateToTab("create-note")} onViewNotes={() => navigateToTab("my-notes")} onNavigate={(tab) => navigateToTab(tab)} onDeleteNote={handleDeleteNote} onRestoreTrash={restoreTrashItem} onEmptyTrash={handleEmptyTrash} onUploadFiles={openDirectUploadPicker} onShareNote={shareNote} />;
      case "create-note":
        return <NoteComposer onBack={() => navigateToTab("dashboard")} onSaveCloud={handleSaveCloudNote} onViewNotes={() => navigateToTab("my-notes")} />;
      case "toolkit":
        return <StudyToolkit notes={notes} />;
      case "preparation":
        return <PreparationMode notes={notes} onSaveCloud={handleSaveCloudNote} onBack={() => navigateToTab("dashboard")} />;
      case "ask":
        return <AskNotes notes={notes} initialNoteId={initialChatNoteId} onAddNote={(note) => setNotes(prev => [note, ...prev])} />;
      case "graph":
        return <KnowledgeGraph notes={notes} />;
      case "trash":
        return <Dashboard notes={notes} trashItems={trashItems} onNoteOpen={(note) => setSelectedNote(note)} onChatOpen={handleStartChat} onCreateNote={() => setActiveTab("create-note")} onViewNotes={() => setActiveTab("my-notes")} onNavigate={(tab) => setActiveTab(tab)} onDeleteNote={handleDeleteNote} onRestoreTrash={restoreTrashItem} onEmptyTrash={handleEmptyTrash} title="Trash Bin" />;
      case "semester":
        return <SemesterBuilder semesters={semesters} setSemesters={setSemesters} onTrash={addToTrash} />;
      case "tasks":
        return <TaskaBoard tasks={tasks} setTasks={setTasks} />;
      case "plans":
        return <PlanPage onBack={() => navigateToTab("dashboard")} />;
      case "shared-notes":
        return <SharingRoom rooms={rooms} setRooms={setRooms} onJoinRoom={(room) => setSelectedRoom(room)} />;
      case "holmes-scanner":
        return <HolmesScanner notes={notes} tasks={tasks} rooms={rooms} semesters={semesters} trashItems={trashItems} />;
      default:
        return (
          <div className="p-8">
            <div className="glass-card p-12 text-center opacity-50">
              <h2 className="text-xl font-bold mb-2">Section: {activeTab}</h2>
              <p>This module is currently being optimized by AI.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 app-surface" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative z-10 grid h-screen grid-cols-[auto_minmax(0,1fr)] overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            navigateToTab(tab);
            if (isMobileScreen) {
              setIsSidebarCollapsed(true);
            }
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          onBuyPlan={() => setActiveTab("plans")}
          isMobileScreen={isMobileScreen}
        />

        <div className="relative z-10 flex min-w-0 flex-col h-screen overflow-hidden">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar
              isDarkMode={isDarkMode}
              toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
              isSidebarCollapsed={isSidebarCollapsed}
              isMobileScreen={isMobileScreen}
            />
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="min-h-full">
                {renderContent()}
                <Footer onNavigate={navigateToTab} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {uploadProgress.active && (
        <div className="fixed bottom-4 left-4 right-4 z-[80] pointer-events-none flex justify-center sm:justify-end sm:left-auto sm:right-6 sm:bottom-6">
          <div className="pointer-events-auto w-full max-w-xl rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/30 sm:p-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)]">Uploading</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--text-main)]">Adding files to My Notes</h3>
                <p className="mt-1 truncate text-sm text-[var(--text-dim)]">{uploadProgress.currentFile}</p>
              </div>
              <button
                onClick={cancelUpload}
                className="shrink-0 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-semibold text-[var(--text-main)] transition-all hover:bg-[var(--bg-main)]"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${uploadProgress.total ? Math.max(6, (uploadProgress.completed / uploadProgress.total) * 100) : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-dim)]">
                <span>{uploadProgress.completed} of {uploadProgress.total} files processed</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Uploading now
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingAI />
    </div>
  );
}
