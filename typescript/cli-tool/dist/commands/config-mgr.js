var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from "chalk";
import { cosmiconfigSync } from "cosmiconfig";
import ajvModule from "ajv";
import betterAjvErrors from "better-ajv-errors";
import * as schema from "../config/schema.json" assert { type: "json" };
const Ajv = ajvModule.default;
const ajv = new Ajv();
const configLoader = cosmiconfigSync("cli-tool");
export function getConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = configLoader.search(process.cwd());
        if (result) {
            const isValid = ajv.validate(schema, result.config);
            console.log(isValid);
            if (!isValid) {
                console.log(chalk.yellow("Invalid configuration was supplied!"));
                console.log();
                console.log(betterAjvErrors(schema, result.config, ajv.errors));
                process.exit(1);
            }
            console.log("Found configuration", result.config);
            return result.config;
        }
        else {
            console.log(chalk.yellow("Could not find configuration, using default"));
            return { port: 1234 };
        }
    });
}
