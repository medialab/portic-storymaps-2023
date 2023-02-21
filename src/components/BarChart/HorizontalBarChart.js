import React, { useRef, useState, useEffect } from 'react';

import { scaleLinear, scaleBand } from 'd3-scale';
import { extent, range, max } from 'd3-array';
import { axisPropsFromTickScale } from 'react-d3-axis';
import { groupBy } from 'lodash';
import { uniq } from 'lodash';
import Tooltip from 'react-tooltip';

import colorsPalettes from '../../utils/colorPalettes';
import { fixSvgDimension, generatePalette } from '../../utils/misc';

const { generic } = colorsPalettes;

/**
 * BarChart component - returns a <figure> containing a svg linechart
 * @param {Object} props
 * 
 * @param {array} props.data 
 * @param {string} props.title 
 * @param {'horizontal'|'vertical'} props.orientation 
 * @param {'stack'|'groups'} props.layout
 * @param {number} props.width 
 * @param {number} props.height 
 * 
 * @param {object} props.color
 * @param {string} props.color.field
 * @param {string} props.color.title
 * @param {object} props.color.palette
 * 
 * @param {object} props.x
 * @param {string} props.x.field
 * @param {string} props.x.title
 * @param {number} props.x.tickSpan
 * @param {function} props.x.tickFormat
 * @param {array} props.x.domain
 * @param {object} props.x.sort
 * @param {string} props.x.sort.field
 * @param {boolean} props.x.sort.ascending
 * @param {number|string} props.x.sort.type
 * 
 * @param {object} props.y
 * @param {string} props.y.field
 * @param {string} props.y.title
 * @param {number} props.y.tickSpan
 * @param {function} props.y.tickFormat
 * @param {array} props.y.domain
 * @param {boolean} props.y.fillGaps
 * @param {object} props.y.sort
 * @param {string} props.y.sort.field
 * @param {boolean} props.y.sort.ascending
 * @param {string} props.y.sort.type
 * 
 * @param {object} props.margins
 * @param {number} props.margins.left
 * @param {number} props.margins.top
 * @param {number} props.margins.right
 * @param {number} props.margins.bottom
 * @param {number} props.annotations
 * @params {string} annotations[n].type ['span]
 * @params {number} annotations[n].start
 * @params {number} annotations[n].end
 * @params {string} annotations[n].axis ['x', 'y']
 * @params {string} annotations[n].label
 * @param {function} props.tooltip
 * 
 * @returns {React.ReactElement}
 */
