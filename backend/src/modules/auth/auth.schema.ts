import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    username: z.string().min(2, 'Nome muito curto')
  })
});

// Inferência de tipo para usar no Service se necessário
export type SignupInput = z.infer<typeof signupSchema>['body'];