import BlockChain from "./BlockChain.js";
const jsChain = new BlockChain();
jsChain.addBlock(Date.now().toString(), "hello");
jsChain.addBlock(Date.now().toString(), "bye");
console.log(JSON.stringify(jsChain, null, 4));
console.log("Is blockchain valid? " + jsChain.checkValid());
