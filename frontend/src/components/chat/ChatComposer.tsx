"use client";

import { SendIcon } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
  disabled?: boolean;
  isSending?: boolean;
  onSend: (content: string) => void;
}

export function ChatComposer({
  disabled = false,
  isSending = false,
  onSend,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const value = textareaRef.current?.value.trim() ?? "";
    if (!value || disabled || isSending) return;

    onSend(value);
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function handleInput() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }

  return (
    <div className="border-t border-border/15 bg-background/80 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Envie uma mensagem..."
          className="min-h-[52px] max-h-[200px] resize-none rounded-2xl py-3"
          disabled={disabled || isSending}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 bg-accent text-background hover:bg-accent/90"
          disabled={disabled || isSending}
          loading={isSending}
          onClick={handleSubmit}
          aria-label="Enviar mensagem"
        >
          {!isSending && <SendIcon />}
        </Button>
      </div>
    </div>
  );
}
