import "dotenv/config";
import express from "express";
import cors from "cors";
import chalk from "chalk";
import { apiRoutes } from "./routes/apiRoutes";
import { errorHandler } from "./middlewares/error.middleware";
import {
  connectRefreshTokenRedis,
  registerRefreshTokenRedisShutdown,
} from "./lib/redis";
import { logger } from "./utils/logger";
import { authenticateJwt } from "./middlewares/auth.middleware";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/api/', authenticateJwt, (req, res) => {
  const message = `Hello ${req.user?.username}`;
  res.json({ message });
});


app.use(errorHandler);

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

