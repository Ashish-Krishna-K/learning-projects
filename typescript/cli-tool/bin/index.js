#!/usr/bin/env node
import arg from "arg";
import COMMANDS from "../dist/commands.js";
import { printError } from "../dist/utils.js";
import { getConfig } from "../dist/commands/config-mgr.js";
import { start } from "../dist/commands/start.js";
try {
    const args = arg({
        [COMMANDS.start]: Boolean,
        [COMMANDS.build]: Boolean,
    });
    if (args[COMMANDS.start]) {
        getConfig().then((config) => {
            start(config);
        });
    }
}
catch (e) {
    printError(e);
}
