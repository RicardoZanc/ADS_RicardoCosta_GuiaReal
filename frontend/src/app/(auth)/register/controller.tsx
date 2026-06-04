"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
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

export function RegisterController() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      const response = await apiClient("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          username: data.username.trim(),
          email: data.email.trim(),
          password: data.password,
        }),
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
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Junte-se à comunidade e tome decisões com mais contexto.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-small font-medium text-foreground"
            >
              Nome
            </label>
            <Input
              id="username"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              error={!!errors.username}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

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
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-small font-medium text-foreground"
            >
              Confirmar senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4 border-0 pt-2">
          <Button type="submit" loading={isSubmitting}>
            Cadastrar
          </Button>
          <p className="text-center text-body text-muted">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:text-accent/80"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
