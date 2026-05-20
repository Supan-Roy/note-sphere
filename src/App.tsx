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
import { Note, Room, Semester } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
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

  // Global State for "Workability"
  const [notes, setNotes] = useState<Note[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
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

  const renderContent = () => {
    if (selectedNote) {
      return <NoteDetail note={selectedNote} onBack={() => setSelectedNote(null)} onStartChat={() => handleStartChat(selectedNote.id)} />;
    }

    if (selectedRoom) {
      return <RoomDetail room={selectedRoom} onBack={() => setSelectedRoom(null)} onUpdateRoom={updateRoom} />;
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard notes={notes} onNoteOpen={(note) => setSelectedNote(note)} onChatOpen={handleStartChat} />;
      case "my-notes":
        return <Dashboard notes={notes} onNoteOpen={(note) => setSelectedNote(note)} onChatOpen={handleStartChat} title="My Notes" />;
      case "upload":
        return <UploadCenter onSaveNote={(newNote) => setNotes(prev => [newNote, ...prev])} onGoToChat={handleStartChat} />;
      case "toolkit":
        return <StudyToolkit notes={notes} />;
      case "ask":
        return <AskNotes notes={notes} initialNoteId={initialChatNoteId} />;
      case "graph":
        return <KnowledgeGraph notes={notes} />;
      case "semester":
        return <SemesterBuilder semesters={semesters} setSemesters={setSemesters} />;
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
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Topbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {renderContent()}
        </div>
      </main>

      <FloatingAI />
    </div>
  );
}
