import React from "react";

import HorizontalBarChart from './HorizontalBarChart';
import VerticalBarChart from './VerticalBarChart';

import './BarChart.scss';

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
 * 
 * @param {object} props.y
 * @param {string} props.y.field
 * @param {string} props.y.title
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
 * 
 * @param {function} props.tooltip
 * 
 * @returns {React.ReactElement} - React component
 */

export default function BarChart ({
  orientation = 'horizontal',
  ...props
}) {
  if (orientation === 'horizontal') {
    return <HorizontalBarChart {...props} />
  }
  return <VerticalBarChart {...props} />
}