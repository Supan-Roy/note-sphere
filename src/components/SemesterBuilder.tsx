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
  ArrowRight,
  X,
  FolderOpen,
  Paperclip,
  FileUp,
  BookOpenText,
  RefreshCw,
} from "lucide-react";
import { Semester, Course, CourseMaterial, CourseMaterialType } from "../types";

export function SemesterBuilder({ semesters, setSemesters }: { semesters: Semester[], setSemesters: React.Dispatch<React.SetStateAction<Semester[]>> }) {
  const [isParsing, setIsParsing] = useState(false);
  const [activeManualName, setActiveManualName] = useState("");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseModalSemesterId, setCourseModalSemesterId] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<{ semesterId: string; courseId: string } | null>(null);

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
          code: c.code,
          materials: []
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

  const openCourseUploader = (courseId: string, materialType: CourseMaterialType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = materialType === "note"
      ? ".txt,.md,.pdf,.doc,.docx,.ppt,.pptx,.rtf,.png,.jpg,.jpeg"
      : ".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.txt,.md,.zip,.rar,.csv,.xlsx,.mp3,.mp4";
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      if (files.length) {
        setUploadingToCourse(courseId);
        setTimeout(() => {
          setUploadingToCourse(null);
          setSemesters(prev => prev.map(sem => ({
            ...sem,
            courses: sem.courses.map(course => {
              if (course.id === courseId) {
                const nextMaterials: CourseMaterial[] = [...(course.materials || [])];
                files.forEach((file) => {
                  nextMaterials.unshift({
                    id: `material-${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name,
                    type: materialType,
                    fileType: file.type,
                    sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                    uploadedAt: new Date(),
                  });
                });
                return { ...course, materials: nextMaterials };
              }
              return course;
            })
          })));
        }, 1500);
      }
    };
    input.click();
  };

  const uploadToCourse = (courseId: string, materialType: CourseMaterialType) => {
    openCourseUploader(courseId, materialType);
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
    if (selectedCourse?.semesterId === id) {
      setSelectedCourse(null);
    }
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(prev => prev.map((sem) => {
      if (sem.id !== semesterId) return sem;
      return {
        ...sem,
        courses: sem.courses.filter((course) => course.id !== courseId),
      };
    }));

    if (selectedCourse?.semesterId === semesterId && selectedCourse.courseId === courseId) {
      setSelectedCourse(null);
    }
  };

  const openAddCourseModal = (semId: string) => {
    setCourseModalSemesterId(semId);
    setNewCourseName("");
    setNewCourseCode("");
    setIsCourseModalOpen(true);
  };

  const addCourse = () => {
    if (!courseModalSemesterId || !newCourseName.trim()) return;

    const newCourseId = `course-${Math.random().toString(36).substr(2, 9)}`;
    setSemesters(prev => prev.map(sem => {
      if (sem.id !== courseModalSemesterId) return sem;
      return {
        ...sem,
        courses: [
          ...sem.courses,
          {
            id: newCourseId,
            name: newCourseName.trim(),
            code: newCourseCode.trim() || undefined,
            materials: [],
          }
        ]
      };
    }));

    setSelectedCourse({ semesterId: courseModalSemesterId, courseId: newCourseId });
    setIsCourseModalOpen(false);
    setCourseModalSemesterId(null);
    setNewCourseName("");
    setNewCourseCode("");
  };

  const selectedSemester = selectedCourse ? semesters.find((sem) => sem.id === selectedCourse.semesterId) : null;
  const selectedCourseData = selectedSemester?.courses.find((course) => course.id === selectedCourse?.courseId) || null;

  const closeCourseDetails = () => setSelectedCourse(null);

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

                {selectedCourseData ? (
                  <motion.div
                    key={selectedCourseData.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card border-indigo-500/20 overflow-hidden"
                  >
                    <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <button onClick={closeCourseDetails} className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          Back to semesters
                        </button>
                        <h3 className="text-2xl font-bold text-[var(--text-main)]">{selectedCourseData.name}</h3>
                        <p className="text-sm text-[var(--text-dim)]">
                          {selectedSemester?.name}
                          {selectedCourseData.code ? ` • ${selectedCourseData.code}` : " • Course workspace"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => uploadToCourse(selectedCourseData.id, "note")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all">
                          <BookOpenText className="w-4 h-4" />
                          Upload Notes
                        </button>
                        <button onClick={() => uploadToCourse(selectedCourseData.id, "file")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all">
                          <FileUp className="w-4 h-4" />
                          Upload Files
                        </button>
                        <button
                          onClick={() => removeCourse(selectedSemester!.id, selectedCourseData.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Course
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-dim)]">Notes</p>
                          <p className="mt-2 text-2xl font-bold text-[var(--text-main)]">{selectedCourseData.materials?.filter((item) => item.type === "note").length || 0}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-dim)]">Files</p>
                          <p className="mt-2 text-2xl font-bold text-[var(--text-main)]">{selectedCourseData.materials?.filter((item) => item.type === "file").length || 0}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-dim)]">Total</p>
                          <p className="mt-2 text-2xl font-bold text-[var(--text-main)]">{selectedCourseData.materials?.length || 0}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[var(--text-main)]">Uploaded materials</h4>
                          <button onClick={() => uploadToCourse(selectedCourseData.id, "file")} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                            <Plus className="w-4 h-4" />
                            Add more
                          </button>
                        </div>

                        {selectedCourseData.materials && selectedCourseData.materials.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedCourseData.materials.map((material) => (
                              <div key={material.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
                                <div className="mt-0.5 w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                  {material.type === "note" ? <BookOpenText className="w-5 h-5 text-indigo-300" /> : <Paperclip className="w-5 h-5 text-indigo-300" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-[var(--text-main)] truncate">{material.name}</p>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.24em] text-[var(--text-dim)]">{material.type}</span>
                                  </div>
                                  <p className="text-xs text-[var(--text-dim)] mt-1">
                                    {material.sizeLabel || "Uploaded"}
                                    {material.fileType ? ` • ${material.fileType}` : ""}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center space-y-3">
                            <FolderOpen className="w-10 h-10 text-indigo-300 mx-auto" />
                            <p className="font-semibold text-[var(--text-main)]">No notes or files yet</p>
                            <p className="text-sm text-[var(--text-dim)]">Upload lecture notes, PDFs, images, or course files to keep everything inside this course.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : semesters.length === 0 ? (
                  <div className="glass-card p-20 text-center space-y-4 border-dashed opacity-40">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-50">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <p className="text-gray-400 font-medium">Your academic workspace is empty. <br />Use the AI routine parser to get started instantly.</p>
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
                          {sem.courses.map((course) => (
                            <div
                              key={course.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedCourse({ semesterId: sem.id, courseId: course.id })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedCourse({ semesterId: sem.id, courseId: course.id });
                                }
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group/course hover:border-indigo-500/30 transition-colors relative overflow-hidden text-left cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-200 truncate">{course.name}</p>
                                <p className="text-[10px] text-gray-500">
                                  {course.code ? `${course.code} • ` : ""}
                                  {course.materials?.length || 0} items
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedCourse({ semesterId: sem.id, courseId: course.id }); }}
                                  className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                  title="Open course"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); uploadToCourse(course.id, "file"); }}
                                  className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                  title="Upload to course folder"
                                >
                                  {uploadingToCourse === course.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeCourse(sem.id, course.id); }}
                                  className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                  title="Delete course"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => openAddCourseModal(sem.id)}
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

      <AnimatePresence>
        {isCourseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setIsCourseModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass-card border border-white/10 p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">Add Course</p>
                  <h3 className="mt-2 text-2xl font-bold text-[var(--text-main)]">Create a new course</h3>
                  <p className="text-sm text-[var(--text-dim)]">This course will open into its own workspace for notes and files.</p>
                </div>
                <button onClick={() => setIsCourseModalOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">Course name</label>
                  <input
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="e.g. Data Structures"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">Course code <span className="normal-case font-medium tracking-normal">(optional)</span></label>
                  <input
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. CSE-321"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setIsCourseModalOpen(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button
                  onClick={addCourse}
                  disabled={!newCourseName.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create Course
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
