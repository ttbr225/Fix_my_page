// checks.js



export function checkTitle($) {
    const text = $("head > title").first().text().trim();
    return text
        ? { 
            present: true,
            value: text,
            length: text.length
        }
        : {
            present: false,
        };
}


export function checkHeadings($) {
    const headings = $("h1, h2, h3, h4, h5, h6").toArray();
    
}