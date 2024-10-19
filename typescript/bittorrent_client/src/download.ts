import { Buffer } from "buffer";
import { Socket } from "net";
import { openSync, write } from "fs";
import { Payload, Peers, PieceResp, Torrent } from "./types.js";
import getPeers from "./tracker.js";
import {
    buildHandshake,
    buildInterested,
    buildRequest,
    parse,
} from "./messsage.js";
import Pieces from "./pieces.js";
import Queue from "./queue.js";

export default function (torrent: Torrent, path: string) {
    getPeers(torrent, (peers) => {
        const pieces = new Pieces(torrent);
        const file = openSync(path, "w");
        peers.forEach((peer) => download(peer, torrent, pieces, file));
    });
}

function download(peer: Peers, torrent: Torrent, pieces: Pieces, file: number) {
    const socket = new Socket();
    socket.on("error", console.log);
    socket.connect(peer.port, peer.ip, () => {
        socket.write(buildHandshake(torrent));
    });
    const queue = new Queue(torrent);
    onWholeMsg(socket, (msg) =>
        msgHandler(msg, socket, pieces, queue, torrent, file)
    );
}

function onWholeMsg(socket: Socket, callback: (data: Buffer) => void) {
    let savedBuff = Buffer.alloc(0);
    let handshake = true;

    socket.on("data", (recvBuf) => {
        const msgLen = () =>
            handshake
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

function msgHandler(
    msg: Buffer,
    socket: Socket,
    pieces: Pieces,
    queue: Queue,
    torrent: Torrent,
    file: number
) {
    if (isHandshake(msg)) {
        socket.write(buildInterested());
    } else {
        const m = parse(msg);

        if (m.id === 0) chokeHandler(socket);
        if (m.id === 1) unchokeHandler(socket, pieces, queue);
        if (m.id === 4) haveHandler(socket, pieces, queue, m.payload);
        if (m.id === 5) bitfieldHandler(socket, pieces, queue, m.payload);
        if (m.id === 7)
            pieceHandler(
                socket,
                pieces,
                queue,
                torrent,
                file,
                m.payload as PieceResp
            );
    }
}

function isHandshake(msg: Buffer) {
    return (
        msg.length === msg.readUint8(0) + 49 &&
        msg.toString("utf8", 1) === "BitTorrent protocol"
    );
}

function chokeHandler(socket: Socket) {
    socket.end();
}

function unchokeHandler(socket: Socket, pieces: Pieces, queue: Queue) {
    queue.choked = false;
    requestPiece(socket, pieces, queue);
}

function haveHandler(
    socket: Socket,
    pieces: Pieces,
    queue: Queue,
    payload: Payload
) {
    if (Buffer.isBuffer(payload)) {
        const pieceIndex = payload.readUint32BE(0);
        const queueEmpty = queue.length() === 0;
        queue.queue(pieceIndex);
        if (queueEmpty) requestPiece(socket, pieces, queue);
    }
}

function bitfieldHandler(
    socket: Socket,
    pieces: Pieces,
    queue: Queue,
    payload: Payload
) {
    const queueEmpty = queue.length() === 0;
    if (Buffer.isBuffer(payload)) {
        payload.forEach((byte, i) => {
            for (let j = 0; j < 8; j++) {
                if (byte % 2) queue.queue(i * 8 + 7 - j);
                byte = Math.floor(byte / 2);
            }
        });
        if (queueEmpty) requestPiece(socket, pieces, queue);
    }
}

function pieceHandler(
    socket: Socket,
    pieces: Pieces,
    queue: Queue,
    torrent: Torrent,
    file: number,
    pieceResp: PieceResp
) {
    console.log(pieceResp);
    pieces.addReceived(pieceResp);
    if (Buffer.isBuffer(pieceResp.block)) {
        const offset =
            pieceResp.index * torrent.info["piece length"] + pieceResp.begin;
        write(
            file,
            pieceResp.block,
            0,
            pieceResp.block?.length,
            offset,
            () => {}
        );
    }
    if (pieces.isDone()) {
        socket.end();
        console.log("DONE!");
    } else {
        requestPiece(socket, pieces, queue);
    }
}

function requestPiece(socket: Socket, pieces: Pieces, queue: Queue) {
    if (queue.choked) return null;

    while (queue.length()) {
        const pieceBlock = queue.deque()!;
        if (pieces.needed(pieceBlock)) {
            socket.write(buildRequest(pieceBlock));
            pieces.addRequested(pieceBlock);
            break;
        }
    }
}
