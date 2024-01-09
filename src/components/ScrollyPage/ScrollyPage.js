import React, { useState, useReducer, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { useScrollYPosition } from 'react-use-scroll-position';
import ReactTooltip from 'react-tooltip';
import cx from 'classnames';
import { isEqual } from 'lodash';

import { VisualisationContext } from '../../utils/contexts';
import { fetchDataFile } from '../../utils/fetch';

import Caller from '../../components/Caller';
import Loader from '../../components/Loader';
import VisualizationContainer from '../../components/VisualizationContainer';
import VisualizationFocus from '../../components/VisualizationFocus';

import { buildPageTitle } from '../../utils/misc';
import visualizationsMetas from '../../content/viz';

const CENTER_FRACTION = 0.6;

import './ScrollyPage.scss';
import translate from '../../utils/translate';

/**
 * Import .mdx files to render text and viz (<Caller/>) on a long page to scroll
 * @param {Object} props
 * @param {Object} props.contents Multilingual
 * @param {Object} props.titles Multilingual
 * @returns {React.ReactElement}
 */

export default function ScrollyPage({
  Content,
  title: sectionTitle,
  chapter,
  ...props
}) {
  const { lang } = useParams()
    , pageRef = useRef(null)
    , scrollY = useScrollYPosition();

  const location = useLocation();

  const title = buildPageTitle(sectionTitle, lang);

  /** @type {[Object, Function]} */
  const [visualizations, setVisualizations] = useReducer(
    (state, { type, payload }) => {
      switch (type) {
        case 'SET':
          return payload;
        default:
        case 'MERGE':
          return { ...state, ...payload }
      }

    },
    {}
  )
  const [datasets, setDatasets] = useState({});
  /** @type {['process'|'failed'|'successed', Function]} */
  const [loadingState, setLoadingState] = useState('process');
  /** @type {[Boolean, Function]} */
  const [displayViz, setDisplayViz] = useState(false);
  const [currentVizId, setCurrentVizId] = useState(undefined);
  const [displayedVizId, setDisplayedVizId] = useState(undefined);
  const [displayedVizProps, setDisplayedVizProps] = useState(undefined);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [scrollYBeforeFullScreen, setScrollYBeforeFullScreen] = useState(0);
  const [activeCallerId, setActiveCallerId] = useState(undefined);
  /** initial states are used when the user click on a inblock caller to memorize the last inline caller and its props */
  const [initialCallerId, setInitialCallerId] = useState(undefined);
  const [initialVizProps, setInitialVizProps] = useState(undefined);
  /** used when user click on a inblock caller */
  const [canResetVizProps, setCanResetVizProps] = useState(false);
  /** @type {['content'|'viz', Function]} */
  const [activeSideOnResponsive, setActiveSideOnResponsive] = useState('content');

  /**
   * Register a new viz to the page list
   * @param {Object} params
   * @param {*} params.ref Caller element from React.useRef
   * @param {String} params.visualizationId Viz id
   * @param {String} params.callerId Caller id
   */
  function onRegisterVisualization(params) {
    setVisualizations({
      type: 'MERGE',
      payload: {
        [params.callerId]: { ...params }
      }
    });
  }

  /**
   * Scroll to the <Caller/> onclick event
   * The scrollTo function launch scroll useEffect
   * @param {Object} props Caller props
   * @param {*} props.ref Caller ref
   * @param {String} props.visualizationId
   * @param {String} props.callerId
   * @param {Boolean} props.canFocusOnScroll Need click to be displayed as overflow
   * @param {Object} props.callerProps Caller input props
   */
  function onClickCallerScroll({ ref, visualizationId, callerId, canFocusOnScroll, callerProps }) {
    const { y: initialVizY } = ref.current.getBoundingClientRect();
    const vizY = initialVizY + window.scrollY;
    const yFraction = window.innerHeight * CENTER_FRACTION;
    const scrollTo = vizY - yFraction * 0.9;

    if (canFocusOnScroll === false) {
      setDisplayedVizId(visualizationId);
      setActiveCallerId(callerId);
      return;
    }

    window.scrollTo({
      top: scrollTo,
      behavior: 'smooth'
    });
  }

  function onClickChangeResponsive() {
    if (activeSideOnResponsive === 'content') {
      setActiveSideOnResponsive('viz')
    }
    if (activeSideOnResponsive === 'viz') {
      setActiveSideOnResponsive('content')
    }
    setTimeout(ReactTooltip.close);
  }

  function focusFirstVizOfPage() {
    const visualizationEntries = Object.entries(visualizations);

    if (visualizationEntries[0] === undefined) {
      setDisplayViz(false);
      return;
    }
    setDisplayViz(true);

    const [firstCallerId, firstVizParms] = visualizationEntries[0];
    const { visualizationId: firstVizId } = firstVizParms;

    setDisplayedVizId(firstVizId);
    setCurrentVizId(firstVizId);
    setActiveCallerId(firstCallerId);
  }

  function resetVizProps() {
    setDisplayedVizProps(initialVizProps);
    setActiveCallerId(initialCallerId);
    setCanResetVizProps(false);
  }

  useEffect(function resetDisplayedVizPropsOnVizChange() {
    if (visualizations[activeCallerId] === undefined) { return; }
    const { props } = visualizations[activeCallerId];
    setInitialVizProps(props);
    setInitialCallerId(activeCallerId);
  }, [currentVizId, visualizations])

  useEffect(function setDisplayedVizPropsOnCallerClick() {
    if (visualizations[activeCallerId] === undefined) { return; }
    const { props } = visualizations[activeCallerId];
    setDisplayedVizProps(props);
  }, [activeCallerId, visualizations]);

  useEffect(function displayButtonToResetDisplayedVizProps() {
    setCanResetVizProps(
      isEqual(initialVizProps, displayedVizProps) === false
    )
  }, [initialVizProps, displayedVizProps]);

  /**
   * Fix for a bug in fullscreen mode (content continuing to flow on scroll
   * when reaching the bottom of the modal content)
   * @todo fix that this is ugly
   */
  useEffect(function onToggleFullScreen() {
    const root = document.getElementById('root');
    if (isFullScreen) {
      if (root) {
        root.style.overflow = 'hidden';
      }
    } else if (root) {
      root.style.overflow = 'unset';
    }
  }, [isFullScreen])

  useEffect(function navigateOnHashFromUrl() {
    if (!!location.hash === '') { return; }
    const hash = location.hash.substring(1)
    // @todo I know, it is very ugly, may be illegal, but I did not find another way
    const interval = setInterval(() => {
      const locatedTitle = document.getElementById(hash);
      if (locatedTitle !== null) {
        locatedTitle.scrollIntoView();
        clearInterval(interval);
      }
    }, 1000);
  }, [location]);

  useEffect(function cleanVisualisationsState() {
    setVisualizations({
      type: 'SET',
      payload: {}
    });
  }, [chapter, lang]);

  useEffect(function focusVizOnScroll() {
    if (Object.keys(visualizations).length === 0 || !pageRef.current || isFullScreen) {
      if (Object.keys(visualizations).length === 0 && currentVizId) {
        setCurrentVizId();
        setDisplayedVizId();
        setDisplayedVizProps();
        setActiveCallerId();
      }
      return;
    }

    const visualizationEntries = Object.entries(visualizations);

    if (scrollY === 0) {
      focusFirstVizOfPage();
      return;
    }

    const yFraction = window.innerHeight * CENTER_FRACTION;
    const yBottom = scrollY + window.innerHeight
    const yMatch = scrollY + yFraction;
    const { height: pageHeight } = pageRef.current.getBoundingClientRect();

    if (yBottom > pageHeight) {
      // to avoid hiding the footer
      setDisplayViz(false);
      return;
    }
    setDisplayViz(true);

    for (let i = visualizationEntries.length - 1; i >= 0; i--) {
      const [callerId, vizParams] = visualizationEntries[i];
      const { visualizationId, ref, canFocusOnScroll, props: vizProps } = vizParams;

      // if (displayedVizId === visualizationId) { return; }
      if (!!ref.current === false) { continue; }

      const { y: initialVizY } = ref.current.getBoundingClientRect();
      let vizY = initialVizY + window.scrollY;

      if (yMatch >= vizY && canFocusOnScroll) {
        resetVizProps();
        setDisplayedVizId(visualizationId);
        setCurrentVizId(visualizationId);
        setActiveCallerId(callerId);
        setDisplayedVizProps(vizProps);
        break;
      }
    }
  }, [visualizations, scrollY, pageRef, chapter]);

  useEffect(function getDataForChapter() {
    setLoadingState('process');
    const payload = new Map();
    let filesCsvToLoad = new Set(
      Object.values(visualizationsMetas)
        .filter(({ n_chapitre }) => n_chapitre === chapter)
        .map(({ outputs }) => outputs || [])
        .flat()
    );
    filesCsvToLoad = Array.from(filesCsvToLoad);

    Promise.all(
      filesCsvToLoad.map(fileToLoad =>
        fetchDataFile(fileToLoad).catch(error => null)
      )
    )
      .then((datasets) => {
        for (let i = 0; i < datasets.length; i++) {
          const dataset = datasets[i];
          if (dataset === null) { continue; }
          payload.set(filesCsvToLoad[i], dataset);
        }
        setDatasets(payload);
        setLoadingState('successed');
      })
      .catch((error) => {
        setLoadingState('failed');
        console.error(error);
      })
  }, [chapter]);

  useEffect(function onFullScreenChange() {
    if (!isFullScreen) {
      window.scrollTo({
        top: scrollYBeforeFullScreen
      })
    }
  }, [isFullScreen]);

  if (loadingState === 'process' || !datasets) {
    return <Loader message='En cours de chargement' />
  }
  // if (loadingState === 'failed') {
  //     return <Loader message='Échec du chargement' />
  // }
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <div className={cx('ScrollyPage', { 'has-fullscreen': isFullScreen })}>
        <ReactTooltip id="contents-tooltip" />
        <section className={cx("Contents", { 'is-focused': activeSideOnResponsive === 'content' })} ref={pageRef}>
          <button
            className={cx('switch-btn', {'is-active': activeSideOnResponsive === 'viz'})}
            onClick={onClickChangeResponsive}
            data-for="contents-tooltip"
            data-effect="solid"
            data-place={activeSideOnResponsive === 'viz' ? 'right' : 'left'}
            data-tip={activeSideOnResponsive === 'viz' ? translate('vizContainer', 'switchToText', lang) : translate('vizContainer', 'switchToViz', lang)}
          >➡</button>
          <VisualisationContext.Provider value={{
            onRegisterVisualization,
            onClickCallerScroll,
            activeCallerId
          }}>
            <h1>{sectionTitle}</h1>
            <Content components={{ Caller, Link }} />
          </VisualisationContext.Provider>
        </section>
        <aside className={cx({ 'is-focused': activeSideOnResponsive === 'viz' })}>
          {
            displayViz &&
            <VisualizationContainer
              callerProps={displayedVizProps}
              {...{
                displayedVizId,
                datasets,
                canResetVizProps,
                onClickToggleFullScreen: () => {
                  setIsFullScreen(!isFullScreen);
                  setScrollYBeforeFullScreen(scrollY);
                  ReactTooltip.hide();
                },
                resetVizProps
              }}
            />
          }
        </aside>
        {isFullScreen && <VisualizationFocus
          vizId={displayedVizId}
          datasets={datasets}
          onClickClose={() => setIsFullScreen(false)}
          callerProps={displayedVizProps}
        />}


      </div>
    </>
  );
}