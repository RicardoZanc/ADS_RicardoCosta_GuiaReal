export function DiscussionEmptyState() {
  return (
    <div className="rounded-xl border border-border/15 bg-muted/5 px-6 py-10 text-center lg:px-12 lg:py-14">
      <p className="text-body font-medium text-foreground lg:text-h4">
        Nenhuma discussão ainda
      </p>
      <p className="mt-2 text-comment text-muted">
        Seja o primeiro a comentar.
      </p>
    </div>
  );
}
