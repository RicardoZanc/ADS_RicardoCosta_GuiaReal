import chalk from 'chalk';

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}


const CURRENT_LEVEL = LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.INFO;

export const logger = {
  debug: (msg: string, ...args: any[]) => {
    if (CURRENT_LEVEL <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${msg}`), ...args);
    }
  },
  info: (msg: string, ...args: any[]) => {
    if (CURRENT_LEVEL <= LogLevel.INFO) {
      console.log(chalk.blue(`[INFO] ${msg}`), ...args);
    }
  },
  warn: (msg: string, ...args: any[]) => {
    if (CURRENT_LEVEL <= LogLevel.WARN) {
      console.log(chalk.yellow(`[WARN] ${msg}`), ...args);
    }
  },
  error: (msg: string, ...args: any[]) => {
    if (CURRENT_LEVEL <= LogLevel.ERROR) {
      console.error(chalk.red(`[ERROR] ${msg}`), ...args);
    }
  }
};