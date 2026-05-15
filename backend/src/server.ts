import "dotenv/config";
import express from "express";
import chalk from "chalk";
import { authRoutes } from "./modules/auth/auth.routes";
import {
  connectRefreshTokenRedis,
  registerRefreshTokenRedisShutdown,
} from "./lib/redis";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(authRoutes);

async function start() {
  try {
    await connectRefreshTokenRedis();
  } catch (err) {
    logger.error("Falha ao conectar ao Redis (refresh tokens)", err);
    process.exit(1);
  }

  registerRefreshTokenRedisShutdown();

  app.listen(PORT, () => {
    const runningMsg = "Serving runnning on port " + PORT;
    console.log(chalk.bgGreen.blackBright(` ${runningMsg} `));
  });
}

void start();

