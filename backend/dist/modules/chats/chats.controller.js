import { chatsService } from "./chats.service";
import { logger } from "../../utils/logger";
const chatsController = {
    create: async (req, res) => {
        const userId = req.user.id;
        logger.info("HTTP POST /api/chats - Iniciado", { userId });
        const chat = await chatsService.createWithFirstMessage(userId, req.body);
        logger.info("HTTP POST /api/chats - Concluído", { chatId: chat.id, userId });
        res.status(201).json(chat);
    },
};
export { chatsController };
