
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { range, max, min, group } from 'd3-array';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { groupBy, uniq } from 'lodash';
import { axisPropsFromTickScale } from 'react-d3-axis';
import Tooltip from 'react-tooltip';
import cx from 'classnames';

import { AnimatedCircle, AnimatedGroup, AnimatedRect, AnimatedText, AnimatedLine, AnimatedForeignObject} from '../AnimatedSvgElements';

import colorsPalettes from '../../utils/colorPalettes';
import { fixSvgDimension, generatePalette } from '../../utils/misc';

import './LineChart.scss';
import TextSpan from '../TextSpan';

const { generic } = colorsPalettes;

/**
 * LineChart component - returns a <figure> containing a svg linechart
 * 
 * @param {Object} props
 * @param {array} props.data
 * @param {string} props.title 
 * @param {width} props.number 
 * @param {height} props.number 
 * 
 * @param {object} props.color
 * @param {string} props.color.field
 * @param {string} props.color.title
 * @param {object} props.color.palette
 * 
 * @param {object} props.x
 * @param {string} props.x.field
 * @param {string} props.x.title
 * @param {'ordinal' | 'quantitative'} props.x.type
 * @param {number} props.x.tickSpan
 * @param {function} props.x.tickFormat
 * @param {array} props.x.domain
 * 
 * @param {object} props.x
 * @param {string} props.y.field
 * @param {string} props.y.title
 * @param {'ordinal' | 'quantitative'} props.y.type
 * @param {number} props.y.tickSpan
 * @param {function} props.y.tickFormat
 * @param {array} props.y.domain
 * @param {boolean} props.y.fillGaps
 * 
 * @param {object} props.margins
 * @param {number} props.margins.left
 * @param {number} props.margins.top
 * @param {number} props.margins.right
 * @param {number} props.margins.bottom
 * @param {array} props.annotations
 * @params {string} annotations[n].type ['span]
 * @params {number} annotations[n].start
 * @params {number} annotations[n].end
 * @params {string} annotations[n].axis ['x', 'y']
 * @params {string} annotations[n].label
 * 
 * @param {function} tooltip
 * 
 * @returns {React.ReactElement} - React component 
 */
