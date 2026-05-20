import { useState, useMemo, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { motion } from "motion/react";
import { Network, Search, Target, ZoomIn, ZoomOut } from "lucide-react";
import { Note } from "../types";

const INITIAL_DATA = {
  nodes: [
    { id: "Physics", group: 1, val: 20 },
    { id: "Quantum Computing", group: 1, val: 15 },
    { id: "Algorithms", group: 2, val: 15 },
    { id: "Data Structures", group: 2, val: 12 },
    { id: "Superposition", group: 1, val: 8 },
    { id: "Entanglement", group: 1, val: 8 },
    { id: "Qubits", group: 1, val: 10 },
    { id: "Sorting", group: 2, val: 8 },
    { id: "Searching", group: 2, val: 6 },
    { id: "Dynamic Programming", group: 2, val: 10 },
    { id: "Binary Trees", group: 2, val: 7 },
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
  ]
};

export function KnowledgeGraph({ notes = [] }: { notes?: Note[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterText, setFilterText] = useState("");

  const graphData = useMemo(() => {
    if (notes.length === 0) return INITIAL_DATA;

    const nodes: any[] = [];
    const links: any[] = [];

    // Add notes as central nodes
    notes.forEach(note => {
      nodes.push({ id: note.title, group: 1, val: 15, isNote: true });
      
      // Add key concepts as connected nodes
      note.aiAnalysis?.keyConcepts?.forEach(concept => {
        // Only add concept node if it doesn't exist
        if (!nodes.find(n => n.id === concept)) {
          nodes.push({ id: concept, group: 2, val: 8, isNote: false });
        }
        links.push({ source: note.title, target: concept });
      });
    });

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

    return { nodes, links };
  }, [notes, filterText]);

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
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
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-700">
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[var(--bg-main)]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <Network className="w-8 h-8 text-cyan-400" />
            Knowledge Graph
          </h1>
          <p className="text-[var(--text-dim)] text-sm">Semantic connections between your academic concepts.</p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter concepts..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 w-64"
            />
          </div>
          <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
            <button onClick={zoomIn} className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={zoomOut} className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={resetZoom} className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><Target className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div ref={containerRef} className="flex-1 bg-[var(--bg-main)] cursor-grab active:cursor-grabbing">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="transparent"
            nodeColor={(node: any) => node.group === 1 ? "#818cf8" : "#22d3ee"}
            nodeRelSize={6}
            nodeLabel="id"
            linkColor={() => "rgba(255, 255, 255, 0.1)"}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={(node) => {
              setSelectedNode(node);
              graphRef.current.centerAt(node.x, node.y, 400);
            }}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.id;
              const fontSize = 14 / globalScale;
              ctx.font = `${fontSize}px Inter`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

              ctx.fillStyle = node.group === 1 ? "rgba(129, 140, 248, 0.2)" : "rgba(34, 211, 238, 0.2)";
              ctx.beginPath();
              // @ts-ignore
              ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1], 4 / globalScale);
              ctx.fill();

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = node.group === 1 ? "#a5b4fc" : "#67e8f9";
              ctx.fillText(label, node.x, node.y);
            }}
          />
        </div>

        <aside className="w-80 glass-sidebar p-6 overflow-y-auto border-l border-white/5">
          <div className="space-y-8">
            <div className="glass-card p-4 border-l-4 border-l-cyan-500 bg-cyan-500/5">
               <h3 className="font-bold text-[var(--text-main)] mb-2">Graph Insights</h3>
               <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                 {notes.length > 0 ? (
                   `Your graph contains ${graphData.nodes.length} concepts extracted from ${notes.length} documents.`
                 ) : (
                   "Start uploading study materials to build your semantic knowledge network."
                 )}
               </p>
            </div>

            {selectedNode ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${selectedNode.group === 1 ? "bg-indigo-400" : "bg-cyan-400"}`}></div>
                  <h2 className="text-xl font-bold text-[var(--text-main)]">{selectedNode.id}</h2>
                </div>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  {selectedNode.isNote 
                    ? `This is a source document. It covers ${graphData.links.filter(l => l.source.id === selectedNode.id).length} specific concepts.`
                    : "This is a concept detected across your study materials."
                  }
                </p>
                
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Semantic Context</p>
                  <div className="space-y-2">
                    {graphData.links
                      .filter(l => l.source.id === selectedNode.id || l.target.id === selectedNode.id)
                      .map((l, i) => {
                        const otherNode = l.source.id === selectedNode.id ? l.target : l.source;
                        return (
                          <div key={i} className="glass-card p-3 text-xs hover:bg-white/5 cursor-pointer flex items-center justify-between group">
                            <span className="text-[var(--text-main)]">{otherNode.id}</span>
                            <Network className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20 opacity-30 select-none text-[var(--text-dim)]">
                <Network className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm">Click a concept node to explore semantic connections</p>
              </div>
            )}
            
            <div className="pt-6 border-t border-white/5">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[var(--text-dim)]">Active Map Stats</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <p className="text-lg font-bold text-[var(--text-main)]">{graphData.nodes.length}</p>
                     <p className="text-[10px] text-[var(--text-dim)] uppercase font-bold tracking-widest">Nodes</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-lg font-bold text-[var(--text-main)]">{graphData.links.length}</p>
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
