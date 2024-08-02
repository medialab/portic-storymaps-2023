import { scalePow, scaleBand, scaleLinear } from "d3-scale";
import { range } from "lodash";
import { extent, max } from "d3-array";
import { useMemo, useRef, useState, useEffect } from "react";
import { axisPropsFromTickScale } from "react-d3-axis";
import cx from "classnames";

import ReactTooltip from "react-tooltip";

import colorsPalettes from "../../utils/colorPalettes";
import { fixSvgDimension } from "../../utils/misc";

/**
 * Improve the display of numbers
 * @param {string|number} str - the number to prettify
 * @returns {string}
 */
const prettifyValue = (str) => {
  const inted = Math.round(+str) + "";
  let finalStr = "";
  let count = 0;
  for (let i = inted.length - 1; i >= 0; i--) {
    const char = inted[i];
    count++;

    finalStr = char + finalStr;
    if (count === 3) {
      count = 0;
      finalStr = " " + finalStr;
    }
  }
  if (finalStr[0] === ",") {
    finalStr = finalStr.slice(1);
  }

  return finalStr;
};

/**
 * Displays a double diagram displaying a histogram and a linechart, with optional additional annotations
 * @param {array} data
 * @param {string} absoluteField
 * @param {string} shareField
 * @param {string} regressionField
 * @param {string} slopeField
 * @param {string} herfindhalField
 *
 * @param {number} width
 * @param {number} height
 * @param {string} axisLeftTitle
 * @param {string} axisRightTitle
 * @param {number} startYear
 * @param {number} endYear
 * @param {boolean} fillGaps - whether to display a line between two datapoints distant by more than one year
 * @param {function} barTooltipFn
 * @param {string} cityName
 * @param {array<number>} highlightYears
 * @param {string} title
 * @param {object} colorScaleMessages
 * @param {array<object>} annotations - in the form of {startYear: [int], endYear: [int], label: [string], row: [int], labelPosition: [string in ['left', 'right']]}
 * @param {object} margins - in the form {'left': [number],'right': [number],'top': [number],'bottom': [number]}
 * @returns {React.ReactElement} - React component
 */
