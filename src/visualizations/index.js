import React, { useMemo } from 'react';

import visualizationsMetas from '../content/viz';

import Intro from './Intro/Intro';

const visualizations = {
  'intro': Intro
}

/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {Object} props
 * @param {String} props.vizId
 * @param {Map} props.datasets
 * @param {React.Ref} props.ref
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {'fr'|'en'} props.lang
 * @param {Object} [props.callerProps={}]
 * @returns {React.ReactElement} - React component
 */
export default function VisualizationController({
  vizId,
  datasets,
  ref,
  dimensions,
  lang,
  callerProps = undefined,
  atlasMode,
  ...props
}) {
  const { width, height } = dimensions;

  const data = useMemo(function getVizDataFromId() {
    const { outputs: vizDataFiles = [] } = visualizationsMetas[vizId] || {};
    if (vizDataFiles.every(dataFile => datasets.has(dataFile)) === false) {
      return undefined;
    }
    if (vizDataFiles.length === 1) {
      return datasets.get(vizDataFiles[0]);
    }
    return datasets;
  }, [vizId, datasets]);

  const vizContent = useMemo(() => {
    if (data === undefined) {
      return <>Les données de cette visualisation n'ont pu être chargées.</>;
    }
    if (!vizId) {
      return null;
    }

    if (vizId in visualizations) {
      const VizComponent = visualizations[vizId]
      return (
        <VizComponent
          {...{
            data,
            width,
            height,
            atlasMode,
            callerProps
          }
          }
        />
      )
      // return visualizations[vizId]({
      //   data,
      //   width,
      //   height,
      //   atlasMode,
      //   callerProps
      // })
    } else {
      return (
        <img
          src={`${process.env.BASE_PATH}/assets/drafts/${vizId}.jpg`}
          {...{ width, height }}
          style={{ objectFit: 'contain' }}
        />
      )
    }
  }, [vizId, callerProps, dimensions, lang, data])

  return (
    <div style={{ height }} onClick={e => e.stopPropagation()} className='VisualizationController viz-render' ref={ref}>
      {vizContent}
    </div>
  )
}