const HorizontalBarChart = ({
  data,
  title,
  orientation = 'horizontal',
  layout = 'stack',
  width: initialWidth = 1000,
  height: initialHeight = 400,
  color,
  x,
  y,
  tooltip,
  margins: inputMargins = {},
  annotations = []
}) => {
  const [headersHeight, setHeadersHeight] = useState(0);
  // const [legendWidth, setLegendWidth] = useState(0);

  const legendRef = useRef(null);
  const headerRef = useRef(null);

  const width = fixSvgDimension(initialWidth);
  const height = fixSvgDimension(initialHeight - headersHeight);

  useEffect(() => {
    Tooltip.rebuild();
  })

  useEffect(() => {
    setTimeout(() => {
      const newHeadersHeight = headerRef.current ? headerRef.current.getBoundingClientRect().height : 0;
      // const newLegendWidth = legendRef.current ?  legendRef.current.getBoundingClientRect().width : 0;
      setHeadersHeight(newHeadersHeight);
      // setLegendWidth(newLegendWidth);
    })
  }, [width, height, color, data])

  const margins = {
    left: 100,
    top: 30,
    bottom: 20,
    right: 20,
    ...inputMargins
  };

  const {
    tickFormat: yTickFormat,
    tickSpan: yTickSpan,
    domain: initialYDomain,
    field: yField,
    sort: sortY = {}
  } = y;
  const {
    tickFormat: xTickFormat,
    tickSpan: xTickSpan,
    domain: initialXDomain,
    fillGaps: fillXGaps,
    field: xField,
    sort: sortX = {},
  } = x;
  const {
    field: sortYField = yField,
    ascending: sortYAscending = true,
    type: sortYType = 'number',
    autoSort: yAutoSort = false
  } = sortY;
  const {
    field: sortXField = xField,
    ascending: sortXAscending = true,
    type: sortXType
  } = sortX;

  let colorPalette, colorModalities;

  if (color) {
    colorModalities = uniq(data.map(d => d[color.field]));
  }
  if (color && color.palette) {
    colorPalette = color.palette;
  } else if (color) {
    const colorValues = generatePalette(color.field, colorModalities.length);
    colorPalette = colorModalities.reduce((res, modality, index) => ({
      ...res,
      [modality]: colorValues[index]
    }), {})
  }

  let xValues = uniq(data.filter(d => +d[y.field]).map(d => d[x.field]));
  let vizWidth = width - margins.left - margins.right;

  let xDomain = xValues;
  let bandsNb = xValues.length;
  let columnWidth = vizWidth / bandsNb;
  let xScale = scaleBand().domain(xDomain).range([margins.left + columnWidth / 2, width - margins.right - columnWidth / 2]);

  if (initialXDomain) {
    xDomain = range(initialXDomain);
    xValues = xDomain;
    bandsNb = xValues.length;
    columnWidth = vizWidth / bandsNb;
    xScale = scaleLinear().domain(extent(xDomain)).range([margins.left + columnWidth / 2, width - margins.right - columnWidth / 2]).nice();
  } else if (fillXGaps) {
    const xExtent = extent(xValues.filter(v => +v).map(v => +v));
    if (xTickSpan) {
      xExtent[0] = xExtent[0] - xExtent[0] % xTickSpan;
      xExtent[1] = xExtent[1] + xExtent[1] % xTickSpan;
    }
    xDomain = range(xExtent[0], xExtent[1]);
    xValues = xDomain;
    bandsNb = xValues.length;
    columnWidth = vizWidth / bandsNb;
    xScale = scaleLinear().domain(extent(xDomain)).range([margins.left + columnWidth / 2, width - margins.right - columnWidth / 2]).nice();
  }

  const groups = Object.entries(groupBy(data, d => d[x.field])) // color ? Object.entries(groupBy(data, d => d[color.field])) : [[undefined, data]];

  let yDomain;
  if (initialYDomain) {
    yDomain = initialYDomain;
  } else {
    yDomain = layout === 'stack' ?
    // stack -> max = max sum for a given x modality
    [0, max(
      groups.map(
        ([_groupName, values]) =>
          values.reduce((sum, datum) => sum + +(datum[y.field]), 0)
      )
    )
    ]
    :
    // group -> max = abs max
    [0, max(data.map(d => +d[y.field]))];
  }
  

  let bandWidth = layout === 'stack' ? columnWidth / 2 : (columnWidth / colorModalities.length) * .5;
  const yScale = scaleLinear().domain(yDomain).range([height - margins.bottom, margins.top]).nice();
  const yStackScale = yScale.copy().range([0, height - margins.bottom - margins.top]);

  const xAxisValues = xTickSpan ? range(xDomain[0], xDomain[xDomain.length - 1], xTickSpan) : xValues;
  let { values: yAxisValues } = axisPropsFromTickScale(yScale, 10);

  if (yTickSpan) {
    yDomain[0] = yDomain[0] - yDomain[0] % yTickSpan;
    yDomain[1] = yDomain[1] + (yTickSpan - yDomain[0] % yTickSpan);
    yAxisValues = range(yDomain[0], yDomain[1], yTickSpan);
    yScale.domain(yDomain)
  }

  return (
    <>
      <figure style={{ width: initialWidth, height: initialHeight }} className="BarChart is-horizontal GenericVisualization">
        <div ref={headerRef} className="row">
          {title ? <h5 className="visualization-title" style={{ marginLeft: margins.left }}>{title}</h5> : null}
        </div>
        <div className="row vis-row">
          <svg className="chart" width={width} height={height}>
            <g className="axis left-axis ticks">
              <text x={margins.left - 10} y={margins.top - 15} className="axis-title">
                {y.title || y.field}
              </text>
              {
                yAxisValues.map((value, valueIndex) => (
                  <g
                    key={value}
                    transform={`translate(0, ${yScale(value)})`}
                  >
                    <text x={margins.left - 10} y={3}>
                      {typeof yTickFormat === 'function' ? yTickFormat(value, valueIndex) : value}
                    </text>
                    <line
                      className="tick-mark"
                      x1={margins.left - 5}
                      x2={margins.left}
                      y1={0}
                      y2={0}
                    />
                    <line
                      className="background-line"
                      x1={margins.left}
                      x2={xScale(xAxisValues[xAxisValues.length - 1])}
                      y1={0}
                      y2={0}
                    />
                  </g>
                ))
              }
            </g>
            <g className="axis bottom-axis ticks">
              {
                xAxisValues.map((value, valueIndex) => (
                  <g
                    key={value}
                    transform={`translate(${xScale(value)}, 0)`}
                  >
                    <text x={0} y={height - margins.bottom + 20}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value, valueIndex) : value}
                    </text>
                    <line
                      className="background-line"
                      x1={0}
                      x2={0}
                      y1={yScale(yAxisValues[yAxisValues.length - 1])}
                      y2={height - margins.bottom}
                    />
                    <line
                      className="tick-mark"
                      x1={0}
                      x2={0}
                      y1={height - margins.bottom}
                      y2={height - margins.bottom + 5}
                    />
                  </g>
                ))
              }
            </g>
            <g className="annotations-container">
              {
                annotations
                  .filter(a => a.axis === 'x')
                  .map((annotation, annotationIndex) => {
                    const { start, end, label, labelPosition = 20 } = annotation;
                    const thatHeight = fixSvgDimension(height - yScale(yAxisValues[yAxisValues.length - 1]) - margins.bottom);
                    const thatY1 = height - margins.bottom;
                    const thatY2 = yScale(yAxisValues[yAxisValues.length - 1]);
                    return (
                      <g className="annotation x-axis-annotation" key={annotationIndex}>
                        <rect
                          x={xScale(start)}
                          width={fixSvgDimension(xScale(end) - xScale(start))}
                          height={thatHeight}
                          y={thatY2}
                          fill="url(#diagonalHatch)"
                          opacity={.4}
                        />
                        <line
                          x1={xScale(start)}
                          x2={xScale(start)}
                          y1={thatY1}
                          y2={thatY2}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <line
                          x1={xScale(end)}
                          x2={xScale(end)}
                          y1={thatY1}
                          y2={thatY2}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <line
                          x1={xScale(end) + 20}
                          x2={xScale(end) + 10}
                          y1={thatY2 + labelPosition - 5}
                          y2={thatY2 + labelPosition - 5}
                          stroke="grey"
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={xScale(end) + 22}
                          y={thatY2 + labelPosition}
                          fontSize={'.5rem'}
                          fill="grey"
                        >
                          {label}
                        </text>
                        <defs>
                          <marker id="arrowhead" markerWidth="5" markerHeight="5"
                            refX="0" refY="2.5" orient="auto">
                            <polygon stroke="grey" fill="transparent" points="0 0, 5 2.5, 0 5" />
                          </marker>
                        </defs>
                        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                          <path d="M-1,1 l2,-2
                              M0,4 l4,-4
                              M3,5 l2,-2"
                            style={{ stroke: 'grey', opacity: .5, strokeWidth: 1 }} />
                        </pattern>

                      </g>
                    )
                  })
              }
              {
                annotations
                  .filter(a => a.axis === 'y')
                  .map((annotation, annotationIndex) => {
                    const { start, end, label, labelPosition = 20 } = annotation;
                    const thatX1 = margins.left;
                    const thatX2 = xScale(xAxisValues[xAxisValues.length - 1]);
                    return (
                      <g className="annotation y-axis-annotation" key={annotationIndex}>
                        <rect
                          x={thatX1}
                          width={fixSvgDimension(thatX2 - thatX1)}
                          y={yScale(start)}
                          height={fixSvgDimension(yScale(end) - yScale(start))}
                          fill="url(#diagonalHatch)"
                          opacity={.4}
                        />
                        <line
                          x1={thatX1}
                          x2={thatX2}
                          y1={yScale(start)}
                          y2={yScale(start)}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <line
                          x1={thatX1}
                          x2={thatX2}
                          y1={yScale(end)}
                          y2={yScale(end)}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <line
                          x1={thatX1 + labelPosition - 5}
                          x2={thatX1 + labelPosition - 5}
                          y1={yScale(start) - 15}
                          y2={yScale(start) - 5}
                          stroke="grey"
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={thatX1 + labelPosition}
                          y={yScale(start) - 10}
                          fontSize={'.5rem'}
                          fill="grey"
                        >
                          {label}
                        </text>
                        <defs>
                          <marker id="arrowhead" markerWidth="5" markerHeight="5"
                            refX="0" refY="2.5" orient="auto">
                            <polygon stroke="grey" fill="transparent" points="0 0, 5 2.5, 0 5" />
                          </marker>
                        </defs>
                        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                          <path d="M-1,1 l2,-2
                              M0,4 l4,-4
                              M3,5 l2,-2"
                            style={{ stroke: 'grey', opacity: .5, strokeWidth: 1 }} />
                        </pattern>

                      </g>
                    )
                  })
              }
            </g>
            <g className="bars-container">
              {
                groups
                  .sort((a, b) => {
                    const multiplier = sortXAscending ? 1 : -1;
                    if (sortXField === x.field) {
                      const aVal = sortXType === 'number' ? +a[0] : a[0];
                      const bVal = sortXType === 'number' ? +b[0] : b[0];
                      if (aVal < bVal) {
                        return -1 * multiplier;
                      }
                      return 1 * multiplier;
                    }
                    const aVal = sortXType === 'number' ?
                      +a[1].reduce((sum, datum) => sum + +datum[sortXField], 0)
                      : a[1][sortXField];
                    const bVal = sortXType === 'number' ?
                      +b[1].reduce((sum, datum) => sum + +datum[sortXField], 0)
                      : b[1][sortXField];
                    if (aVal < bVal) {
                      return -1 * multiplier;
                    }
                    return 1 * multiplier;

                  })
                  .map(([xModality, items], groupIndex) => {
                    let stackDisplaceY = height - margins.bottom;
                    return (
                      <g key={groupIndex} transform={`translate(${xScale(items[0][x.field])}, 0)`}>
                        {
                          items
                            .sort((a, b) => {
                              if (!yAutoSort) {
                                return 0;
                              }
                              const multiplier = sortYAscending ? 1 : -1;
                              const aVal = sortYType === 'number' ? +a[sortYField] : a[sortYField];
                              const bVal = sortYType === 'number' ? +b[sortYField] : b[sortYField];
                              if (aVal > +bVal) {
                                return -1 * multiplier;
                              }
                              return 1 * multiplier;
                            })
                            .map((item, itemIndex) => {
                              const thatX = layout === 'stack' ? -bandWidth / 2 : itemIndex * ((columnWidth * .5) / items.length) - columnWidth / 4;
                              const thatHeight = layout === 'stack' ? yStackScale(item[y.field]) : height - margins.bottom - yScale(item[y.field]) || 0;

                              const thatY = layout === 'stack' ? stackDisplaceY - thatHeight : yScale(item[y.field]);
                              if (layout === 'stack') {
                                stackDisplaceY -= thatHeight;
                              }
                              const thatColor = colorPalette ? colorPalette[item[color.field]] : generic.dark;
                              return (
                                <>
                                  {
                                    +item[y.field] > 0 ?
                                      <rect key={itemIndex}
                                        fill={thatColor}
                                        width={fixSvgDimension(bandWidth)}
                                        x={thatX}
                                        y={thatY}
                                        height={fixSvgDimension(thatHeight)}
                                        data-for="bar-tooltip"
                                        data-tip={typeof tooltip === 'function' ? tooltip(item, itemIndex, groupIndex) : undefined}
                                      />
                                      : null
                                  }
                                </>
                              )
                            })
                        }
                      </g>
                    );
                  })
              }
            </g>
          </svg>
          {
            color ?
              <div
                className="ColorLegend"
                ref={legendRef}
                style={{
                  top: headersHeight
                }}
              >
                <h5>{color.title || 'Légende'}</h5>
                <ul className="color-legend">
                  {
                    Object.entries(colorPalette)
                      .map(([modality, color]) => (
                        <li
                          key={modality}
                        >
                          <span className="color-box"
                            style={{ background: color }}
                          />
                          <span className="color-label">
                            {modality}
                          </span>
                        </li>
                      ))
                  }
                </ul>
              </div>
              : null
          }
        </div>
      </figure>
      <Tooltip id="bar-tooltip" />
    </>
  )
}

export default HorizontalBarChart;