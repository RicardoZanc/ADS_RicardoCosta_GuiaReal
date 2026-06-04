import { toast } from "sonner";
import { isApiError } from "@/lib/errors";

export function notifyApiError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  toast.error(error.message);
  return true;
}
