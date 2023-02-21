import React from 'react';

export default function LangSwitcher({
    onLangChange,
    langagesFlag,
    lang: activeLang
}) {
    return (
        <ul className="lang-toggle-container">
            {
                langagesFlag.map((flag, i) =>
                    <li key={i} >
                        <button
                            className={(activeLang === flag ? 'is-active' : '')}
                            onClick={() => onLangChange(flag)}
                        >{flag}</button>
                    </li>
                )
            }
        </ul>
    )
}