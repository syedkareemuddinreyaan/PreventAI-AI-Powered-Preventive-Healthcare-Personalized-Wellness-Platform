export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-lg font-semibold">
            Prevent<span className="text-gradient">AI</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Preventive intelligence for everyday health. Built on clinical
            scoring models for heart, metabolic, sleep and mental wellness.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Risk Analysis</li>
            <li>Risk Engine</li>
            <li>Diet & Workout</li>
            <li>Lifestyle Simulator</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About</li>
            <li>Clinical Advisors</li>
            <li>Privacy</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} PreventAI. For educational use only — not a medical device.</span>
          <span>v1.0 · Hackathon Build</span>
        </div>
      </div>
    </footer>
  );
}
