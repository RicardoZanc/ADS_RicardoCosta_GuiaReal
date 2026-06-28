import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CreateOpinionFormData } from "@/lib/schemas/productDetail";

interface OpinionComposerProps {
  register: UseFormRegister<CreateOpinionFormData>;
  errors: FieldErrors<CreateOpinionFormData>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function OpinionComposer({
  register,
  errors,
  isSubmitting,
  onSubmit,
}: OpinionComposerProps) {
  return (
    <form
      className="space-y-3 rounded-xl border border-border/15 bg-card/50 p-4 shadow-[var(--shadow-card)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block space-y-2">
        <Eyebrow size="sm">Nova opinião</Eyebrow>
        <Textarea
          {...register("content")}
          error={Boolean(errors.content)}
          placeholder="Compartilhe sua experiência ou pergunta..."
          disabled={isSubmitting}
          rows={4}
        />
      </label>
      {errors.content && (
        <p className="text-small text-red-500">{errors.content.message}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Publicar opinião
        </Button>
      </div>
    </form>
  );
}
