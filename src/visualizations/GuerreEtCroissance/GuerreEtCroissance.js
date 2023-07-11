import { groupBy, range } from "lodash";
import { useEffect, useState } from "react"

const seriesLabels = {
  'total': 'total',
  'imports': 'importations',
  'exports': 'exportations',
  'total_no_colonial_product': 'total (sans produits coloniaux)',
  'total_no_colonial_trade': 'total (sans commerce colonial)',
  'imports_no_colonial_product': 'importations (sans produits coloniaux)',
  'exports_no_colonial_product': 'exportations (sans produits coloniaux)',
  'imports_no_colonial_trade': 'importations (sans commerce colonial)',
  'exports_no_colonial_trade': 'exportations (sans commerce colonial)',
  'navigation': 'navigation de Marseille'
}

import './GuerreEtCroissance.scss';
import { scaleLinear } from "d3-scale";
import { extent, max } from "d3-array";
import { formatNumber } from "../../utils/misc";
import ReactTooltip from "react-tooltip";

const MIN_YEAR = 1720;
const MAX_YEAR = 1790;

const WARS = [
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
];

const LineSeries = ({
  width,
  height,
  data: inputData,
  xScale,
  yDomain: initialYDomain,
  gutter,
  displayYTicks,
  activeYear,
  onSetActiveYear,
  tickFormat,
  id,
}) => {
  if (!inputData || !inputData[0]) {
    return null;
  }
  const data = inputData.filter(d => d.value > 0)
  // .map(d => {
  //   let cleanSlope = 0;
  //   if (d.slope.length) {
  //     const part2 = d.slope.split(' ').pop();
  //     cleanSlope = +part2.split('%')[0]
  //   }
  //   return {
  //     ...d,
  //     cleanSlope,
  //   }
  // })
  let cleanSlope = 0;
  if (inputData[0].slope.length) {
    const part2 = inputData[0].slope.split(' ').pop();
    cleanSlope = +part2.split('%')[0]
  }
  const yDomain = initialYDomain || [0, max(data.map(d => d.value))];
  let yTickSpan = 50000000;
  if (yDomain[1] <= 10000) {
    yTickSpan = 500;
  } else if (yDomain[1] <= 1000000) {
    yTickSpan = 50000;
  } else if (yDomain[1] <= 5000000) {
    yTickSpan = 500000;
  }
  const avgMem = data[0].avg_loss_mem.split(' ').pop().replace('memoire', '');
  const slope = data[0].slope.split(' ').pop();
  // const avgNoMem = data[0].avg_loss_no_mem.split(' ').pop().replace('memoire', '');

  const yScale = scaleLinear().domain(yDomain).range([height - gutter, gutter * 2]).nice();
  const yAxisTickValues = range(yDomain[0], yDomain[1] + yTickSpan, yTickSpan);
  const endX = xScale(MAX_YEAR + 10);
  let tickFontSize = width / 25;
  if (tickFontSize < 6) {
    tickFontSize = 6;
  }
  // const slopeExtent = extent(data.map(d => d.cleanSlope));
  // const slopeColorScale = scaleLinear().domain([-1.1, 3.5]).range(['red', 'green'])
  const slopeColorScale = scaleLinear().domain([-1.1, 3.5]).range(['lightgrey', 'blue']);
  const lossColorScale = scaleLinear().domain([-60, 60]).range(['red', 'green']);
  // console.log(data.map(d => !d.slope.length ? 0 : (d.slope.split(' ')[1].split('%')[0])))
  return (
    <g className="LineSeries">
      <rect x={0} y={gutter * 2} width={endX} height={height - gutter * 3} fill="rgba(0,0,0,0.05)" />
      {
        yAxisTickValues
          .map(value => {
            const y = yScale(value);
            return (
              <g key={value}
                className="axis-tick-group">
                <line
                  stroke="grey"
                  strokeDasharray={'2,2'}
                  x1={0}
                  x2={endX}
                  y1={y}
                  y2={y}
                />
                {
                  displayYTicks ?
                    <>
                      <line
                        x1={endX}
                        x2={endX + gutter / 4}
                        y1={y}
                        y2={y}
                        stroke="grey"
                      />

                      <text
                        x={endX + gutter / 2}
                        y={y + tickFontSize / 4}
                        fontSize={tickFontSize}
                      >
                        {tickFormat(value)}
                      </text>

                    </>
                    : null
                }

              </g>
            )
          })
      }
      <g className="wars">
        {
          WARS.map(({ start, end, name }) => {
            const x1 = xScale(start);
            const x2 = xScale(end);
            return (
              <rect
                key={name}
                title={name}
                x={x1}
                y={gutter * 2}
                width={x2 - x1}
                height={height - gutter * 3}
                fill="url(#diagonalHatch)"
                opacity={.5}
                stroke="none"
              />
            )
          })
        }
      </g>
      {
        activeYear ?
          <line
            x1={xScale(activeYear)}
            x2={xScale(activeYear)}
            y1={gutter * 2}
            y2={height - gutter}
            stroke="rgb(81, 78, 238)"
            strokeDasharray={'2,2'}
          />
          : null
      }
      {
        data
          .map(({ year: year1, value: value1 }, index) => {
            const next = data[index + 1];
            if (!next || next.year !== year1 + 1) {
              return null;
            }
            const { year: year2, value: value2 } = next;
            const x1 = xScale(year1);
            const y1 = yScale(value1);
            const x2 = xScale(year2);
            const y2 = yScale(value2);
            return (
              <line
                key={year1}
                stroke="grey"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            )
          })
      }
      {
        inputData
          .map(({ year: year1, peace_reg_memory: value1 }, index) => {
            const next = inputData[index + 1];
            if (!next) {
              return null;
            }
            const { year: year2, peace_reg_memory: value2 } = next;
            if (value1 === 0 || value2 === 0) {
              return null;
            }
            const x1 = xScale(year1);
            const y1 = yScale(value1);
            const x2 = xScale(year2);
            const y2 = yScale(value2);
            return (
              <line
                key={year1}
                stroke="red"
                strokeWidth={2}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            )
          })
      }

      {
        data
          .map(({ year, value }) => {
            const x = xScale(year);
            const y = yScale(value);
            const isActive = activeYear === year;
            return (
              <g key={year}>
                <circle
                  fill="transparent"
                  cx={x}
                  cy={y}
                  r={isActive ? width / data.length * 5 : width / data.length * 2}
                  onMouseEnter={() => onSetActiveYear(year)}
                  onMouseLeave={() => onSetActiveYear()}
                  data-for="guerre-tooltip"
                  data-tip={`En ${year}, valeur de ${formatNumber(parseInt(value))} (perte mémoire de ${formatNumber(parseInt(data.find(d => d.year === year).peace_reg_memory))})`}
                />
                <circle
                  fill={isActive ? 'blue' : "grey"}
                  cx={x}
                  cy={y}
                  r={isActive ? 3 : 1.5}
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            )
          })
      }
      {
        slope ?
        <foreignObject
        x={gutter / 2}
        y={gutter * 2}
        height={gutter * 2}
        width={gutter * 5 + 2}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="slope"
          style={{
            fontSize: tickFontSize * 1.5,
            fontWeight: '900',
            color: slopeColorScale(cleanSlope),
            // color: 'white',
            width: '100%',
            height: '100%',
          }}
        >
          {slope}
        </div>
      </foreignObject>
        : null
      }
      
      {/* <text
        fill={'blue'}
        x={gutter / 2}
        y={gutter * 3}
        fontSize={tickFontSize * 1.5}
        fontWeight="bold"
        textAnchor="start"
      >
        {slope}
      </text> */}
      <text
        fill={lossColorScale(+avgMem.split('%')[0])}
        x={endX - gutter / 2}
        y={id === 'navigation' ? height - gutter - 2 : gutter * 3}
        fontSize={tickFontSize * 1.5}
        fontWeight="bold"
        textAnchor="end"
      >
        {(+avgMem.split('%')[0] > 0 ? '+' : '') + avgMem}
      </text>
      {/* <text
        fill={'orange'}
        x={endX - gutter / 2}
        y={gutter * 4}
        fontSize={tickFontSize * 1.5}
        textAnchor="end"
      >
        {avgNoMem}
      </text> */}
    </g>
  )
}

