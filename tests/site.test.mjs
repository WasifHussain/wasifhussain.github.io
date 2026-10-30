import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { before, test } from "node:test";

const run = promisify(execFile);
const repository = fileURLToPath(new URL("../", import.meta.url));
const output = join(repository, "_site");
let sourceSnapshot;

async function filesIn(directory, prefix = "") {
    const result = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const name = join(prefix, entry.name);
        if (entry.isDirectory())
            result.push(...(await filesIn(join(directory, entry.name), name)));
        else if (entry.isFile()) result.push(name);
        else assert.fail(`Unexpected non-file in public assets: ${name}`);
    }
    return result.sort();
}

async function snapshot(directory, files) {
    return new Map(
        await Promise.all(
            files.map(async (file) => [
                file,
                await readFile(join(directory, file)),
            ]),
        ),
    );
}

async function build() {
    const result = await run(process.execPath, ["scripts/build.mjs"], {
        cwd: repository,
    });
    assert.match(result.stdout, /built successfully/);
}

before(async () => {
    const sources = [
        "index.html",
        "package.json",
        "package-lock.json",
        "CNAME",
        ...(await filesIn(join(repository, "assets"), "assets")),
        ...(await filesIn(join(repository, "scripts"), "scripts")),
    ];
    sourceSnapshot = await snapshot(repository, sources);
    await build();
});

test("build emits exactly the public site with intact assets and a downloadable PDF", async () => {
    const publicFiles = [
        "index.html",
        "CNAME",
        ...(await filesIn(join(repository, "assets"), "assets")),
    ].sort();
    assert.deepEqual(
        await filesIn(output),
        [...publicFiles, ".nojekyll"].sort(),
    );
    for (const file of publicFiles) {
        const source = await readFile(join(repository, file));
        const emitted = await readFile(join(output, file));
        assert.ok(source.length > 0, `${file} must be nonempty`);
        assert.deepEqual(
            emitted,
            source,
            `${file} must survive deployment unchanged`,
        );
    }
    const pdf = await readFile(join(output, "assets/Wasif-Hussain-Resume.pdf"));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.equal((await readFile(join(output, ".nojekyll"))).length, 0);
});

