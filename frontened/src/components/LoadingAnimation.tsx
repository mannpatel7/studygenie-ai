export function LoadingAnimation({ message = "Loading your study genie", subtext = "One moment while we prepare your learning experience." }: { message?: string; subtext?: string; }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card/90 p-8 shadow-elevated backdrop-blur-xl">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-4 border-primary/15 loader-ring" />
          <span className="absolute inset-3 rounded-full border-4 border-secondary/30 loader-ring-inner" />
          <span className="absolute inset-8 rounded-full bg-primary/20" />
        </div>
        <div className="flex items-center gap-3">
          <span className="h-3.5 w-3.5 rounded-full bg-primary loader-dot" />
          <span className="h-3.5 w-3.5 rounded-full bg-secondary loader-dot" />
          <span className="h-3.5 w-3.5 rounded-full bg-accent loader-dot" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">{message}</p>
          <p className="text-xs text-muted-foreground/80">{subtext}</p>
        </div>
      </div>
    </div>
  );
}
