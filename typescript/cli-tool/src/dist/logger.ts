import chalk from "chalk";
import debug from "debug";

export function createLogger(name: string) {
    return {
        log: (...args: string[]) => console.log(chalk.gray(...args)),
        warning: (...args: string[]) => console.log(chalk.yellow(...args)),
        highlight: (...args: string[]) =>
            console.log(chalk.bgCyanBright(...args)),
        debug: debug(name),
    };
}
