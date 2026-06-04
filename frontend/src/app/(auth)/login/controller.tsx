"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginController() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      setAuth(response.token, response.user);
      router.push("/");
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <p className="font-mono text-small font-medium tracking-wide text-accent">
          GuiaReal
        </p>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Decisões de compra com IA e a sabedoria da comunidade.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-small font-medium text-foreground"
            >
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              error={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-small font-medium text-foreground"
            >
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4 border-0 pt-2">
          <Button type="submit" loading={isSubmitting}>
            Entrar
          </Button>
          <p className="text-center text-body text-muted">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-accent hover:text-accent/80"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
