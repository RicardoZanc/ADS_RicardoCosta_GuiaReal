import { prisma } from "../../lib/prisma";

export const userExists = async (email: string): Promise<boolean> => {
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });
  return user === null;
};

export type UserForLogin = {
  id: string;
  email: string | null;
  username: string;
  hashpassword: string;
  is_banned: boolean | null;
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
      deleted_at: true,
    },
  });
  return user;
};