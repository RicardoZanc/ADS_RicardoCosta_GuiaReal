"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import { toast } from "sonner";

export function useRegisterController() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      await apiClient("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          username: data.username.trim(),
          email: data.email.trim(),
          password: data.password,
        }),
      });

      toast.success("Conta criada. Faça login para continuar.");
      router.push("/login");
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    }
  }

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
  };
}
