import { apiClient } from "@/lib/api";
import { redirectToHome, redirectToLogin } from "@/lib/navigation";
import { useAuthStore } from "@/store/authStore";

export { redirectToLogin };

export async function logout(): Promise<void> {
  try {
    await apiClient("/auth/logout", { method: "POST", skipAuthRetry: true });
  } finally {
    useAuthStore.getState().clearAuth();
    redirectToHome();
  }
}
