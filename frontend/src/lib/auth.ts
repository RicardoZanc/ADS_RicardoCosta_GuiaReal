import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export { redirectToLogin } from "@/lib/navigation";

export async function logout(): Promise<void> {
  try {
    await apiClient("/auth/logout", { method: "POST", skipAuthRetry: true });
  } finally {
    useAuthStore.getState().clearAuth();
  }
}
