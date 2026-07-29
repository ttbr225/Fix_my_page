// scratch.js



import { readFileSync } from "node:fs";
import { load } from "cheerio";
import { checkTitle, checkHeadings } from "./checks.js";



const $ = load(readFileSync("fixtures/messy.html", "utf8"));

console.log(JSON.stringify(checkTitle($), null, 2));
checkHeadings($);
