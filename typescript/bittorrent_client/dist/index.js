import { open } from "./torrent-parser.js";
import download from "./download.js";
const torrent = open(process.argv[2]);
download(torrent, torrent.info.name);
//# sourceMappingURL=index.js.map