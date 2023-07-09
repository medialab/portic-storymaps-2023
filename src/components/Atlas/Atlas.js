import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import cx from 'classnames';

import visualizationsMetas from '../../content/viz';
import Loader from '../Loader';
import VisualizationFocus from '../VisualizationFocus';

import translate from '../../utils/translate';
import { buildPageTitle } from '../../utils/misc';
import { fetchDataFile } from '../../utils/fetch';

import './Atlas.scss';


export default function Atlas({
  ...props
}) {
  const { vizId, lang } = useParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState(null);

  /** @type {['process'|'failed'|'successed'|'none', Function]} */
  const [loadingState, setLoadingState] = useState('none');

  /**
   * Launch focus on a viz
   * @param {String} vizId 
   */
  function onClickFocus(vizId) {
    navigate(`/${lang}/atlas/${vizId}`);
  }

  // triggers when a visualization is selected
  useEffect(() => {
    if (vizId === undefined || visualizationsMetas[vizId] === undefined) {
      setLoadingState('none');
      return;
    }

    setLoadingState('process');
    const { outputs = [], ...metas } = visualizationsMetas[vizId];

    const payload = new Map();

    Promise.all(
      outputs.map(fileToLoad =>
        fetchDataFile(fileToLoad).catch(error => null)
      )
    )
      .then((loadedDatasets) => {
        for (let i = 0; i < loadedDatasets.length; i++) {
          const dataset = loadedDatasets[i];
          if (dataset === null) { continue; }
          payload.set(outputs[i], dataset);
        }
        setDatasets(payload);
        
        setLoadingState('successed');
      })
      .catch((error) => {
        setLoadingState('failed');
        console.log(error);
      })
  }, [vizId])

  // scroll top when arriving on the view
  useEffect(() => window.scrollTo({ top: 0 }), []);

  return (
    <div className='Atlas secondary-page'>
      <Helmet>
        <title>{buildPageTitle('Atlas', lang)}</title>
      </Helmet>
      <div className="centered-contents">
        <h1 className='title'>{translate('atlas', 'title', lang)}</h1>
        <ul className='visualizations-list'>
          {
            Object.values(visualizationsMetas)
            .filter(meta => meta.cacher_atlas !== 'oui')
            .map((metas, i) => {
              const title = metas['titre_' + lang] || false;

              const { id, output } = metas;

              return (
                <li
                  className='visualization-item'
                  onClick={() => onClickFocus(id, output)}
                  key={id}
                >
                  <figure className="thumbnail-container">
                    <img
                      className='thumbnail'
                      // @todo reset for real visualizations
                      // src={`${process.env.BASE_PATH}/thumbnails/${lang}/${id}.png`}
                      src={`${process.env.BASE_PATH}/thumbnails/${lang}/${id}.png`}
                    />
                    <figcaption className='visualization-title'>{title}</figcaption>
                  </figure>
                </li>
              )
            })
          }
        </ul>
      </div>
      {
        (vizId && loadingState === "successed") ?
          <VisualizationFocus
            vizId={vizId}
            datasets={datasets}
            isVisible={vizId !== undefined}
            onClickClose={(e) => navigate(`/${lang}/atlas`)}
          />
          : null
      }
      <Loader isLoading={vizId && loadingState !== 'successed'} message='En cours de chargement' />
    </div>
  )
}