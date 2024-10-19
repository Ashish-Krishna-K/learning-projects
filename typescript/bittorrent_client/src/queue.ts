import { blocksPerPiece, BLOCK_LEN, blockLen } from "./torrent-parser.js";
import { Torrent, PieceBlock } from "./types.js";

export default class Queue {
    _torrent: Torrent;
    _queue: PieceBlock[];
    choked: boolean;
    constructor(torrent: Torrent) {
        this._torrent = torrent;
        this._queue = [];
        this.choked = true;
    }

    queue(pieceIndex: number) {
        const nBlocks = blocksPerPiece(this._torrent, pieceIndex);
        for (let i = 0; i < nBlocks; i++) {
            const pieceBlock = {
                index: pieceIndex,
                begin: i * BLOCK_LEN,
                length: blockLen(this._torrent, pieceIndex, i),
            };
            this._queue.push(pieceBlock);
        }
    }

    deque() {
        return this._queue.shift();
    }

    peek() {
        return this._queue[0];
    }

    length() {
        return this._queue.length;
    }
}
