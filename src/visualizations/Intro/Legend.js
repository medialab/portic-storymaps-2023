import { max } from "d3-array";
import { formatNumber } from "../../utils/misc";
import translate from "../../utils/translate";


const Legend = ({
  dataType,
  width,
  navigoWidthScale,
  navigoHeightScale,
  // arrowsMargin,
  toflitAreaScale,
  arrowSide,
  dataScope,
  lang,
  // data

}) => {
  const margin = 5;
  const maxAreaValue = dataScope === 'france' ? 300000000 : 100000000; // max(data.map(d => +d.toflit_value));
  const minAreaValue = maxAreaValue / 2;
  const maxRadius = Math.sqrt((toflitAreaScale(maxAreaValue) / Math.PI));
  const minRadius = Math.sqrt((toflitAreaScale(minAreaValue) / Math.PI));
  const maxCircleCx = margin + maxRadius;
  const maxCircleCy = margin + maxRadius;
  const minCircleCy = maxCircleCy + minRadius / 2 - 1;

  const maxShips = dataScope === 'france' ? 5000 : 500;
  const maxTonnage = 200;
  const triangleWidth = navigoWidthScale(maxShips);
  const triangleHeight = navigoHeightScale(maxTonnage);

  const svgHeight = dataType === 'toflit18' ? maxCircleCx * 2 : triangleHeight * 3.75;

  return (
    <svg
      className={`Legend`}
      width={width}
      height={svgHeight}
    >
      {
        dataType === 'navigo' ?
          <>
             <line
              x1={0}
              x2={width * .75}
              y1={triangleHeight * 1.5}
              y2={triangleHeight * 1.5}
              className="background-line"
            />
            <line
              x1={0}
              x2={width * .75}
              y1={triangleHeight * 2}
              y2={triangleHeight * 2}
              className="background-line"
            />
            <line
              x1={0}
              x2={width * .75}
              y1={triangleHeight * 2.5}
              y2={triangleHeight * 2.5}
              className="background-line"
            />
            <line
              x1={0}
              x2={0}
              y1={triangleHeight * 1.25}
              y2={triangleHeight * 3.25}
              className="background-line"
            />
            <line
              x1={triangleWidth/2}
              x2={triangleWidth/2}
              y1={triangleHeight * 1.25}
              y2={triangleHeight * 3.25}
              className="background-line"
            />
            <line
              x1={triangleWidth}
              x2={triangleWidth}
              y1={triangleHeight * 1.25}
              y2={triangleHeight * 3.25}
              className="background-line"
            />
            <text
              x={0}
              y={triangleHeight}
              className={'legend-indicator'}
            >
              {translate('Intro', 'number-of-travels', lang)}
            </text>
            <line
              x1={0}
              x2={triangleWidth - arrowSide}
              y1={triangleHeight * 1.25}
              y2={triangleHeight * 1.25}
              className="legend-arrow"
              markerEnd="url(#legend-arrow-end)"
              markerStart="url(#legend-arrow-start)"
            />
            <line
              x1={0}
              x2={triangleWidth}
              y1={triangleHeight * 2.75 + arrowSide}
              y2={triangleHeight * 2.75 + arrowSide}
              className="legend-form"
            />
            <text
              x={triangleWidth + arrowSide}
              y={triangleHeight * 2.75 + arrowSide + 3}
              className="legend-indicator"
              
            >
              {
                translate('Intro', 'n-travels', lang, {count: formatNumber(maxShips, lang)})
              }
            </text>

            <line
              x1={0}
              x2={triangleWidth / 2}
              y1={triangleHeight * 3.25 + arrowSide}
              y2={triangleHeight * 3.25 + arrowSide}
              className="legend-form"
            />
            <text
              x={triangleWidth / 2 + arrowSide}
              y={triangleHeight * 3.25 + arrowSide + 3}
              className="legend-indicator"
              
            >
              {translate('Intro', 'n-travels', lang, {count: formatNumber(maxShips / 2, lang)})}
            </text>
            
            <line
              x1={triangleWidth + arrowSide}
              x2={triangleWidth + arrowSide}
              y1={triangleHeight * 1.5}
              y2={triangleHeight * 1.5 + triangleHeight - arrowSide}
              className="legend-arrow"
              markerEnd="url(#legend-arrow-end)"
              markerStart="url(#legend-arrow-start)"
            />
            <text
              x={triangleWidth + arrowSide * 2}
              y={triangleHeight * 2 + 3}
              className={'legend-indicator'}
            >
              {translate('Intro', 'mean-tonnage', lang)}
            </text>
            <g
              transform={`translate(${triangleWidth / 2},${triangleHeight * 2})`}
            >
              <path
                d={`M ${-triangleWidth / 2} ${-triangleHeight / 2} L ${triangleWidth / 2} ${-triangleHeight / 2} L 0 ${triangleHeight / 2} Z`}
                className="legend-form"
              />
            </g>
            <line
              x1={width * .5 + arrowSide}
              x2={width * .5 + arrowSide}
              y1={triangleHeight * 1.5}
              y2={triangleHeight * 1.5 + triangleHeight}
              className="legend-form"
            />
            <text
              x={width * .5 + arrowSide + arrowSide}
              y={triangleHeight * 1.5 + 9}
              className={'legend-indicator'}
            >
              {formatNumber(maxTonnage, lang)} tx.
            </text>
            <line
              x1={width * .75}
              x2={width * .75}
              y1={triangleHeight * 1.5}
              y2={triangleHeight * 1.5 + triangleHeight / 2}
              className="legend-form"
            />
            <text
              x={width * .75 + arrowSide}
              y={triangleHeight * 1.5 + 9}
              className={'legend-indicator'}
            >
              {formatNumber(maxTonnage / 2, lang)} tx.
            </text>
          </>
          :
          <>
            <circle
              className="legend-form"
              cx={maxCircleCx}
              cy={maxCircleCy}
              r={maxRadius}
            />
            <text
                x={maxCircleCx + maxRadius + width / 4 - 2}
                y={maxCircleCy - 3 - maxRadius / 2}
                className="legend-indicator"
              >
                {translate('Intro', 'total-trade', lang)}
                
              </text>
            <g
              transform={`translate(${maxCircleCx + maxRadius}, ${maxCircleCy - 3})`}
            >
              <line
                x1={width / 4}
                x2={arrowSide}
                y1={0}
                y2={0}
                className="legend-arrow"
                markerEnd="url(#legend-arrow-end)"
              />
              <text
                x={width / 4}
                y={3}
                className="legend-indicator"
              >
                {formatNumber(maxAreaValue, lang)} lt.
              </text>
            </g>
            <circle
              className="legend-form"
              cx={maxCircleCx}
              cy={minCircleCy}
              r={minRadius}
            />
            <g
              transform={`translate(${maxCircleCx + minRadius}, ${minCircleCy + 3})`}
            >
              <line
                x1={width / 4 + (maxRadius - minRadius)}
                x2={arrowSide}
                y1={0}
                y2={0}
                className="legend-arrow"
                markerEnd="url(#legend-arrow-end)"
              />
              <text
                x={width / 4 + (maxRadius - minRadius)}
                y={3}
                className="legend-indicator"
              >
                {formatNumber(minAreaValue, lang)} lt.
              </text>
            </g>
          </>
      }

      <defs>
      <marker
          id="legend-arrow-start"
          viewBox={`0 0 ${arrowSide} ${arrowSide}`}
          refX={0}
          refY={arrowSide / 2}
          // markerUnits="strokeWidth"
          markerWidth={arrowSide}
          markerHeight={arrowSide}
          orient="auto">

          <path
            d={`M ${arrowSide} ${0} L ${arrowSide} ${arrowSide} L ${0} ${arrowSide / 2} z`}
          />
        </marker>
        <marker
          id="legend-arrow-end"
          viewBox={`0 0 ${arrowSide} ${arrowSide}`}
          refX="0"
          refY={arrowSide / 2}
          // markerUnits="strokeWidth"
          markerWidth={arrowSide}
          markerHeight={arrowSide}
          orient="auto">

          <path
            d={`M 0 0 L ${arrowSide} ${arrowSide / 2} L 0 ${arrowSide} z`}
          />
        </marker>
      </defs>
    </svg>
  )
}

export default Legend;