import { createHash } from "crypto";
import bcrypt from "bcrypt";

const cryptUtils = {
  hashPassword: async (password: string) => {
    return await bcrypt.hash(password, 10);
  },
  comparePassword: async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
  },
  /** Fingerprint determinístico do refresh opaco (chave Redis); não armazene o token em claro no servidor. */
  hashRefreshTokenFingerprint: (plainRefreshToken: string): string => {
    return createHash("sha256").update(plainRefreshToken, "utf8").digest("hex");
  },
};

export { cryptUtils };