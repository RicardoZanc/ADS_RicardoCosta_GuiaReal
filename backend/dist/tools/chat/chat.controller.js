import { chatsService } from "../../modules/chats/chats.service";
import { logger } from "../../utils/logger";
const chatToolController = {
    agentResponse: async (req, res) => {
        const body = req.body;
        logger.info("HTTP POST /tool/chat/agent-response - Iniciado", {
            chatId: body.chat_id,
        });
        const result = await chatsService.handleAgentResponse(body);
        logger.info("HTTP POST /tool/chat/agent-response - Concluído", {
            chatId: result.chat_id,
        });
        res.status(200).json(result);
    },
};
export { chatToolController };
