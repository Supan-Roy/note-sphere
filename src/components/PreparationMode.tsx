import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  GraduationCap,
  Loader2,
  Sparkles,
  Target,
  UploadCloud,
  X,
  Brain,
} from "lucide-react";
import { Note } from "../types";

type Difficulty = "Easy" | "Medium" | "Hard";
type PrepAction = "summary" | "quiz" | "exam" | null;

interface SummaryResult {
  title: string;
  summary: string;
  keyTakeaways: string[];
  weakAreas: string[];
  nextSteps: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  title: string;
  questions: QuizQuestion[];
}

interface ExamQuestion {
  question: string;
  topic: string;
  marks: number;
  expectedAnswer: string;
}

interface LiveExamResult {
  title: string;
  recommendedMinutes: number;
  instructions: string;
  questions: ExamQuestion[];
}

interface GradeFeedbackItem {
  question: string;
  maxMarks: number;
  marksAwarded: number;
  comment: string;
}

interface GradeResult {
  grade: string;
  scorePercent: number;
  totalMarks: number;
  awardedMarks: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  questionWiseFeedback: GradeFeedbackItem[];
}

interface PreparationModeProps {
  notes: Note[];
  onSaveCloud: (note: Note) => void;
  onBack: () => void;
}

function inferNoteType(file: File): Note["type"] {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (extension === "txt" || extension === "md") return "text";
  if (extension === "ppt" || extension === "pptx") return extension;
  if (extension === "doc" || extension === "docx") return extension;
  return "pdf";
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getDurationByQuestionCount(questionCount: number) {
  if (questionCount <= 5) return 30;
  if (questionCount <= 8) return 60;
  return 90;
}

function SourceStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">
        <Icon className="h-3.5 w-3.5 text-[var(--text-main)]" />
        {label}
      </div>
      <p className="mt-2 text-lg font-bold text-[var(--text-main)]">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  accent,
  onClick,
  loading,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`prep-gradient-card group relative overflow-hidden rounded-[1.75rem] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 text-left shadow-sm transition-all duration-300`}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          <div className="flex items-center gap-3 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--text-main)]" />
            Gemini thinking
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-main)] bg-[var(--bg-elevated)]">
            <Icon className="h-6 w-6 text-[var(--text-main)]" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[var(--text-main)]">{title}</h3>
          <p className="text-sm leading-6 text-[var(--text-dim)]">{description}</p>
        </div>

        <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
          <span>Launch</span>
          <Sparkles className="h-4 w-4" />
        </div>
      </div>
    </motion.button>
  );
}

function normalizeSourceText(note: Note | null) {
  if (!note) return "";
  return note.content || note.rawText || note.aiAnalysis?.summary || note.title || "";
}

