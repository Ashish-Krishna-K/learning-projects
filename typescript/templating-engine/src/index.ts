import { transformFileAsync } from "@babel/core";
import { createNode, createHtml } from "./Render.js";
import { writeFile } from "fs/promises";

async function render(pathToJSXFile: string, data?: unknown) {
    try {
        const transpiled = await transformFileAsync(pathToJSXFile, {
            plugins: [
                ["@babel/plugin-transform-react-jsx", { pragma: "createNode" }],
            ],
        });
        const transpiledCode = transpiled?.code?.replace(
            /^"use strict";\s*/,
            ""
        );
        const resultNode = createNodeCreator(transpiledCode || "", data);
        const html = createHtml(resultNode);
        await writeFile("index.html", html);
        console.log("done");
    } catch (error) {
        if (error instanceof Error) console.error(error.message);
        else if (typeof error === "string") console.error(error);
    }
}

function createNodeCreator(transpiledCode: string, data?: unknown) {
    const temp = new Function("createNode", "data", `return ${transpiledCode}`);
    return temp(createNode, data);
}

render("./dist/hello.jsx", { test: "test message" });
