"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import { useAuthStore } from "@/store/authStore";
import { replaceMyInterests } from "@/lib/users";
import { useInterestOptions } from "@/hooks/useInterestOptions";
import type { AuthTokenResponse } from "@/lib/types/auth";

type RegisterStep = "account" | "interests";

export function useRegisterController() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<RegisterStep>("account");
  const [selectedInterestIds, setSelectedInterestIds] = useState<Set<string>>(
    new Set()
  );
  const [isSubmittingInterests, setIsSubmittingInterests] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const interestOptions = useInterestOptions({
    enabled: step === "interests",
  });

  const onAccountSubmit = async (data: RegisterFormData) => {
    try {
      await apiClient("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          username: data.username.trim(),
          email: data.email.trim(),
          password: data.password,
        }),
      });

      const loginResponse = await apiClient<AuthTokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
      });

      setAuth(loginResponse.accessToken, loginResponse.user);
      setStep("interests");
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    }
  };

  const handleToggleInterest = useCallback((id: string) => {
    setSelectedInterestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const onInterestsSubmit = async () => {
    setIsSubmittingInterests(true);
    try {
      if (selectedInterestIds.size > 0) {
        await replaceMyInterests([...selectedInterestIds]);
      }
      router.push("/feed");
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmittingInterests(false);
    }
  };

  const skipInterests = () => {
    router.push("/feed");
  };

  return {
    step,
    register,
    handleSubmit,
    onAccountSubmit,
    errors,
    isSubmitting,
    selectedInterestIds,
    handleToggleInterest,
    onInterestsSubmit,
    skipInterests,
    isSubmittingInterests,
    interestOptions,
  };
}
