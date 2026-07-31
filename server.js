// server.js



import { createServer } from "node:http";
import { load } from "cheerio";
import { checkTitle, checkHeadings, checkDescription } from "./checks.js";
import { fetchPublic } from "./safety.js";
import { serveStatic } from "./static.js";



const PORT = process.env.PORT ?? 3000;



/**
 * @param {import("node:http").ServerResponse} response 
 * @param {number} status 
 * @param {unknown} body 
 */
function send(response, status, body) {
    // `writeHead` before `end`; header before body, or else Node throws. \\
    response.writeHead(status, {
        "content-type": "application/json", // key is quoted due to the hyphen
        "cache-control": "no-store",
    });
    response.end(JSON.stringify(body, null, 2)); // `null` means we don't want to control what fields of the first argument get serialized. `2` is indentation. `JSON.stringify(body)` would work just as well but would be less pretty.
}


const server = createServer(
    async (request, response) => { // i am gonna need to look up what async does again....

        // ARGUMENT VALIDATION \\

        const requestUrl = new URL( // `new` just means initialize a new object. Python doesn't require it, instead implicitly calling `__new__` and `__init__`.
            request.url,
            `http://${request.headers.host}` // basically Python fstrings.
        );
        if (requestUrl.pathname !== "/audit") { 
            return serveStatic(response, requestUrl.pathname);
        };

        const rawUrl = requestUrl.searchParams.get("url"); // this looks through the '?'s in the URL for "url=".
        if (!rawUrl) return send(response, 400, { // "bad request". like `ValueError` in Python.
            error: "missing ?url=",
        });

        let targetUrl; // not just a type hint! this actually creates a binding with `undefined`. need it here since `let` is block-scoped and we need to use this variable later.
        try {
            targetUrl = new URL(rawUrl); // this is the parameter URL, not the actual request.
        } catch {
            return send(response, 400, {
                error: "not a valid URL",
                got: rawUrl,
            });
        }
        if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
            return send(response, 400, {
                error: "only http and https are supported",
                got: targetUrl.protocol,
            });
        }

        let page, html; // not a tuple; just two declarations.
        try {
            const result = await fetchPublic(targetUrl, {
                headers: { "user-agent": "fix-my-page/0.1 (site auditor)" },
                signal: AbortSignal.timeout(10_000), // milliseconds
            });
            page = result.response;
            html = await page.text(); // waits for the body stream to end or timeout
        } catch (caughtError) {
            return send(response, 502, {
                error: "could not reach page",
                detail: caughtError instanceof Error ? caughtError.message : String(caughtError),
            });
        };
        
        
        // arguments are all good! go ahead and send. \\

        const $ = load(html); // `page` is already used above. this is just convention.
        
        const checks = {
            title: checkTitle($),
            headings: checkHeadings($),
            description: checkDescription($),
        };

        const problems = Object.values(checks).flatMap(check => check.problems);

        send(response, 200, { // 200 is OK :)
            url: targetUrl.href, // just the string version of the URL instead of the URL object.
            targetStatus: page.status, // send the same status that the fetched target page gave us.
            contentType: page.headers.get("content-type"),
            bytes: html.length, // might not be correct if the page has non-ASCII· characters.
            problems,
            checks,
        });
    }
);



server.listen(PORT, () =>
    console.log(`ready: http://localhost:${PORT}/audit?url=https://example.com`)
);
