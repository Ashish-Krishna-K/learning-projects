import { Buffer } from "buffer";
import { Torrent, Payload, ParsedMsg, PieceBlock, PieceResp } from "./types.js";
import { infoHash } from "./torrent-parser.js";
import { genId } from "./util.js";

export const buildHandshake = (torrent: Torrent) => {
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

export const buildHave = (payload: number) => {
    const buf = Buffer.alloc(9);
    buf.writeUInt32BE(5, 0);
    buf.writeUInt8(4, 4);
    buf.writeUInt32BE(payload, 5);
    return buf;
};

export const buildBitfield = (bitfield: Buffer, payload: PieceBlock) => {
    const buf = Buffer.alloc(14);
    if (payload.length) {
        buf.writeUInt32BE(payload.length + 1, 0);
        buf.writeUInt8(5, 4);
        bitfield.copy(buf, 5);
    }
    return buf;
};

export const buildRequest = (payload: PieceBlock) => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0);
    buf.writeUInt8(6, 4);
    buf.writeUInt32BE(payload.index, 5);
    buf.writeUInt32BE(payload.begin, 9);
    if (payload.length) buf.writeUInt32BE(payload.length, 13);
    return buf;
};

export const buildPiece = (payload: PieceResp) => {
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

export const buildCancel = (payload: PieceBlock) => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0);
    buf.writeUInt8(8, 4);
    buf.writeUInt32BE(payload.index, 5);
    buf.writeUInt32BE(payload.begin, 9);
    if (payload.length) buf.writeUInt32BE(payload.length, 13);
    return buf;
};

export const buildPort = (payload: number) => {
    const buf = Buffer.alloc(7);
    buf.writeUInt32BE(3, 0);
    buf.writeUInt8(9, 4);
    buf.writeUInt16BE(payload, 5);
    return buf;
};

export const parse = (msg: Buffer): ParsedMsg => {
    const id = msg.length > 4 ? msg.readInt8(4) : null;
    let payload: Payload = msg.length > 5 ? msg.slice(5) : null;

    if ([6, 7, 8].includes(id ?? 0)) {
        const rest = payload?.slice(8);
        payload = {
            index: payload?.readInt32BE(0) ?? 0,
            begin: payload?.readInt32BE(4) ?? 0,
        };
        if (id === 7) {
            (payload as PieceResp).block = rest;
        } else {
            (payload as PieceBlock).length = rest?.length;
        }
    }

    return {
        size: msg.readInt32BE(0),
        id,
        payload,
    };
};
