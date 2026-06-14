import { Link, useRouterState } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const linkCls = (active: boolean) =>
    `text-sm transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`;
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-primary-foreground">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Prevent<span className="text-gradient">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className={linkCls(path === "/")}>Overview</Link>
          <Link to="/assessment" className={linkCls(path === "/assessment")}>Assessment</Link>
          <Link to="/results" className={linkCls(path === "/results")}>Dashboard</Link>
          <Link to="/coach" className={linkCls(path === "/coach")}>AI Coach</Link>
          <a href="#science" className={linkCls(false)}>Science</a>
        </nav>
        <Link
          to="/assessment"
          className="inline-flex h-9 items-center rounded-md bg-gradient-to-r from-brand to-brand-2 px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Start free analysis
        </Link>
      </div>
    </header>
  );
}
