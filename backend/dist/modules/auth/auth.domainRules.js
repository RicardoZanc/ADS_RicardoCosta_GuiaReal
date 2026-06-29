import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
export const userExists = async (email) => {
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
export const usernameAvailable = async (username) => {
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
export const findUserForLoginByEmail = async (email) => {
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
