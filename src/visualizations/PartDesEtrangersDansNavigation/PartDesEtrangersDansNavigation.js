

import './PartDesEtrangersDansNavigation.scss';
import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import ReactTooltip from 'react-tooltip';
import {formatNumber} from '../../utils/misc';
import translate from '../../utils/translate';
import colorsPalettes from '../../utils/colorPalettes';

const {marseilleColor} = colorsPalettes;

const italians = ['Genoese', 'Savoyard', 'Venitian', 'Tuscan', 'Neapolitan', 'Carrara', 'Roman'];

export default function PartDesEtrangersDansNavigation({
  data: inputData,
  width,
  height,
  lang = 'fr'
}) {

// const flagToNationality = useMemo(() => ({
const flagToNationality = {
  'Genoese': 'gênois',
  'Venitian': 'vénitiens',
  'Tuscan': 'toscans',
  'Neapolitan': 'napolitains',
  'Carrara': 'carrarais',
  'Ragusan': translate('PartDesEtrangersDansNavigation', 'ragusois', lang),
  'Roman': 'romains',

  // 'Genoese': 'italiens',
  // 'Venitian': 'italiens',
  // 'Tuscan': 'italiens',
  // 'Neapolitan': 'italiens',
  // 'Carrara': 'italiens',
  // 'Roman': 'italiens',
  // 'Ragusan': 'italiens',

  'Spanish': translate('PartDesEtrangersDansNavigation', 'espagnols', lang),
  'unknown': translate('PartDesEtrangersDansNavigation', 'unknown', lang),
  'Jerusalemite': translate('PartDesEtrangersDansNavigation', 'jerusalemites', lang),
  'Monegasque': translate('PartDesEtrangersDansNavigation', 'monégasques', lang),
  'Savoyard': translate('PartDesEtrangersDansNavigation', 'savoyards', lang),
  'British': translate('PartDesEtrangersDansNavigation', 'britanniques', lang),
  'Dutch': translate('PartDesEtrangersDansNavigation', 'hollandais', lang),
  'Danish': translate('PartDesEtrangersDansNavigation', 'danois', lang),
  'Imperial Mediterranean': translate('PartDesEtrangersDansNavigation', 'imperiaux-mediterrannee', lang),
  // 'Imperial Mediterranean': 'impériaux de la méditerranée',
  'Swedish': translate('PartDesEtrangersDansNavigation', 'suédois', lang),
};
// }), [lang]);

  // const comparisonData = useMemo(() => inputData.get('share_of_strangers_1787_french_ports.csv')
  const comparisonData = (inputData.get('share_of_strangers_1787_french_ports.csv') || [])
    .map(d => ({ ...d, share_of_strangers: +d.share_of_strangers }))
    .sort((a, b) => {
      if (a.share_of_strangers > b.share_of_strangers) {
        return 1;
      }
      return -1;
    })
    // , [inputData]);
  // const marseilleData = useMemo(() => {
    const cleanData = (inputData.get('share_of_strangers_marseille_1789.csv') || [])
      .map(d => ({ ...d, tonnage: +d.tonnage, label: flagToNationality[d.flag] }))
      .filter(d => d.flag !== 'unknown')
    const reducedData = cleanData
      .reduce((res, item) => {
        let label = item.label;
        let flag = item.flag;
        if (italians.includes(item.flag)) {
          label = translate('PartDesEtrangersDansNavigation', 'italians', lang);
          flag = 'italians';
        }
        if (res[label]) {
          return {
            ...res,
            [label]: {
              ...item,
              tonnage: res[label].tonnage + item.tonnage,
              label,
              flag
            }
          }
        } else {
          return {
            ...res,
            [label]: {
              ...item,
              label,
              flag
            }
          }
        }
      }, {})
    const sortedData = Object.values(reducedData)
      .sort((a, b) => {
        if (a.tonnage > b.tonnage) {
          return -1;
        }
        return 1;
      })
    const marseilleData = sortedData;
  // }, [inputData]);

  const titlesHeight = 40;
  const comparisonLabelsHeight = 50;

  const sideWidth = width / 10;
  const vizSpaceWidth = width - sideWidth;

  const marseilleRowHeight = height * .2 < 100 ? 50 : height * .2;
  const comparisonRowHeight = height - marseilleRowHeight;
  const topBarHeight = comparisonRowHeight - titlesHeight - comparisonLabelsHeight;
  const comparisonCellWidth = (vizSpaceWidth / comparisonData.length);
  const topBarWidth = comparisonCellWidth / 2;
  const topAxisValues = [0, 25, 50, 75, 100];

  const comparisonRowTitle = translate('PartDesEtrangersDansNavigation', 'comparison-row-title', lang);
  const marseilleRowTitle = translate('PartDesEtrangersDansNavigation', 'marseille-row-title', lang);

  const marseilleSum = marseilleData.reduce((sum, { tonnage }) => sum + tonnage, 0);
  const marseilleScale = scaleLinear().domain([0, marseilleSum]).range([0, vizSpaceWidth]);
  const marseilleBandHeight = marseilleRowHeight / 3;
  let marseilleXOffset = 0;
  return (
    <>
      <svg
        className="PartDesEtrangersDansNavigation"
        width={width}
        height={height}
      >
        <g className="row top-row">
          <text className="row-title" x={sideWidth} y={titlesHeight / 2}>
            {comparisonRowTitle}
          </text>
          <g transform={`translate(${sideWidth}, ${titlesHeight})`}>
            {
              topAxisValues.map(value => {
                const y = topBarHeight - topBarHeight * value / 100;
                return (
                  <g key={value} transform={`translate(0, ${y})`}>
                    <line
                      x1={0}
                      x2={-5}
                      y1={0}
                      y2={0}
                      stroke="grey"
                    />
                    <line
                      x1={0}
                      x2={vizSpaceWidth - topBarWidth}
                      y1={0}
                      y2={0}
                      stroke="lightgrey"
                      strokeDasharray={'2,2'}
                    />
                    <text
                      fontSize={10}
                      y={5}
                      x={-10}
                      textAnchor="end"
                      fill="grey"
                    >
                      {value}%
                    </text>
                  </g>
                )
              })
            }
            {
              comparisonData
                .map(({ port, share_of_strangers }, index) => {
                  const x = index * comparisonCellWidth;
                  const secondBarHeight = topBarHeight * share_of_strangers;
                  return (
                    <g
                      key={port}
                      transform={`translate(${x}, 0)`}
                      data-for={'part-etrangers-tooltip'}
                      data-tip={
                        translate('PartDesEtrangersDansNavigation', 'top-barchart-tooltip', lang, {
                          share: (share_of_strangers * 100).toFixed(2),
                          port
                        })
                        // `En 1787, ${(share_of_strangers * 100).toFixed(2)}% du tonnage cumulé des navires partis du port de ${port} avaient un pavillon étranger.`
                      }
                    >
                      <rect
                        x={0}
                        y={0}
                        width={topBarWidth}
                        height={topBarHeight}
                        fill="lightgrey"
                        opacity={.5}
                        stroke="none"
                      />
                      <rect
                        x={0}
                        y={topBarHeight - secondBarHeight}
                        width={topBarWidth}
                        height={secondBarHeight}
                        fill={port === 'Marseille' ? marseilleColor : 'grey'}
                      />
                      <g transform={`translate(${topBarWidth/2 - 10}, ${topBarHeight + 10})rotate(45)`}>
                        <text
                          x={0}
                          y={0}
                          fontSize={comparisonLabelsHeight / 4}
                          fontWeight={port === 'Marseille' ? 'bold' : undefined}
                        >
                          {(port === 'Dunkerque' && lang === 'en' ? 'Dunkirk' : port) + (port === 'Marseille' ? ` (${translate('PartDesEtrangersDansNavigation', 'ins', lang)})` : '')}
                        </text>
                      </g>
                      {
                        port === 'Marseille' ?
                          <>
                            <line
                              y1={topBarHeight + comparisonLabelsHeight}
                              y2={comparisonRowHeight}
                              x1={topBarWidth / 2}
                              x2={topBarWidth / 2}
                              stroke="grey"
                              markerEnd={'url(#arrow-head)'}
                            />
                            <defs>
                              <marker id='arrow-head' orient='auto' markerWidth='20' markerHeight='12' refX='0.1' refY='2'>
                                <path d='M0,0 V4 L2,2 Z' fill='grey' />
                              </marker>
                            </defs>
                          </>
                          : null
                      }
                    </g>
                  )
                })
            }
          </g>
        </g>
        <g className="row bottom-row" transform={`translate(${0}, ${comparisonRowHeight})`}>
          <text className="row-title" x={sideWidth} y={marseilleRowHeight - marseilleBandHeight - titlesHeight / 2}>
            {marseilleRowTitle}
          </text>
          <g transform={`translate(${sideWidth}, ${marseilleRowHeight - marseilleBandHeight})`}>
            {
              marseilleData
                .map(({ flag, tonnage, label }) => {
                  const width = marseilleScale(tonnage);
                  const fontSize = marseilleBandHeight / 5;
                  marseilleXOffset += width;
                  return (
                    <g transform={`translate(${marseilleXOffset - width}, ${0})`}
                    data-for="part-etrangers-tooltip"
                          data-tip={
                            // `En 1789, un total de ${formatNumber(tonnage, lang)} tonneaux arrivant à Marseille a été pris en charge par des ${label} ((${parseInt(tonnage / marseilleSum * 100)}%) du total des étrangers).`
                            translate('PartDesEtrangersDansNavigation', 'top-row-tooltip', lang, {
                              tonnage: formatNumber(tonnage, lang),
                              label,
                              pct: parseInt(tonnage / marseilleSum * 100)
                            })
                        }
                       
                    >
                      <rect
                        x={0}
                        y={0}
                        width={width}
                        height={marseilleBandHeight}
                        stroke="white"
                        fill={marseilleColor}
                      />
                      <foreignObject
                        x={5}
                        y={marseilleBandHeight / 2 - fontSize}
                        width={width - 10}
                        height={marseilleBandHeight / 2}
                      >
                        <div
                          xmlns="http://www.w3.org/1999/xhtml"
                          style={{ fontSize: fontSize, color: 'white' }}
                          className="label"
                          data-for="part-etrangers-tooltip"
                          data-tip={
                            translate('PartDesEtrangersDansNavigation', 'bottom-row-tooltip', lang, {
                                tonnage: formatNumber(tonnage, lang),
                                label,
                                pct: parseInt(tonnage / marseilleSum * 100)
                            })
                            // `En 1789, un total de ${formatNumber(tonnage, lang)} tonneaux arrivant à Marseille a été pris en charge par des ${label} ((${parseInt(tonnage / marseilleSum * 100)}%) du total des étrangers).`
                          }
                        >
                          {label} ({parseInt(tonnage / marseilleSum * 100)}%)
                        </div>
                      </foreignObject>
                    </g>
                  )
                })
            }
          </g>
        </g>
      </svg>
      <ReactTooltip id="part-etrangers-tooltip" />
    </>
  )
}