export default function GuerreEtCroissance({
  width,
  height,
  data: inputData,
  callerProps = {},
}) {
  const {
    series,
    directions,
    navigation_metric // ['tonnage', 'travels', 'mileage']
  } = callerProps;

  const defaultSeries = [
    'total',
    'imports',
    'exports',
    // 'total_no_colonial_product',
    'total_no_colonial_trade',
    // 'imports_no_colonial_product',
    // 'exports_no_colonial_product',
    'imports_no_colonial_trade',
    'exports_no_colonial_trade',
    'navigation',
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

  useEffect(() => setVisibleSeries(series ? series.split(',').map(s => s.trim())  : defaultSeries), [series]);
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

  const gutter = 10;
  const sideWidth = width / 5 < 100 ? 100 : width / 5;
  const topLabelsHeight = gutter * 3;
  const bottomAxisHeight = gutter * 3;
  const rowHeight = (height - topLabelsHeight - bottomAxisHeight) / visibleSeries.length;
  const cellWidth = (width - sideWidth - gutter * 5) / (visibleDirections.length < 3 ? 3 : visibleDirections.length);

  const xScale = scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, cellWidth - gutter * 3]);
  const navigationSources = [
    {
      id: 'carrière',
      source: 'Carriere',
      label: 'Carrière',
      tickFormat: d => formatNumber(d) + ' v.'
    },
    {
      id: 'entrées',
      source: 'Navigo entrées',
      label: 'Entrées navigo',
      tickFormat: d => formatNumber(d) + ' v.'
    },
    {
      id: 'tonnage',
      source: 'Navigo tonnage',
      label: 'Tonnage navigo',
      tickFormat: d => formatNumber(d) + ' tx.'
    },
    {
      id: 'mileage',
      source: 'Navigo mileage_total',
      label: 'Distance navigo',
      tickFormat: d => formatNumber(d) + ' m.'
    },
  ];
  const activeNavigationSource = navigationSources.find(({ id }) => id === navigationMetric).source;
  const activeNavigationTickFormat = navigationSources.find(({ id }) => id === navigationMetric).tickFormat;
  const xAxisValues = range(MIN_YEAR, MAX_YEAR + 20, 20);
  const legendX = sideWidth + (visibleDirections.length >= 4 ? cellWidth * 2.5 : cellWidth * 1.5) + gutter * 2;
  return (
    <>
      <svg
        className="GuerreEtCroissance"
        width={width}
        height={height}
      >
        <g className="x-axis-wrapper">
          {
            visibleDirections.map((direction, index) => {
              const x = sideWidth + index * cellWidth;
              return (
                <g className="x-axis-container"
                  transform={`translate(${x}, 0)`}
                  key={direction}
                >
                  {
                    xAxisValues
                      .map(value => {
                        const x = xScale(value);
                        const yEnd = direction === 'Marseille' ? height - bottomAxisHeight : height - bottomAxisHeight - rowHeight;
                        return (
                          <g
                            className="x-axis-group"
                            key={value}
                            transform={`translate(${x}, 0)`}
                          >
                            <line
                              stroke="grey"
                              strokeDasharray={'2,2'}
                              x1={0}
                              x2={0}
                              y1={topLabelsHeight + gutter * 2}
                              y2={yEnd}
                            />
                            <line
                              stroke="grey"
                              x1={0}
                              x2={0}
                              y1={yEnd}
                              y2={yEnd + gutter / 2}
                            />
                            <text
                              fill="grey"
                              x={0}
                              y={yEnd + gutter * 1.5}
                              textAnchor="middle"
                              fontSize={gutter * .6}
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
                    seriesId === 'navigation' ?
                      <rect
                        x={0}
                        y={0}
                        width={width}
                        height={rowHeight}
                        fill={`rgba(0,0,0,0.05)`}
                      />
                      : null
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
                          displayYTicks
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
                                yDomain={[0, 350000000]}
                                tickFormat={d => formatNumber(d) + ' lt.'}
                                activeYear={activeYear}
                                onSetActiveYear={y => setActiveYear(y)}
                                gutter={gutter}
                                displayYTicks={index === visibleDirections.length - 1}
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
        <foreignObject

          x={sideWidth + cellWidth + gutter * 2}
          y={topLabelsHeight + rowHeight * (visibleSeries.length - 1) + gutter * 2}
          width={cellWidth * 2}
          height={rowHeight}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="navigation-ui-container"
          >
            <p>
              Utiliser les données de navigation :
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
        </foreignObject>
        <foreignObject
          x={legendX}
          y={topLabelsHeight + rowHeight * (visibleSeries.length - 1) + gutter * 3}
          width={width - legendX - gutter * 3}
          height={rowHeight}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="legend"
          >
            <h4>
              Légende
            </h4>
            <ul>
              <li>
                <span
                  style={{
                    height: '.3rem',
                    borderBottom: '2px solid red',
                    display: 'inline-block',
                  }}
                ></span>
                <span>Projection d'une valeur estimée par régression à partir de la période de paix précédente</span>
              </li>
              <li>
                <span
                  style={{
                    color: 'blue'
                  }}
                >
                  +1%/an
                </span>
                <span>Croissance annuelle moyenne</span>
              </li>
              <li>
                <span
                  style={{
                    color: 'red'
                  }}
                >
                  -1%
                </span>
                <span>Moyenne de l'estimation de la perte en temps de guerre</span>
              </li>
            </ul>
          </div>
          {/*         
        <g transform={`translate(${0}, ${0})`}>
          <line
            stroke="red"
            x1={0}
            x2={gutter * 2}
            y1={gutter}
            y2={gutter}
          />
           <text
            x={gutter * 3}
            y={gutter}
          >
            Régression d'après la période de paix précédente
          </text> */}
          {/* </g> */}
        </foreignObject>
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 l2,-2
                              M0,4 l4,-4
                              M3,5 l2,-2"
            style={{ stroke: 'grey', opacity: 1, strokeWidth: 1 }} />
        </pattern>
      </svg>
      <ReactTooltip id="guerre-tooltip" />
    </>
  )
}