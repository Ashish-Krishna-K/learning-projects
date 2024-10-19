import { Buffer } from "buffer";
import { Socket } from "net";
import { openSync, write } from "fs";
import getPeers from "./tracker.js";
import { buildHandshake, buildInterested, buildRequest, parse, } from "./messsage.js";
import Pieces from "./pieces.js";
import Queue from "./queue.js";
export default function (torrent, path) {
    getPeers(torrent, (peers) => {
        const pieces = new Pieces(torrent);
        const file = openSync(path, "w");
        peers.forEach((peer) => download(peer, torrent, pieces, file));
    });
}
function download(peer, torrent, pieces, file) {
    const socket = new Socket();
    socket.on("error", console.log);
    socket.connect(peer.port, peer.ip, () => {
        socket.write(buildHandshake(torrent));
    });
    const queue = new Queue(torrent);
    onWholeMsg(socket, (msg) => msgHandler(msg, socket, pieces, queue, torrent, file));
}
function onWholeMsg(socket, callback) {
    let savedBuff = Buffer.alloc(0);
    let handshake = true;
    socket.on("data", (recvBuf) => {
        const msgLen = () => handshake
            ? savedBuff.readUint8(0) + 49
            : savedBuff.readInt32BE(0) + 4;
        savedBuff = Buffer.concat([savedBuff, recvBuf]);
        while (savedBuff.length >= 4 && savedBuff.length >= msgLen()) {
            callback(savedBuff.slice(0, msgLen()));
            savedBuff = savedBuff.slice(msgLen());
            handshake = false;
        }
    });
}
function msgHandler(msg, socket, pieces, queue, torrent, file) {
    if (isHandshake(msg)) {
        socket.write(buildInterested());
    }
    else {
        const m = parse(msg);
        if (m.id === 0)
            chokeHandler(socket);
        if (m.id === 1)
            unchokeHandler(socket, pieces, queue);
        if (m.id === 4)
            haveHandler(socket, pieces, queue, m.payload);
        if (m.id === 5)
            bitfieldHandler(socket, pieces, queue, m.payload);
        if (m.id === 7)
            pieceHandler(socket, pieces, queue, torrent, file, m.payload);
    }
}
function isHandshake(msg) {
    return (msg.length === msg.readUint8(0) + 49 &&
        msg.toString("utf8", 1) === "BitTorrent protocol");
}
function chokeHandler(socket) {
    socket.end();
}
function unchokeHandler(socket, pieces, queue) {
    queue.choked = false;
    requestPiece(socket, pieces, queue);
}
function haveHandler(socket, pieces, queue, payload) {
    if (Buffer.isBuffer(payload)) {
        const pieceIndex = payload.readUint32BE(0);
        const queueEmpty = queue.length() === 0;
        queue.queue(pieceIndex);
        if (queueEmpty)
            requestPiece(socket, pieces, queue);
    }
}
function bitfieldHandler(socket, pieces, queue, payload) {
    const queueEmpty = queue.length() === 0;
    if (Buffer.isBuffer(payload)) {
        payload.forEach((byte, i) => {
            for (let j = 0; j < 8; j++) {
                if (byte % 2)
                    queue.queue(i * 8 + 7 - j);
                byte = Math.floor(byte / 2);
            }
        });
        if (queueEmpty)
            requestPiece(socket, pieces, queue);
    }
}
function pieceHandler(socket, pieces, queue, torrent, file, pieceResp) {
    var _a;
    console.log(pieceResp);
    pieces.addReceived(pieceResp);
    if (Buffer.isBuffer(pieceResp.block)) {
        const offset = pieceResp.index * torrent.info["piece length"] + pieceResp.begin;
        write(file, pieceResp.block, 0, (_a = pieceResp.block) === null || _a === void 0 ? void 0 : _a.length, offset, () => { });
    }
    if (pieces.isDone()) {
        socket.end();
        console.log("DONE!");
    }
    else {
        requestPiece(socket, pieces, queue);
    }
}
function requestPiece(socket, pieces, queue) {
    if (queue.choked)
        return null;
    while (queue.length()) {
        const pieceBlock = queue.deque();
        if (pieces.needed(pieceBlock)) {
            socket.write(buildRequest(pieceBlock));
            pieces.addRequested(pieceBlock);
            break;
        }
    }
}
//# sourceMappingURL=download.js.map