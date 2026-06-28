import { Server } from "socket.io";
import { authenticateAccessToken } from "./jwtAccessToken";
import { assertChatBelongsToUser } from "../modules/chats/chats.domainRules";
import { logger } from "../utils/logger";
let io = null;
export function chatRoomId(chatId) {
    return `chat:${chatId}`;
}
export function initSocket(httpServer) {
    const corsOrigin = process.env.CORS_ORIGIN?.trim() || "http://localhost:3001";
    io = new Server(httpServer, {
        cors: {
            origin: corsOrigin,
            credentials: true,
        },
    });
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const tokenValue = typeof token === "string" && token.length > 0 ? token : null;
            socket.data.user = await authenticateAccessToken(tokenValue);
            next();
        }
        catch (err) {
            logger.warn("Socket.IO: autenticação falhou", { err });
            next(err instanceof Error ? err : new Error("Não autorizado"));
        }
    });
    io.on("connection", (socket) => {
        logger.info("Socket.IO: cliente conectado", { userId: socket.data.user.id });
        socket.on("chat:join", async (payload) => {
            try {
                const chatId = payload?.chatId;
                if (!chatId) {
                    socket.emit("chat:error", { message: "chatId é obrigatório" });
                    return;
                }
                await assertChatBelongsToUser(chatId, socket.data.user.id);
                await socket.join(chatRoomId(chatId));
                logger.info("Socket.IO: cliente entrou na sala do chat", {
                    userId: socket.data.user.id,
                    chatId,
                });
            }
            catch (err) {
                logger.warn("Socket.IO: falha ao entrar na sala do chat", {
                    userId: socket.data.user.id,
                    err,
                });
                socket.emit("chat:error", {
                    message: err instanceof Error ? err.message : "Falha ao entrar na sala",
                });
            }
        });
        socket.on("disconnect", () => {
            logger.debug("Socket.IO: cliente desconectado", {
                userId: socket.data.user.id,
            });
        });
    });
    return io;
}
export function getIo() {
    if (!io) {
        throw new Error("Socket.IO não foi inicializado");
    }
    return io;
}
