import { createHash } from "crypto";
import bcrypt from "bcrypt";
const cryptUtils = {
    hashPassword: async (password) => {
        return await bcrypt.hash(password, 10);
    },
    comparePassword: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    },
    /** Fingerprint determinístico do refresh opaco (chave Redis); não armazene o token em claro no servidor. */
    hashRefreshTokenFingerprint: (plainRefreshToken) => {
        return createHash("sha256").update(plainRefreshToken, "utf8").digest("hex");
    },
};
export { cryptUtils };
