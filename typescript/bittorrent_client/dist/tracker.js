import { createSocket } from "dgram";
import { parse as urlParse } from "url";
import { randomBytes } from "crypto";
import { genId } from "./util.js";
import { infoHash, size } from "./torrent-parser.js";
export default function getPeers(torrent, callback) {
    const socket = createSocket("udp4");
    const url = torrent.announce.toString("utf-8");
    console.log(url);
    udpSend(socket, buildConnReq(), url);
    socket.on("message", (response) => {
        const resp = respType(response);
        if (resp === "connect") {
            const connResp = parseConnResp(response);
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
            udpSend(socket, announceReq, url);
        }
        else if (resp === "announce") {
            const announceResp = parseAnnounceResp(response);
            callback(announceResp.peers);
        }
    });
}
function udpSend(socket, message, rawUrl, callback = () => { }) {
    var _a, _b;
    const url = urlParse(rawUrl);
    url.port = (_a = url.port) !== null && _a !== void 0 ? _a : "0";
    url.host = (_b = url.host) !== null && _b !== void 0 ? _b : "";
    socket.send(message, 0, message.length, parseInt(url.port), url.host, callback);
}
function respType(resp) {
    const action = resp.readUint32BE(0);
    if (action === 0)
        return "connect";
    if (action === 1)
        return "announce";
}
function buildConnReq() {
    const buff = Buffer.alloc(16);
    buff.writeUint32BE(0x417, 0);
    buff.writeUint32BE(0x27101980, 4);
    buff.writeUint32BE(0, 8);
    randomBytes(4).copy(buff, 12);
    return buff;
}
function parseConnResp(resp) {
    return {
        action: resp.readUint32BE(0),
        transactionId: resp.readUint32BE(4),
        connectionId: resp.slice(8),
    };
}
function buildAnnounceReq(connId, torrent, port = 6881) {
    const buff = Buffer.allocUnsafe(98);
    connId.copy(buff, 0);
    buff.writeUint32BE(1, 8);
    randomBytes(4).copy(buff, 12);
    infoHash(torrent).copy(buff, 16);
    genId().copy(buff, 36);
    Buffer.alloc(8).copy(buff, 56);
    size(torrent).copy(buff, 64);
    Buffer.alloc(8).copy(buff, 72);
    buff.writeUInt32BE(0, 80);
    buff.writeUInt32BE(0, 80);
    randomBytes(4).copy(buff, 88);
    buff.writeInt32BE(-1, 92);
    buff.writeUInt16BE(port, 96);
    return buff;
}
function parseAnnounceResp(resp) {
    function group(iterable, groupSize) {
        let groups = [];
        for (let i = 0; i < iterable.length; i += groupSize) {
            groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    }
    return {
        action: resp.readUint32BE(0),
        transactionId: resp.readUint32BE(4),
        leechers: resp.readUint32BE(8),
        seeders: resp.readUint32BE(12),
        peers: group(resp.slice(20), 6).map((address) => {
            return {
                ip: address.slice(0, 4).join("."),
                port: address.readUint16BE(4),
            };
        }),
    };
}
//# sourceMappingURL=tracker.js.map