const LineChart = ({
  data,
  title,
  width: initialWidth = 1000,
  height: initialHeight = 400,
  color,
  x,
  y,
  tooltip,
  margins: inputMargins = {},
  annotations = [],
  brushState = false,
  isBrushable = false
}) => {
  const [headersHeight, setHeadersHeight] = useState(0);
  const [legendWidth, setLegendWidth] = useState(0);
  const { lang } = useParams();

  const svgRef = useRef(null);
  const legendRef = useRef(null);
  const headerRef = useRef(null);

  const width = fixSvgDimension(initialWidth - legendWidth);
  const height = fixSvgDimension(initialHeight - headersHeight);

  useEffect(() => {
    setTimeout(() => {
      const newHeadersHeight = headerRef.current ? headerRef.current.getBoundingClientRect().height : 0;
      const newLegendWidth = legendRef.current ? legendRef.current.getBoundingClientRect().width : 0;
      setHeadersHeight(newHeadersHeight);
      setLegendWidth(newLegendWidth);
    })
  }, [width, height, color, data])

  useEffect(() => {
    Tooltip.rebuild();
  }, [data])

  const margins = {
    left: 120,
    top: 50,
    bottom: 40,
    right: 20,
    ...inputMargins
  };

  const {
    tickFormat: yTickFormat,
    tickSpan: yTickSpan,
    domain: initialYDomain,
    type: yType,
    field: yField,
    fillGaps
  } = y;
  const {
    tickFormat: xTickFormat,
    tickSpan: xTickSpan,
    domain: initialXDomain,
    type: xType,
    field: xField
  } = x;

  let colorPalette;
  if (color && color.palette) {
    colorPalette = color.palette;
  } else if (color) {
    const colorModalities = uniq(data.map(d => d[color.field]));
    const colorValues = generatePalette(color.field, colorModalities.length);
    colorPalette = colorModalities.reduce((res, modality, index) => ({
      ...res,
      [modality]: colorValues[index]
    }), {})
  }

  let xScale, xDomain, xAxisValues;
  if (xType === 'ordinal') {
    xDomain = Array.from(group(data, d => d[xField]).keys());
    xScale = scaleOrdinal().domain(xDomain).range(range(margins.left, width - margins.right, (width - margins.right) / xDomain.length - 1));
    xAxisValues = xDomain;
  } else {
    xDomain = initialXDomain && Array.isArray(initialXDomain) && initialXDomain.length === 2 ? initialXDomain : [min(data.map(d => +d[x.field])), max(data.map(d => +d[x.field]))];
    xScale = scaleLinear().domain(xDomain).range([margins.left, width - margins.right]).nice();
    xAxisValues = axisPropsFromTickScale(xScale).values;
  }

  let yScale, yDomain, yAxisValues;
  if (yType === 'ordinal') {
    yDomain = Array.from(group(data, d => d[yField]).keys())
    yScale = scaleOrdinal().domain(yDomain).range(range(margins.top, height - margins.bottom, (height - margins.bottom) / yDomain.length - 1));
    yAxisValues = yDomain;
  } else {
    yDomain = [min(data.map(d => +d[y.field])), max(data.map(d => +d[y.field]))];
    yScale = scaleLinear().domain(yDomain).range([height - margins.bottom, margins.top]).nice();
    yAxisValues = axisPropsFromTickScale(yScale, 10).values;
  }

  const groups = color ? Object.entries(groupBy(data, d => d[color.field])) : [[undefined, data]];
  if (xTickSpan) {
    xDomain[0] = xDomain[0] - xDomain[0] % xTickSpan;
    xDomain[1] = xDomain[1] + (xTickSpan - xDomain[0] % xTickSpan);
    xAxisValues = range(xDomain[0], xDomain[1], xTickSpan);
    xScale.domain(xDomain);
  }
  if (yTickSpan) {
    yDomain[0] = yDomain[0] - yDomain[0] % yTickSpan;
    yDomain[1] = yDomain[1] + (yTickSpan - yDomain[0] % yTickSpan);
    yAxisValues = range(yDomain[0], yDomain[1], yTickSpan);
    yScale.domain(yDomain)
  }

  function mouseXToChartX(e) {
    const { pageX } = e;
    let { left, width } = svgRef.current.getBoundingClientRect();
    const xRelative = pageX - left;
    if (xRelative <= margins.left) {
      return margins.left;
    }
    if (xRelative >= width) {
      return width;
    }
    return xRelative;
  }

  function convertXOnYear(xRelative) {
    const year = xScale.invert(xRelative);
    return Math.round(year)
  }

  let legendTitle = lang === 'fr' ? 'Légende' : 'Legend';
  if (color?.title) {
    legendTitle = color.title;
  }

  return (
    <>
      <figure style={{ width: initialWidth, height: initialHeight }} className={cx("LineChart GenericVisualization", {'is-brushable': isBrushable})}>
        <div ref={headerRef} className="row">
          {title ? <h5 className="visualization-title" style={{ marginLeft: margins.left }}>{title}</h5> : null}
        </div>
        {
          (brushState !== false && brushState[0]['mouse'] === 'up') &&
          <div className="zoom-info-container">
            Vous zoomez actuellement sur les années <strong>{brushState[0].start}</strong> à <strong>{brushState[0].end}</strong>.
            <button onClick={(e) => { brushState[1]({ mode: 'reset' }) }}>Revenir à l'ensemble de la série</button>
          </div>
          
        }
        <div className="row vis-row">
          <svg
            ref={svgRef}
            className="chart"
            width={width}
            height={height}
            onMouseDown={(e) => {
              if (brushState === false) { return; }
              const [brush, setBrush] = brushState;
              const xRelative = mouseXToChartX(e);
              setBrush({
                mode: 'start',
                value: convertXOnYear(xRelative),
                mouseState: 'down'
              })
            }}
            onMouseMove={(e) => {
              if (brushState === false) { return; }
              const [brush, setBrush] = brushState;
              const xRelative = mouseXToChartX(e);
              setBrush({
                mode: 'progress',
                value: convertXOnYear(xRelative),
              })
            }}
            onMouseUp={(e) => {
              if (brushState === false) { return; }
              const [brush, setBrush] = brushState;
              const xRelative = mouseXToChartX(e);
              if (!brush.end || brush.start === brush.end) {
                return;
              }
              setBrush({
                mode: 'end',
                value: convertXOnYear(xRelative),
                mouseState: 'up'
              })
            }}
          >
            {
              brushState[0] && brushState[0].mouse !== 'up' &&
                <rect
                  x={xScale(brushState[0]['start'])}
                  width={xScale(brushState[0]['end']) - xScale(brushState[0]['start'])}
                  y={margins.top}
                  height={height - margins.bottom - margins.top}
                  fill="rgba(0,0,0,0.1)"
                /> 
            }
            <AnimatedGroup className="axis left-axis ticks">
              <foreignObject
                  x={0}
                  y={margins.top - 40}
                  width={margins.left - 10}
                  height={100}
              >
                <p
                    xmlns="http://www.w3.org/1999/xhtml"
                    className="axis-title axis-title-y"
                >
                  {y.title || y.field}
                </p>
              </foreignObject>
              {
                yAxisValues.map((value, valueIndex) => (
                  <AnimatedGroup
                    key={value}
                    transform={`translate(0, ${yScale(value)})`}
                  >
                    <AnimatedText x={margins.left - 10} y={3}>
                      {typeof yTickFormat === 'function' ? yTickFormat(value, valueIndex) : value}
                    </AnimatedText>
                    <AnimatedLine
                      className="tick-mark"
                      x1={margins.left - 5}
                      x2={margins.left}
                      y1={0}
                      y2={0}
                    />
                    <AnimatedLine
                      className={cx("background-line", {
                        'is-zero': yDomain[0] < 0 && value === 0
                      })}
                      x1={margins.left}
                      x2={xScale(xAxisValues[xAxisValues.length - 1])}
                      y1={0}
                      y2={0}
                    />
                  </AnimatedGroup>
                ))
              }
            </AnimatedGroup>
            <AnimatedGroup className="axis bottom-axis ticks">
              <foreignObject
                  x={width /2}
                  y={height - (margins.bottom - 25)}
                  width={width/2 - margins.right / 2}
                  height={100}
              >
                <p
                    xmlns="http://www.w3.org/1999/xhtml"
                    className="axis-title axis-title-x"
                >
                  {x.title || x.field}
                </p>
              </foreignObject>
              {
                xAxisValues.map((value, valueIndex) => (
                  <AnimatedGroup
                    key={value}
                    transform={`translate(${xScale(value)}, 0)`}
                  >
                    <AnimatedText x={0} y={height - margins.bottom + 20}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value, valueIndex) : value}
                    </AnimatedText>
                    <AnimatedLine
                      className="background-line"
                      x1={0}
                      x2={0}
                      y1={yScale(yAxisValues[yAxisValues.length - 1])}
                      // y2={height - margins.bottom}
                      y2={margins.top}
                    />
                    <AnimatedLine
                      className="tick-mark"
                      x1={0}
                      x2={0}
                      y1={height - margins.bottom}
                      y2={height - margins.bottom + 5}
                    />
                  </AnimatedGroup>
                ))
              }
            </AnimatedGroup>
            <AnimatedGroup className="annotations-container">
              {
                annotations
                  .filter(a => a.axis === 'x')
                  .map((annotation, annotationIndex) => {
                    const { start, end, label, labelPosition = 20 } = annotation;
                    const thatHeight = height - yScale(yAxisValues[yAxisValues.length - 1]) - margins.bottom;
                    const thatY1 = height - margins.bottom;
                    const thatY2 = yScale(yAxisValues[yAxisValues.length - 1]);
                    const x = xScale(start);
                    const maxWidth = Math.abs(height - x + margins.right);
                    return (
                      <AnimatedGroup className="annotation x-axis-annotation" key={annotationIndex}>
                        <AnimatedRect
                          x={x}
                          width={xScale(end) - xScale(start)}
                          height={thatHeight}
                          y={thatY2}
                          fill="url(#diagonalHatch)"
                          opacity={.4}
                        />
                        <AnimatedLine
                          x1={x}
                          x2={x}
                          y1={thatY1}
                          y2={thatY2}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <AnimatedLine
                          x1={xScale(end)}
                          x2={xScale(end)}
                          y1={thatY1}
                          y2={thatY2}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <AnimatedLine
                          x1={xScale(end) + 20}
                          x2={xScale(end) + 10}
                          y1={thatY2 + labelPosition - 5}
                          y2={thatY2 + labelPosition - 5}
                          stroke="grey"
                          markerEnd="url(#arrowhead)"
                        />
                        <AnimatedForeignObject
                          x={xScale(end) + 22}
                          y={thatY2 + labelPosition - 12}
                          width={maxWidth + 10}
                          height={height / 2}
                        >
                          <p
                              xmlns="http://www.w3.org/1999/xhtml"
                          >
                            {label}
                          </p>
                        </AnimatedForeignObject>
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

                      </AnimatedGroup>
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
                      <AnimatedGroup className="annotation y-axis-annotation" key={annotationIndex}>
                        <AnimatedRect
                          x={thatX1}
                          width={thatX2 - thatX1}
                          y={yScale(start)}
                          height={Math.abs(yScale(end) - yScale(start))}
                          fill="url(#diagonalHatch)"
                          opacity={.4}
                        />
                        <AnimatedLine
                          x1={thatX1}
                          x2={thatX2}
                          y1={yScale(start)}
                          y2={yScale(start)}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <AnimatedLine
                          x1={thatX1}
                          x2={thatX2}
                          y1={yScale(end)}
                          y2={yScale(end)}
                          stroke="grey"
                          opacity={.4}
                          strokeDasharray={'4,2'}
                        />
                        <AnimatedLine
                          x1={thatX1 + labelPosition - 5}
                          x2={thatX1 + labelPosition - 5}
                          y1={yScale(start) - 15}
                          y2={yScale(start) - 5}
                          stroke="grey"
                          markerEnd="url(#arrowhead)"
                        />
                        <AnimatedText
                          x={thatX1 + labelPosition}
                          y={yScale(start) - 10}
                          fontSize={'.5rem'}
                          fill="grey"
                        >
                          {label}
                        </AnimatedText>
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

                      </AnimatedGroup>
                    )
                  })
              }
            </AnimatedGroup>
            <AnimatedGroup className="lines-container">
              {
                groups.map(([groupName, items], groupIndex) => {
                  const color = colorPalette && groupName ? colorPalette[groupName] : generic.dark;
                  return (
                    <AnimatedGroup key={groupName}>
                      {
                        items.map((item, itemIndex) => {
                          let next;
                          let consecutive;
                          const hasNext = itemIndex < items.length - 1;
                          if (hasNext) {
                            next = items[itemIndex + 1];
                            consecutive = +item[x.field] + 1 === +next[x.field];
                          }
                          return (
                            <>
                              {
                                (hasNext && fillGaps)
                                  || (hasNext && consecutive && +item[y.field] && +next[y.field])
                                  ?
                                  <AnimatedLine
                                    className="chart-line"
                                    x1={xScale(item[x.field])}
                                    x2={xScale(next[x.field])}
                                    y1={yScale(item[y.field])}
                                    y2={yScale(next[y.field])}
                                    style={{ stroke: color }}
                                    key={`${itemIndex}-line`}
                                  />
                                  : null
                              }
                              {
                                +item[y.field] !== 0 ?
                                  <AnimatedGroup 
                                    className="data-dot-container"
                                    key={`${itemIndex}-group`}
                                  >
                                    <AnimatedCircle
                                      className="data-dot"
                                      fill={color}
                                      r={height / 200}
                                      cx={xScale(item[x.field]) || 0}
                                      cy={yScale(item[y.field]) || 0}
                                    />
                                    <AnimatedCircle
                                      className="data-dot-big"
                                      fill={color}
                                      r={5}
                                      cx={xScale(item[x.field]) || 0}
                                      cy={yScale(item[y.field]) || 0}
                                    />
                                    <AnimatedCircle
                                      fill={'transparent'}
                                      r={5}
                                      cx={xScale(item[x.field]) || 0}
                                      cy={yScale(item[y.field]) || 0}
                                      data-tip={tooltip ? tooltip(item) : undefined}
                                      data-for="line-tooltip"
                                    />
                                  </AnimatedGroup>
                                  : null
                              }
                            </>
                          )
                        })
                      }
                    </AnimatedGroup>
                  );
                })
              }
            </AnimatedGroup>
          </svg>
          {
            color ?
              <div
                className="ColorLegend"
                ref={legendRef}
                style={{
                  top: headersHeight + margins.top
                }}
              >
                <h5>{color.title || legendTitle}</h5>
                <ul className="color-legend">
                  {
                    Object.entries(colorPalette)
                      .map(([genre, color], genreIndex) => (
                        <li
                          key={genre}
                        >
                          <span className="color-box"
                            style={{ background: color }}
                          />
                          <span className="color-label">
                            {genre}
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
      <Tooltip id="line-tooltip" />
    </>
  )
}
export default LineChart;