
import React, { useRef, useState, useReducer, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';
import { useScrollYPosition } from 'react-use-scroll-position';

/* eslint-disable import/no-webpack-loader-syntax */

import ContentsFr from '../../content/fr/part-0.mdx';
import ContentsEn from '../../content/en/part-0.mdx';
import visualizationsMetas from '../../content/viz';

// import CitationWidget from '../CitationWidget';
import VisualizationContainer from '../VisualizationContainer';
// import { VisualizationControlContext } from '../../utils/contexts';
import { VisualisationContext } from '../../utils/contexts';
import translate from '../../utils/translate';
import { fetchDataFile } from '../../utils/fetch';


import summary from '../../content/summary';
import metadata from '../../content/metadata.json';

import BoatsContainer from './BoatsContainer';
import HomeSummary from './HomeSummary';
import Caller from '../../components/Caller';

import './Home.scss';

const CENTER_FRACTION = 0.5;
// const CENTER_FRACTION = .6;

function Home({
  ...props
}) {
  const { lang } = useParams();

  // function Home({ match: {
  //   params: { lang = 'fr' }
  // } }) {
  const introRef = useRef(null);
  const [focusOnViz, setFocusOnViz] = useState(false);
  const [inVis, setInVis] = useState(false);
  const title = useMemo(() => metadata[lang].title, [lang])
  // const titleHTML = title;
  const titleHTML = translate('site', 'titleHTML', lang);
  // const titleHTML = translate('site', 'titleHTML', lang);
  const subtitle = translate('site', 'subtitle', lang);
  const [activeCallerId, setActiveCallerId] = useState(undefined);
  const [activeVisualization, setActiveVisualization] = useState(undefined);
  const [loadingState, setLoadingState] = useState('process');
  const [datasets, setDatasets] = useState({});
  const [visualizations, setVisualizations] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {}
  )
  const scrollY = useScrollYPosition();
  const updateCurrentVisualization = () => {
    // const bodyPos = document.body.getBoundingClientRect();
    const DISPLACE_Y = window.innerHeight * CENTER_FRACTION;
    const visualizationEntries = Object.entries(visualizations);
    let found;
    let newActiveVisualization;
    // on parcourt la liste à l'envers pour récupérer
    // la visualisation la plus haute de la page qui est
    // au-dessus du milieu de l'écran
    let firstOneY = Infinity;
    if (introRef.current && introRef.current) {
      const top = introRef.current.offsetTop;
      const contentsHeight = introRef.current.querySelector('.Contents').getBoundingClientRect().height;
      const endOfIntro = top + contentsHeight - DISPLACE_Y / 2;
      const pos = scrollY + DISPLACE_Y;
      if (pos > endOfIntro) {
        if (inVis) {
          setInVis(false);
        }
        if (activeVisualization) {
          setActiveVisualization();
          setActiveCallerId();
        }
        return;
      }
    }
    for (let index = visualizationEntries.length - 1; index >= 0; index--) {
      const y = index === 0 ? scrollY + window.innerHeight * .2 : scrollY + DISPLACE_Y;
      const [_id, visualization] = visualizationEntries[index];/* eslint no-unused-vars : 0 */
      const { ref } = visualization;
      if (ref.current) {
        const { y: initialVisY } = ref.current.getBoundingClientRect();
        let visY = initialVisY + window.scrollY;
        // @todo refactor this, it is dirty
        // if (ref.current.parentNode.className === 'centered-part-contents') {
        //   visY += ref.current.parentNode.parentNode.getBoundingClientRect().y;
        // }
        if (visY < firstOneY) {
          firstOneY = visY;
        }
        if (index === 0 && y < visY) {
          found = true;
          newActiveVisualization = visualization;
        } /*else if (!visualization.visualizationId && scrollY + window.innerHeight * .8 > visY) {
          found = true;
          newActiveVisualization = undefined;
          break;
        }*/ else if (y > visY) {
          found = true;
          if (visualization.visualizationId) {
            newActiveVisualization = visualization;
          } else {
            newActiveVisualization = undefined;
          }
          break;
        }
      } else {
        // console.error('cant find ref for', visualizationEntries[index])
      }
    }

    if (scrollY > window.innerHeight * .9 && !inVis) {
      setInVis(true);
    } else if (scrollY < window.innerHeight * .9 && inVis) {
      setInVis(false);
    }

    if (!found && scrollY < firstOneY && visualizationEntries.length) {
      newActiveVisualization = visualizationEntries[0][1]
    }
    if (!found && activeVisualization) {
      newActiveVisualization = undefined;
    }
    if (activeVisualization !== !newActiveVisualization) {
      setActiveVisualization(newActiveVisualization);
      if (newActiveVisualization) {
        setActiveCallerId(newActiveVisualization.callerId);
      }
    } else if (
      (!activeVisualization && newActiveVisualization) 
      || activeVisualization.visualizationId !== newActiveVisualization.visualizationId
    ) {
      setActiveVisualization(newActiveVisualization);
      setActiveCallerId(newActiveVisualization.callerId);
    }
  }

  useEffect(function getDataForChapter() {
    setLoadingState('process');
    const payload = new Map();
    let filesCsvToLoad = new Set(
      Object.values(visualizationsMetas)
      // filter for intro
        .filter(({ n_chapitre }) => n_chapitre === 0 || !n_chapitre)
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
        setLoadingState('success');
      })
      .catch((error) => {
        setLoadingState('failed');
        console.error(error);
      })
  }, []);

  /**
   * Hour of time management
   */
  const [hourOfTime, setHourOfTime] = useState(Math.round(Math.random() * 23));
  const hourDuration = 1000 * 2;
  useEffect(() => {
    setTimeout(() => {
      const nextHour = hourOfTime >= 23 ? 0 : hourOfTime + 1;
      setHourOfTime(nextHour);
    }, hourDuration)
  }, [hourOfTime]);

  /**
   * Scroll to top on mount
   */
   useEffect(() => {
    window.scrollTo(0, 0);
  }, [])
  /**
   * Scrollytelling management
   */
  useEffect(updateCurrentVisualization, [scrollY, visualizations]) /* eslint react-hooks/exhaustive-deps : 0 */

  useEffect(() => {
    if (!activeVisualization && focusOnViz) {
      setFocusOnViz(false);
    }
  }, [activeVisualization])

  const onRegisterVisualization = (params) => {
    setVisualizations({
      ...visualizations,
        [params.callerId]: { ...params }
    });
  }
  const onClickOnStart = () => {
    if (introRef && introRef.current) {
      const intro = introRef.current;
      const top = intro.offsetTop - (window.innerHeight / 20);
      window.scrollTo({
        top,
        behavior: 'smooth'
      })
    }
    
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
  return (
    <div className="Home">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="header">
        <div className={`titles-container ${(hourOfTime >= 20 || hourOfTime <= 6) ? 'is-night-mode' : ''}`}>
          <h1 dangerouslySetInnerHTML={{__html: titleHTML}}/>
          <h2>{subtitle}</h2>
          {/* <CitationWidget
            lang={lang}
          /> */}
          <button onClick={onClickOnStart} className={`go-to-start ${(hourOfTime >= 20 || hourOfTime <= 6) ? 'is-night-mode' : ''}`}>
            <span>⌄</span>
          </button>
        </div>
        
        <BoatsContainer hourOfTime={hourOfTime} hourDuration={hourDuration} />
      </div>
      <main ref={introRef} className="intro-container">
        {/* <VisualizationControlContext.Provider
          value={{
            activeVisualization,
            onBlockClick,
            onRegisterVisualization,
            onUnregisterVisualization,
          }}
        > */}
        <VisualisationContext.Provider value={{
          onRegisterVisualization,
          onClickCallerScroll,
          activeCallerId
        }}>

          <div className="Contents">
            
            <section className={cx({'is-focused': !focusOnViz})}>
              {lang === 'fr' ? <ContentsFr  components={{ Caller, Link }} /> : <ContentsEn  components={{ Caller, Link }} />}
            </section>
            <aside className={cx({'is-focused': focusOnViz, 'is-fixed': inVis})}>
              {
                loadingState === 'success' ?
                <VisualizationContainer 
                  lang={lang} 
                  activeVisualization={activeVisualization} 
                  callerProps={activeVisualization && activeVisualization.props}
                  introMode
                  {...{
                    displayedVizId: activeVisualization && activeVisualization.visualizationId,
                    datasets,
                    // canResetVizProps,
                    // onClickToggleFullScreen: () => {
                    //   setIsFullScreen(!isFullScreen);
                    //   setScrollYBeforeFullScreen(scrollY);
                    //   ReactTooltip.hide();
                    // },
                    // resetVizProps
                  }}
                />
                :
                <div>Chargement</div>
              }
              
            </aside>
            
          </div>
        {/* </VisualizationControlContext.Provider> */}
        </VisualisationContext.Provider>

        <HomeSummary lang={lang} summary={summary} />
        <div className={cx("vis-focus-container", {
          'is-active': focusOnViz,
          'is-visible': activeVisualization
          })}>
          <button data-for="contents-tooltip" data-effect="solid" data-tip={lang === 'fr' ? 'voir la visualisation associée' : 'see associated visualization'} onClick={() => setFocusOnViz(!focusOnViz)}>
            <span>{'˃'}</span>
          </button>
        </div>
      </main>
      <ReactTooltip id="contents-tooltip" />
    </div>
  )
}

export default Home;