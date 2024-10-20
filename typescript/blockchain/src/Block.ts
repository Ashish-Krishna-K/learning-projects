import pkg from "crypto-js";
const { SHA256 } = pkg;

export default class Block {
    index: number;
    timestamp: string;
    data: string;
    previousHash: string;
    hash: string;
    nonce: number;
    constructor(
        index: number = 0,
        timestamp: string,
        data: string,
        previousHash: string = "0"
    ) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(
            this.index +
                this.previousHash +
                this.timestamp +
                this.data +
                this.nonce
        ).toString();
    }

    // mineBlock(difficulty: unknown) {
    // TODO
    // }
}
