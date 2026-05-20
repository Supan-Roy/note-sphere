import { useMemo, useState } from "react";
import { CalendarDays, Clock3, ListTodo, Plus, Trash2, NotebookPen } from "lucide-react";
import { TaskItem } from "../types";

const createId = () => Math.random().toString(36).slice(2, 10);

export function TaskaBoard({ tasks, setTasks }: { tasks: TaskItem[]; setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>> }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [notes, setNotes] = useState("");

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => `${a.dueDate}T${a.dueTime}`.localeCompare(`${b.dueDate}T${b.dueTime}`)),
    [tasks]
  );

  const handleAddTask = () => {
    if (!title.trim() || !dueDate || !dueTime) return;

    const newTask: TaskItem = {
      id: createId(),
      title: title.trim(),
      dueDate,
      dueTime,
      notes: notes.trim(),
      createdAt: new Date(),
    };

    setTasks(prev => [newTask, ...prev]);
    setTitle("");
    setDueDate("");
    setDueTime("");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="glass-card p-8 border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_32%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-300">
              <ListTodo className="w-3 h-3" />
              Task planner
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-main)]">My Tasks</h1>
            <p className="text-[var(--text-dim)] max-w-xl">
              Create quick study tasks with a due date, time, and short notes so you can stay on track.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="glass-card p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">Add a task</h2>
            <p className="text-sm text-[var(--text-dim)]">Save time, date, and a short note.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-dim)]">Task title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Revise chapter 4"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-dim)]">Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-dim)]">Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-dim)]">Short notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add a quick reminder or checklist..."
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              />
            </div>

            <button
              onClick={handleAddTask}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Save Task
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">Upcoming tasks</h2>
              <p className="text-sm text-[var(--text-dim)]">Your saved task list appears here.</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[var(--text-main)]">{sortedTasks.length}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-dim)]">Total</p>
            </div>
          </div>

          <div className="space-y-4">
            {sortedTasks.length === 0 ? (
              <div className="glass-card p-10 text-center space-y-3 border-dashed">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                  <NotebookPen className="h-6 w-6 text-[var(--text-dim)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">No tasks yet</h3>
                <p className="text-sm text-[var(--text-dim)]">Add your first task on the left.</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <article key={task.id} className="glass-card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-main)]">{task.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--text-dim)]">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                          <CalendarDays className="h-4 w-4" />
                          {task.dueDate}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                          <Clock3 className="h-4 w-4" />
                          {task.dueTime}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-[var(--text-dim)] transition-colors hover:text-red-400 hover:bg-white/10"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {task.notes && <p className="text-sm leading-6 text-[var(--text-dim)]">{task.notes}</p>}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}