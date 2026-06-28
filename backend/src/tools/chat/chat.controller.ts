import { Request, Response } from "express";
import { chatsService } from "../../modules/chats/chats.service";
import type {
  AgentProgressInput,
  AgentResponseInput,
} from "../../modules/chats/chats.schema";
import { logger } from "../../utils/logger";

const chatToolController = {
  agentResponse: async (req: Request, res: Response) => {
    const body = req.body as AgentResponseInput;

    logger.info("HTTP POST /tool/chat/agent-response - Iniciado", {
      chatId: body.chat_id,
    });

    const result = await chatsService.handleAgentResponse(body);

    logger.info("HTTP POST /tool/chat/agent-response - Concluído", {
      chatId: result.chat_id,
    });

    res.status(200).json(result);
  },

  agentProgress: async (req: Request, res: Response) => {
    const body = req.body as AgentProgressInput;

    logger.debug("HTTP POST /tool/chat/agent-progress", {
      chatId: body.chat_id,
      step: body.step,
    });

    await chatsService.emitAgentProgress(body);

    res.status(204).send();
  },
};

export { chatToolController };
