import { readFileSync } from "fs";
import bencode from "bencode";
import { createHash } from "crypto";
import bignum from "bignum";
export const BLOCK_LEN = Math.pow(2, 14);
export const pieceLen = (torrent, pieceIndex) => {
    const totalLength = bignum.fromBuffer(size(torrent)).toNumber();
    const pieceLength = torrent.info["piece length"];
    const lastPieceLength = totalLength % pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength);
    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
};
export const blocksPerPiece = (torrent, pieceIndex) => {
    const pieceLength = pieceLen(torrent, pieceIndex);
    return Math.ceil(pieceLength / BLOCK_LEN);
};
export const blockLen = (torrent, pieceIndex, blockIndex) => {
    const pieceLength = pieceLen(torrent, pieceIndex);
    const lastPieceLength = pieceLength % BLOCK_LEN;
    const lastPieceIndex = Math.floor(pieceLength / BLOCK_LEN);
    return blockIndex === lastPieceIndex ? lastPieceLength : BLOCK_LEN;
};
export function open(filepath) {
    return bencode.decode(readFileSync(filepath));
}
export function size(torrent) {
    const size = torrent.info.files
        ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
        : torrent.info.length;
    return bignum.toBuffer(size, { size: 8, endian: "big" });
}
export function infoHash(torrent) {
    const info = bencode.encode(torrent.info);
    return createHash("sha1").update(info).digest();
}
//# sourceMappingURL=torrent-parser.js.map