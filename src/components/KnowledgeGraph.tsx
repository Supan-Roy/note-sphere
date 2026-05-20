import { useState, useMemo, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { motion } from "motion/react";
import { Network, Search, Target, ZoomIn, ZoomOut } from "lucide-react";
import { Note } from "../types";

const INITIAL_DATA = {
  nodes: [
    { id: "Physics", group: 1, val: 26 },
    { id: "Quantum Computing", group: 1, val: 22 },
    { id: "Algorithms", group: 2, val: 20 },
    { id: "Data Structures", group: 2, val: 16 },
    { id: "Superposition", group: 1, val: 12 },
    { id: "Entanglement", group: 1, val: 12 },
    { id: "Qubits", group: 1, val: 14 },
    { id: "Sorting", group: 2, val: 12 },
    { id: "Searching", group: 2, val: 10 },
    { id: "Dynamic Programming", group: 2, val: 14 },
    { id: "Binary Trees", group: 2, val: 11 },
    // extra surrounding concepts to make the demo feel dense and rich
    { id: "Wavefunction", group: 1, val: 9 },
    { id: "Interference", group: 1, val: 8 },
    { id: "QFT", group: 1, val: 9 },
    { id: "Complexity", group: 2, val: 10 },
    { id: "Graphs", group: 2, val: 9 },
    { id: "Trees", group: 2, val: 8 },
    { id: "Recursion", group: 2, val: 9 },
    { id: "Greedy", group: 2, val: 7 },
    { id: "Hashing", group: 2, val: 8 },
  ],
  links: [
    { source: "Physics", target: "Quantum Computing" },
    { source: "Quantum Computing", target: "Superposition" },
    { source: "Quantum Computing", target: "Entanglement" },
    { source: "Quantum Computing", target: "Qubits" },
    { source: "Algorithms", target: "Data Structures" },
    { source: "Algorithms", target: "Sorting" },
    { source: "Algorithms", target: "Searching" },
    { source: "Algorithms", target: "Dynamic Programming" },
    { source: "Data Structures", target: "Binary Trees" },
    { source: "Quantum Computing", target: "Algorithms" },
    { source: "Physics", target: "Wavefunction" },
    { source: "Physics", target: "Interference" },
    { source: "Quantum Computing", target: "QFT" },
    { source: "Algorithms", target: "Complexity" },
    { source: "Data Structures", target: "Graphs" },
    { source: "Data Structures", target: "Trees" },
    { source: "Sorting", target: "Recursion" },
    { source: "Searching", target: "Hashing" },
  ]
};

export function KnowledgeGraph({ notes = [] }: { notes?: Note[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [filterText, setFilterText] = useState("");

  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    if (notes.length === 0) {
      // start from demo data when no notes
      return INITIAL_DATA;
    }

    const nodeIndex = new Map<string, any>();

    const ensureNode = (id: string, data: any) => {
      if (!id || typeof id !== 'string' || id.trim() === '') return null;
      const key = id.trim();
      if (!nodeIndex.has(key)) {
        const newNode = { id: key, ...data };
        nodeIndex.set(key, newNode);
      }
      return nodeIndex.get(key);
    };

    // Add notes and their concepts/subjects
    notes.forEach(note => {
      const rawTitle = typeof note.title === 'string' ? note.title.trim() : '';
      const noteId = rawTitle && rawTitle.toLowerCase() !== 'untitled' ? rawTitle : (note.id ? `Note ${note.id}` : `Note ${Math.random().toString(36).slice(2,7)}`);
      ensureNode(noteId, { group: 1, val: 16, isNote: true });

      // Add subject nodes from tags (skip empty or 'untitled' tags)
      (note.tags || []).forEach(tag => {
        const t = (tag || '').toString().trim();
        if (!t || t.toLowerCase() === 'untitled') return;
        const subjectId = `Subject: ${t}`;
        ensureNode(subjectId, { group: 3, val: 12, isSubject: true });
        links.push({ source: noteId, target: subjectId });
      });

      // Add key concepts as connected nodes (skip empty or 'untitled')
      note.aiAnalysis?.keyConcepts?.forEach(concept => {
        const c = (concept || '').toString().trim();
        if (!c || c.toLowerCase() === 'untitled') return;
        ensureNode(c, { group: 2, val: 9, isNote: false });
        links.push({ source: noteId, target: c });
      });
    });

    // collect nodes
    nodeIndex.forEach(n => nodes.push(n));

    // If filter is applied
    if (filterText) {
      const filteredNodes = nodes.filter(n => n.id.toLowerCase().includes(filterText.toLowerCase()));
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      const filteredLinks = links.filter(l => filteredNodeIds.has(l.source) || filteredNodeIds.has(l.target));
      
      // Also include the other end of the link
      filteredLinks.forEach(l => {
        filteredNodeIds.add(l.source);
        filteredNodeIds.add(l.target);
      });
      
      return {
        nodes: nodes.filter(n => filteredNodeIds.has(n.id)),
        links: filteredLinks
      };
    }

    // remove nodes explicitly containing 'Untitled' to avoid noisy placeholders
    const untitledRegex = /\bUntitled\b/i;
    const filteredNodes = nodes.filter(n => !(typeof n.id === 'string' && untitledRegex.test(n.id)));
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // drop links that reference missing endpoints or removed nodes
    const validLinks = links.filter(l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target));

    return { nodes: filteredNodes, links: validLinks };
  }, [notes, filterText]);

  // If graphData ended up empty (e.g., filtering removed nodes), fall back to demo INITIAL_DATA
  const displayGraph = (graphData && Array.isArray(graphData.nodes) && graphData.nodes.length > 0) ? graphData : INITIAL_DATA;

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth || Math.max(600, window.innerWidth - 400), height: clientHeight || Math.max(400, window.innerHeight - 220) });
    }

    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || Math.max(600, window.innerWidth - 400);
        const h = containerRef.current.clientHeight || Math.max(400, window.innerHeight - 220);
        setDimensions({ width: w, height: h });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  

  const zoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400);
  const zoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() * 0.7, 400);
  const resetZoom = () => {
    graphRef.current?.zoomToFit(400, 50);
    setSelectedNode(null);
    setHoverNode(null);
  };

  const activeFocus = hoverNode ?? selectedNode;
  const conceptCount = displayGraph.nodes.filter((node: any) => !node.isNote).length;
  const noteCount = displayGraph.nodes.filter((node: any) => node.isNote).length;

  // helper to normalize link endpoints which may be ids (string) or node objects
  const endpointId = (endpoint: any) => (typeof endpoint === 'object' && endpoint !== null ? endpoint.id : endpoint);
  const resolveNodeObject = (endpoint: any) => {
    if (typeof endpoint === 'object' && endpoint !== null) return endpoint;
    return displayGraph.nodes.find((n: any) => n.id === endpoint) || { id: endpoint };
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-700 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-28 left-16 h-72 w-72 rounded-full bg-cyan-500/14 blur-3xl"
          animate={{ x: [0, 18, 0], y: [0, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-16 right-24 h-80 w-80 rounded-full bg-indigo-500/14 blur-3xl"
          animate={{ x: [0, -16, 0], y: [0, 12, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-6rem] left-1/3 h-96 w-96 rounded-full bg-violet-500/12 blur-3xl"
          animate={{ x: [0, 10, 0], y: [0, -14, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.10),transparent_22%)]"
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[var(--bg-main)]/80 backdrop-blur-xl">
        <div className="space-y-2">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-200"
            animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 24px rgba(34,211,238,0.18)", "0 0 0 rgba(34,211,238,0)"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Network className="w-3 h-3" />
            Semantic map
          </motion.div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <motion.span
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-500 text-white shadow-[0_16px_40px_rgba(34,211,238,0.22)]"
              animate={{ y: [0, -4, 0], rotate: [0, 1.5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="absolute inset-0 rounded-2xl border border-white/20" />
              <Network className="w-6 h-6" />
            </motion.span>
            Knowledge Graph
          </h1>
          <p className="text-[var(--text-dim)] text-sm max-w-2xl">Explore how your study materials connect through concepts, patterns, and source notes.</p>
        </div>

        <div className="flex flex-col gap-3 items-end">
          <div className="flex gap-3">
            <motion.div className="glass-card px-4 py-3 min-w-24" whileHover={{ y: -3, scale: 1.02 }}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-dim)]">Notes</p>
              <p className="text-lg font-bold text-[var(--text-main)]">{noteCount}</p>
            </motion.div>
            <motion.div className="glass-card px-4 py-3 min-w-24" whileHover={{ y: -3, scale: 1.02 }}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-dim)]">Concepts</p>
              <p className="text-lg font-bold text-[var(--text-main)]">{conceptCount}</p>
            </motion.div>
            <motion.div className="glass-card px-4 py-3 min-w-24" whileHover={{ y: -3, scale: 1.02 }}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-dim)]">Links</p>
              <p className="text-lg font-bold text-[var(--text-main)]">{displayGraph.links.length}</p>
            </motion.div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter concepts..." 
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 w-64 backdrop-blur-sm"
              />
            </div>
            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1 backdrop-blur-sm">
              <button onClick={zoomIn} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={zoomOut} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"><ZoomOut className="w-4 h-4" /></button>
              <button onClick={resetZoom} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"><Target className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex overflow-hidden">
        <div ref={containerRef} className="flex-1 bg-[var(--bg-main)] cursor-grab active:cursor-grabbing relative">
          {displayGraph.nodes.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-[var(--text-dim)]">
                <p className="text-lg font-semibold">No graph data</p>
                <p className="text-sm">Upload notes or remove filters to populate the knowledge graph.</p>
              </div>
            </div>
          ) : (
          <>
          <ForceGraph2D
            ref={graphRef}
            graphData={displayGraph}
            width={Math.max(300, dimensions.width)}
            height={Math.max(240, dimensions.height)}
            backgroundColor="transparent"
            nodeColor={(node: any) => node.isNote ? "#8b5cf6" : node.isSubject ? "#fb923c" : node.group === 1 ? "#06b6d4" : "#6366f1"}
            nodeRelSize={10}
            nodeLabel="id"
            nodePointerAreaPaint={(node: any, color, ctx) => {
              try {
                // increase clickable area for small nodes
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, Math.max(12, (node.val || 8) * 0.9), 0, Math.PI * 2, true);
                ctx.fill();
              } catch (e) {
                // fail silently to avoid crashing the canvas render
                // console.error('nodePointerAreaPaint error', e);
              }
            }}
            linkColor={(link: any) => {
              const source = link.source?.isNote || link.target?.isNote;
              return source ? "rgba(34, 211, 238, 0.22)" : "rgba(255, 255, 255, 0.10)";
            }}
            linkWidth={(link: any) => (link.source?.isNote || link.target?.isNote ? 2.2 : 1.2)}
            linkDirectionalParticles={displayGraph.links.length > 12 ? 2 : 1}
            linkDirectionalParticleSpeed={0.006}
            linkCurvature={0.12}
            // tweak physics for a denser, tighter layout
            d3VelocityDecay={0.26}
            d3AlphaDecay={0.025}
            onNodeClick={(node) => {
              setSelectedNode(node);
              try {
                graphRef.current?.centerAt?.(node.x, node.y, 400);
                graphRef.current?.zoom?.(3.2, 400);
              } catch (e) {
                // ignore
              }
            }}
            onNodeHover={(node) => setHoverNode(node || null)}
            onBackgroundClick={resetZoom}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              try {
              const label = node.id;
              const isFocused = activeFocus?.id === node.id;
              const fontSize = (isFocused ? 16 : 13) / globalScale;
              const radius = Math.max(10, (node.val || 8) * 0.85);
              ctx.save();

              // subtle radial gradient for a filled, polished look
              const grad = ctx.createRadialGradient(node.x - radius * 0.25, node.y - radius * 0.25, radius * 0.15, node.x, node.y, radius);
              if (node.isNote) {
                grad.addColorStop(0, 'rgba(167,139,250,0.98)');
                grad.addColorStop(1, 'rgba(124,58,237,0.98)');
                ctx.shadowColor = 'rgba(124,58,237,0.32)';
              } else if (node.isSubject) {
                grad.addColorStop(0, 'rgba(255,215,170,0.98)');
                grad.addColorStop(1, 'rgba(251,146,60,0.95)');
                ctx.shadowColor = 'rgba(251,146,60,0.28)';
              } else if (node.group === 1) {
                grad.addColorStop(0, 'rgba(99,211,240,0.98)');
                grad.addColorStop(1, 'rgba(6,182,212,0.95)');
                ctx.shadowColor = 'rgba(6,182,212,0.28)';
              } else {
                grad.addColorStop(0, 'rgba(147,148,255,0.98)');
                grad.addColorStop(1, 'rgba(99,102,241,0.95)');
                ctx.shadowColor = 'rgba(99,102,241,0.28)';
              }

              ctx.shadowBlur = isFocused ? 24 / globalScale : 12 / globalScale;
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
              ctx.fill();

              ctx.shadowBlur = 0;
              ctx.lineWidth = 1.8 / globalScale;
              ctx.strokeStyle = isFocused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.28)';
              ctx.stroke();

              ctx.font = `600 ${fontSize}px Inter`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

              ctx.fillStyle = isFocused ? "rgba(15, 23, 42, 0.82)" : "rgba(15, 23, 42, 0.56)";
              ctx.beginPath();
              // draw rounded rect fallback (works across browsers)
              const rx = 8 / globalScale;
              const x = node.x - bckgDimensions[0] / 2;
              const y = node.y - radius - bckgDimensions[1] - 8 / globalScale;
              const w = bckgDimensions[0];
              const h = bckgDimensions[1];
              const r = Math.min(rx, w / 2, h / 2);
              ctx.moveTo(x + r, y);
              ctx.arcTo(x + w, y, x + w, y + h, r);
              ctx.arcTo(x + w, y + h, x, y + h, r);
              ctx.arcTo(x, y + h, x, y, r);
              ctx.arcTo(x, y, x + w, y, r);
              ctx.closePath();
              ctx.fill();

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#f8fafc";
              ctx.fillText(label, node.x, node.y - radius - 8 / globalScale);
              ctx.restore();
              } catch (e) {
                try {
                  // fallback simple rendering: circle only
                  ctx.restore && ctx.restore();
                } catch {}
              }
            }}
          />

          <motion.div
            className="absolute left-6 bottom-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 backdrop-blur-xl shadow-2xl shadow-cyan-500/10"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="h-3 w-3 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(139,92,246,0.8)]"
              animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div>
              <p className="text-xs font-semibold text-white">Floating concept map</p>
              <p className="text-[10px] text-slate-300">Drag, zoom, and click to inspect links</p>
            </div>
          </motion.div>
          </>
          )}
        </div>

        <aside className="w-80 glass-sidebar p-6 overflow-y-auto border-l border-white/5 relative">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/10 to-transparent pointer-events-none" />
          <div className="space-y-8">
            <motion.div
              className="glass-card p-5 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-violet-500/10 overflow-hidden relative"
              animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 28px rgba(34,211,238,0.12)", "0 0 0 rgba(34,211,238,0)"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
               <motion.div
                 className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl"
                 animate={{ x: [0, -8, 0], y: [0, 8, 0], scale: [1, 1.08, 1] }}
                 transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
               />
               <div className="relative">
                 <h3 className="font-bold text-[var(--text-main)] mb-2 text-lg">Graph Insights</h3>
                 <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    {notes.length > 0 ? (
                     `Your graph contains ${displayGraph.nodes.length} concepts extracted from ${notes.length} documents.`
                   ) : (
                     "Start uploading study materials to build your semantic knowledge network."
                   )}
                 </p>
               </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div className="glass-card p-4" whileHover={{ y: -3, scale: 1.02 }}>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[var(--text-dim)]">Focus</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">{activeFocus ? activeFocus.id : "None selected"}</p>
              </motion.div>
              <motion.div className="glass-card p-4" whileHover={{ y: -3, scale: 1.02 }}>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[var(--text-dim)]">Mode</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">{filterText ? "Filtered" : "All concepts"}</p>
              </motion.div>
            </div>

            {activeFocus ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="space-y-4 glass-card p-5 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${activeFocus.group === 1 ? "bg-cyan-400" : "bg-violet-400"}`}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.75, 1, 0.75] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <h2 className="text-xl font-bold text-[var(--text-main)]">{activeFocus.id}</h2>
                </div>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                    {activeFocus.isNote 
                      ? `This is a source document. It covers ${displayGraph.links.filter(l => endpointId(l.source) === activeFocus.id).length} specific concepts.`
                      : "This is a concept detected across your study materials."
                    }
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-dim)]">
                    {activeFocus.isNote ? "Source note" : "Concept node"}
                  </span>
                  <motion.span
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200"
                    animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 18px rgba(34,211,238,0.18)", "0 0 0 rgba(34,211,238,0)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {displayGraph.links.filter((l: any) => endpointId(l.source) === activeFocus.id || endpointId(l.target) === activeFocus.id).length} connections
                  </motion.span>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Semantic Context</p>
                  <div className="space-y-2">
                    {displayGraph.links
                      .filter(l => endpointId(l.source) === activeFocus.id || endpointId(l.target) === activeFocus.id)
                        .map((l, i) => {
                          const otherEndpoint = endpointId(l.source) === activeFocus.id ? l.target : l.source;
                          const otherNode = resolveNodeObject(otherEndpoint);
                          return (
                            <motion.div key={i} whileHover={{ x: 6, scale: 1.01 }} className="glass-card p-3 text-xs hover:bg-white/10 cursor-pointer flex items-center justify-between group border border-white/5 transition-all">
                              <span className="text-[var(--text-main)]">{otherNode?.id || otherEndpoint}</span>
                              <Network className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          );
                        })
                      }
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20 select-none text-[var(--text-dim)]">
                <motion.div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-violet-500/20 shadow-[0_0_60px_rgba(34,211,238,0.12)]"
                  animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Network className="w-8 h-8 text-cyan-300" />
                </motion.div>
                <p className="text-sm font-medium text-[var(--text-main)]">Click a concept node to explore semantic connections</p>
                <p className="mt-2 text-xs max-w-xs mx-auto leading-relaxed">Use the search box to spotlight a theme and watch the graph reshape around it.</p>
              </div>
            )}
            
            <div className="pt-6 border-t border-white/5">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[var(--text-dim)]">Active Map Stats</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <p className="text-lg font-bold text-[var(--text-main)]">{displayGraph.nodes.length}</p>
                     <p className="text-[10px] text-[var(--text-dim)] uppercase font-bold tracking-widest">Nodes</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-lg font-bold text-[var(--text-main)]">{displayGraph.links.length}</p>
                     <p className="text-[10px] text-[var(--text-dim)] uppercase font-bold tracking-widest">Links</p>
                  </div>
               </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
