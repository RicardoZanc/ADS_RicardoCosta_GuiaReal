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

type LoginForm = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof LoginForm, string>>;

function validateLogin(form: LoginForm): FormErrors {
  const errors: FormErrors = {};

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

  return errors;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof LoginForm, value: string) {
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

    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      // TODO: fetch POST ${process.env.NEXT_PUBLIC_API_URL}/api/auth/login
      console.log("Login payload:", payload);
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
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Decisões de compra com IA e a sabedoria da comunidade.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col gap-4">
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-auto flex-col gap-4 border-0 pt-2 pb-8 sm:pb-6">
          <Button type="submit" loading={isSubmitting}>
            Entrar
          </Button>
          <p className="text-center text-sm text-slate-400">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
