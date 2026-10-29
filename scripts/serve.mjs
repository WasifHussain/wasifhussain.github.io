import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, join, resolve, sep } from "node:path";

const repository = fileURLToPath(new URL("../", import.meta.url));
const root = resolve(repository, process.argv[2] || ".");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const mime = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8",
};
const server = createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
        response.writeHead(405, { Allow: "GET, HEAD" });
        response.end("Method not allowed");
        return;
    }
    try {
        const path = decodeURIComponent(
            new URL(request.url, "http://localhost").pathname
        );
        const relative = path.replace(/^\/+/, "");
        const segments = relative.split("/");
        const file = resolve(root, relative || "index.html");
        // Only the public website belongs on this development server.
        if (
            segments.some((segment) => segment.startsWith(".")) ||
            (relative &&
                relative !== "index.html" &&
                relative !== "CNAME" &&
                !relative.startsWith("assets/")) ||
            (file !== root && !file.startsWith(root + sep))
        ) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }
        const resolvedFile = await realpath(file);
        const resolvedRoot = await realpath(root);
        if (
            !resolvedFile.startsWith(resolvedRoot + sep) ||
            !(await stat(resolvedFile)).isFile()
        ) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }
        const contents = await readFile(file);
        response.writeHead(200, {
            "Content-Type": mime[extname(file)] || "application/octet-stream",
            "Content-Length": contents.length,
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy":
                "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
        });
        response.end(request.method === "HEAD" ? undefined : contents);
    } catch (error) {
        response.writeHead(
            error instanceof URIError
                ? 400
                : error.code === "ENOENT"
                ? 404
                : 500
        );
        response.end(
            error instanceof URIError
                ? "Bad request"
                : error.code === "ENOENT"
                ? "Not found"
                : "Server error"
        );
    }
});
server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
});
server.listen(port, host, () =>
    console.log(
        `Portfolio server running on ${host}:${
            server.address().port
        } from ${root}`
    )
);
