"use client";

import Link from "next/link";
import { useRegisterController } from "./controller";
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

export default function RegisterPage() {
  const { register, handleSubmit, onSubmit, errors, isSubmitting } =
    useRegisterController();

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
              placeholder="name@email.com"
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
