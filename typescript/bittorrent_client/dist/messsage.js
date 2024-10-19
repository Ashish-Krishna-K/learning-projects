import { Buffer } from "buffer";
import { infoHash } from "./torrent-parser.js";
import { genId } from "./util.js";
export const buildHandshake = (torrent) => {
    const buf = Buffer.alloc(68);
    buf.writeUInt8(19, 0);
    buf.write("BitTorrent protocol", 1);
    buf.writeUInt32BE(0, 20);
    buf.writeUInt32BE(0, 24);
    infoHash(torrent).copy(buf, 28);
    buf.write(genId().toString());
    return buf;
};
export const buildKeepAlive = () => Buffer.alloc(4);
export const buildChoke = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(0, 4);
    return buf;
};
export const buildUnchoke = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(1, 4);
    return buf;
};
export const buildInterested = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(2, 4);
    return buf;
};
export const buildUninterested = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(3, 4);
    return buf;
};
export const buildHave = (payload) => {
    const buf = Buffer.alloc(9);
    buf.writeUInt32BE(5, 0);
    buf.writeUInt8(4, 4);
    buf.writeUInt32BE(payload, 5);
    return buf;
};
export const buildBitfield = (bitfield, payload) => {
    const buf = Buffer.alloc(14);
    if (payload.length) {
        buf.writeUInt32BE(payload.length + 1, 0);
        buf.writeUInt8(5, 4);
        bitfield.copy(buf, 5);
    }
    return buf;
};
export const buildRequest = (payload) => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0);
    buf.writeUInt8(6, 4);
    buf.writeUInt32BE(payload.index, 5);
    buf.writeUInt32BE(payload.begin, 9);
    if (payload.length)
        buf.writeUInt32BE(payload.length, 13);
    return buf;
};
export const buildPiece = (payload) => {
    if (payload.block) {
        const buf = Buffer.alloc(payload.block.length + 13);
        buf.writeUInt32BE(payload.block.length + 9, 0);
        buf.writeUInt8(7, 4);
        buf.writeUInt32BE(payload.index, 5);
        buf.writeUInt32BE(payload.begin, 9);
        payload.block.copy(buf, 13);
        return buf;
    }
};
export const buildCancel = (payload) => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0);
    buf.writeUInt8(8, 4);
    buf.writeUInt32BE(payload.index, 5);
    buf.writeUInt32BE(payload.begin, 9);
    if (payload.length)
        buf.writeUInt32BE(payload.length, 13);
    return buf;
};
export const buildPort = (payload) => {
    const buf = Buffer.alloc(7);
    buf.writeUInt32BE(3, 0);
    buf.writeUInt8(9, 4);
    buf.writeUInt16BE(payload, 5);
    return buf;
};
export const parse = (msg) => {
    var _a, _b;
    const id = msg.length > 4 ? msg.readInt8(4) : null;
    let payload = msg.length > 5 ? msg.slice(5) : null;
    if ([6, 7, 8].includes(id !== null && id !== void 0 ? id : 0)) {
        const rest = payload === null || payload === void 0 ? void 0 : payload.slice(8);
        payload = {
            index: (_a = payload === null || payload === void 0 ? void 0 : payload.readInt32BE(0)) !== null && _a !== void 0 ? _a : 0,
            begin: (_b = payload === null || payload === void 0 ? void 0 : payload.readInt32BE(4)) !== null && _b !== void 0 ? _b : 0,
        };
        if (id === 7) {
            payload.block = rest;
        }
        else {
            payload.length = rest === null || rest === void 0 ? void 0 : rest.length;
        }
    }
    return {
        size: msg.readInt32BE(0),
        id,
        payload,
    };
};
//# sourceMappingURL=messsage.js.map