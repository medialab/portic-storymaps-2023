import { groupBy, range } from "lodash";
import React, { useEffect, useMemo, useState } from "react"

import './GuerreEtCroissance.scss';
import { scaleLinear } from "d3-scale";
import { extent, max } from "d3-array";
import { formatNumber } from "../../utils/misc";
import ReactTooltip from "react-tooltip";
import translate from "../../utils/translate";
import LineSeries from "./LineSeries";
import Legend from "./Legend";

const MIN_YEAR = 1720;
const MAX_YEAR = 1790;

export default function GuerreEtCroissance({
  width,
  height,
  data: inputData,
  callerProps = {},
  lang,
  atlasMode,
}) {
  const {
    series,
    directions,
    'navigation-metric': navigation_metric // ['tonnage', 'travels', 'mileage']
  } = callerProps;

  const defaultSeries = [
    'total',
    'imports',
    'exports',
    'total_no_colonial_trade',
    'imports_no_colonial_trade',
    'exports_no_colonial_trade',
    'navigation',

    // 'imports_no_colonial_product',
    // 'exports_no_colonial_product',
    // 'total_no_colonial_product',
  ];
  const defaultDirections = [
    'Marseille',
    'Bordeaux',
    'Rouen',
    'Nantes',
    'La Rochelle',
    'Bayonne'
  ];
  const defaultNavigationMetric = 'carrière';

  const [visibleSeries, setVisibleSeries] = useState(series ? series.split(',').map(s => s.trim()) : defaultSeries);
  const [visibleDirections, setVisibleDirections] = useState(directions ? directions.split(',').map(d => d.trim()) : defaultDirections);
  const [navigationMetric, setNavigationMetric] = useState(navigation_metric || defaultNavigationMetric);
  const [activeYear, setActiveYear] = useState();
  const [controlsVisible, setControlsVisible] = useState();

  useEffect(() => setVisibleSeries(series ? series.split(',').map(s => s.trim()) : defaultSeries), [series]);
  useEffect(() => setVisibleDirections(directions ? directions.split(',').map(d => d.trim()) : defaultDirections), [directions]);
  useEffect(() => setNavigationMetric(navigation_metric || defaultNavigationMetric), [navigation_metric]);
  


  // const data = useMemo(() => {
  const cleanData = (inputData.get('impact-guerre-sur-croissance.csv') || []).map(datum => ({
    ...datum,
    ...['year', 'value', 'reg_point', 'peace_reg_memory', 'peace_reg', 'column_order',]
      .reduce((res, key) => ({ ...res, [key]: +datum[key] }), {})
  }))
    .sort((a, b) => {
      if (a.year > b.year) {
        return 1;
      }
      return -1;
    })
  const groups = groupBy(cleanData, d => d.kind || d.data_type)
  const data = groups;
  //   return groups;
  // }, [inputData]);


  let legendWidth = 200;
  legendWidth = width < 400 ? width / 3 : legendWidth;
  const matrixWidth = width - legendWidth;

  const gutter = 10;
  const sideWidth = matrixWidth / 5 < 100 ? 100 : matrixWidth / 5;
  const topLabelsHeight = gutter * 3;
  const bottomAxisHeight = gutter * 3;
  const rowHeight = (height - topLabelsHeight - bottomAxisHeight) / visibleSeries.length;
  const cellWidth = (matrixWidth - gutter * 6) / (visibleDirections.length ? visibleDirections.length + 1 : 2);
  // const cellWidth = (matrixWidth - sideWidth - gutter * 5) / (visibleDirections.length < 3 ? 3 : visibleDirections.length);

  const xScale = scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, cellWidth - gutter * 3]);
  const navigationSources = [
    {
      id: 'carrière',
      source: 'Carriere',
      label: translate('GuerreEtCroissance', 'navigation-interface-carriere', lang),
      tickFormat: d => formatNumber(d, lang) + ' u.',
      unit: 'u.',
    },
    {
      id: 'entrées',
      source: 'Navigo entrées',
      label: translate('GuerreEtCroissance', 'navigation-interface-arrivals', lang),
      tickFormat: d => formatNumber(d, lang) + ' u.',
      unit: 'u.',
    },
    {
      id: 'tonnage',
      source: 'Navigo tonnage',
      label: translate('GuerreEtCroissance', 'navigation-interface-tonnage', lang),
      tickFormat: d => formatNumber(d, lang) + ' tx.',
      unit: 'tx.',
    },
    {
      id: 'mileage',
      source: 'Navigo mileage_total',
      label: translate('GuerreEtCroissance', 'navigation-interface-distance', lang),
      tickFormat: d => formatNumber(d, lang) + ' m.',
      unit: 'm.',
    },
  ];
  const activeNavigationSource = navigationSources.find(({ id }) => id === navigationMetric).source;
  const activeNavigationTickFormat = navigationSources.find(({ id }) => id === navigationMetric).tickFormat;
  const xAxisValues = range(MIN_YEAR, MAX_YEAR + 20, 20);
  // const legendX = sideWidth + (visibleDirections.length >= 4 ? cellWidth * 2.5 : cellWidth * 1.5) + gutter * 2;
  const seriesLabels = useMemo(() => {
    return {
      'total': translate('GuerreEtCroissance', 'total', lang),
      'imports': translate('GuerreEtCroissance', 'imports', lang),
      'exports': translate('GuerreEtCroissance', 'exports', lang),
      'total_no_colonial_product': translate('GuerreEtCroissance', 'total_no_colonial_product', lang),
      'total_no_colonial_trade': translate('GuerreEtCroissance', 'total_no_colonial_trade', lang),
      'imports_no_colonial_product': translate('GuerreEtCroissance', 'imports_no_colonial_product', lang),
      'exports_no_colonial_product': translate('GuerreEtCroissance', 'exports_no_colonial_product', lang),
      'imports_no_colonial_trade': translate('GuerreEtCroissance', 'imports_no_colonial_trade', lang),
      'exports_no_colonial_trade': translate('GuerreEtCroissance', 'exports_no_colonial_trade', lang),
      'navigation': translate('GuerreEtCroissance', 'navigation', lang),
    }
  }, [translate, lang]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [lang, visibleSeries, visibleDirections, data, activeNavigationSource, activeYear]);

  const wars = [
    {
      start: 1744,
      end: 1748,
      name: 'succession Autriche'
    },
    {
      start: 1756,
      end: 1763,
      name: 'sept ans'
    },
    {
      start: 1776,
      end: 1783,
      name: 'indépendance américaine'
    },
    {
      start: 1793,
      end: 1800,
      name: 'Guerres de la Révolution française'
    },
  ];
  let circleRadius = width / 1000; // width / (visibleDirections.length * visibleSeries.length * 20);
  const numberOfCells = visibleDirections.length * visibleSeries.length;
  if (numberOfCells < 3) {
    circleRadius = width / 350;
  }
  else if (numberOfCells < 9) {
    circleRadius = width / 500;
  }

  const maxTickValue = useMemo(() => {
    const points = visibleSeries.reduce((p, seriesId) => 
      seriesId === 'navigation' ? p 
    :  
    [
      ...p, 
      ...data[seriesId]
          .filter(d => visibleDirections.includes(d.direction_ferme))
          .map(d => +d.value)
    ]
    , []);
    const max = Math.max(...points);
    let tickValue = 350000000;
    if (max < 20000000) {
      tickValue = 20000000;
    } else if (max < 50000000) {
      tickValue = 50000000;
    } else if (max < 150000000) {
      tickValue = 150000000;
    }
    return tickValue;
  }, [data, visibleSeries, visibleDirections]);
  return (
    <>
      <svg
        className="GuerreEtCroissance"
        width={width}
        height={height}
      >
        {/* <rect
          fill="pink"
          x={0}
          y={0}
          height={height}
          width={legendWidth + sideWidth}
        /> */}
        <g className="viz-space-wrapper" transform={`translate(${legendWidth}, 0)`}>
          <g className="x-axis-wrapper">
            {
              (visibleDirections.length ? visibleDirections : ['Marseille']).map((direction, index) => {
                const x = sideWidth + index * cellWidth;
                const tickFontSize = xScale(1760) - xScale(1757);
                return (
                  <g className="x-axis-container"
                    transform={`translate(${x}, 0)`}
                    key={direction}
                  >
                    {
                      xAxisValues
                        .map(value => {
                          const x = xScale(value);
                          const yEnd = direction === 'Marseille' ? height - bottomAxisHeight : 
                            visibleSeries.includes('navigation') ? height - bottomAxisHeight - rowHeight
                            : height - bottomAxisHeight;
                          return (
                            <g
                              className="x-axis-group"
                              key={value}
                              transform={`translate(${x}, 0)`}
                            >
                              <line
                                stroke="lightgrey"
                                strokeDasharray={'2,2'}
                                x1={0}
                                x2={0}
                                y1={topLabelsHeight * 2 + tickFontSize * 2}
                                y2={yEnd - tickFontSize * .5}
                              />
                              {/* <line
                                stroke="lightgrey"
                                x1={0}
                                x2={0}
                                y1={yEnd}
                                y2={yEnd + tickFontSize * .25}
                              /> */}
                              <text
                                fill="grey"
                                x={0}
                                // y={yEnd + tickFontSize * 1.5}
                                y={yEnd + tickFontSize * .5}
                                textAnchor="middle"
                                fontSize={tickFontSize}
                              >
                                {value}
                              </text>
                            </g>
                          )
                        })
                    }
                  </g>
                )
              })
            }
          </g>
          <g className="top-labels">
            {
              visibleDirections.map((direction, index) => {
                const x = sideWidth + index * cellWidth;
                const y = 0 // topLabelsHeight / 2;
                return (
                  <foreignObject
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={topLabelsHeight * 2}
                    key={direction}
                  >
                    <div
                      className="top-label-container">
                      <h4
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="top-label"
                      >
                        {direction}
                      </h4>
                    </div>
                  </foreignObject>
                )
              })
            }
          </g>
          <g className="rows">
            {
              visibleSeries.map((seriesId, index) => {
                const y = topLabelsHeight + index * rowHeight;
                return (
                  <g
                    className="row"
                    transform={`translate(${0}, ${y})`}
                    key={seriesId}
                  >
                    {
                      // seriesId === 'navigation' ?
                      //   <rect
                      //     x={0}
                      //     y={0}
                      //     width={width}
                      //     height={rowHeight}
                      //     fill={`rgba(0,0,0,0.0)`}
                      //   />
                      //   : null
                    }
                    <g className="row-title-container">
                      <foreignObject
                        x={0}
                        y={0}
                        width={sideWidth}
                        height={rowHeight}
                      >
                        <div
                          xmlns="http://www.w3.org/1999/xhtml"
                          className="row-title-wrapper">
                          <h4
                            className="row-title"
                          >
                            {seriesLabels[seriesId]}
                          </h4>
                        </div>
                      </foreignObject>
                    </g>
                    <g
                      className="row-columns-container"
                      transform={`translate(${sideWidth}, 0)`}
                    >
                      {
                        seriesId === 'navigation' ?
                          <LineSeries
                            width={cellWidth}
                            height={rowHeight}
                            id={seriesId}
                            data={data[activeNavigationSource]}
                            tickFormat={activeNavigationTickFormat}
                            activeYear={activeYear}
                            onSetActiveYear={y => setActiveYear(y)}
                            xScale={xScale}
                            gutter={gutter}
                            seriesLabels={seriesLabels}
                            wars={wars}
                            lang={lang}
                            displayYTicks={true}
                            circleRadius={circleRadius}
                            unit={navigationSources.find(({ id }) => id === navigationMetric).unit}
                          />
                          :
                          visibleDirections.map((direction, index) => {
                            const x = index * cellWidth;
                            if (!data[seriesId]) {
                              return null;
                            }
                            return (
                              <g
                                key={index}
                                transform={`translate(${x}, 0)`}
                              >
                                <LineSeries
                                  width={cellWidth}
                                  height={rowHeight}
                                  id={seriesId}
                                  data={data[seriesId].filter(d => d.direction_ferme === direction)}
                                  xScale={xScale}
                                  yDomain={[0, maxTickValue]}
                                  tickFormat={d => formatNumber(d / 1000, lang) + ' k lt.'}
                                  activeYear={activeYear}
                                  onSetActiveYear={y => setActiveYear(y)}
                                  gutter={gutter}
                                  seriesLabels={seriesLabels}
                                  wars={wars}
                                  lang={lang}
                                  displayYTicks={index === visibleDirections.length - 1}
                                  circleRadius={circleRadius}
                                  unit={'lt.'}
                                />
                              </g>
                            )
                          })
                      }
                    </g>
                  </g>
                )
              })
            }
          </g>
        </g>
        {/* <foreignObject

          x={sideWidth + cellWidth * 1.5}
          y={topLabelsHeight + rowHeight * (visibleSeries.length - 1) + gutter * 3}
          width={cellWidth * 2}
          height={rowHeight}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="navigation-ui-container"
          >
            <p>
              <strong>← {translate('GuerreEtCroissance', 'navigation-interface-title', lang)}</strong>
            </p>
            <ul>
              {
                navigationSources.map(({ id, label }) => {
                  return (
                    <li
                      key={id}
                      onClick={() => setNavigationMetric(id)}
                    >
                      <input
                        type="radio"
                        checked={id === navigationMetric}
                        onChange={() => setNavigationMetric(id)}
                      />
                      <label style={{ fontWeight: id === navigationMetric ? 'bold' : '' }}>{label}</label>
                    </li>
                  )
                })
              }
            </ul>
          </div>
        </foreignObject> */}
        <Legend
          {
          ...{
            x: gutter,
            y: topLabelsHeight,
            width: legendWidth,
            height: height - topLabelsHeight * 2,
            lang,

            atlasMode,
            defaultDirections,
            visibleDirections,
            setVisibleDirections,
            defaultSeries,
            visibleSeries,
            setVisibleSeries,

            navigationMetric,
            setNavigationMetric,
            navigationSources,
          }
          }
        />

        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 l2,-2
                              M0,4 l4,-4
                              M3,5 l2,-2"
            style={{ stroke: 'grey', opacity: 1, strokeWidth: 1 }} />
        </pattern>

        {/*
          atlasMode ?
            <foreignObject
              x={gutter * 4}
              y={topLabelsHeight - 10}
              width={sideWidth * 1.5}
              height={height}
              style={{ pointerEvents: 'none' }}
            >
              <div className="controls-container" style={{ pointerEvents: 'all' }}>
                <button
                  className={`btn ${controlsVisible ? 'is-active' : ''}`}
                  onClick={() => setControlsVisible(!controlsVisible)}
                >
                  {translate('GuerreEtCroissance', 'filters-title', lang)}
                </button>
                <div className={`collapsable-controls ${controlsVisible ? 'is-visible' : ''}`}>
                  <p>
                  {translate('GuerreEtCroissance', 'filters-directions-title', lang)}
                  </p>
                  <ul>
                    {
                      defaultDirections
                        .map(direction => {
                          const isVisible = visibleDirections.includes(direction)
                          const handleClick = () => {
                            if (isVisible) {
                              setVisibleDirections(visibleDirections.filter(d => d !== direction))
                            } else {
                              setVisibleDirections([...visibleDirections, direction])
                            }
                          }
                          return (
                            <li style={{ fontWeight: isVisible ? 800 : 400, opacity: isVisible ? 1 : .5, cursor: 'pointer' }} onClick={handleClick} key={direction}>
                              {direction}
                            </li>
                          )
                        })
                    }
                  </ul>
                  <p>
                  {translate('GuerreEtCroissance', 'filters-series-title', lang)}
                  </p>
                  <ul>
                    {
                      defaultSeries
                        .map(series => {
                          const isVisible = visibleSeries.includes(series)
                          const handleClick = () => {
                            if (isVisible) {
                              setVisibleSeries(visibleSeries.filter(d => d !== series))
                            } else {
                              setVisibleSeries([...visibleSeries, series])
                            }
                          }
                          return (
                            <li style={{ fontWeight: isVisible ? 800 : 400, opacity: isVisible ? 1 : .5, cursor: 'pointer' }} onClick={handleClick} key={series}>
                              {translate('GuerreEtCroissance', series, lang)}
                            </li>
                          )
                        })
                    }
                  </ul>
                </div>
              </div>
            </foreignObject>
            : null
       */ }


      </svg>
      <ReactTooltip id="guerre-tooltip" />
    </>
  )
}