const LongitudinalTradeChart = ({
  data: inputData,
  // fields: if null, viz will not show the corresponding data
  absoluteField,
  regressionField,
  shareField,
  slopeField,
  herfindhalField,

  width,
  height: wholeHeight,
  axisLeftTitle,
  axisRightTitle,
  regressionTitle,

  startYear,
  endYear,
  fillGaps,
  barTooltipFn,
  cityName,
  highlightYears,
  title,
  colorScaleMessages,
  annotations = [],
  margins,
}) => {
  const data = useMemo(
    () =>
      inputData.filter((d) => (+d.year >= startYear) & (+d.year <= endYear)),
    [startYear, endYear, inputData]
  );
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const [height, setHeight] = useState(wholeHeight);
  useEffect(() => {
    // handling ref updates to set the correct height
    setTimeout(() => {
      let newHeight = wholeHeight;
      if (headerRef && headerRef.current) {
        newHeight = wholeHeight - headerRef.current.offsetHeight;
        if (footerRef && footerRef.current) {
          newHeight -= footerRef.current.offsetHeight;
        }
      }
      setHeight(newHeight);
      ReactTooltip.rebuild();
    });
  }, [wholeHeight]);

  const yearsExtent = extent([...data.map((d) => +d.year), endYear]);
  const yearsEnumerated = range(...yearsExtent);
  const xBand = scaleBand()
    .domain([...yearsEnumerated, endYear, endYear + 1])
    .range([margins.left, width - margins.right])
    .padding(0.1);
  const herfindhalColorScale = scalePow()
    .domain(extent(data, (d) => +d[herfindhalField]))
    .range([colorsPalettes.generic.accent2, "grey"]);
  // const herfindhalOpacityScale = herfindhalColorScale.copy()
  // .range([1, 0.5])

  const yearDomain = xBand.domain().map((y) => +y);
  const yearTicks = yearDomain.filter((y) => y % 5 === 0);
  const yAbsoluteScale = scaleLinear()
    .domain([0, max(data, (d) => +d[absoluteField])])
    .nice()
    .range([height - margins.bottom, margins.top]);
  const yShareScale = scaleLinear()
    .domain([0, max(data, (d) => +d[shareField])])
    .nice()
    .range([height - margins.bottom, margins.top]);

  const { values: rightYAxisValues } = axisPropsFromTickScale(
    yAbsoluteScale,
    Math.round(height / 20)
  );
  let { values: leftYAxisValue } = axisPropsFromTickScale(
    yShareScale,
    Math.round(height / 20)
  );
  if (yShareScale.domain()[1] - yShareScale.domain()[0] <= 5) {
    leftYAxisValue = axisPropsFromTickScale(yShareScale, 5).values;
  }
  return (
    <div
      className={cx("LongitudinalTradeChart", {
        "has-highlights": highlightYears !== undefined,
      })}
    >
      <div className="chart-header" ref={headerRef}>
        <h3
          className="visualization-title"
          style={{ marginLeft: margins.left }}
        >
          {title}
        </h3>
        <div className="axis-headers-container">
          <div
            style={{
              background:
                axisLeftTitle && axisLeftTitle.length
                  ? colorsPalettes.generic.accent2
                  : undefined,
              marginLeft: margins.left,
            }}
            className="axis-header axis-header-left"
          >
            {axisLeftTitle}
          </div>
          {colorScaleMessages ? (
            <div className="color-scale-container">
              <div className="color-scale-detail">
                <div
                  className="bar"
                  style={{
                    background: `linear-gradient(to right, ${herfindhalColorScale(
                      herfindhalColorScale.domain()[0]
                    )}, ${herfindhalColorScale(
                      herfindhalColorScale.domain()[1]
                    )})`,
                  }}
                />
                <div className="labels">
                  <span>{colorScaleMessages.maximum}</span>
                  {/* <span>{colorScaleMessages.title}</span> */}
                  <span>{colorScaleMessages.minimum}</span>
                </div>
              </div>
            </div>
          ) : null}
          {regressionField && (
            <div
              style={{
                background: colorsPalettes.generic.dark,
              }}
              className="axis-header axis-header-center"
            >
              {regressionTitle || `Régression linéaire (log)`}
            </div>
          )}
          <div
            style={{
              background:
                axisRightTitle && axisRightTitle.length
                  ? colorsPalettes.generic.accent1
                  : undefined,
              marginRight: margins.right,
            }}
            className="axis-header axis-header-right"
          >
            {axisRightTitle}
          </div>
        </div>
      </div>
      <svg width={width} height={height}>
        <g className="axis axis-left">
          {leftYAxisValue.map((value) => {
            return (
              <g key={value} className="axis-group">
                <line
                  x1={margins.left * 0.8}
                  x2={margins.left}
                  y1={yShareScale(value)}
                  y2={yShareScale(value)}
                  stroke={colorsPalettes.generic.accent2}
                />
                <line
                  x1={margins.left}
                  x2={width - margins.right}
                  y1={yShareScale(value)}
                  y2={yShareScale(value)}
                  stroke={colorsPalettes.generic.accent2}
                  strokeDasharray={"2, 2"}
                  opacity={0.2}
                />
                <text
                  x={margins.left * 0.7}
                  y={yShareScale(value) + height / 100}
                  fill={colorsPalettes.generic.accent2}
                >
                  {Math.round(+value * 100) + "%"}
                </text>
              </g>
            );
          })}
        </g>
        <g className="axis axis-right">
          {rightYAxisValues.map((value) => {
            return (
              <g key={value} className="axis-group">
                <line
                  x1={xBand(yearTicks[0]) + xBand.bandwidth() / 2}
                  x2={xBand(yearTicks[yearTicks.length - 1])}
                  y1={yAbsoluteScale(value)}
                  y2={yAbsoluteScale(value)}
                  stroke={colorsPalettes.generic.accent1}
                  strokeDasharray={"4, 2"}
                  opacity={0.5}
                />
                <text
                  x={width - margins.right + 2}
                  y={yAbsoluteScale(value) + height / 100}
                  fill={colorsPalettes.generic.accent1}
                >
                  {value > 0 ? Math.round(value / 1000000) + "m livres t." : 0}
                </text>
              </g>
            );
          })}
        </g>
        <g className="axis axis-bottom">
          <line
            y1={height - margins.bottom}
            y2={height - margins.bottom}
            x1={xBand(yearTicks[0]) + xBand.bandwidth() / 2}
            x2={xBand(yearTicks[yearTicks.length - 1]) + xBand.bandwidth() / 2}
            stroke={"lightgrey"}
          />
          {yearTicks.map((year, i) => {
            const x = xBand(year) + xBand.bandwidth() / 2;
            const y = height - margins.bottom;
            return (
              <g
                key={year}
                className="axis-group"
                transform={`translate(${x}, ${y})`}
              >
                <line
                  x1={0}
                  x2={0}
                  y1={0}
                  y2={margins.bottom / 6}
                  stroke="grey"
                />
                <g
                  transform={`translate(${xBand.bandwidth() * 0.5}, ${
                    margins.bottom / 2
                  })`}
                >
                  <text fill="grey">{year}</text>
                </g>
              </g>
            );
          })}
        </g>
        <g className="annotations-container">
          {annotations
            .filter(
              ({ startYear: aStartYear, endYear: aEndYear }) =>
                aStartYear >= startYear && aEndYear <= endYear
            )
            .map((annotation, annotationIndex) => {
              const { startYear, endYear: initialEndYear } = annotation;
              const endYear = initialEndYear + 1;
              return (
                <g className="annotation" key={annotationIndex}>
                  <rect
                    x={xBand(startYear)}
                    width={xBand(endYear) - xBand(startYear)}
                    height={fixSvgDimension(
                      height - margins.top - margins.bottom
                    )}
                    y={margins.top}
                    fill="url(#diagonalHatch)"
                    opacity={0.4}
                  />
                  <line
                    x1={xBand(startYear)}
                    x2={xBand(startYear)}
                    y1={margins.top}
                    y2={height - margins.bottom}
                    stroke="grey"
                    opacity={0.4}
                    strokeDasharray={"4,2"}
                  />
                  <line
                    x1={xBand(endYear)}
                    x2={xBand(endYear)}
                    y1={margins.top}
                    y2={height - margins.bottom}
                    stroke="grey"
                    opacity={0.4}
                    strokeDasharray={"4,2"}
                  />
                  <pattern
                    id="diagonalHatch"
                    patternUnits="userSpaceOnUse"
                    width="4"
                    height="4"
                  >
                    <path
                      d="M-1,1 l2,-2
                          M0,4 l4,-4
                          M3,5 l2,-2"
                      style={{ stroke: "grey", opacity: 0.5, strokeWidth: 1 }}
                    />
                  </pattern>
                </g>
              );
            })}
        </g>

        {shareField && (
          <g className="bars-container">
            {data.map((d) => {
              return (
                <rect
                  key={d.year}
                  x={xBand(+d.year)}
                  y={yShareScale(d[shareField])}
                  width={xBand.bandwidth()}
                  height={fixSvgDimension(
                    yShareScale(0) - yShareScale(d[shareField])
                  )}
                  fill={
                    herfindhalField && d[herfindhalField]
                      ? herfindhalColorScale(+d[herfindhalField])
                      : colorsPalettes.generic.accent2
                  }
                  // opacity={herfindhalField && d[herfindhalField]
                  //         ? herfindhalOpacityScale(+d[herfindhalField])
                  //         : 1}
                  data-tip={
                    barTooltipFn
                      ? barTooltipFn(
                          d.year,
                          (d[shareField] * 100).toFixed(2),
                          cityName,
                          d[herfindhalField] &&
                            (+d[herfindhalField] || 0).toFixed(2)
                        ).replace(
                          "[colorBox]",
                          `<span style="display:inline-block;width: .8em;height:.8em;background:${herfindhalColorScale(
                            +d[herfindhalField] || 0
                          )}"></span>`
                        )
                      : undefined
                  }
                  data-for={cityName}
                  data-effect="solid"
                  data-html={true}
                  data-class="bar-tooltip"
                  data-place="left"
                  className={cx("graph-bar", {
                    "is-highlighted":
                      highlightYears && highlightYears.includes(+d.year),
                  })}
                />
              );
            })}
          </g>
        )}

        <g className="lines-container">
          {
            /* data points circles */
            data
              .sort((a, b) => {
                if (+a.year > +b.year) {
                  return 1;
                }
                return -1;
              })
              .filter((datum) => datum[absoluteField] !== "")
              .map((datum, index) => {
                const x = xBand(+datum.year) + xBand.bandwidth() / 2;
                const y = yAbsoluteScale(+datum[absoluteField]);
                return (
                  <>
                    <circle
                      key={index + "a"}
                      {...{
                        cx: x,
                        cy: y,
                        r: width * 0.005,
                      }}
                      fill={"transparent"}
                      data-tip={`${datum.year} : <strong>${prettifyValue(
                        +datum[absoluteField]
                      )}</strong> livres tournois.`}
                      data-for={cityName}
                      data-class="bar-tooltip"
                      data-html={true}
                    />
                    <circle
                      key={index + "b"}
                      {...{
                        cx: x,
                        cy: y,
                        r: 1.5,
                      }}
                      fill={colorsPalettes.generic.accent1}
                    />
                  </>
                );
              })
          }
          {data
            .sort((a, b) => {
              if (+a.year > +b.year) {
                return 1;
              }
              return -1;
            })
            .map((datum, index) => {
              const next = data[index + 1];
              if (
                index === data.length - 1 || fillGaps
                  ? false
                  : +next.year !== +datum.year + 1
              ) {
                return null;
              }
              if (!next) {
                return null;
              }
              const x1 = xBand(+datum.year) + xBand.bandwidth() / 2;
              const x2 = xBand(+next.year) + xBand.bandwidth() / 2;
              const y1 = yAbsoluteScale(+datum[absoluteField]);
              const y2 = yAbsoluteScale(+next[absoluteField]);

              const ratio =
                absoluteField && datum[absoluteField] && next[absoluteField]
                  ? +next[absoluteField] > +datum[absoluteField]
                    ? +next[absoluteField] / +datum[absoluteField] - 1
                    : -(1 - +next[absoluteField] / +datum[absoluteField])
                  : 0;
              return (
                <>
                  {/* ABSOLUTE VALUES */}
                  {absoluteField &&
                    datum[absoluteField] !== "" &&
                    next[absoluteField] !== "" && (
                      <line
                        key={datum.year}
                        {...{
                          x1,
                          x2,
                          y1,
                          y2,
                        }}
                        stroke={colorsPalettes.generic.accent1}
                        title={`${datum.year}-${next.year}`}
                        strokeWidth={2}
                        data-tip={`${datum.year} → <strong>${prettifyValue(
                          +datum[absoluteField]
                        )}</strong> livres tournois <br/>${
                          next.year
                        } → <strong>${prettifyValue(
                          +next[absoluteField]
                        )}</strong> livres tournois<br/><i>(${
                          ratio > 0 ? "+" : ""
                        }${Math.round(ratio * 100)}%)</i>`}
                        data-for={cityName}
                        data-class="bar-tooltip"
                        data-html={true}
                      />
                    )}
                  {/* REGRESSION LINE*/}
                  {regressionField &&
                    datum[regressionField] !== "" &&
                    next[regressionField] !== "" && (
                      <line
                        key={`${datum.year}_regression`}
                        {...{
                          x1,
                          x2,
                          y1: yAbsoluteScale(+datum[regressionField]),
                          y2: yAbsoluteScale(+next[regressionField]),
                        }}
                        stroke={colorsPalettes.generic.dark}
                        title={`${datum.year}-${next.year}`}
                        strokeWidth={2}
                        //TODO: add slopeField to props
                        data-tip={`Regression ${datum[slopeField]}`}
                        data-for={cityName}
                        data-class="bar-tooltip"
                        data-html={true}
                      />
                    )}
                </>
              );
            })}
        </g>

        <g className="annotations-container">
          {annotations
            .filter(
              ({ startYear: aStartYear, endYear: aEndYear }) =>
                aStartYear >= startYear && aEndYear <= endYear
            )
            .map((annotation, annotationIndex) => {
              const {
                startYear,
                endYear: initialEndYear,
                label,
                row = 0,
                labelPosition = "right",
              } = annotation;
              const endYear = initialEndYear + 1;
              return (
                <g className="annotation" key={annotationIndex}>
                  {labelPosition === "right" ? (
                    <>
                      <line
                        x1={xBand(endYear) + 20}
                        x2={xBand(endYear) + 10}
                        y1={margins.top + 7.5 + row * 20}
                        y2={margins.top + 7.5 + row * 20}
                        stroke="grey"
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={xBand(endYear) + 22}
                        y={margins.top + 10 + row * 20}
                        fontSize={".5rem"}
                        fill="grey"
                      >
                        {label}
                      </text>
                    </>
                  ) : (
                    <>
                      <line
                        x1={xBand(startYear) - 20}
                        x2={xBand(startYear) - 10}
                        y1={margins.top + 7.5 + row * 20}
                        y2={margins.top + 7.5 + row * 20}
                        stroke="grey"
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={xBand(startYear) - 22}
                        y={margins.top + 10 + row * 20}
                        fontSize={".5rem"}
                        textAnchor={"end"}
                        fill="grey"
                      >
                        {label}
                      </text>
                    </>
                  )}

                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="5"
                      markerHeight="5"
                      refX="0"
                      refY="2.5"
                      orient="auto"
                    >
                      <polygon
                        stroke="grey"
                        fill="transparent"
                        points="0 0, 5 2.5, 0 5"
                      />
                    </marker>
                  </defs>
                  <pattern
                    id="diagonalHatch"
                    patternUnits="userSpaceOnUse"
                    width="4"
                    height="4"
                  >
                    <path
                      d="M-1,1 l2,-2
                          M0,4 l4,-4
                          M3,5 l2,-2"
                      style={{ stroke: "grey", opacity: 0.5, strokeWidth: 1 }}
                    />
                  </pattern>
                </g>
              );
            })}
        </g>
      </svg>

      <ReactTooltip id={cityName} />
    </div>
  );
};
export default LongitudinalTradeChart;
