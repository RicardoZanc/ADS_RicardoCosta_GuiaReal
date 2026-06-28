import "dotenv/config";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import { apiRoutes } from "./routes/apiRoutes";
import { errorHandler } from "./middlewares/error.middleware";
import { connectRefreshTokenRedis, registerRefreshTokenRedisShutdown, } from "./lib/redis";
import { logger } from "./utils/logger";
import { authenticateJwt } from "./middlewares/auth.middleware";
import { toolRoutes } from "./routes/toolRoutes";
import { initSocket } from "./lib/socket";
const PORT = process.env.PORT || 3000;
const app = express();
const corsOrigin = process.env.CORS_ORIGIN?.trim() || "http://localhost:3001";
app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
app.use('/api', apiRoutes);
app.use('/tool', toolRoutes);
app.get('/api/', authenticateJwt, (req, res) => {
    const message = `Hello ${req.user?.username}`;
    res.json({ message });
});
app.use(errorHandler);
async function start() {
    try {
        await connectRefreshTokenRedis();
    }
    catch (err) {
        logger.error("Falha ao conectar ao Redis (refresh tokens)", err);
        process.exit(1);
    }
    registerRefreshTokenRedisShutdown();
    const httpServer = createServer(app);
    initSocket(httpServer);
    httpServer.listen(PORT, () => {
        const runningMsg = "Serving runnning on port " + PORT;
        console.log(chalk.bgGreen.blackBright(` ${runningMsg} `));
    });
}
void start();
