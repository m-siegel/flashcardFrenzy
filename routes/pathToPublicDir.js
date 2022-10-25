/*Ilana-Mahmea Siegel*/
// To get absolute path based on current location
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const pathToPublicDir = resolve(__dirname, "../public");

export default pathToPublicDir;
