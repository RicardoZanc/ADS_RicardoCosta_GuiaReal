export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-slate-950">
      <div className="flex w-full flex-1 flex-col sm:mx-auto sm:my-auto sm:min-h-0 sm:max-w-md sm:rounded-2xl sm:shadow-2xl">
        {children}
      </div>
    </main>
  );
}
