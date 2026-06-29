import { prisma } from "../lib/prisma";
import { ForbiddenError } from "../lib/errors/BaseError";
export const requireAdmin = async (req, _res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new ForbiddenError("Acesso restrito a administradores");
        }
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { is_admin: true },
        });
        if (!user?.is_admin) {
            throw new ForbiddenError("Acesso restrito a administradores");
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
