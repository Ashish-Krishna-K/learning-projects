const SELF_CLOSING_ELEMS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
]);
const JSX_ATTRIBUTES = new Map(Object.entries({
    charSet: "charset",
    className: "class",
    htmlFor: "for",
    onChange: "onchange",
    onClick: "onclick",
    defaultValue: "value",
    tabIndex: "tabindex",
    colSpan: "colspan",
    rowSpan: "rowspan",
    readOnly: "readonly",
    autoComplete: "autocomplete",
}));
export function createNode(nodeName, attributes, ...args) {
    return {
        nodeName,
        attributes,
        children: args.length ? args.flat() : null,
    };
}
export function createHtml(node, data) {
    if (typeof node === "string")
        return escapeHtml(node);
    const elem = node.nodeName;
    const attr = convertAttributes(node.attributes || {});
    const children = node.children || [];
    const isSelfClosingTag = SELF_CLOSING_ELEMS.has(elem);
    const openTag = `<${elem} ${Object.entries(attr)
        .map(([attrName, attrVal]) => `${attrName}="${attrVal}"`)
        .join(" ")} ${isSelfClosingTag ? "/" : ""}>`;
    const closeTag = isSelfClosingTag
        ? ""
        : `${children
            .map((child) => createHtml(child, data))
            .join("\n")}</${elem}>`;
    return openTag + closeTag;
}
function convertAttributes(attributes) {
    return Object.fromEntries(Object.entries(attributes).map(([nme, val]) => [
        JSX_ATTRIBUTES.get(nme) ?? nme,
        val,
    ]));
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
//# sourceMappingURL=Render.js.map