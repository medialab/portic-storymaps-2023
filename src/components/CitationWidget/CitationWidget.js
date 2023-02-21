/* eslint import/no-webpack-loader-syntax: 0 */
import { useState, useRef, useEffect } from 'react';
import cx from 'classnames';
// import copy from 'copy-to-clipboard';

import FrMla from './mla-fr.mdx';
import FrIso690 from './iso-fr.mdx';
import FrApa from './apa-fr.mdx';
import Doi from './doi.mdx';

import './CitationWidget.scss';


const CONTENTS = {
  fr: {
    'MLA': FrMla,
    'ISO 690': FrIso690,
    'APA': FrApa,
    'DOI': Doi
  },
  en: {
    'MLA': FrMla,
    'DOI': Doi
  }
}


/**
 * Description
 * @param {string} lang
 * @returns {React.ReactElement} - React component
 */
const CitationWidget = ({
  lang = 'fr',
}) => {
  const blockquoteRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  // const [copyClicked, setCopyClicked] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(null);
  useEffect(() => {
    if (lang === 'fr' || lang === 'en') {
      setCurrentStyle(Object.keys(CONTENTS[lang])[0]);
    }
  }, [lang])

  const Contents = currentStyle ? CONTENTS[lang][currentStyle] : undefined;

  const messages = {
    title: {
      fr: 'Citer cette publication',
      en: 'Cite this publication',
    },
    copyCitation: {
      fr: 'copier',
      en: 'copy'
    },
    citationCopied: {
      fr: 'copié dans le presse-papier !',
      en: 'copied in the clipboard !'
    }
  }

  // const handleCopyClick = (e) => {
  //   e.stopPropagation();
  //   setCopyClicked(true);
  //   const contents = blockquoteRef.current.innerHTML;
  //   copy(contents, { format: 'text/html' });
  //   // copy(blockquoteRef.current.innerText);
  //   setTimeout(() => setCopyClicked(false), 5000);
  // }

  if (!['fr', 'en'].includes(lang)) {
    return null;
  }

  return (
    <div className={cx("CitationWidget", { 'is-collapsed': isCollapsed })}>
      <button
        className={cx("collapse-toggler", { 'is-active': !isCollapsed })}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {messages.title[lang]}
      </button>
      <div className={cx('collapsible-contents')}>
        <blockquote ref={blockquoteRef}>
          {currentStyle ? <Contents /> : null}
        </blockquote>
        <div className="widget-footer">
          {
            Object.entries(CONTENTS[lang]).length > 1 ?
              <ul className="styles-list">
                {
                  lang && currentStyle ?
                    Object.entries(CONTENTS[lang])
                      .map(([id, Contents]) => (
                        <li onClick={() => setCurrentStyle(id)} key={id} className={cx('list-item', { 'is-active': currentStyle === id })}>
                          <span>{id}</span>
                        </li>
                      ))
                    : null
                }
              </ul>
              : null
          }
          {/* disabled: copy on click (gadget) */}
          {/* <div className="copy-link-container">
            <span onClick={handleCopyClick}>{copyClicked ? messages.citationCopied[lang] : messages.copyCitation[lang]}</span>
          </div> */}
        </div>

      </div>
    </div>
  )
}

export default CitationWidget;