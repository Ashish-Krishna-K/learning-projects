import chalk from "chalk";
export function printError(error) {
    if (error instanceof Error) {
        console.error(chalk.yellow(error.message));
    }
    else {
        console.error(chalk.yellow(error));
    }
    console.log();
    usage();
}
function usage() {
    console.log(`${chalk.whiteBright("tool [CMD]")}
        ${chalk.greenBright("--start")}\tStarts the app
        ${chalk.greenBright("--build")}\tBuilds the app`);
}
