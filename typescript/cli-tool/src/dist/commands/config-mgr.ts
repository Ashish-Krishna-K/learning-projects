import chalk from "chalk";
import { cosmiconfigSync } from "cosmiconfig";
import ajvModule from "ajv";

import * as schema from "../config/schema.json" assert { type: "json" };
import { createLogger } from "../logger.js";

const Ajv = ajvModule.default;
const ajv = new Ajv();
const configLoader = cosmiconfigSync("cli-tool");

const logger = createLogger("config:mgr");

export async function getConfig() {
    const result = configLoader.search(process.cwd());
    if (result) {
        const isValid = ajv.validate(schema, result.config);
        console.log(isValid);
        if (!isValid) {
            logger.warning("Invalid configuration was supplied!");
            console.log();
            console.log(ajv.errors);
            process.exit(1);
        }
        logger.debug("Found configuration", result.config);
        return result.config;
    } else {
        logger.warning("Could not find configuration, using default!");
        return { port: 1234 };
    }
}
