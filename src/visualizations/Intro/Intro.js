import { useEffect, useState, useMemo } from 'react';
import GeographicMapChart from '../../components/GeographicMapChart'
import { extent, min, max } from "d3-array";
import { scaleLinear } from "d3-scale";

import './Intro.scss';
import PartnersObjects from './PartnersObjects';
import Legend from './Legend';
import SliderRange from '../../components/SliderRange/SliderRange';
import ReactTooltip from 'react-tooltip';

const Intro = ({
  data,
  width,
  height,
  atlasMode,
  callerProps = {}
}) => {
  const {
    mode = 'navigo_france',
    top_ports: initialTopPorts = '10',
    // mode = 'toflit18_france',
    // mode = 'toflit18_world'
  } = callerProps;
  const [initialDataType, initialDataScope] = mode.split('_');
  const [dataType, setDataType] = useState(initialDataType);
  const [dataScope, setDataScope] = useState(initialDataScope);
  const [topPortsNumber, setTopPortsNumber] = useState(+initialTopPorts);

  useEffect(() => {
    setTopPortsNumber(initialTopPorts)
  }, [initialTopPorts])

  useEffect(() => {
    setDataType(initialDataType);
    setDataScope(initialDataScope);
  }, [initialDataType, initialDataScope]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [dataType, dataScope])

  let title = '';
  if (dataType === 'navigo') {
    if (dataScope === 'world') {
      title = 'Pays étrangers de départ des navires à destination de Marseille en 1789';
    } else {
      title = 'Sorties des 10 plus grands ports de France en 1787';
    }
  } else {
    if (dataScope === 'world') {
      title = 'Partenaires de commerce de Marseille en 1789';
    } else {
      title = 'Commerce des directions des fermes de France en 1789';
    }
  }

  const usableData = data.get('intro_data_world.csv');

  const visibleData = useMemo(() => {
    if (dataType === 'toflit18') {
      if (dataScope === 'world') {
        return usableData.filter(datum => +datum.toflit_value > 0 && datum.scope === 'world' && datum.partner !== 'Inconnu')
      } else {
        return usableData.filter(datum => +datum.toflit_value > 0 && datum.scope === 'france')
      }
    } else {
      if (dataScope === 'world') {
        return usableData.filter(datum => +datum.navigo_nb_ships > 0 && datum.scope === 'world' && datum.partner !== 'Inconnu')
      } else {
        return usableData
          .filter(datum => +datum.navigo_nb_ships > 0 && datum.scope === 'france')
          .sort((a, b) => {
            if (+a.navigo_nb_ships > +b.navigo_nb_ships) {
              return -1;
            }
            return 1;
          })
          .slice(0, topPortsNumber)
      }
    }
  }, [data, mode, dataType, dataScope, topPortsNumber]);

  const maxTriangleWidth = width * 0.05;
  const minTriangleWidth = 5;
  const minTriangleHeight = 5;
  const maxTriangleHeight = height * 0.05;
  const arrowSide = 5;

  const toflitAreaScale = useMemo(() => {
    const maxRadius = height * 0.03;
    const maxArea = Math.PI * maxRadius * maxRadius;
    return scaleLinear()
      .domain([0, max(visibleData.map(d => +d.toflit_value))])
      .range([1, maxArea])
  }, [visibleData, width, height]);

  const navigoWidthScale = useMemo(() => {
    return scaleLinear()
      .domain([0, max(visibleData.map(d => +d.navigo_nb_ships))])
      // .domain(extent(visibleData.map(d => +d.navigo_nb_ships)))
      .range([minTriangleWidth, maxTriangleWidth])
  }, [visibleData, width, height]);
  const navigoHeightScale = useMemo(() => {
    return scaleLinear()
      .domain([0, max(visibleData.map(d => +d.navigo_mean_tonnage))])
      // .domain(extent(visibleData.map(d => +d.navigo_mean_tonnage)))
      .range([minTriangleHeight, maxTriangleHeight])
  }, [visibleData, width, height]);

  // console.log(navigoWidthScale.domain(), navigoWidthScale(500))

  const arrowsMargin = width * height * 0.00005;

  const legendWidth = max([width * .2, 200]);

  let legendPosition = 'top right';
  if (!atlasMode) {
    if (dataScope === 'world') {
      if (dataType === 'navigo') {
        legendPosition = 'bottom right';
      } else {
        legendPosition = 'deep-bottom right';
      }
    } else {
      if (dataType === 'toflit18') {
        legendPosition = 'middle right';
      } else {
        legendPosition = 'top right';
      }
    }
  }


  return (
    <>
      <GeographicMapChart
        {...{
          width,
          height,
          title,
          projectionTemplate: dataScope === 'world' ? 'Europe and North Africa centered on Marseille' : 'France',
          className: `Intro ${atlasMode ? 'is-atlas-mode' : ''}`,
          layers: [
            {
              type: 'choropleth',
              data: data.get('map_backgrounds/intro_map.geojson')
            },
            {
              type: 'custom',
              data: visibleData,
              renderObjects: (props) =>
                <PartnersObjects
                  {...props}
                  {
                  ...{
                    maxTriangleWidth,
                    minTriangleWidth,
                    topPortsNumber,
                    dataType,
                    dataScope,

                    arrowSide,
                    navigoWidthScale,
                    navigoHeightScale,
                    arrowsMargin,
                    toflitAreaScale,
                  }
                  }
                />
            },

          ]
        }}
      />
      <ul className={`intro-ui-container ${atlasMode ? 'is-atlas-mode' : ''} ${legendPosition}`}>
        <h3>
          Légende
        </h3>
        <li>
          <Legend
            {
            ...{
              width: legendWidth,
              dataType,
              dataScope,
              navigoWidthScale,
              navigoHeightScale,
              arrowsMargin,
              toflitAreaScale,
              data: usableData,
              arrowSide,
            }
            }
          />
        </li>
        {
          atlasMode ?
            <>
              <li>
                <h4>Échelle</h4>
                <ul>
                  <li>
                    <button
                      className={dataScope === 'france' ? 'is-active' : ''}
                      onClick={() => setDataScope('france')}
                    >France</button>
                  </li>
                  <li>
                    <button
                      className={dataScope === 'world' ? 'is-active' : ''}
                      onClick={() => setDataScope('world')}
                    >Monde</button>
                  </li>
                </ul>
              </li>
              <li>
                <h4>Sources</h4>
                <ul>
                  <li>
                    <button
                      className={dataType === 'navigo' ? 'is-active' : ''}
                      onClick={() => setDataType('navigo')}
                    >Navigation</button>
                  </li>
                  <li>
                    <button
                      className={dataType === 'toflit18' ? 'is-active' : ''}
                      onClick={() => setDataType('toflit18')}
                    >Commerce</button>
                  </li>
                </ul>
              </li>
            </>
            : null
        }

        <li
          style={{
            maxHeight: atlasMode && dataType === 'navigo' && dataScope === 'france' ? '10rem' : 0,
            overflow: 'hidden',
            transition: '.5s ease all'
          }}
        >
          <SliderRange
            {
            ...{
              title: `Afficher les ${topPortsNumber} plus grands ports`,
              min: 1,
              max: data.get('intro_data_world.csv')
                .filter(datum => +datum.navigo_nb_ships > 0 && datum.scope === 'france').length,
              value: [0, topPortsNumber],
              onChange: ([_min, max]) => setTopPortsNumber(max),
              style: {
                margin: 0,
                width: legendWidth
              }
            }
            }

          />
        </li>

      </ul>

    </>

  )
}

export default Intro;