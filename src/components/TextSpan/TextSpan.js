import React, { useMemo } from "react";

/**
 * 
 * @param {Object} props
 * @param {String} props.text
 * @param {Number} props.x
 * @param {Number} [props.maxLength = 25]
 * @returns {React.ReactElement} - React component 
 */

export default function TextSpan({
    maxLength = 25,
    text,
    ...props
}) {
    const wordsGroups = useMemo(function splitWords() {
        const groups = [[]];
        const words = text.split(' ');

        let letterCounter = 0;
        let wordI = 0;
        for (const word of words) {
            const lastWordGroup = groups[groups.length - 1];
            lastWordGroup.push(word);
            letterCounter += word.length;
            letterCounter += 1; // count space

            if (wordI === words.length - 1) {
                break;
            }

            if (letterCounter >= maxLength) {
                groups.push([]);
                letterCounter = 0;
            }
            wordI++;
        }
        return groups; // last nested array is useless
    }, [text, maxLength]);

    return (
        <text
            {...props}
        >
            {
                wordsGroups.map(
                    (group, i) => (
                        <tspan
                            x={props.x}
                            dy='1.2em'
                        >
                            {group.join(' ')}
                        </tspan>
                    )
                )
            }
        </text>
    )
}