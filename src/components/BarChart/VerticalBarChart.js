import React, { useRef, useState, useEffect, useMemo } from 'react';

import { scaleLinear } from 'd3-scale';
import { range, max } from 'd3-array';
import { groupBy } from 'lodash';
import { axisPropsFromTickScale } from 'react-d3-axis';
import Tooltip from 'react-tooltip';
import { uniq } from 'lodash';

import colorsPalettes from '../../utils/colorPalettes';
import { fixSvgDimension, generatePalette } from '../../utils/misc';

const { generic } = colorsPalettes;


/**
 * BarChart component - returns a <figure> containing a svg linechart
 * @param {Object} props
 * 
 * @param {array} props.data 
 * @param {string} props.title 
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
 * @param {boolean} props.y.formatLabel
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
 * 
 * @param {function} props.tooltip
 * 
 * @returns {React.ReactElement}
 */
const VerticalBarChart = ({
  data,
  title,
  layout = 'stack',
  width: initialWidth = 1200,
  height: initialHeight = 1200,
  color,
  y,
  x,
  tooltip,
  margins: inputMargins = {},
}) => {
  const [headersHeight, setHeadersHeight] = useState(0);
  const [legendWidth, setLegendWidth] = useState(0);


  const legendRef = useRef(null);
  const headerRef = useRef(null);

  const width = fixSvgDimension(initialWidth - legendWidth);
  const height = fixSvgDimension(initialHeight - headersHeight);

  useEffect(() => {
    Tooltip.rebuild();
  })

  useEffect(() => {
    setTimeout(() => {
      const newHeadersHeight = headerRef.current ? headerRef.current.getBoundingClientRect().height : 0;
      const newLegendWidth = legendRef.current ? legendRef.current.getBoundingClientRect().width : 0;
      setHeadersHeight(newHeadersHeight);
      setLegendWidth(newLegendWidth);
    })
  }, [width, height, color, data])
  const margins = {
    left: 100,
    top: 30,
    bottom: 20,
    right: 30,
    ...inputMargins
  };

  const {
    tickFormat: xTickFormat,
    tickSpan: xTickSpan,
    domain: initialXDomain,
    field: xField,
    sort: sortX = {}
  } = x;
  const {
    rowHeight: fixedRowHeight,
    formatLabel,
    field: yField,
    sort: sortY = {}
  } = y;
  const {
    field: sortYField = yField,
    autoSort = false,
    ascending: sortYAscending = true,
    type: sortYType,
  } = sortY;
  const {
    field: sortXField = xField,
    ascending: sortXAscending = true,
    type: sortXType = 'number'
  } = sortX;
  let colorPalette;
  let colorModalities;
  if (color) {
    colorModalities = uniq(data.map(d => d[color.field]))
  }
  if (color && color.palette) {
    colorPalette = color.palette;
    colorModalities = Object.entries(colorPalette).map(([id]) => id)
  } else if (color) {
    const colorValues = generatePalette(color.field, colorModalities.length);
    colorPalette = colorModalities.reduce((res, modality, index) => ({
      ...res,
      [modality]: colorValues[index]
    }), {})
  }
  let yValues = uniq(data.map(d => d[y.field]));
  let bandsNb = yValues.length;
  let vizHeight = (fixedRowHeight ? fixedRowHeight * (bandsNb) : height - headersHeight);

  let rowHeight = fixSvgDimension(fixedRowHeight || vizHeight / bandsNb);

  const groups = useMemo(() => 
    Object.entries(groupBy(data, d => d[y.field]))
    // sort groups
    .sort((a, b) => {
      if (!autoSort) {
        return 0;
      }
      const multiplier = sortYAscending ? 1 : -1;
      if (sortYField === y.field) {
        const aVal = sortYType === 'number' ? +a[0] : a[0];
        const bVal = sortYType === 'number' ? +b[0] : b[0];
        if (aVal < bVal) {
          return -1 * multiplier;
        }
        return 1 * multiplier;
      }
      const aVal = sortYType === 'number' ?
        +a[1].reduce((sum, datum) => sum + +datum[sortYField], 0)
        : a[1][sortYField];
      const bVal = sortYType === 'number' ?
        +b[1].reduce((sum, datum) => sum + +datum[sortYField], 0)
        : b[1][sortYField];
      if (aVal < bVal) {
        return -1 * multiplier;
      }
      return 1 * multiplier;
    })
    // sort items
    .map(([yModality, items]) => [
      yModality,
      items
      .sort((a, b) => {
        if (!autoSort) {
          // sort in the order of colorpalette
          if (colorModalities.indexOf(a[color.field]) > colorModalities.indexOf(b[color.field])) {
            return 1;
          }
          return -1;
        }
        const multiplier = sortXAscending ? 1 : -1;
        const aVal = sortXType === 'number' ? +a[sortXField] : a[sortXField];
        const bVal = sortXType === 'number' ? +b[sortXField] : b[sortXField];
        if (aVal > +bVal) {
          return -1 * multiplier;
        }
        return 1 * multiplier;
      })
    ])
  , [data, y, autoSort, sortYAscending, sortYField, sortYType, sortXAscending, sortXField, sortXType, color, colorModalities]);

  const xDomain = initialXDomain || (layout === 'stack' ?
    // stack -> max = max sum for a given x modality
    [0, max(
      groups.map(
        ([_groupName, values]) =>
          values.reduce((sum, datum) => sum + +(datum[x.field]), 0)
      )
    )
    ]
    :
    // group -> max = abs max
    [0, max(data.map(d => +d[x.field]))]);
  let bandHeight = layout === 'stack' ? rowHeight / 2 : (rowHeight / colorModalities.length) * .5;
  const xScale = scaleLinear().domain(xDomain).range([0, width - margins.left - margins.right]).nice();
  const xStackScale = xScale.copy().range([0, width - margins.left - margins.right]);

  let { values: xAxisValues } = axisPropsFromTickScale(xScale, 10);

  if (xTickSpan) {
    xDomain[0] = xDomain[0] - xDomain[0] % xTickSpan;
    xDomain[1] = xDomain[1] + xDomain[1] % xTickSpan;
    xAxisValues = range(xDomain[0], xDomain[1], xTickSpan);
    xScale.domain(xDomain);
  }
  const svgHeight = vizHeight + margins.top + margins.bottom;
  const finalHeight = initialHeight > (svgHeight + headersHeight) ? initialHeight : svgHeight + headersHeight;

  return (
    <>
      <figure style={{ width: initialWidth, height: finalHeight }} className="BarChart is-vertical GenericVisualization">
        <div ref={headerRef} className="row">
          {title ? <h5 className="visualization-title" style={{ marginLeft: margins.left }}>{title}</h5> : null}
        </div>
        <div className="row vis-row">
          <svg className="chart" width={width} height={svgHeight}>
            <g className="axis top-axis ticks">
              {
                xAxisValues.map((value, valueIndex) => (
                  <g
                    key={valueIndex}
                    transform={`translate(${margins.left + xScale(value)}, 0)`}
                  >
                    <text x={0} y={margins.top - 5}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value, valueIndex) : value}
                    </text>
                    <line
                      className="background-line"
                      x1={0}
                      x2={0}
                      y1={margins.top}
                      y2={vizHeight + margins.top}
                    />
                    <text x={0} y={svgHeight - margins.bottom + 10}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value, valueIndex) : value}
                    </text>
                  </g>
                ))
              }
            </g>
            <g className="bars-container">
              {
                groups
                  .map(([yModality, items], groupIndex) => {
                    let stackDisplaceX = margins.left;
                    return (
                      <g key={groupIndex} transform={`translate(0, ${margins.top + rowHeight * groupIndex})`}>
                        <foreignObject
                          x={0}
                          y={layout === 'stack' ? -bandHeight * 1.5 : (bandHeight) / 2 /* + bandHeight * (items.length / 2)*/}
                          width={margins.left}
                          height={rowHeight * 2}
                        >
                          <div className="vertical-bar-label">
                            <div>{typeof formatLabel === 'function' ? formatLabel(yModality, groupIndex) : yModality}</div>
                          </div>
                        </foreignObject>
                        {/* <text y={rowHeight / 2 + 5} className="vertical-bar-label" x={margins.left - 5}>
                          {typeof formatLabel === 'function' ? formatLabel(yModality, groupIndex) : yModality}
                        </text> */}
                        {
                          items
                            .map((item, itemIndex) => {

                              const thatY = layout === 'stack' ? bandHeight / 2 : itemIndex * ((rowHeight * .5) / items.length) + rowHeight / 4;
                              const thatWidth = layout === 'stack' ? xStackScale(+item[x.field]) : xScale(item[x.field]);
                              const thatX = layout === 'stack' ? stackDisplaceX : margins.left;
                              if (layout === 'stack') {
                                stackDisplaceX += thatWidth;
                              }
                              const thatColor = colorPalette ? colorPalette[item[color.field]] : generic.dark;
                              return (
                                <>
                                  {
                                    +item[x.field] > 0 ?
                                      <rect key={itemIndex}
                                        fill={thatColor}
                                        width={fixSvgDimension(thatWidth)}
                                        x={thatX}
                                        y={thatY}
                                        height={fixSvgDimension(bandHeight - 1)}
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
                      .map(([modality, color], modalityIndex) => (
                        <li
                          key={modalityIndex}
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

export default VerticalBarChart;