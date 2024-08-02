import { useParams, Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { useEffect, useState, useReducer, useRef } from 'react';
import ReactTooltip from 'react-tooltip';

import visualizationsMetas from '../../content/viz';
// import Caller from '../../components/Caller';
import { buildPageTitle } from '../../utils/misc';
import { VisualisationContext } from '../../utils/contexts';
import { fetchDataFile } from '../../utils/fetch';
// import VisualizationContainer from '../../components/VisualizationContainer';

import './PlainPage.scss';
import VisualizationController from '../../visualizations';
import Measure from 'react-measure';

const PlainPageVisualization = ({ id, lang }) => {
  const [dimensions, setDimensions] = useState({
    width: 100,
    height: 100,
  });
  const ref = useRef(null);
  return (
    <Measure
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
        <div className="PlainPageVisualization" ref={measureRef}>
        <ReactTooltip id="contents-tooltip" />
          <VisualizationController
            {
            ...{
              vizId: id,
              datasets: new Set(),
              ref,
              dimensions,
              lang,
              callerProps: {},
              atlasMode: false,
            }
            }
          />
        </div>
      )}
    </Measure>
  )
}


export default function PlainPage({
  Content,
  title: sectionTitle,
  chapter
}) {
  const { lang } = useParams();
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
  );
  const [datasets, setDatasets] = useState({});
  /** @type {['process'|'failed'|'successed', Function]} */
  const [loadingState, setLoadingState] = useState('process');

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

  return (
    <div className="PlainPage secondary-page">
      <Helmet>
        <title>{buildPageTitle(sectionTitle, lang)}</title>
      </Helmet>

      <div className='centered-contents'>
        <VisualisationContext.Provider value={{
          onRegisterVisualization,
          onClickCallerScroll: () => { },
          activeCallerId: undefined,
        }}>
          <h1>{sectionTitle}</h1>
          <Content components={{ Caller: ({id}) => <PlainPageVisualization {...{id, lang}} />, Link }} />
        </VisualisationContext.Provider>
        {/* <Content components={{ Caller, Link }} /> */}
      </div>
    </div>
  )
}
// import { useParams } from 'react-router-dom';
// import { Helmet } from "react-helmet";

// import { buildPageTitle } from '../../utils/misc';

// import './PlainPage.scss';

// export default function PlainPage ({
//     Content,
//     title: sectionTitle
// }) {
//     const { lang } = useParams();

//     return (
//         <div className="PlainPage secondary-page">
//             <Helmet>
//                 <title>{buildPageTitle(sectionTitle, lang)}</title>
//             </Helmet>

//             <div className='centered-contents'>
//                 <h1>{sectionTitle}</h1>
//                 <Content />
//             </div>
//         </div>
//     )
// }