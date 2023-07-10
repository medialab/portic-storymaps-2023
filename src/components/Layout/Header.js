import React, { useState, useMemo } from 'react';
import { NavLink as Link } from "react-router-dom";
import { useScrollYPosition } from 'react-use-scroll-position';
import { scaleLinear } from 'd3-scale';
import cx from 'classnames';

import routes from '../../content/summary';
import colorsPalettes from '../../utils/colorPalettes';
import LangSwitcher from './LangSwitcher';
import translate from '../../utils/translate';


const MAX_DISPLAYED_TITLE_LENGTH = 45;
/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {String[]} props.langagesFlag
 * @param {Function} props.onLangChange
 * @param {String[]} props.lang
 * @param {String[]} props.pageType
 * @returns {React.ReactElement}
 */

export default function Header({
    langagesFlag,
    onLangChange,
    lang,
    pageType
}) {
    const {
        ui: {
            colorText,
            colorAccentBackground,
            colorBackgroundBlue,
            colorBackground
        }
    } = colorsPalettes;

    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    const title = translate('site', 'title', lang);
    const scrollY = useScrollYPosition()
    const pageColorScale = scaleLinear().range([colorBackgroundBlue, colorBackground]).domain([0, 1]);
    const { fontColor, backgroundColor } = useMemo(() => {
        const screenHeight = window.innerHeight;

        switch (pageType) {
            case 'intro':
            case 'chapter':
                if (scrollY < screenHeight) {
                    return {
                        fontColor: colorText,
                        backgroundColor: pageColorScale((scrollY / (screenHeight / 2))),
                    }
                } else {
                    return {
                        backgroundColor: colorBackground
                    }
                }

            case 'home':
                if (scrollY < screenHeight * .8) {
                    return {
                        fontColor: colorText,
                        backgroundColor: 'transparent' // colorBackgroundBlue,
                    }
                } else {
                    return {
                        fontColor: 'white',
                        backgroundColor: colorAccentBackground
                    }
                }

            case 'other-page':
            default:
                return {
                    fontColor: undefined,
                    backgroundColor: colorBackground
                }
        }
    }, [scrollY, pageColorScale, pageType]);

    function onClickOpen() {
        setIsOpen(!isOpen);
    }

    return (
        <header>
            <nav
                style={{
                    background: backgroundColor,
                    color: fontColor
                }}
                className="nav nav-large"
            >
                <ul className="primary-nav-container">
                    <li className="navitem-container">
                        <Link to='/'>
                            {
                                fontColor === 'white' ?
                                    <img src={`${process.env.BASE_PATH}/assets/rose_des_vents_white.svg`} alt="logo" />
                                    :
                                    <img src={`${process.env.BASE_PATH}/assets/rose_des_vents.svg`} alt="logo" />
                            }
                        </Link>
                    </li>
                    {
                        routes
                            .filter(({ navGroup = 'primary', hide }) => navGroup === 'primary' && !hide)
                            .map(({ routes, titles }, index) => {
                                const pagePath = routes[lang];
                                const title = titles[lang];
                                let displayedTitle = title.replace(/^(\d\. ?)/g, '').replace(' ?', '\u00A0?');
                                if (displayedTitle.length > MAX_DISPLAYED_TITLE_LENGTH) {
                                  displayedTitle = displayedTitle.substr(0, MAX_DISPLAYED_TITLE_LENGTH) + '...';
                                }
                                return (
                                    <li key={index} className="navitem-container">
                                        <Link to={`/${lang}/${pagePath}`}>
                                            {displayedTitle}
                                        </Link>
                                    </li>
                                )
                            })
                    }
                </ul>
                <ul className="secondary-nav-container">
                    
                    {
                        routes
                            .filter(({ navGroup = 'primary', hide }) => navGroup === 'secondary' && !hide)
                            .map(({ titles, routes: inputRoute }, index) => {
                                const route = `/${lang}/${inputRoute[lang]}`
                                return (
                                    <li key={index} className="navitem-container">
                                        <Link to={route}>
                                            {titles[lang]}
                                        </Link>
                                    </li>
                                )
                            })
                    }
                    <li className="navitem-container">
                        <Link to={`/${lang}/atlas`}>
                            {translate('menu', 'atlas', lang)}
                        </Link>
                    </li>

                    <li className="navitem-container lang-toggle">
                        <LangSwitcher {...{ onLangChange, langagesFlag, lang }} />
                    </li>
                </ul>
            </nav>
            <nav
                className={cx("nav nav-drawer", { 'is-open': drawerIsOpen })}
            >
                <div className="drawer-background" onClick={() => setDrawerIsOpen(!drawerIsOpen)} />
                <div className="drawer-body">
                    <ul className="primary-nav-container">
                        <li onClick={() => setDrawerIsOpen(false)} className="navitem-container">
                            <Link to='/'>
                                {translate('menu', 'home', lang)}
                            </Link>
                        </li>
                        {
                            routes
                                .filter(({ navGroup = 'primary', hide }) => navGroup === 'primary' && !hide)
                                .map(({ routes, titles }, index) => {
                                    const pagePath = routes[lang];
                                    const title = titles[lang];
                                    return (
                                        <li onClick={() => setDrawerIsOpen(false)} key={index} className="navitem-container">
                                            <Link to={`/${lang}/${pagePath}`}>
                                                {title}
                                            </Link>
                                        </li>
                                    )
                                })
                        }
                    </ul>
                    <ul className="secondary-nav-container">
                        {
                            routes
                                .filter(({ navGroup = 'primary', hide }) => navGroup === 'secondary' && !hide)
                                .map(({ titles, routes: inputRoute }, index) => {
                                    const route = `/${lang}/${inputRoute[lang]}`
                                    return (
                                        <li onClick={() => setDrawerIsOpen(false)} key={index} className="navitem-container">
                                            <Link to={route}>
                                                {titles[lang]}
                                            </Link>
                                        </li>
                                    )
                                })
                        }
                        <li onClick={() => setDrawerIsOpen(false)} className="navitem-container">
                            <Link to={`/${lang}/atlas`}>
                                {translate('menu', 'atlas', lang)}
                            </Link>
                        </li>

                        <li className="navitem-container lang-toggle">
                            <LangSwitcher {...{ onLangChange, langagesFlag, lang }} />
                        </li>
                    </ul>
                </div>
                <div className="drawer-header">
                    <button onClick={() => setDrawerIsOpen(!drawerIsOpen)} className={cx('drawer-button')}>
                        {
                            fontColor === 'white' || drawerIsOpen ?
                                <img style={{ background: drawerIsOpen ? undefined : backgroundColor }} src={`${process.env.BASE_PATH}/assets/rose_des_vents_white.svg`} alt="logo" />
                                :
                                <img style={{ background: drawerIsOpen ? undefined : backgroundColor }} src={`${process.env.BASE_PATH}/assets/rose_des_vents.svg`} alt="logo" />
                        }
                    </button>
                    <Link to='/'>
                        <h1 style={{
                            color: drawerIsOpen ? undefined : fontColor,
                            background: drawerIsOpen ? undefined : backgroundColor,
                        }} dangerouslySetInnerHTML={{ __html: title }} />
                    </Link>
                </div>
            </nav>
        </header>
    )
}