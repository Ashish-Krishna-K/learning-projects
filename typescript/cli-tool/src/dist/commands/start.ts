import { createLogger } from "../logger.js";

const logger = createLogger("commands:start");
export function start(config: unknown) {
    logger.highlight(" Starting the app... ");
    logger.debug("Received configuration in start -", config);
}
