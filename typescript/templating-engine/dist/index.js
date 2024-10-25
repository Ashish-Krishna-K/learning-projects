import { transformFileAsync } from "@babel/core";
import { createNode, createHtml } from "./Render.js";
import { writeFile } from "fs/promises";
async function main() {
    try {
        const transpiled = await transformFileAsync("./dist/hello.jsx", {
            plugins: [
                ["@babel/plugin-transform-react-jsx", { pragma: "createNode" }],
            ],
        });
        const result = eval(`
        const createNode = ${createNode.toString()}
        ${transpiled?.code}
        `);
        const html = createHtml(result);
        await writeFile("index.html", html);
        console.log("done");
    }
    catch (error) {
        if (error instanceof Error)
            console.error(error.message);
        else if (typeof error === "string")
            console.error(error);
    }
}
main();
//# sourceMappingURL=index.js.map