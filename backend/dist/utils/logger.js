import chalk from 'chalk';
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
const CURRENT_LEVEL = LogLevel[process.env.LOG_LEVEL] ?? LogLevel.INFO;
export const logger = {
    debug: (msg, ...args) => {
        if (CURRENT_LEVEL <= LogLevel.DEBUG) {
            console.log(chalk.gray(`[DEBUG] ${msg}`), ...args);
        }
    },
    info: (msg, ...args) => {
        if (CURRENT_LEVEL <= LogLevel.INFO) {
            console.log(chalk.blue(`[INFO] ${msg}`), ...args);
        }
    },
    warn: (msg, ...args) => {
        if (CURRENT_LEVEL <= LogLevel.WARN) {
            console.log(chalk.yellow(`[WARN] ${msg}`), ...args);
        }
    },
    error: (msg, ...args) => {
        if (CURRENT_LEVEL <= LogLevel.ERROR) {
            console.error(chalk.red(`[ERROR] ${msg}`), ...args);
        }
    }
};
