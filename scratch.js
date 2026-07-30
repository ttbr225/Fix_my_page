// scratch.js



import { readFileSync } from "node:fs";
import { load } from "cheerio";
import { checkTitle, checkHeadings, checkDescription } from "./checks.js";



for (const name of ["messy", "clean"]) {
    const $ = load(readFileSync(`fixtures/${name}.html`, "utf8"));

    const checks = {
        title: checkTitle($),
        headings: checkHeadings($),
        description: checkDescription($),
    };

    const problems = Object.values(checks).flatMap(check => check.problems);


    console.log(`\n=== ${name}.html — ${problems.length} problem(s) ===`);
    for (const problem of problems) console.log("  ", JSON.stringify(problem));
};