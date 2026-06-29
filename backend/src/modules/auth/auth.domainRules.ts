import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";

export const userExists = async (email: string): Promise<boolean> => {
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });
  const available = user === null;
  logger.debug("Cadastro: verificação de e-mail no banco", {
    email,
    available,
  });
  return available;
};

export const usernameAvailable = async (
  username: string
): Promise<boolean> => {
  const user = await prisma.users.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });
  const available = user === null;
  logger.debug("Cadastro: verificação de nome de usuário no banco", {
    username,
    available,
  });
  return available;
};

export type UserForLogin = {
  id: string;
  email: string | null;
  username: string;
  hashpassword: string;
  is_banned: boolean | null;
  is_admin: boolean;
  deleted_at: Date | null;
};

export const findUserForLoginByEmail = async (
  email: string
): Promise<UserForLogin | null> => {
  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      hashpassword: true,
      is_banned: true,
      is_admin: true,
      deleted_at: true,
    },
  });
  logger.debug("Login: consulta de usuário no banco", {
    email,
    found: user !== null,
  });
  return user;
};
