import { ChatPageContent } from "@/app/(chat)/chat/ChatPageContent";

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  return <ChatPageContent chatId={id} />;
}