export function PreparationMode({ notes, onSaveCloud, onBack }: PreparationModeProps) {
  const [selectedNoteId, setSelectedNoteId] = useState(() => notes[0]?.id || "");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [activeAction, setActiveAction] = useState<PrepAction>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [liveExam, setLiveExam] = useState<LiveExamResult | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Select a note or upload a document to begin.");
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!notes.length) {
      setSelectedNoteId("");
      return;
    }

    if (!notes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (!liveExam || timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [liveExam, timeLeft]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;
  const sourceText = normalizeSourceText(selectedNote);
  const sourceTitle = selectedNote?.title || "No source selected";
  const examDuration = getDurationByQuestionCount(questionCount);
  const canRunAi = Boolean(selectedNote && sourceText.trim());

  const openSourcePicker = () => sourceInputRef.current?.click();
  const openAnswerPicker = () => answerInputRef.current?.click();

  const clearGeneratedOutputs = () => {
    setSummaryResult(null);
    setQuizResult(null);
    setLiveExam(null);
    setGradeResult(null);
    setTimeLeft(0);
  };

  const saveUploadedSource = async (file: File) => {
    setSourceLoading(true);
    setStatusMessage(`Uploading ${file.name} into Preparation Mode...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/process-note", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to process the file");
      }

      const uploadedNote: Note = {
        id: makeId(),
        title: data.title || file.name.replace(/\.[^.]+$/, "") || "Uploaded Source",
        ownerId: "user1",
        ownerName: "Supan",
        type: inferNoteType(file),
        content: data.extractedText || "",
        rawText: data.extractedText || "",
        storageUrl: URL.createObjectURL(file),
        tags: data.tags || [],
        isPublic: false,
        aiAnalysis: data,
        likesCount: 0,
        bookmarksCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onSaveCloud(uploadedNote);
      setSelectedNoteId(uploadedNote.id);
      clearGeneratedOutputs();
      setStatusMessage("Uploaded source is ready for AI preparation.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Could not process the uploaded file. Try another note or document.");
    } finally {
      setSourceLoading(false);
      if (sourceInputRef.current) sourceInputRef.current.value = "";
    }
  };

  const generateSummary = async () => {
    if (!selectedNote || !sourceText.trim()) {
      setStatusMessage("Pick a note or upload a document first. The AI needs readable source text.");
      return;
    }

    setActiveAction("summary");
    setStatusMessage("Gemini is writing a premium study summary...");

    try {
      const response = await fetch("/api/preparation-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedNote.title,
          context: sourceText,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Summary generation failed");

      setSummaryResult(data);
      setQuizResult(null);
      setLiveExam(null);
      setGradeResult(null);
      setStatusMessage("Summary ready. Review the high-yield points below.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Summary generation failed. Try a different source note.");
    } finally {
      setActiveAction(null);
    }
  };

  const generateQuiz = async () => {
    if (!selectedNote || !sourceText.trim()) {
      setStatusMessage("Pick a note or upload a document first. The AI needs readable source text.");
      return;
    }

    setActiveAction("quiz");
    setStatusMessage("Generating MCQ quiz from your source...");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: sourceText,
          difficulty,
          count: questionCount,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Quiz generation failed");

      setQuizResult(data);
      setSummaryResult(null);
      setLiveExam(null);
      setGradeResult(null);
      setStatusMessage("Quiz generated. Use it for quick recall practice.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Quiz generation failed. Please try again.");
    } finally {
      setActiveAction(null);
    }
  };

  const startLiveExam = async () => {
    if (!selectedNote || !sourceText.trim()) {
      setStatusMessage("Pick a note or upload a document first. The AI needs readable source text.");
      return;
    }

    setActiveAction("exam");
    setStatusMessage("Creating a timed Gemini exam paper...");

    try {
      const response = await fetch("/api/preparation-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedNote.title,
          context: sourceText,
          difficulty,
          questionCount,
          durationMinutes: examDuration,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Exam generation failed");

      setLiveExam({
        title: data.title || `${selectedNote.title} Live Exam`,
        instructions: data.instructions || "Answer the questions carefully and upload your script for AI marking.",
        recommendedMinutes: data.recommendedMinutes || examDuration,
        questions: data.questions || [],
      });
      setTimeLeft(((data.recommendedMinutes || examDuration) * 60) as number);
      setSummaryResult(null);
      setQuizResult(null);
      setGradeResult(null);
      setStatusMessage("Live exam is ready. The timer is running.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Live exam generation failed. Try another source or lower difficulty.");
    } finally {
      setActiveAction(null);
    }
  };

  const gradeAnswerScript = async (file: File) => {
    if (!liveExam) {
      setStatusMessage("Generate a live exam before uploading an answer script.");
      return;
    }

    if (!sourceText.trim()) {
      setStatusMessage("The selected source is empty. Please choose another note or upload a readable file first.");
      return;
    }

    setAnswerLoading(true);
    setStatusMessage(`Gemini is grading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("exam", JSON.stringify(liveExam));
      formData.append("context", sourceText);
      formData.append("difficulty", difficulty);

      const response = await fetch("/api/preparation-grade", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Grading failed");

      setGradeResult(data);
      setStatusMessage("Answer script marked. Review the feedback and marks below.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Grading failed. Try uploading a clearer script or a different file format.");
    } finally {
      setAnswerLoading(false);
      if (answerInputRef.current) answerInputRef.current.value = "";
    }
  };

  const handleSourceChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await saveUploadedSource(file);
  };

  const handleAnswerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await gradeAnswerScript(file);
  };

  return (
    <div className="prep-premium-shell p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <section className="prep-hero relative overflow-hidden rounded-[2rem] border border-[var(--border-main)] bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-fuchsia-500/10 p-5 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--text-main)] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--text-main)]" />
              Gemini Premium Preparation
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">Preparation Mode</h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--text-dim)] sm:text-base">
                Select an existing note, upload a fresh document instantly, then generate a quiz, concise summary, or a timed live exam with AI marking and feedback.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onBack}
                className="prep-soft-control inline-flex items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text-main)] shadow-sm transition-all hover:bg-[var(--bg-card)]"
              >
                <GraduationCap className="h-4 w-4" />
                Back to Dashboard
              </button>
              <button
                onClick={openSourcePicker}
                className="prep-gradient-control inline-flex items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text-main)] shadow-sm transition-all hover:bg-[var(--bg-card)]"
              >
                <UploadCloud className="h-4 w-4" />
                Upload source
              </button>
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <SourceStat label="Source" value={selectedNote ? sourceTitle : "Upload needed"} icon={FileText} />
            <SourceStat label="Timer" value={`${examDuration} min auto`} icon={Clock3} />
            <SourceStat label="Mode" value={difficulty} icon={Target} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="prep-soft-panel glass-card border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--text-main)]">Study source</p>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Choose a note or document</h2>
              <p className="text-sm text-[var(--text-dim)]">Preparation Mode uses the selected source for every AI action below.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openSourcePicker}
                disabled={sourceLoading}
                className="prep-soft-control inline-flex items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text-main)] shadow-sm transition-all hover:bg-[var(--bg-card)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sourceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Upload instantly
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">Existing notes</span>
              <select
                value={selectedNoteId}
                onChange={(e) => {
                  setSelectedNoteId(e.target.value);
                  clearGeneratedOutputs();
                  setStatusMessage("Source updated. Pick an AI action to continue.");
                }}
                className="prep-soft-control w-full rounded-2xl border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/50"
              >
                <option value="" className="bg-[#030712]">
                  Select a note
                </option>
                {notes.map((note) => (
                  <option key={note.id} value={note.id} className="bg-[#030712]">
                    {note.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">Exam style</span>
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setDifficulty(item);
                      clearGeneratedOutputs();
                    }}
                    className={`rounded-xl border px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] shadow-sm transition-all ${
                      difficulty === item
                        ? "prep-gradient-control border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--text-main)]"
                        : "prep-soft-control border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:bg-[var(--bg-card)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="prep-soft-panel rounded-2xl border border-[var(--border-main)] bg-[var(--bg-elevated)] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">Question count</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-main)]">Controls both quiz size and exam length.</p>
                </div>
                <span className="rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-3 py-1 text-xs font-bold text-[var(--text-main)] shadow-sm">
                  {questionCount} questions
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                value={questionCount}
                onChange={(e) => {
                  setQuestionCount(Number(e.target.value));
                  clearGeneratedOutputs();
                }}
                className="mt-4 w-full accent-fuchsia-400"
              />
            </div>

            <div className="prep-soft-panel rounded-2xl border border-[var(--border-main)] bg-[var(--bg-elevated)] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-main)]">Status</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-main)]">{statusMessage}</p>
                </div>
                <Brain className="h-5 w-5 text-[var(--text-main)]" />
              </div>
            </div>
          </div>

          <input ref={sourceInputRef} type="file" className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a" onChange={handleSourceChange} />
          <input ref={answerInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp" onChange={handleAnswerChange} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <ActionCard
            title="Generate Quiz (MCQ)"
            description="Build recall questions from the current source with Gemini-powered distractors and explanations."
            icon={BookOpen}
            accent=""
            onClick={generateQuiz}
            loading={activeAction === "quiz"}
          />
          <ActionCard
            title="Make Summary"
            description="Turn the selected note into a sharp exam-ready summary with weak spots and next steps."
            icon={FileText}
            accent=""
            onClick={generateSummary}
            loading={activeAction === "summary"}
          />
          <ActionCard
            title="Give Live Exam"
            description="Generate a timed paper, solve it offline, then upload your script for AI marking and feedback."
            icon={Award}
            accent=""
            onClick={startLiveExam}
            loading={activeAction === "exam"}
          />
        </div>
      </section>

      <AnimatePresence>
        {summaryResult && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card border border-cyan-400/15 p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">Summary</p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text-main)]">{summaryResult.title}</h2>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(summaryResult.summary)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] transition-all hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-7 text-[var(--text-main)] whitespace-pre-wrap">{summaryResult.summary}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <DetailList title="Key takeaways" items={summaryResult.keyTakeaways} />
                <DetailList title="Weak areas" items={summaryResult.weakAreas} warning />
                <DetailList title="Next steps" items={summaryResult.nextSteps} accent />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quizResult && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card border border-fuchsia-400/15 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-300">Quiz</p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text-main)]">{quizResult.title}</h2>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(quizResult, null, 2))}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] transition-all hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                Copy quiz
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {quizResult.questions.map((question, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-[var(--text-main)]">Q{index + 1}. {question.question}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`rounded-xl border px-3 py-2 text-sm ${optionIndex === question.correctAnswer ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-[var(--text-dim)]"}`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-dim)]">{question.explanation}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {liveExam && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card border border-amber-400/20 p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">Live exam</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{liveExam.title}</h2>
                <p className="text-sm text-[var(--text-dim)]">{liveExam.instructions}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">Timer</p>
                  <p className="mt-1 text-xl font-bold text-[var(--text-main)]">{formatTime(timeLeft)}</p>
                </div>
                <button
                  onClick={openAnswerPicker}
                  disabled={answerLoading || !liveExam || !canRunAi}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {answerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Upload answer script
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                {liveExam.questions.map((question, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text-main)]">Q{index + 1}. {question.question}</p>
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
                        {question.marks} marks
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-dim)]">Topic: {question.topic}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-amber-400/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Marking panel
                </div>
                <p className="text-sm leading-7 text-[var(--text-dim)]">
                  Upload a clear answer script after solving. Gemini will compare it against the source and exam paper, then return marks, strengths, and improvement points.
                </p>
                <button
                  onClick={openAnswerPicker}
                  disabled={answerLoading || !liveExam || !canRunAi}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text-main)] transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UploadCloud className="h-4 w-4" />
                  Choose answer script
                </button>
                <button
                  onClick={() => {
                    setLiveExam(null);
                    setGradeResult(null);
                    setTimeLeft(0);
                    setStatusMessage("Live exam reset. You can generate a new paper now.");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text-main)] transition-all hover:bg-white/10"
                >
                  Reset exam
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gradeResult && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card border border-emerald-400/15 p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Marked exam</p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text-main)]">{gradeResult.grade}</h2>
                <p className="mt-2 text-sm text-[var(--text-dim)]">Gemini returned a {gradeResult.scorePercent}% score and {gradeResult.awardedMarks}/{gradeResult.totalMarks} marks.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-auto">
                <SourceStat label="Score" value={`${gradeResult.scorePercent}%`} icon={Target} />
                <SourceStat label="Marks" value={`${gradeResult.awardedMarks}/${gradeResult.totalMarks}`} icon={Award} />
                <SourceStat label="Grade" value={gradeResult.grade} icon={Brain} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-7 text-[var(--text-main)] whitespace-pre-wrap">{gradeResult.feedback}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <DetailList title="Strengths" items={gradeResult.strengths} accent />
                <DetailList title="Improvements" items={gradeResult.improvements} warning />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {gradeResult.questionWiseFeedback.map((item, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-sm font-semibold text-[var(--text-main)]">Q{index + 1}. {item.question}</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                      {item.marksAwarded}/{item.maxMarks}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-dim)]">{item.comment}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailList({ title, items, warning, accent }: { title: string; items: string[]; warning?: boolean; accent?: boolean }) {
  return (
    <div className={`prep-soft-panel rounded-2xl border p-4 ${warning ? "border-amber-400/20 bg-amber-400/10" : accent ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/10 bg-white/5"}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-dim)]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--text-main)]">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`mt-1 h-2 w-2 rounded-full ${warning ? "bg-amber-300" : accent ? "bg-emerald-400" : "bg-fuchsia-300"}`} />
            <span className="leading-6">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}