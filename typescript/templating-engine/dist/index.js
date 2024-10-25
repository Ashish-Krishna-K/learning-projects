import { transformFileAsync } from "@babel/core";
import { createNode, createHtml } from "./Render.js";
import { writeFile } from "fs/promises";
async function main() {
    // try {
    // } catch (error) {
    //     if (error instanceof Error) console.error(error.message);
    //     else if (typeof error === "string") console.error(error);
    // }
    const transpiled = await transformFileAsync("./dist/hello.jsx", {
        plugins: [
            ["@babel/plugin-transform-react-jsx", { pragma: "createNode" }],
        ],
    });
    const transpiledCode = transpiled?.code?.replace(/^"use strict";\s*/, "");
    const resultCode = renderFunc(transpiledCode || "");
    const resultNode = resultCode(createNode);
    const html = createHtml(resultNode);
    await writeFile("index.html", html);
    console.log("done");
}
function renderFunc(x) {
    return new Function("createNode", `return ${x}`);
}
main();
//# sourceMappingURL=index.js.map