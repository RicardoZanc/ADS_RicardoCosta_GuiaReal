import type { FieldErrors, UseFormRegister } from "react-hook-form";
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
      className="space-y-3 border border-border/30 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block space-y-2">
        <span className="font-mono text-small font-medium tracking-widest text-accent uppercase">
          Nova opinião
        </span>
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
