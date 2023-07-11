import { useEffect, useMemo, useState } from "react";
import translate from "../../utils/translate";
import { scaleLinear } from "d3-scale";
import { formatNumber } from "../../utils/misc";
import { G, Path, Rect, Text } from '../../components/animatedPrimitives';

import colorsPalettes from "../../utils/colorPalettes";


import './ExportationsSudEst.scss';
import { max } from "d3-array";

const { provinces: provincesColors } = colorsPalettes;


export default function ExportationsSudEst({
  data: inputData,
  width,
  height,
  lang,
  callerProps = {}
}) {
  const {
    inconnu,
    colonies,
    relatif
  } = callerProps;


  const [showInconnu, setShowInconnu] = useState(inconnu !== undefined);
  const [showColonies, setShowColonies] = useState(colonies !== undefined);
  const [relativeScale, setRelativeScale] = useState(relatif !== undefined);

  useEffect(() => setShowInconnu(inconnu !== undefined), [inconnu])
  useEffect(() => setShowColonies(colonies !== undefined), [colonies])
  useEffect(() => setRelativeScale(relatif !== undefined), [relatif])

  // const data = useMemo(() => {
  // const cleanData = inputData
  const data = inputData
    .get('origins_for_marseille_exports.csv')
    .filter(d => (showInconnu ? true : d.origin !== 'inconnue') && (showColonies ? true : d.origin !== 'colonies'))
    .map(d => ({ ...d, value: +d.value }));

  // const marseilleOrigins = new Set(cleanData.filter(d => d.scope === 'Marseille').map(d => d.origin));
  // const filteredData = cleanData.filter(({origin}) => marseilleOrigins.has(origin));
  //   return cleanData // filteredData;
  // }, [inputData, showInconnu, showColonies]);

  const nationalSum = //useMemo(() =>
    data.filter(({ scope }) => scope === 'France')
      .reduce((sum, { value }) => sum + value, 0)
  // , [data]);
  const localSum = //useMemo(() =>
    data.filter(({ scope }) => scope === 'Marseille')
      .reduce((sum, { value }) => sum + value, 0)
  // , [data]);
  const gutter = 5;
  const barHeight = gutter * 2;

  const bottomBarsY = height * .6;
  const topBarsY = height * .33;
  const labelsZoneWidth = width > 300 ? 200 : width / 4;
  const rightGutter = width > 300 ? 100 : width / 8;
  const minLabelFontSize = 6;
  const maxLabelFontSize = 14;


  const nationalBarWidthScale = useMemo(() => scaleLinear().domain([0, nationalSum]).range([0, width - labelsZoneWidth - rightGutter]), [nationalSum, width, labelsZoneWidth, rightGutter]);
  const localBarWidthScale = useMemo(() => scaleLinear().domain([0, localSum]).range([0, width - labelsZoneWidth - rightGutter]), [localSum, width, labelsZoneWidth, rightGutter]);
  const nationalFontScale = useMemo(() => scaleLinear().domain([0, max(data.filter(({ scope }) => scope === 'France').map(d => d.value))]).range([minLabelFontSize, maxLabelFontSize]), [nationalSum, width]);
  const localFontScale = useMemo(() => scaleLinear().domain([0, max(data.filter(({ scope }) => scope === 'Marseille').map(d => d.value))]).range([minLabelFontSize, maxLabelFontSize]), [localSum, width]);

  // const {
  //   marseilleOriginsValuesMap,
  //   bottomBars
  // } = useMemo(() => {
  const items = data.filter(({ scope, origin }) => scope === 'Marseille').sort((a, b) => {
    if (['inconnue', 'colonies'].includes(a.origin)) {
      return 1;
    }
    if (['inconnue', 'colonies'].includes(b.origin)) {
      return -1;
    }
    if (a.value > b.value) {
      return -1;
    }
    return 1;
  });

  const valuesMap = items.reduce((res, datum, index) => ({
    ...res,
    [datum.origin]: datum.value
  }), {});

  // let xOffset = labelsZoneWidth +  (width - labelsZoneWidth) / 2 + nationalBarWidthScale(localSum) / 2;
  let xOffsetBottom = labelsZoneWidth// width - rightGutter;

  const computedBottom = items.map(({ value, origin }, i) => {
    let barWidth = relativeScale ? nationalBarWidthScale(value) : localBarWidthScale(value);
    if (barWidth < 2) {
      barWidth = 2;
    }
    // const barWidth = nationalBarWidthScale(value);
    xOffsetBottom += barWidth;
    let color;
    if (provincesColors[origin]) {
      color = provincesColors[origin];
    } else {
      color = i % 2 === 0 ? 'grey' : 'lightgrey';
    }
    return {
      label: origin,
      value,
      barWidth,
      color,
      x: xOffsetBottom - barWidth,
      y: bottomBarsY,
      barHeight,
    }
  });
  //   return {
  //     marseilleOriginsValuesMap: valuesMap,
  //     bottomBars: computed
  //   }
  // }, [data, width, relativeScale]);
  const marseilleOriginsValuesMap = valuesMap;
  const bottomBars = computedBottom;

  // const topBars = useMemo(() => {
  const topItems = data
    .filter(({ scope }) => scope === 'France')
    .sort((a, b) => {
      if (['inconnue', 'colonies'].includes(a.origin) && !['inconnue', 'colonies'].includes(b.origin)) {
        return 1;
      }
      if (['inconnue', 'colonies'].includes(b.origin) && !['inconnue', 'colonies'].includes(a.origin)) {
        return -1;
      }

      // if (marseilleOriginsValuesMap[a.origin] < marseilleOriginsValuesMap[b.origin]) {
      //   return 1;
      // }
      if (a.value < b.value) {
        return 1;
      }
      return -1;
    });
  let xOffsetTop = labelsZoneWidth;
  const topComputed = topItems.map(({ value, origin }, i) => {
    let barWidth = nationalBarWidthScale(value);
    if (barWidth < 2) {
      barWidth = 2;
    }
    xOffsetTop += barWidth;
    let color;
    if (provincesColors[origin]) {
      color = provincesColors[origin];
    } else {
      color = i % 2 === 0 ? 'grey' : 'lightgrey';
    }
    return {
      label: origin,
      value,
      barWidth,
      marseilleBarWidth: nationalBarWidthScale(marseilleOriginsValuesMap[origin] || 0),
      color,
      x: xOffsetTop - barWidth,
      y: topBarsY,
      barHeight
    }
  });
  const topBars = topComputed;
  // return computed;
  // }, [data, width, marseilleOriginsValuesMap]);

  // const links = useMemo(() => {
  //   const edges = [];
  const links = [];
  topBars.forEach(({
    label: topLabel,
    value: topValue,
    marseilleBarWidth: topBarWidth,
    color,
    x: topX,
    y: topY,
    barHeight: topBarHeight
  }) => {
    bottomBars.forEach(({
      label: bottomLabel,
      value: bottomValue,
      barWidth: bottomBarWidth,
      x: bottomX,
      y: bottomY,
      // barHeight: bottomBarHeight
    }) => {
      if (topLabel === bottomLabel) {
        links.push({
          // edges.push({
          x1: topX + topBarWidth / 2,
          y1: topY + topBarHeight * 1.5,
          x2: bottomX + bottomBarWidth / 2,
          color,
          y2: bottomY,
          value: bottomValue,
          label: topLabel,
        })
      }
    })
  })
  //   return edges;
  // }, [bottomBars, topBars])

  const titleTop = translate('exportations-sud-est', 'title-top', lang);
  const titleBottom = translate('exportations-sud-est', 'title-bottom', lang);

  return (
    <svg
      className="ExportationsSudEst"
      width={width}
      height={height}
    >
      <foreignObject
        x={gutter}
        y={topBarsY - gutter * 2}
        width={labelsZoneWidth - gutter}
        height={labelsZoneWidth}
      >
        <h3
          xmlns="http://www.w3.org/1999/xhtml"
        >{titleTop}</h3>
      </foreignObject>
      <foreignObject
        x={gutter}
        y={bottomBarsY - gutter * 2}
        width={labelsZoneWidth - gutter}
        height={labelsZoneWidth}
      >
        <h3
          xmlns="http://www.w3.org/1999/xhtml"
        >{titleBottom}</h3>
      </foreignObject>

      <g className="top-bars">
        {
          topBars.map(({
            label,
            color,
            value,
            x,
            y,
            barHeight,
            barWidth,
            marseilleBarWidth
          }) => {
            return (
              <g
                key={label}
              >
                <Rect
                  {
                  ...{
                    x,
                    y,
                    fill: color,
                    width: barWidth - 1,
                    height: barHeight
                  }
                  }
                />
                {
                  marseilleBarWidth > 0 ?
                    <Rect
                      {
                      ...{
                        x,
                        y: y + barHeight + 1,
                        fill: color, // 'rgba(255,0,0,0.5)',
                        stroke: 'white',
                        width: marseilleBarWidth > 2 ? marseilleBarWidth : 2,
                        height: barHeight / 2
                      }
                      }
                    />
                    : null
                }

                {
                  barWidth > 5 ?
                    <G
                      transform={`translate(${x + barWidth / 2}, ${y - gutter})rotate(-45)`}
                    >
                      <Text
                        textAnchor="start"
                        x={0}
                        y={0}
                        fontSize={nationalFontScale(value)}
                      >
                        {label} ({formatNumber(parseInt(value))} lt.)
                      </Text>
                    </G>
                    : null
                }

              </g>
            )
          })
        }
      </g>

      <g className="bottom-bars">
        {
          bottomBars.map(({
            label,
            color,
            value,
            x,
            y,
            barWidth,
            barHeight,
          }) => {
            return (
              <G
                key={label}
                transform={`translate(${x}, ${y})`}
              >
                <Rect
                  {
                  ...{
                    x: 0,
                    y: 0,
                    fill: color,
                    stroke: 'white',
                    width: barWidth,
                    height: barHeight
                  }
                  }
                />
                {
                  barWidth > 3 ?
                    <G
                      transform={`translate(${barWidth / 2}, ${barHeight + gutter * 2})rotate(45)`}
                    >
                      <Text
                        textAnchor="start"
                        x={0}
                        y={0}
                        fontSize={localFontScale(value)}
                      >
                        {label} ({formatNumber(parseInt(value))} lt.)
                      </Text>
                    </G>
                    : null
                }

              </G>
            )
          })
        }
      </g>
      <g className="links-container">
        {
          links.map(({
            x1,
            x2,
            y1,
            y2,
            label,
            color
          }) => {
            const yMiddle = y1 + (y2 - y1) / 2;
            return (
              <Path
                key={label}
                stroke={color}
                fill='none'
                strokeDasharray={'2,2'}
                d={`
                M ${x1} ${y1}
                C ${x1} ${yMiddle}, ${x2} ${yMiddle}, ${x2} ${y2}
                `}
              />
            )
          })
        }
      </g>

      <foreignObject
        x={gutter}
        y={height * .8}
        width={width / 3}
        height={height * .25}
        className="controls-container"
      >
        <ul className="controls">
          <li>
            <input type="checkbox" checked={showInconnu} onClick={() => setShowInconnu(!showInconnu)} />
            <label>Afficher les origines inconnues</label>
          </li>
          <li>
            <input type="checkbox" checked={showColonies} onClick={() => setShowColonies(!showColonies)} />
            <label>Afficher les produits coloniaux</label>
          </li>
          <li>
            <input type="checkbox" checked={relativeScale} onClick={() => setRelativeScale(!relativeScale)} />
            <label>Mettre Marseille à l'échelle nationale</label>
          </li>
        </ul>
      </foreignObject>
    </svg>
  )
}