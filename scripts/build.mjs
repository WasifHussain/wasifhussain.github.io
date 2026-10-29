import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "_site");
for (const file of [
    "index.html",
    "assets/styles.css",
    "assets/app.js",
    "assets/favicon.svg",
    "assets/Wasif-Hussain-Resume.pdf",
]) {
    const info = await stat(join(root, file));
    if (!info.isFile() || !info.size)
        throw new Error(`Required site file is missing or empty: ${file}`);
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ["index.html", "assets"])
    await cp(join(root, file), join(output, file), { recursive: true });
await writeFile(join(output, ".nojekyll"), "");
// Only ship a domain binding after ownership and DNS have been confirmed.
try {
    await cp(join(root, "CNAME"), join(output, "CNAME"));
} catch (error) {
    if (error.code !== "ENOENT") throw error;
}
console.log(`Static portfolio built successfully: ${resolve(output)}`);
