import catalog from '../i18n/messages.yml'

/**
 * @type {RegExp}
 * @exemple
 * ```
 * // Match
 * ${match} and ${matchAgain} and ${also_match}
 * // NOT match
 * ${matchFrançaisSpécialsCaractères} or ${not-match}
 * ```
 */

const matchDollarBracket = new RegExp(/\$\{(\w+)\}/g)

/**
 * Get translate for a text element
 * @param {String} element Page, layout or viz name
 * @param {String} label Text sub-element identifier
 * @param {String} lang Language as its flag, as the 'ISO 3166-1 alpha-2' standard
 * @param {Object} remplacements
 * @returns {String}
 * @exemple
 * ```
 * translate('marseille-product-diagram', 'title', 'en', { year: 1787 })
 * ```
 */

export default function translate (element, label, lang, remplacements) {
    const error = `no translate for '${label}' in '${element}'`;

    if (
        catalog[element] === undefined ||
        catalog[element][label] === undefined ||
        catalog[element][label][lang] === undefined
    ) {
        return error;
    }

    let result = catalog[element][label][lang];

    if (!!result === false) {
        return error;
    }

    result = result.replace(matchDollarBracket, (match, key) => {
        if (remplacements === undefined) { return ''; }
        return (remplacements[key] + '') || ''
    })

    return result;
}