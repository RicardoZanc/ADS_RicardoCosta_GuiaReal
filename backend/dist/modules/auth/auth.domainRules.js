import { prisma } from "../../lib/prisma";
export const userExists = async (email) => {
    const user = await prisma.users.findUnique({
        where: {
            email,
        },
    });
    return user === null;
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
            deleted_at: true,
        },
    });
    return user;
};
