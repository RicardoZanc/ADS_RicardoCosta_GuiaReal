"use client";

export function ChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="font-sans text-h3 font-bold text-foreground">
        Como posso ajudar?
      </h1>
      <p className="mt-2 max-w-md text-center text-body text-muted">
        Pergunte sobre produtos, opiniões da comunidade e fatos técnicos do
        GuiaReal.
      </p>
    </div>
  );
}
