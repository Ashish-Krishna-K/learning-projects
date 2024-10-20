import Block from "./Block.js";

export default class BlockChain {
    chain: Block[];
    private _lastIndex: number;
    constructor() {
        this._lastIndex = 0;
        this.chain = [this.createGenesis()];
    }
    createGenesis() {
        return new Block(
            this._lastIndex,
            Date.now().toString(),
            "Genesis block",
            "0"
        );
    }
    latestBlock() {
        return this.chain[this._lastIndex];
    }
    addBlock(timestamp: string, data: string) {
        const newBlock = new Block(this._lastIndex + 1, timestamp, data);
        newBlock.previousHash = this.latestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
        this._lastIndex++;
    }
    checkValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}
