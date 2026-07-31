// safety.js



import { lookup } from "node:dns/promises";
import { isIP } from "node:net";



function isBlockedIPv4(address) {
    const [a, b] = address.split(".").map(Number); // a.b.x.y/z

    if (a === 0) return true;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && 16 <= b && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;

    return false;
};


function isBlockedIPv6(address) {
    const ip = address.toLowerCase().split("%")[0];
    
    if (ip === "::1" || ip === "::") return true;
    if (ip.startsWith("fe80")) return true;
    if (ip.startsWith("fc") || ip.startsWith("fd")) return true;
    
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIPv4(mapped[1]);
    
    return false;
};



export async function assertPublicHost(hostname) {
    const literalFamily = isIP(hostname);
    const addresses = literalFamily
        ? [{ address: hostname, family: literalFamily }]
        : await lookup(hostname, { all: true });

    for (const { address, family } of addresses) {
        const blocked = family === 4 ? isBlockedIPv4(address) : isBlockedIPv6(address);
        if (blocked) throw new Error(`refusing to fetch private address ${address}`);
    };
};



export async function fetchPublic(startUrl, options, maxHops = 5) {
    let current = new URL(startUrl);

    for (let hop = 0; hop < maxHops; hop++) {
        await assertPublicHost(current.hostname.replace(/^\[|\]$/g, "")); // throws or returns nothing
        const response = await fetch(current, { ...options, redirect: "manual" }); // does not redirect automatically
        const location = response.headers.get("location");

        if (300 <= response.status && response.status < 400 && location) {
            current = new URL(location, current);
            if (current.protocol !== "http:" && current.protocol !== "https:")
                throw new Error("redirect to a non-http scheme");
            continue; // skips the `return` right below us
        }

        return { response, finalUrl: current };
    }
    throw new Error("too many redirects");
};