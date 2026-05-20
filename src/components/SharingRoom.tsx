import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  Search, 
  MessageSquare, 
  Share2, 
  Lock, 
  Globe, 
  ArrowRight,
  Sparkles,
  Zap,
  MoreVertical,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Room } from "../types";

export function SharingRoom({ onJoinRoom, rooms, setRooms }: { onJoinRoom: (room: Room) => void, rooms: Room[], setRooms: React.Dispatch<React.SetStateAction<Room[]>> }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: "", description: "", isPublic: true });

  const handleCreateRoom = () => {
    if (!newRoom.title) return;
    const room: Room = {
      id: `room-${Math.random().toString(36).substr(2, 9)}`,
      title: newRoom.title,
      description: newRoom.description,
      ownerId: "current-user",
      members: ["current-user"],
      isPublic: newRoom.isPublic,
      code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: new Date(),
      sharedNotes: [],
      subRooms: []
    };
    setRooms([room, ...rooms]);
    setIsCreating(false);
    setNewRoom({ title: "", description: "", isPublic: true });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Sharing Room
          </h1>
          <p className="text-[var(--text-dim)]">Collaborative academic zones powered by shared knowledge intelligence.</p>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-dim)] font-bold hover:bg-white/10 transition-all text-sm">Join with Code</button>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-red-600 px-6 py-2 rounded-xl text-white font-bold shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center gap-2 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Create New Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1 block">Room Title</label>
                  <input 
                    type="text" 
                    value={newRoom.title}
                    onChange={(e) => setNewRoom({...newRoom, title: e.target.value})}
                    placeholder="e.g. Computer Science 2025"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1 block">Description</label>
                  <textarea 
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                    placeholder="What is this room for..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 h-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                   <input 
                    type="checkbox" 
                    checked={newRoom.isPublic}
                    onChange={(e) => setNewRoom({...newRoom, isPublic: e.target.checked})}
                    id="is-public"
                   />
                   <label htmlFor="is-public" className="text-sm text-[var(--text-dim)]">Make Public (shared with all members)</label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsCreating(false)} className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-[var(--text-dim)] font-bold hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleCreateRoom} className="flex-1 bg-red-600 px-6 py-3 rounded-xl text-white font-bold hover:bg-red-700 transition-all">Create Room</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Live Rooms" value="124" icon={Zap} color="indigo" />
        <StatCard label="Knowledge Shares" value="2.4k" icon={Sparkles} color="cyan" />
        <StatCard label="Contributors" value="840" icon={Users} color="emerald" />
        <StatCard label="AI Assists" value="15k" icon={ShieldCheck} color="purple" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Room Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100 italic">Trending Rooms</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input type="text" placeholder="Search rooms..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" />
            </div>
          </div>

          <div className="space-y-4">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ x: 4 }}
                onClick={() => onJoinRoom(room)}
                className="glass-card p-6 flex items-start gap-6 group cursor-pointer border-l-4 border-l-transparent hover:border-l-cyan-500 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-cyan-400">{room.title.charAt(0)}</span>
                  <div className="flex -space-x-2 mt-1">
                     <div className="w-4 h-4 rounded-full bg-indigo-500 border border-[#030712] text-[8px] flex items-center justify-center text-white">A</div>
                     <div className="w-4 h-4 rounded-full bg-emerald-500 border border-[#030712] text-[8px] flex items-center justify-center text-white">B</div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-100 group-hover:text-cyan-300 transition-colors truncate">{room.title}</h3>
                    {room.isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-gray-600" />}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {room.description}
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{room.members.length} Members</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-gray-600">
                      <MessageSquare className="w-3 h-3" />
                      <span>42 Messages</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-gray-600">
                      <Share2 className="w-3 h-3" />
                      <span>15 Notes Shared</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 h-full">
                  <button className="p-2 text-gray-600 hover:text-gray-400"><MoreVertical className="w-4 h-4" /></button>
                  <div className="mt-auto bg-cyan-600 p-2 rounded-xl text-white shadow-xl shadow-cyan-600/20 hover:scale-110 active:scale-95 transition-all cursor-pointer">
                     <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-l-4 border-l-indigo-500 space-y-6 bg-gradient-to-br from-indigo-500/5 to-transparent">
             <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-gray-200">Recommended Rooms</h3>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed">
               Based on your recent notes about <span className="text-indigo-400">Quantum Theory</span>, Gemini suggests:
             </p>
             <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                  <p className="text-xs font-bold text-gray-300 group-hover:text-indigo-300">CERN Research Forum</p>
                  <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest font-bold">84% Match Score</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                  <p className="text-xs font-bold text-gray-300 group-hover:text-indigo-300">Berkeley Physics Club</p>
                  <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest font-bold">72% Match Score</p>
                </div>
             </div>
          </div>

          <div className="glass-card p-6 space-y-4 overflow-hidden relative">
             <h3 className="font-bold text-gray-200">Room Activity</h3>
             <div className="space-y-4 relative z-10">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-px h-10 bg-gray-800 ml-4 absolute left-0"></div>
                     <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-gray-600" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-gray-300 leading-tight"><span className="font-bold text-indigo-400">Sarah</span> shared a new note in <span className="text-cyan-400">Physics 101</span></p>
                        <p className="text-[9px] text-gray-600 mt-0.5">2 minutes ago</p>
                     </div>
                  </div>
                ))}
             </div>
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-24 h-24 text-gray-400" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className={`glass-card p-4 transition-all hover:bg-white/[0.02] border-b-2 border-b-${color}-500/50`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 text-${color}-400`} />
        </div>
        <span className="text-xl font-bold text-gray-100">{value}</span>
      </div>
      <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest">{label}</p>
    </div>
  );
}
