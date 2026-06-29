import { UnauthorizedError } from "../lib/errors/BaseError";
import { logger } from "../utils/logger";
import { authenticateAccessToken } from "../lib/jwtAccessToken";
const MISSING_TOKEN_MESSAGE = "Token de acesso não informado";
function getBearerToken(req) {
    const header = req.headers.authorization;
    logger.debug("getBearerToken", { header });
    if (!header?.startsWith("Bearer ")) {
        return null;
    }
    const token = header.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
}
export const authenticateJwt = async (req, _res, next) => {
    try {
        const token = getBearerToken(req);
        if (!token) {
            logger.warn("Autenticação JWT falhou: header Authorization ausente ou inválido");
            throw new UnauthorizedError(MISSING_TOKEN_MESSAGE);
        }
        req.user = await authenticateAccessToken(token);
        next();
    }
    catch (error) {
        next(error);
    }
};
export const optionalAuthenticateJwt = async (req, _res, next) => {
    try {
        const token = getBearerToken(req);
        if (!token) {
            req.user = undefined;
            next();
            return;
        }
        req.user = await authenticateAccessToken(token);
        next();
    }
    catch (error) {
        next(error);
    }
};
