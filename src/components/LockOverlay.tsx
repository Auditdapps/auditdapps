export default function LockOverlay({ message = "This feature is locked for your plan." }: { message?: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 backdrop-blur-sm rounded-2xl border border-border">
        <div className="text-center px-6">
          <div className="text-lg font-semibold">🔒 Locked</div>
          <div className="text-sm text-muted-foreground mt-1">{message}</div>
          <a href="/auth/payment" className="inline-flex mt-3 h-9 items-center px-3 rounded-md bg-primary text-white hover:opacity-90 text-sm">
            Upgrade to Premium
          </a>
        </div>
      </div>
    </div>
  );
}