test("every local HTML reference and internal anchor resolves in the deployed output", async () => {
    const html = await readFile(join(output, "index.html"), "utf8");
    const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(
        (match) => match[1],
    );
    assert.equal(new Set(ids).size, ids.length, "HTML ids must be unique");
    let assetCount = 0;
    let anchorCount = 0;
    for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
        const value = match[1];
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) continue;
        if (value.startsWith("#")) {
            assert.ok(
                ids.includes(decodeURIComponent(value.slice(1))),
                `Missing anchor target: ${value}`,
            );
            anchorCount += 1;
            continue;
        }
        const pathname = decodeURIComponent(value.split(/[?#]/)[0]);
        const file = resolve(output, pathname.replace(/^\/+/, ""));
        assert.ok(
            file.startsWith(output + sep),
            `Asset must remain in the website: ${value}`,
        );
        assert.ok(
            (await stat(file)).isFile(),
            `Missing deployed asset: ${value}`,
        );
        assetCount += 1;
    }
    assert.ok(
        assetCount >= 6,
        "Check the stylesheet, script, fonts, portrait, favicon, and résumé",
    );
    assert.ok(
        anchorCount >= 6,
        "Check the primary navigation and page actions",
    );
});

test("all CSS font and image URLs are deployed locally", async () => {
    const stylesheet = join(output, "assets/styles.css");
    const css = await readFile(stylesheet, "utf8");
    const urls = [...css.matchAll(/url\(\s*["']?([^\s)"']+)["']?\s*\)/g)].map(
        (match) => match[1],
    );
    assert.ok(urls.length >= 2, "The design must load its self-hosted fonts");
    for (const url of urls) {
        assert.doesNotMatch(
            url,
            /^(?:https?:|\/\/)/,
            "Fonts must not rely on an external provider",
        );
        if (url.startsWith("data:")) continue;
        const file = resolve(
            dirname(stylesheet),
            decodeURIComponent(url.split(/[?#]/)[0]),
        );
        assert.ok(
            file.startsWith(output + sep),
            `CSS URL escapes the website: ${url}`,
        );
        assert.ok(
            (await stat(file)).size > 0,
            `Empty or missing CSS asset: ${url}`,
        );
    }
});

test("deployed page contains the current résumé and no unrelated template credentials", async () => {
    const html = await readFile(join(output, "index.html"), "utf8");
    const normalizedHtml = html.replace(/\s+/g, " ");
    for (const text of [
        "<title>Wasif Hussain — Software Engineer</title>",
        "Prairie View, Texas",
        "mailto:hussainwasif1999@gmail.com",
        "Graduate Teaching Assistant",
        "SEP 2026 — PRESENT",
        "FEB 2024 — JUL 2026",
        "JUL 2024 — MAR 2026",
        "Prairie View A&M University",
        "Expected May 2028",
        "Astra Technology",
        "Namaste Roving",
        "https://namasteroving.com/",
        "https://astratechnology.com.np/portfolio/5",
    ])
        assert.ok(
            normalizedHtml.includes(text),
            `Missing current résumé content: ${text}`,
        );
    assert.doesNotMatch(
        html,
        /Clarence Taylor|University of Colorado|Google Analytics Certified|wasifhussain\.me/,
    );
    const domain = (await readFile(join(output, "CNAME"), "utf8")).trim();
    assert.equal(
        domain,
        "wasifhussain.tech",
        "Use the domain the user purchased",
    );
    assert.match(html, /rel="canonical" href="https:\/\/wasifhussain\.tech\/"/);
    assert.match(
        html,
        /property="og:url" content="https:\/\/wasifhussain\.tech\/"/,
    );
});

test("rebuilding is repeatable and leaves source files unchanged", async () => {
    const files = await filesIn(output);
    const first = await snapshot(output, files);
    await build();
    assert.deepEqual(await filesIn(output), files);
    const second = await snapshot(output, files);
    assert.deepEqual(second, first, "Repeated builds must emit the same bytes");
    assert.deepEqual(
        await snapshot(repository, [...sourceSnapshot.keys()]),
        sourceSnapshot,
    );
});

test("preview serves the built website and rejects non-public or malformed requests", async (t) => {
    const server = spawn(process.execPath, ["scripts/serve.mjs", "_site"], {
        cwd: repository,
        env: { ...process.env, HOST: "127.0.0.1", PORT: "0" },
        stdio: ["ignore", "pipe", "pipe"],
    });
    t.after(async () => {
        if (server.exitCode !== null || server.signalCode !== null) return;
        const exited = once(server, "exit");
        server.kill("SIGTERM");
        await exited;
    });
    const base = await new Promise((resolvePort, reject) => {
        let logs = "";
        const timeout = setTimeout(
            () => reject(new Error(`Server did not become ready: ${logs}`)),
            8000,
        );
        server.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
        server.on("exit", (code) => {
            clearTimeout(timeout);
            reject(new Error(`Server exited with ${code}: ${logs}`));
        });
        server.stderr.on("data", (chunk) => {
            logs += chunk.toString();
        });
        server.stdout.on("data", (chunk) => {
            logs += chunk.toString();
            const match = logs.match(/running on 127\.0\.0\.1:(\d+)/);
            if (match) {
                clearTimeout(timeout);
                assert.notEqual(
                    match[1],
                    "0",
                    "Startup must report the actual bound port",
                );
                resolvePort(`http://127.0.0.1:${match[1]}`);
            }
        });
    });
    for (const [path, type] of [
        ["/", "text/html"],
        ["/assets/styles.css", "text/css"],
        ["/assets/app.js", "text/javascript"],
        ["/assets/favicon.svg", "image/svg+xml"],
        ["/assets/Wasif-Hussain-Resume.pdf", "application/pdf"],
    ]) {
        const response = await fetch(base + path);
        assert.equal(response.status, 200, path);
        assert.ok(response.headers.get("content-type").startsWith(type), path);
        const file = path === "/" ? "index.html" : path.slice(1);
        assert.deepEqual(
            Buffer.from(await response.arrayBuffer()),
            await readFile(join(output, file)),
            path,
        );
    }
    const head = await fetch(base + "/", { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal((await head.arrayBuffer()).byteLength, 0);
    const post = await fetch(base + "/", { method: "POST" });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get("allow"), "GET, HEAD");
    for (const path of [
        "/missing",
        "/package.json",
        "/.env",
        "/.git/config",
        "/assets/.private",
    ]) {
        assert.equal((await fetch(base + path)).status, 404, path);
    }
    assert.equal((await fetch(base + "/%invalid")).status, 400);
});
