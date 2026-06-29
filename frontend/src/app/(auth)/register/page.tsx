"use client";

import Link from "next/link";
import { useRegisterController } from "./controller";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InterestPicker } from "@/components/interests/InterestPicker";

export default function RegisterPage() {
  const {
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
  } = useRegisterController();

  if (step === "interests") {
    return (
      <div className="w-full max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <Eyebrow className="mx-auto">GuiaReal</Eyebrow>
            <CardTitle className="text-h4 font-semibold">
              O que te interessa?
            </CardTitle>
            <CardDescription>
              Escolha tipos e categorias para personalizar sua experiência.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <InterestPicker
              options={interestOptions.filteredOptions}
              selectedIds={selectedInterestIds}
              onToggle={handleToggleInterest}
              isLoading={interestOptions.isLoading}
              query={interestOptions.query}
              onQueryChange={interestOptions.setQuery}
            />
          </CardContent>

          <CardFooter className="flex-col gap-3 border-0 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={skipInterests}
              disabled={isSubmittingInterests}
            >
              Pular por agora
            </Button>
            <Button
              type="button"
              onClick={onInterestsSubmit}
              loading={isSubmittingInterests}
            >
              Começar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <Eyebrow className="mx-auto">GuiaReal</Eyebrow>
        <CardTitle className="text-h4 font-semibold">Criar conta</CardTitle>
        <CardDescription>
          Junte-se à comunidade e tome decisões com mais contexto.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onAccountSubmit)} noValidate>
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
            Continuar
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
