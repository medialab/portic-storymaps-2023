import { sum } from 'lodash';
import React from 'react';
import { useSpring, animated } from 'react-spring'

import { fixSvgDimension, polarToCartesian, formatNumber } from '../../utils/misc';

import translate from '../../utils/translate';

/**
 * A plain animated circle
 * @param {number} cx 
 * @param {number}  cy 
 * @param {number} r 
 * @param {object} props
 * @returns {React.ReactElement} - React component 
 */
const Circle = ({
  cx: inputX,
  cy: inputY,
  r: inputR,
  ...props
}) => {
  const {
    cx,
    cy,
    r,
  } = useSpring({
    cx: fixSvgDimension(inputX),
    cy: fixSvgDimension(inputY),
    r: inputR
  })
  return (
    <animated.circle
      cx={cx}
      cy={cy}
      r={r}
      {...props}
    />
  )
}


/**
 * Displays a radarchart object
 * @param {string} color
 * @param {object} data - single data object
 * @param {object} axisIndexMap
 * @param {function} axisRankScale
 * @param {array<number>} center - 2D coordinates of center in pixels
 * @param {string} name
 * @param {function} radiusScale
 * @returns {React.ReactElement} - React component 
 */
const VisObject = ({
  lang,
  color,
  data,
  absoluteData,
  axisIndexMap,
  axisRankScale,
  center,
  name,
  radiusScale,
  isActive,
  isHidden,
  onMouseOver,
  onMouseOut,
}) => {
  const points = Object.entries(axisIndexMap)
  .map(([key, index]) => {
    const val = data[key] || 0;
    const r = radiusScale(val);
    const theta = axisRankScale(+index);
    const [xRaw, yRaw] = polarToCartesian(r, theta);
    const x = fixSvgDimension(xRaw + center[0]);
    const y = fixSvgDimension(yRaw + center[1]);
    return [x, y]
  })
  const {joinedPoints} = useSpring({
    joinedPoints: points.map(([x, y]) => `${x},${y}`).join(' ')
  });

  let tooltipValues = Object.entries(data);
  const sumOfParts = sum(tooltipValues.map(v => v[1]));
  tooltipValues = tooltipValues.map(([key, val]) => [key, val / sumOfParts])
  return (
    <g 
      className={`VisObject ${isActive ? 'is-active': ''} ${isHidden ? 'is-hidden' : ''}`}
      data-for="radar-tooltip"
      data-html={true}
      data-place="left"
      onMouseOver={() => onMouseOver(name)}
      onMouseOut={() => onMouseOut(name)}
      data-tip={`
      <p>
      ${name/* === 'Tous les bureaux' ? translate('viz-principale-partie-2', 'radar_tip_region', lang) : translate('viz-principale-partie-2', 'radar_tip_office', lang, { name: name })*/} :
      </p>
      <ol>
        ${
          tooltipValues
          .sort(([_key, portionA], [_key2, portionB]) => {
            if (portionA > portionB) {
              return -1;
            }
            return 1;
          })
          .map(([key, portion]) => `
            <li>
              <strong>${key}</strong> : <strong>${(portion * 100).toFixed(2)}% (${formatNumber(absoluteData[key])} lt)</strong>
            </li>
          `).join('\n')
        }
      </ol>
  `}
    >
      <animated.polygon
        points={joinedPoints}
        fill={color}
        fillOpacity={.2}
        stroke={color}
      />
      {
        points
        .map(([x, y], index) => {
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={1.5}
              fill={color}
            />
          )
        })
      }
    </g>
  )
}

export default VisObject;