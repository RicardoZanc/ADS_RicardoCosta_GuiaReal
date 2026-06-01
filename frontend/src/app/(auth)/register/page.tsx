"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

function validateRegister(form: RegisterForm): FormErrors {
  const errors: FormErrors = {};
  const username = form.username.trim();

  if (!username) {
    errors.username = "Nome é obrigatório";
  } else if (username.length < 2) {
    errors.username = "Nome muito curto";
  } else if (username.length > 50) {
    errors.username = "Nome muito longo";
  }

  if (!form.email.trim()) {
    errors.email = "E-mail é obrigatório";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "E-mail inválido";
  }

  if (!form.password) {
    errors.password = "Senha é obrigatória";
  } else if (form.password.length < 6) {
    errors.password = "A senha deve ter no mínimo 6 caracteres";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirme sua senha";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "As senhas não coincidem";
  }

  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof RegisterForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateRegister(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      // TODO: fetch POST ${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup
      console.log("Signup payload:", payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="flex min-h-dvh flex-1 flex-col border-0 shadow-none sm:min-h-0 sm:border sm:shadow-lg">
      <CardHeader className="pt-10 sm:pt-8">
        <p className="text-sm font-medium tracking-wide text-indigo-400">
          GuiaReal
        </p>
        <CardTitle className="text-2xl">Criar conta</CardTitle>
        <CardDescription>
          Junte-se à comunidade e tome decisões com mais contexto.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-slate-200"
            >
              Nome
            </label>
            <Input
              id="username"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              error={!!errors.username}
            />
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-200"
            >
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-200"
            >
              Confirmar senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-auto flex-col gap-4 border-0 pt-2 pb-8 sm:pb-6">
          <Button type="submit" loading={isSubmitting}>
            Cadastrar
          </Button>
          <p className="text-center text-sm text-slate-400">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
