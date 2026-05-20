import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  LayoutGrid,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Semester, Course } from "../types";

export function SemesterBuilder({ semesters, setSemesters }: { semesters: Semester[], setSemesters: React.Dispatch<React.SetStateAction<Semester[]>> }) {
  const [isParsing, setIsParsing] = useState(false);
  const [activeManualName, setActiveManualName] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsParsing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parse-routine", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Parsing failed");

      const data = await response.json();
      // Add unique IDs to the detected data
      const processed: Semester[] = data.semesters.map((s: any, idx: number) => ({
        id: `sem-${Math.random().toString(36).substr(2, 9)}`,
        name: s.name || `Semester ${idx + 1}`,
        courses: s.courses.map((c: any) => ({
          id: `course-${Math.random().toString(36).substr(2, 9)}`,
            name: c.name,
            code: c.code
        }))
      }));
      // Automatically "build" - Add to semesters
      setSemesters(prev => [...prev, ...processed]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  }, [semesters]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] }
  } as any);

  const [uploadingToCourse, setUploadingToCourse] = useState<string | null>(null);

  const handleCourseUpload = (courseId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setUploadingToCourse(courseId);
        // Simulate upload
        setTimeout(() => {
          setUploadingToCourse(null);
          setSemesters(prev => prev.map(sem => ({
            ...sem,
            courses: sem.courses.map(course => {
              if (course.id === courseId) {
                const currentCount = parseInt(course.code?.match(/\d+/)?.[0] || "0");
                return { ...course, code: `${currentCount + 1} Files` };
              }
              return course;
            })
          })));
        }, 1500);
      }
    };
    input.click();
  };

  const addManualSemester = () => {
    if (!activeManualName.trim()) return;
    const newSem: Semester = {
      id: Math.random().toString(36).substr(2, 9),
      name: activeManualName,
      courses: []
    };
    setSemesters([...semesters, newSem]);
    setActiveManualName("");
  };

  const removeSemester = (id: string) => {
    setSemesters(semesters.filter(s => s.id !== id));
  };

  const addCourse = (semId: string) => {
    const courseName = prompt("Enter course name:");
    if (!courseName) return;
    
    setSemesters(semesters.map(s => {
      if (s.id === semId) {
        return {
          ...s,
          courses: [...s.courses, { id: Math.random().toString(36).substr(2, 9), name: courseName }]
        };
      }
      return s;
    }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <LayoutGrid className="w-10 h-10 text-indigo-400" />
            AI Manage Semesters
          </h1>
          <p className="text-[var(--text-dim)]">Organize your academic journey with manual control or AI routine parsing.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button className="px-6 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20">Active Plan</button>
          <button className="px-6 py-2 rounded-xl text-gray-400 text-sm font-bold hover:text-gray-200">Archive</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Column */}
        <div className="lg:col-span-1 space-y-8">
          <section className="glass-card p-6 border-l-4 border-l-indigo-500 space-y-6">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-[var(--text-main)]">Manual Creation</h2>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                value={activeManualName}
                onChange={(e) => setActiveManualName(e.target.value)}
                placeholder="Semester Name (e.g. Summer 2026)" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              <button 
                onClick={addManualSemester}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-[var(--text-dim)] transition-all active:scale-95"
              >
                Create Semester
              </button>
            </div>
          </section>

          <section className="glass-card p-6 border-l-4 border-l-purple-500 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold text-[var(--text-main)]">Smart Routine Upload</h2>
            </div>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragActive ? "border-purple-500 bg-purple-500/5" : "border-white/10 hover:border-white/20"
              }`}
            >
              <input {...getInputProps()} />
              {isParsing ? (
                <div className="space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-purple-300 animate-pulse">Gemini analyzing routine...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-main)]">Routine PDF or Image</p>
                    <p className="text-[10px] text-[var(--text-dim)] mt-1 uppercase tracking-widest">Supports Screenshots & Timetables</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Workspace Column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
              <motion.div 
                key="active-semesters"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">Active Curriculum</h2>
                  <p className="text-xs text-[var(--text-dim)]">{semesters.length} Semesters Organized</p>
                </div>

                {semesters.length === 0 ? (
                  <div className="glass-card p-20 text-center space-y-4 border-dashed opacity-40">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-50">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <p className="text-gray-400 font-medium">Your academic workspace is empty. <br/>Use the AI routine parser to get started instantly.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {semesters.map((sem) => (
                      <div key={sem.id} className="glass-card group overflow-hidden border-indigo-500/10">
                        <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent flex items-center justify-between">
                          <h3 className="font-bold text-[var(--text-main)] text-lg">{sem.name}</h3>
                          <div className="flex gap-2">
                             <button className="p-2 bg-white/5 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => removeSemester(sem.id)} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="p-6 space-y-3">
                          {sem.courses.map(course => (
                            <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group/course hover:border-indigo-500/30 transition-colors relative overflow-hidden">
                               <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-200 truncate">{course.name}</p>
                                  <p className="text-[10px] text-gray-500">{course.code || "0 Files"}</p>
                               </div>
                               <div className="flex items-center gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleCourseUpload(course.id); }}
                                    className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                    title="Upload to course folder"
                                  >
                                    {uploadingToCourse === course.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Upload className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover/course:text-indigo-400 transition-colors" />
                               </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => addCourse(sem.id)}
                            className="w-full py-3 rounded-xl border border-dashed border-white/10 text-xs font-bold text-gray-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Course
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
