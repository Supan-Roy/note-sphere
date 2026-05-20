import { ArrowLeft, Check, Crown, HardDrive, ShieldCheck, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "59 BDT/mo",
    storage: "1 GB cloud storage",
    description: "Good for light note keeping and simple study uploads.",
    accent: "from-sky-500 to-blue-600",
  },
  {
    name: "Student",
    price: "99 BDT/mo",
    storage: "5 GB cloud storage",
    description: "Best for regular class notes, revision packs, and shared study files.",
    accent: "from-indigo-500 to-violet-600",
  },
  {
    name: "Pro",
    price: "199 BDT/mo",
    storage: "10 GB cloud storage",
    description: "For heavy use, bigger files, and all-in-one premium workspace access.",
    accent: "from-emerald-500 to-cyan-500",
  },
];

export function PlanPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="glass-card p-8 border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_32%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">
              <Crown className="w-3 h-3" />
              Premium plans
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-main)]">Choose a plan</h1>
            <p className="text-[var(--text-dim)] max-w-2xl">
              This is a demo pricing page. It shows your premium options, but no actual payment is required.
            </p>
          </div>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="glass-card p-6 space-y-5">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.accent} shadow-lg`}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">{plan.name}</h2>
              <p className="mt-1 text-3xl font-semibold text-[var(--text-main)]">{plan.price}</p>
              <p className="mt-2 text-sm text-[var(--text-dim)]">{plan.storage}</p>
            </div>
            <p className="text-sm leading-6 text-[var(--text-dim)]">{plan.description}</p>
            <div className="space-y-2 text-sm text-[var(--text-dim)]">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Cloud notes sync</div>
              <div className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-sky-400" /> Secure cloud storage</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet-400" /> Demo checkout only</div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white hover:scale-[1.01] active:scale-[0.99] transition-all">
              Select {plan.name}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}