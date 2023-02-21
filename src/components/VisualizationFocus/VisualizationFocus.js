import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import packageJSON from '../../../package.json';
import copy from 'copy-to-clipboard';
import VisualizationController from '../../visualizations';
import Md from 'react-markdown';
import Measure from 'react-measure'
import cx from 'classnames';

import translate from '../../utils/translate';
import visualizationsMetas from '../../content/viz';

import './VisualizationFocus.scss';

const { homepage } = packageJSON;

/**
 * Displays an overlay with a visualization and its meta and descriptions in a 2-to-1 columns layout
 * @param {Object} props
 * @param {Function} props.onClickClose
 * @returns {React.ReactElement}
 */
export default function VisualizationFocus({
    vizId,
    datasets,
    onClickClose,
    isVisible,
    // ...props
}) {
    const { lang } = useParams();

    const [dimensions, setDimensions] = useState({
        width: -1,
        height: -1
    });
    const [copyClicked, setCopyClicked] = useState(false);

    const inputRef = useRef(null);

    let {
        permalink,
        title,
        description,
        howToRead,
        howItsMade,
        isOk
    } = useMemo(function getVizMetas() {
        const vizMetas = Object.values(visualizationsMetas)
            .find(({ id }) => id === vizId);

        if (vizMetas === undefined) {
            return { isOk: false };
        }

        const {
            lien_permanent_visualisation: permalink,
            ...metas
        } = vizMetas;

        const title = metas['titre_' + lang] || false
            , description = metas['description_' + lang] || false
            , howToRead = metas['comment_lire_' + lang] || false
            , howItsMade = metas['comment_cest_fait_' + lang] || false;

        return {
            permalink,
            title,
            description,
            howToRead,
            howItsMade,
            isOk: true
        }
    }, [vizId, lang]);

    const messages = useMemo(function getMessages() {
        return {
            description: translate('vizFocus', 'description', lang),
            howItsMade: translate('vizFocus', 'howItsMade', lang),
            howToRead: translate('vizFocus', 'howToRead', lang),
            copyLink: translate('vizFocus', 'copyLink', lang),
            linkCopied: translate('vizFocus', 'linkCopied', lang)
        }
    }, [lang])

    function onClickCopy(e) {
        e.stopPropagation();

        copy(permalink);

        setCopyClicked(true);
        setTimeout(() => setCopyClicked(false), 5000);
    }

    function onKeyEscape(e) {
        if (e.keyCode === 27) {
            onClickClose();
        }
    }

    useEffect(() => {
        if (inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef])

    if (isOk === false) {
        return null;
    }

    return (
        <div className={cx('VisualizationFocus', {'is-visible': isVisible})}>
            <input
                style={{ opacity: 0, zIndex: -10, 'pointerEvents': 'none' }}
                type="text"
                onKeyUp={onKeyEscape}
                ref={inputRef}
            />
            <div onClick={onClickClose} className="lightbox-background" />

            <div className="lightbox-contents-container"  onClick={onClickClose}>
                <div className="lightbox-contents">

                    <div className="visualization-details" onClick={e => e.stopPropagation()}>
                        <div className="details-header">
                            {title && <h2>{title}</h2>}
                            <button className="close-btn" onClick={onClickClose}>
                                ✕
                            </button>
                        </div>
                        <div className="copy-link-container">
                            <button onClick={onClickCopy}>{copyClicked ? messages.linkCopied : messages.copyLink}</button>
                        </div>
                        <div className="details-contents">
                            {
                                description ?
                                    <section className="details-contents-section">
                                        <h3>{messages.description}</h3>
                                        <Md>
                                            {description.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                            {
                                howItsMade ?
                                    <section className="details-contents-section">
                                        <h3>{messages.howItsMade}</h3>
                                        <Md>
                                            {howItsMade.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                            {
                                howToRead ?
                                    <section className="details-contents-section">
                                        <h3>{messages.howToRead}</h3>
                                        <Md>
                                            {howToRead.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                        </div>
                    </div>
                    <div className="visualization-wrapper">
                        <Measure
                            bounds
                            onResize={contentRect => {
                                const { width } = contentRect.bounds;
                                setDimensions({
                                    width,
                                    height: 600
                                })
                            }}
                        >
                            {
                                ({ measureRef }) => (
                                    <div ref={measureRef} onClick={e => e.stopPropagation()}>
                                        <VisualizationController
                                            {
                                            ...{
                                                vizId,
                                                dimensions,
                                                lang,
                                                datasets,
                                                atlasMode: true
                                            }
                                            }
                                        />
                                    </div>
                                )
                            }
                        </Measure>
                    </div>
                </div>
            </div>
        </div>
    )
}