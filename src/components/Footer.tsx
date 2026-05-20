import { Github, Linkedin, Facebook, Mail, ArrowRight, GraduationCap } from "lucide-react";

const quickLinks = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "My Notes", href: "#my-notes" },
  { label: "Upload Center", href: "#upload" },
  { label: "Study Toolkit", href: "#toolkit" },
];

const socialLinks = [
  { label: "GitHub", value: "Supan-Roy", href: "https://github.com/Supan-Roy", icon: Github },
  { label: "LinkedIn", value: "supanroy", href: "https://www.linkedin.com/in/supanroy/", icon: Linkedin },
  { label: "Facebook", value: "supan.being.roy", href: "https://www.facebook.com/supan.being.roy", icon: Facebook },
  { label: "Contact", value: "contact@supanroy.com", href: "mailto:contact@supanroy.com", icon: Mail },
];

export function Footer() {
  return (
    <footer className="shrink-0 border-t border-[var(--border-main)] bg-[var(--bg-card)] backdrop-blur-xl">
      <div className="px-8 py-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 ring-1 ring-white/10 shadow-lg shadow-blue-600/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">Note Sphere</p>
                <p className="text-sm text-[var(--text-dim)]">Organize, study, and share with clarity.</p>
              </div>
            </div>

            <p className="max-w-xl text-sm leading-6 text-[var(--text-dim)]">
              Your all-in-one academic workspace for organizing notes, keeping study materials in one place, and sharing knowledge with a polished, modern experience.
            </p>

            <p className="text-sm text-[var(--text-dim)]">
              <span className="font-semibold text-[var(--text-main)]">2026</span> All rights reserved. Created by <span className="text-sky-300">Supan Roy</span>.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-main)]">Quick Links</p>
            <div className="grid gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text-main)]"
                >
                  <ArrowRight className="h-4 w-4 text-sky-400" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-main)]">Connect</p>
            <div className="grid gap-3">
              {socialLinks.map(({ label, value, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={label === "Contact" ? undefined : "_blank"}
                  rel={label === "Contact" ? undefined : "noreferrer noopener"}
                  className="inline-flex items-center gap-3 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text-main)]"
                  title={label}
                >
                  <Icon className="h-4 w-4 text-sky-400" />
                  <span>{value}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
