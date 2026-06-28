import { FadeIn } from "@/components/motion/FadeIn";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4 sm:p-6">
      <FadeIn className="w-full max-w-md">{children}</FadeIn>
    </main>
  );
}
