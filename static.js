// static.js



import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";



const CLIENT_DIRECTORY = resolve("client/dist");

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js":   "text/javascript; charset=utf-8",
    ".css":  "text/css; charset=utf-8",
    ".svg":  "image/svg+xml",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".ico":  "image/x-icon",
    ".json": "application/json; charset=utf-8",
    ".woff2":"font/woff2",
};


/**
 * @param {import("node:http").ServerResponse} response 
 * @param {string} pathname 
 */
export async function serveStatic(response, pathname) {
    response.setHeader("x-robots-tag", "noindex, nofollow");

    let decoded;
    try { decoded = decodeURIComponent(pathname); }
    catch { decoded = pathname; }

    const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
    const filePath = resolve(CLIENT_DIRECTORY, relative);

    
    if (filePath !== CLIENT_DIRECTORY && !filePath.startsWith(CLIENT_DIRECTORY + "/")) {
        response.writeHead(403, { "content-type": "text/plain" });
        return response.end("forbidden");
    };

    try {
        const data = await readFile(filePath);
        response.writeHead(200, {
            "content-type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
        });
        return response.end(data);
    } catch {
        try {
            const html = await readFile(resolve(CLIENT_DIRECTORY, "index.html"));
            response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
            return response.end(html);
        } catch {
            response.writeHead(404, { "content-type": "text/plain" });
            return response.end("not found");
        }
    }
};
