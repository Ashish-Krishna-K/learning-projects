type NodeChild = (string | Node)[];

type Node = {
    nodeName: string;
    attributes?: { [key: string]: string };
    children?: NodeChild;
};

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

const JSX_ATTRIBUTES = new Map<string, string>(
    Object.entries({
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
    })
);

export function createNode(
    nodeName: string,
    attributes: { [key: string]: string },
    ...args: NodeChild[]
) {
    return {
        nodeName,
        attributes,
        children: args.length ? args.flat() : null,
    };
}

export function createHtml(node: Node | string): string {
    if (typeof node === "string") return escapeHtml(node);

    const elem = node.nodeName;
    const attr = convertAttributes(node.attributes || {});
    const children: NodeChild = node.children || [];
    const isSelfClosingTag = SELF_CLOSING_ELEMS.has(elem);

    const openTag = `<${elem} ${Object.entries(attr)
        .map(([attrName, attrVal]) => `${attrName}="${attrVal}"`)
        .join(" ")} ${isSelfClosingTag ? "/" : ""}>`;

    const closeTag = isSelfClosingTag
        ? ""
        : `${children.map(createHtml).join("\n")}</${elem}>`;
    return openTag + closeTag;
}

function convertAttributes(attributes: { [key: string]: string }) {
    return Object.fromEntries(
        Object.entries(attributes).map(([nme, val]) => [
            JSX_ATTRIBUTES.get(nme) ?? nme,
            val,
        ])
    );
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
