export type Torrent = {
    announce: Buffer;
    "created by": Buffer;
    "creation date": number;
    encoding: number;
    info: {
        length: number;
        name: Buffer;
        "piece length": number;
        pieces: Buffer;
        files: {
            length: number;
        }[];
    };
};

export type ConnectionResponse = {
    action: number;
    transactionId: number;
    connectionId: Buffer;
};

export type AnnounceResp = {
    action: number;
    transactionId: number;
    leechers: number;
    seeders: number;
    peers: Peers[];
};

export type Peers = {
    ip: string;
    port: number;
};

type PieceBlockBase = {
    index: number;
    begin: number;
};
export type PieceBlock = PieceBlockBase & {
    length?: number;
};
export type PieceResp = PieceBlockBase & {
    block?: Buffer;
};
export type Payload = null | Buffer | PieceResp;

export type ParsedMsg = {
    size: number;
    id: number | null;
    payload: Payload;
};
