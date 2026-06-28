import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CreateReplyFormData } from "@/lib/schemas/productDetail";
import { THREAD_CONNECTOR_CLASS } from "./threadLayout";

interface ReplyComposerProps {
  register: UseFormRegister<CreateReplyFormData>;
  errors: FieldErrors<CreateReplyFormData>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ReplyComposer({
  register,
  errors,
  isSubmitting,
  onSubmit,
  onCancel,
}: ReplyComposerProps) {
  return (
    <form
      className={`mt-3 space-y-3 rounded-lg border border-border/15 bg-muted/5 p-3 pl-4 ${THREAD_CONNECTOR_CLASS}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Textarea
        {...register("content")}
        error={Boolean(errors.content)}
        placeholder="Escreva sua resposta..."
        disabled={isSubmitting}
        rows={3}
      />
      {errors.content && (
        <p className="text-small text-red-500">{errors.content.message}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting}>
          Responder
        </Button>
      </div>
    </form>
  );
}
