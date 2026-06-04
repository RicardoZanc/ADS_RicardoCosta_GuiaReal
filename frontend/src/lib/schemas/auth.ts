import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("E-mail inválido")
    .min(1, "E-mail é obrigatório"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome muito curto")
      .max(50, "Nome muito longo"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("E-mail inválido"),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
