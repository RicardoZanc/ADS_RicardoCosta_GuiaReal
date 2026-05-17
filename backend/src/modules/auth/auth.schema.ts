import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    username: z
      .string()
      .trim()
      .min(2, "Nome muito curto")
      .max(50, "Nome muito longo"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token obrigatório"),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshSchema>["body"];