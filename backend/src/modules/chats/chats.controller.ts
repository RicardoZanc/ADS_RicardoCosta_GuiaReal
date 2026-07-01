import { Request, Response } from "express";
import { chatsService } from "./chats.service";
import { logger } from "../../utils/logger";

const chatsController = {
  list: async (req: Request, res: Response) => {
    const userId = req.user!.id;

    logger.info("HTTP GET /api/chats - Iniciado", { userId });

    const result = await chatsService.listByUser(userId);

    logger.info("HTTP GET /api/chats - Concluído", {
      userId,
      count: result.data.length,
    });

    res.status(200).json(result);
  },

  getById: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const chatId = req.params.id as string;

    logger.info("HTTP GET /api/chats/:id - Iniciado", { userId, chatId });

    const chat = await chatsService.getById(userId, chatId);

    logger.info("HTTP GET /api/chats/:id - Concluído", { userId, chatId });

    res.status(200).json(chat);
  },

  create: async (req: Request, res: Response) => {
    const userId = req.user!.id;

    logger.info("HTTP POST /api/chats - Iniciado", { userId });

    const chat = await chatsService.createWithFirstMessage(userId, req.body);

    logger.info("HTTP POST /api/chats - Concluído", { chatId: chat.id, userId });

    res.status(201).json(chat);
  },

  sendMessage: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const chatId = req.params.id as string;

    logger.info("HTTP POST /api/chats/:id/messages - Iniciado", {
      userId,
      chatId,
    });

    const result = await chatsService.sendMessage(userId, chatId, req.body);

    logger.info("HTTP POST /api/chats/:id/messages - Concluído", {
      userId,
      chatId,
      messageId: result.message.id,
    });

    res.status(201).json(result);
  },

  retry: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const chatId = req.params.id as string;

    logger.info("HTTP POST /api/chats/:id/retry - Iniciado", {
      userId,
      chatId,
    });

    const result = await chatsService.retryAssistantResponse(userId, chatId);

    logger.info("HTTP POST /api/chats/:id/retry - Concluído", {
      userId,
      chatId,
    });

    res.status(200).json(result);
  },
};

export { chatsController };
