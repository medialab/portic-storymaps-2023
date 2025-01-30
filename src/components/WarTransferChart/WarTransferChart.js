

import { range } from 'lodash';
import './WarTransferChart.scss';
import { mean } from 'd3-array';
import ReactTooltip from 'react-tooltip';
import translate from '../../utils/translate';
import { useMemo } from 'react';

export default function WarTransferChart({
  title,
  width,
  height,
  data,
  palette,
  lang,
}) {
  const gutter = 10;
  const topAxisHeight = gutter * 12;
  const legendHeight = 0; // gutter * 5;
  const sideWidth = width / 10 < 100 ? 100 : width / 10;
  const rowHeight = (height - topAxisHeight - legendHeight) / (data.length);

  // const rowMarginBottom = gutter * 4;
  const barHeight = gutter;
  const secondBarY = rowHeight / 2 - barHeight;

  const axisValues = range(0, 125, 25);

  const barsWidth = width - sideWidth * 2;

  return (
    <>
      <svg
        className="WarTransferChart"
        width={width}
        height={height}
      >
        <foreignObject

          x={sideWidth + gutter}
          y={gutter}
          width={width - sideWidth}
          height={topAxisHeight / 2}
        >
          <h3
            xmlns="http://www.w3.org/1999/xhtml"
            className="viz-title"
          >
            {title}
          </h3>
        </foreignObject>
        <g className="axis">
          {
            axisValues.map(value => {
              return (
                <g
                  key={value}
                  transform={`translate(${sideWidth + gutter + (value / 100) * barsWidth}, ${0})`}
                >

                  <line
                    x1={0}
                    x2={0}
                    y1={topAxisHeight}
                    y2={topAxisHeight + rowHeight * (data.length - .5)}
                    stroke="grey"
                    strokeDasharray={'2,2'}
                  />
                  <line
                    x1={0}
                    x2={0}
                    y1={topAxisHeight + rowHeight * (data.length - .5)}
                    y2={topAxisHeight + rowHeight * (data.length - .5) + gutter}
                    stroke="lightgrey"
                  />
                  <g transform={`translate(0, ${topAxisHeight + rowHeight * (data.length - .5) + gutter * 2})`}>
                    <text
                      x={0}
                      y={0}
                      fontSize={gutter}
                    >
                      {value}%
                    </text>
                  </g>
                </g>
              )
            })
          }
        </g>
        <g className="objects"
          transform={`translate(0, ${topAxisHeight})`}
        >
          {
            data.map(([peaceData, warData], coupleIndex) => {
              let offsetX = 0;
              const peaceVizData = peaceData.values.map(({ key, value }) => {
                const color = palette[key];
                const width = value * barsWidth;
                const x = offsetX;
                offsetX += width;
                return {
                  group: key,
                  value,
                  color,
                  width,
                  x,
                }
              });
              offsetX = 0;
              const warVizData = warData.values.map(({ key, value }) => {
                const color = palette[key];
                const width = value * barsWidth;
                const x = offsetX;
                offsetX += width;
                return {
                  group: key,
                  value,
                  color,
                  width,
                  x,
                }
              });

              const links = [];
              peaceVizData.forEach(({ group: group1, color, width: width1, x: x1, value: value1 }) => {
                warVizData.forEach(({ group: group2, width: width2, x: x2, value: value2 }) => {
                  if (group1 === group2) {
                    links.push(({
                      group: group1,
                      color,
                      values: [value1, value2],
                      points: [
                        [x1, barHeight],
                        [x1 + width1, barHeight],
                        [x2 + width2, secondBarY],
                        [x2, secondBarY],
                      ]
                    }))
                  }
                })
              });

              const translateLabel = useMemo(() =>
                (group) => {
                  switch(group) {
                    case 'neutre':
                      return translate('WarTransferChart', 'group-neutral', lang);
                    case 'France du Levant':
                      return translate('WarTransferChart', 'group-levant', lang);
                    case 'France du Ponant':
                      return translate('WarTransferChart', 'group-ponant', lang);
                    case 'en guerre allié de la France':
                      return translate('WarTransferChart', 'group-war-ally', lang);
                    case 'en guerre ennemi de la France':
                      return translate('WarTransferChart', 'group-war-ennemy', lang);
                    default:
                      return 'no translation for group :(';
                  }
                }
              , [])

              return (
                <g
                  key={coupleIndex}
                  transform={`translate(${gutter}, ${rowHeight * coupleIndex})`}
                >
                  <foreignObject
                    x={0}
                    y={0}
                    width={sideWidth}
                    height={rowHeight / 2}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      className="label"
                    >
                      <strong>{peaceData.year}</strong> <br />({translate('WarTransferChart', 'peace-year', lang)})
                    </div>
                  </foreignObject>
                  <g className="links-group" transform={`translate(${sideWidth}, ${0})`}>
                    {
                      links.map(({ group, color, points, values }, index) => {
                        let tooltip = translate('WarTransferChart', 'tooltip-peace', lang, {
                          start: peaceData.year,
                          end: warData.year,
                          group: translateLabel(group),
                          from: parseInt(values[0] * 100),
                          to: parseInt(values[1] * 100),
                        }) 
                        // `Entre ${peaceData.year} et ${warData.year}, le tonnage cumulé estimé des navires du groupe ${group} est passé de ${parseInt(values[0] * 100)}% à ${parseInt(values[1] * 100)}% de la navigation vers Marseille.`
                        if (group.includes('guerre')) {
                          // tooltip = `Entre ${peaceData.year} et ${warData.year}, le tonnage cumulé estimé des navires qui allaient devenir ${group} en ${warData.year} est passé de ${parseInt(values[0] * 100)}% à ${parseInt(values[1] * 100)}% de la navigation vers Marseille.`;
                          tooltip = translate('WarTransferChart', 'tooltip-war', lang, {
                            start: peaceData.year,
                            end: warData.year,
                            group,
                            from: parseInt(values[0] * 100),
                            to: parseInt(values[1] * 100),
                          }) 
                        }
                        return (
                          <g className="link-group"
                            data-for="transfer-tooltip"
                            data-tip={tooltip}
                            key={index}
                          >
                            <path
                              fill={color}
                              className="link"
                              stroke="none"
                              d={`M ${points[0][0]},${points[0][1]} ${points.slice(1).reduce((str, [x, y]) => `${str} L ${x}, ${y}`, '')} Z`}
                            />
                            {
                              values[0] > 0 && values[1] > 0 ?
                                <text
                                  x={mean(points.map(p => p[0]))}
                                  y={barHeight + (secondBarY) / 2}
                                  textAnchor={'middle'}
                                  fontSize={gutter}
                                >
                                  {(values[1] > values[0] ? '+' : '-') + parseInt(Math.abs(values[1] - values[0]) * 100)} pp
                                </text>
                                : null
                            }

                          </g>
                        )
                      })
                    }
                  </g>
                  <g
                    className="bars-group peace-bars-group"
                    transform={`translate(${sideWidth}, ${0})`}
                  >
                    {
                      peaceVizData.map(({ group, color, width, x, value }, index) => {
                        const prevLabelX = index > 0 ? peaceVizData[index - 1].x : undefined;
                        let labelX = 0;
                        if (prevLabelX && Math.abs(x - prevLabelX) < 10) {
                          labelX = 10;
                        }
                        return (
                          <g className="bar-group"
                            data-for="transfer-toltip"
                            key={index}
                            data-tip={`En ${peaceData.year}, le tonnage cumulé des navires ${group.includes('guerre') ? 'qui allaient devenir' : 'du groupe'} ${group} étant de ${parseInt(value * 100)}% de la navigation vers Marseille.`}
                          >
                            {
                              width > 0 ?
                                <g className="bar-label"
                                  transform={`translate(${x + labelX + width / 2}, ${-2})rotate(-45)`}

                                >
                                  <text x={0} y={0} fontSize={gutter}>
                                    {translateLabel(group)}
                                  </text>
                                </g>
                                : null

                            }

                            <rect
                              fill={color}
                              width={width}
                              height={barHeight}
                              x={x}
                              y={0}
                              stroke="white"
                              title={group}
                            />
                            <rect
                              fill={`url(#diagonalHatch)`}
                              width={width}
                              height={barHeight}
                              x={x}
                              y={0}
                              stroke="white"
                              title={group}
                            />
                          </g>
                        )
                      })
                    }
                  </g>
                  <g
                    className="bars-group war-bars-group"
                    transform={`translate(${sideWidth}, ${secondBarY})`}
                  >
                    {
                      warVizData.map(({ group, color, width, x, value }, index) => {
                        return (
                          <g className="bar-group"
                            data-for="transfer-toltip"
                            key={index}
                            data-tip={`En ${warData.year}, le tonnage cumulé des navires ${group.includes('guerre') ? 'provenant de pays' : 'du groupe'} ${group} étant de ${parseInt(value * 100)}% de la navigation vers Marseille.`}
                          >
                            <rect
                              key={group}
                              fill={color}
                              width={width}
                              height={barHeight}
                              x={x}
                              y={0}
                              stroke="white"
                              title={group}
                            />
                          </g>
                        )
                      })
                    }
                  </g>
                  <foreignObject
                    x={0}
                    y={secondBarY}
                    width={sideWidth}
                    height={rowHeight / 2}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      className="label"
                    >
                      <strong>{warData.year}</strong> <br />({translate('WarTransferChart', 'war-year', lang)})
                    </div>
                  </foreignObject>
                </g>
              )
            })
          }
        </g>

        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path
            d="M-1,1 l2,-2
                M0,4 l4,-4
                M3,5 l2,-2"
            style={{
              stroke: 'white',
              strokeWidth: 1
            }}
          />
        </pattern>

      </svg>
      <ReactTooltip id="transfer-tooltip" />
    </>
  )
}