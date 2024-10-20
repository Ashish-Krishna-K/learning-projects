import chalk from "chalk";

import { createLogger } from "./logger.js";

const logger = createLogger("");
export function printError(error: unknown) {
    if (error instanceof Error) {
        logger.warning(error.message);
    } else if (typeof error === "string") {
        logger.warning(error);
    } else {
        console.error(error);
    }
    console.log();
    usage();
}

function usage() {
    console.log(`${chalk.whiteBright("tool [CMD]")}
        ${chalk.greenBright("--start")}\tStarts the app
        ${chalk.greenBright("--build")}\tBuilds the app`);
}
