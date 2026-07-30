// checks.js



export function checkTitle($) {
    const titleTag = $("head > title").first();
    const titleText = titleTag.text().trim();
    
    const problems = [];
    

    if (!titleTag.length) {
        problems.push({ type: "no-title" });
    }
    else {
        if (!titleText)
            problems.push({ type: "empty-title" });
    };


    return {
        facts: {
            titleExists: titleTag.length > 0,
            titleText: titleTag.length ? titleText : null,
            titleLength: titleTag.length ? titleText.length : null, // this may diverge on pages with non-ASCII· characters
        },
        problems,
    };
};



export function checkHeadings($) {
    const headings = $("h1, h2, h3, h4, h5, h6")
        .toArray()
        .map(element => ({
            level: Number(element.name[1]), // `element.name` is something like "h1"
            text: $(element).text().trim(),
        }));

    const problems = [];
    

    const h1Count = headings.filter(
        heading => heading.level === 1
    ).length;
    if (h1Count > 1) problems.push(
        {
            type: "multiple-h1s",
            h1Count, // equivalent to `h1Count: h1Count,`
        }
    );

    if (headings.length === 0) { // why on earth are empty arrays truthy....
        // no headings \\
        problems.push(
            {
                type: "no-headings",
            }
        )
    } else {
        // yes headings \\
        const firstHeadingLevel = headings[0].level
        if (firstHeadingLevel !== 1) problems.push(
            {
                type: "first-heading-level-is-not-1",
                firstHeadingLevel,
                h1Count,
            }
        );

        for (let index = 1; index < headings.length; index++) {
            if (headings[index].level > (headings[index-1].level + 1))
                problems.push({
                    type: "bad-heading-level-jump",
                    fromHeading: {
                        level: headings[index-1].level,
                        text: headings[index-1].text,
                    },
                    toHeading: {
                        level: headings[index].level,
                        text: headings[index].text,
                    }
                })
        };
    };
    

    return {
        facts: {
            headings,
            h1Count,
        },
        problems,
    };
};



export function checkDescription($) {
    const descriptionTags = $(
        'meta[name="description"]'
    );
    const firstDescriptionTag = descriptionTags.first();
    const firstDescriptionText = descriptionTags.length
        ? (
            firstDescriptionTag
                .attr("content")
                ?.trim() // `?.` is optional chaining. if `.attr("content")` is undefined, we skip `.trim()` and return `undefined`.
            ?? "" // `??` is like `||` but only triggers on `null` and `undefined`.
        )
        : null;
    
    const problems = []
    

    if (descriptionTags.length > 1)
        problems.push( {type: 'multiple-description-tags' });

    else if (descriptionTags.length === 0)
        problems.push({ type: "no-description" });

    else if (!firstDescriptionText)
        problems.push({ type: "empty-description" });


    return {
        facts: {
            descriptionCount: descriptionTags.length,
            firstDescriptionText,
        },
        problems,
    };
}
