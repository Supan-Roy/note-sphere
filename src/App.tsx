/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { UploadCenter } from "./components/UploadCenter";
import { StudyToolkit } from "./components/StudyToolkit";
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
import { Note, Room, Semester, TaskItem } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const readSidebarPreference = () => {
    try {
      return localStorage.getItem("noteSphere.sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(readSidebarPreference);
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    try {
      return window.innerWidth < 1024;
    } catch {
      return false;
    }
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [initialChatNoteId, setInitialChatNoteId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (!isDarkMode) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const updateLayoutMode = () => {
      const mobile = mediaQuery.matches;
      setIsMobileScreen(mobile);
      setIsSidebarCollapsed(mobile ? true : readSidebarPreference());
    };

    updateLayoutMode();
    mediaQuery.addEventListener("change", updateLayoutMode);

    return () => mediaQuery.removeEventListener("change", updateLayoutMode);
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
    const params = new URLSearchParams(window.location.search);
    const sharedPayload = params.get("share");
    if (sharedPayload) {
      try {
        const decoded = decodeURIComponent(escape(window.atob(sharedPayload)));
        const sharedNote = JSON.parse(decoded) as Note;
        setSelectedNote(sharedNote);
        setActiveTab("my-notes");
        return;
      } catch {
        // fall through to normal note lookup
      }
    }

    const noteId = params.get("note");
    if (!noteId) return;
    const sharedNote = notes.find(note => note.id === noteId);
    if (sharedNote) {
      setSelectedNote(sharedNote);
      setActiveTab("my-notes");
    }
  }, [notes]);

  const handleSaveCloudNote = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev.filter(note => note.id !== newNote.id)]);
  };

  const renderContent = () => {
    if (selectedNote) {
      return <NoteDetail note={selectedNote} onBack={() => setSelectedNote(null)} onStartChat={() => handleStartChat(selectedNote.id)} />;
    }

    if (selectedRoom) {
      return <RoomDetail room={selectedRoom} onBack={() => setSelectedRoom(null)} onUpdateRoom={updateRoom} />;
    }

    switch (activeTab) {
      case "dashboard":
      return <Dashboard notes={notes} onNoteOpen={(note) => setSelectedNote(note)} onChatOpen={handleStartChat} onCreateNote={() => setActiveTab("create-note")} onViewNotes={() => setActiveTab("my-notes")} onNavigate={(tab) => setActiveTab(tab)} />;
      case "my-notes":
      return <Dashboard notes={notes} onNoteOpen={(note) => setSelectedNote(note)} onChatOpen={handleStartChat} onCreateNote={() => setActiveTab("create-note")} onViewNotes={() => setActiveTab("my-notes")} onNavigate={(tab) => setActiveTab(tab)} title="My Notes" />;
      case "upload":
        return <UploadCenter onSaveNote={(newNote) => setNotes(prev => [newNote, ...prev])} onGoToChat={handleStartChat} />;
      case "create-note":
        return <NoteComposer onBack={() => setActiveTab("dashboard")} onSaveCloud={handleSaveCloudNote} onViewNotes={() => setActiveTab("my-notes")} />;
      case "toolkit":
        return <StudyToolkit notes={notes} />;
      case "ask":
        return <AskNotes notes={notes} initialNoteId={initialChatNoteId} />;
      case "graph":
        return <KnowledgeGraph notes={notes} />;
      case "semester":
        return <SemesterBuilder semesters={semesters} setSemesters={setSemesters} />;
      case "tasks":
        return <TaskaBoard tasks={tasks} setTasks={setTasks} />;
      case "plans":
        return <PlanPage onBack={() => setActiveTab("dashboard")} />;
      case "shared-notes":
        return <SharingRoom rooms={rooms} setRooms={setRooms} onJoinRoom={(room) => setSelectedRoom(room)} />;
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
            setActiveTab(tab);
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
              onUpload={() => setActiveTab("upload")}
              onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
              isSidebarCollapsed={isSidebarCollapsed}
              isMobileScreen={isMobileScreen}
            />
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="min-h-full">
                {renderContent()}
                <Footer />
              </div>
            </div>
          </main>
        </div>
      </div>

      <FloatingAI />
    </div>
  );
}
