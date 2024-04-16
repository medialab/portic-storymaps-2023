import { max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { range, uniq } from "lodash";
import translate from "../../utils/translate";

// category,nb_steps,tonnage,count

export default function StyleViz({
  width,
  height,
  data,
  title,
  color,
  tonnageValues,
  legendStep,
  id,
  highlightedTonnage,
  setHighlightedTonnage,
  highlightedCategory,
  setHighlightedCategory,
  highlightedSteps,
  setHighlightedSteps,
  lang,
}) {
  const titleHeight = 60;
  const sideWidth = width / 4 < 20 ? 20 : width / 4;
  const bottomHeight = height / 4 < 20 ? 20 : height / 4;
  const matrixWidth = width - sideWidth * 2;
  const matrixHeight = height - titleHeight - bottomHeight;
  const stepsRange = range(1, 10);
  const stepsData = data.reduce((res, item) => ({
    ...res,
    [item.nb_steps]: res[item.nb_steps] + (+item.count)
  }), stepsRange.reduce((r, s) => ({ ...r, ['' + s]: 0 }), {}));
  const tonnageData = data.reduce((res, item) => ({
    ...res,
    [item.tonnage]: res[item.tonnage] + item.count
  }), Object.keys(tonnageValues).reduce((r, s) => ({ ...r, [s]: 0 }), {}));
  const numberOfRows = 9;
  const axisStep = 5;
  const numberOfColumns = Object.keys(tonnageValues).length;
  const cellWidth = matrixWidth / numberOfColumns;
  const cellHeight = matrixHeight / numberOfRows;
  const barsWidth = matrixHeight / (numberOfRows * 2);
  const yBarScale = scaleLinear().domain([0, max(Object.values(stepsData))]).range([0, sideWidth - axisStep * 2])
  const xBarScale = scaleLinear().domain([0, max(Object.values(tonnageData))]).range([0, bottomHeight - axisStep * 10])


  const maxRadius = max([cellWidth, cellHeight]) / 2;
  const maxArea = Math.PI * maxRadius * maxRadius;
  const maxCount = max(data.map(d => d.count));
  const areaScale = scaleLinear().domain([0, maxCount]).range([0, maxArea]);

  const numberOfLegendObjects = parseInt(maxCount / legendStep);
  const legendObjectsValues = range(legendStep, legendStep * numberOfLegendObjects, legendStep);
  // const legendCellHeight =  (matrixHeight - cellHeight * 3) / 7 * 1.2;
  let legendObjectOffset = cellHeight * 1.8;
  return (
    <div 
      className={`StyleViz ${highlightedCategory ? highlightedCategory === id ? 'is-highlighted': 'is-shadowed' : ''}`}
      onMouseEnter={() => setHighlightedCategory(id)}
          onMouseLeave={() => setHighlightedCategory()}
    >
      <h4 style={{ height: titleHeight / 2 }}>{title}</h4>
      <svg
        width={width}
        height={matrixHeight + sideWidth}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke={'transparent'}
          fill={'transparent'}
          
        />
        <g className="axis-container">
          {
            Object.keys(stepsData)
              .map((nb_steps) => {
                const y = cellHeight * (9 - nb_steps);
                return (
                  <g key={nb_steps} className="axis-group y-axis">
                    <line
                      stroke="grey"
                      strokeDasharray={'2,2'}
                      x1={sideWidth}
                      x2={sideWidth + matrixWidth - cellWidth / 2}
                      y1={y + cellHeight / 2}
                      y2={y + cellHeight / 2}
                    />
                    <line
                      stroke="grey"
                      x1={sideWidth - axisStep}
                      x2={sideWidth}
                      y1={y + cellHeight / 2}
                      y2={y + cellHeight / 2}
                    />
                    <text
                      fill="grey"
                      x={sideWidth - axisStep * 2}
                      y={y + cellHeight / 2 + axisStep}
                      textAnchor="end"
                      fontSize={axisStep * 2}
                    >
                      {nb_steps - 1}
                    </text>
                  </g>
                )
              })
          }
          <g transform={`translate(${sideWidth - axisStep * 5},${matrixHeight / 2})rotate(-90)`}>
            <text
              x={0}
              y={0}
              textAnchor="middle"
              fontSize={axisStep * 2}
              className="axis-title"
            >
              {translate('StylesNavigation', 'number-of-steps', lang)}
            </text>
          </g>
        </g>
        <g className="legend">
          <foreignObject
            x={axisStep}
            y={axisStep * 4}
            width={sideWidth - axisStep * 8}
            height={cellHeight * 3}
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="axis-title"
              style={{ fontSize: axisStep * 2 }}
            >
              {translate('StylesNavigation', 'number-of-travels', lang)}
            </div>
          </foreignObject>
          {
            legendObjectsValues
              .map((legendValue, index) => {
                // const cy = cellHeight * 2 + index * legendCellHeight + legendCellHeight / 2;
                const cy = legendObjectOffset;
                const cx = maxRadius;
                const area = areaScale(legendValue);
                const radius = Math.sqrt(area / Math.PI);
                legendObjectOffset += radius * 2 + axisStep * 2;
                return (
                  <g key={legendValue}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      stroke="grey"
                      strokeDasharray={'2,2'}
                      fill="transparent"
                    />
                    <text
                      x={maxRadius * 2}
                      y={cy + axisStep / 2}
                      fontSize={axisStep * 1.5}
                      fontStyle="italic"
                    >
                      {translate('StylesNavigation', 'travels-tick', lang, {count: legendValue})}
                    </text>
                  </g>
                )
              })
          }
        </g>
        {
          Object.entries(tonnageValues)
            .map(([tonnage, rank]) => {
              const x = sideWidth + rank * cellWidth + cellWidth / 2;
              return (
                <g
                  className="axis-group x-axis"
                  key={tonnage}
                >
                  <line
                    x1={x}
                    x2={x}
                    stroke="grey"
                    strokeDasharray={'2,2'}
                    y1={cellHeight / 2}
                    y2={matrixHeight}
                  />
                  <line
                    x1={x}
                    x2={x}
                    stroke="grey"
                    y1={matrixHeight}
                    y2={matrixHeight + axisStep}
                  />
                  <line
                    x1={x}
                    x2={x}
                    stroke="grey"
                    opacity={.2}
                    y1={matrixHeight}
                    y2={matrixHeight + axisStep * 8}
                  />
                  <g transform={`translate(${x + axisStep * .75}, ${matrixHeight + axisStep * 2})rotate(-90)`}
                  >
                    <text
                      x={0}
                      y={0}
                      textAnchor="end"
                      fill="grey"
                      fontSize={axisStep * 2}
                    >
                      {tonnage}
                    </text>
                  </g>
                </g>
              )
            })
        }
        <g transform={`translate(${sideWidth + cellWidth / 2},${matrixHeight + axisStep * 7})`}>
          <text
            x={0}
            y={0}
            fontSize={axisStep * 2}
            className="axis-title"
          >
            {translate('StylesNavigation', 'tonnage', lang)}
          </text>
        </g>
        <g
          className="bar-viz y-bar-viz"
          transform={`translate(${matrixWidth + sideWidth}, 0)`}
        >
          {
            Object.entries(stepsData)
              .map(([nb_steps, count]) => {
                const y = matrixHeight / 9 * (9 - nb_steps);
                const width = yBarScale(count);
                const textSize = (count + ' v.').length * axisStep * .7;
                const textOutside = textSize > width;
                return (
                  <g key={nb_steps}
                    data-for="styles-tooltip"
                    data-tip={translate('StylesNavigation', 'steps-bar-tooltip', lang, {count, nb_steps})}
                    // data-tip={`Durant les années de paix disponibles dans les données (1749, 1769, 1787, 1789), ${count} navires sont venus à Marseille en faisant ${nb_steps} étapes.`}
                    onMouseEnter={() => setHighlightedSteps(nb_steps)}
                    onMouseLeave={() => setHighlightedSteps()}
                    opacity={highlightedSteps && highlightedSteps !== nb_steps ? .3 : 1}
                  >
                    <rect
                      key={nb_steps}
                      x={2}
                      y={y + cellHeight / 2 - barsWidth / 2}
                      width={width}
                      height={barsWidth}
                      fill={color}
                    />
                    {
                      count > 0 ?
                        <g
                          transform={`translate(${textOutside ? width + axisStep : width - axisStep / 2}, ${y + cellHeight / 2 + axisStep * .5})`}
                        >
                          <text
                            fontSize={barsWidth / 2}
                            x={0}
                            y={0}
                            textAnchor={textOutside ? 'start' : 'end'}
                            fill={textOutside ? 'grey' : 'white'}
                          >
                            {translate('StylesNavigation', 'travels-minified', lang, {count})}
                          </text>
                        </g>
                        : null
                    }
                  </g>
                )
              })
          }
        </g>
        <g
          className="bar-viz x-bar-viz"
          transform={`translate(${sideWidth}, ${matrixHeight + axisStep * 8})`}
        >
          {
            Object.entries(tonnageData)
              .map(([tonnage, count]) => {
                const xRank = tonnageValues[tonnage];
                const x = matrixWidth / numberOfColumns * xRank;
                const height = xBarScale(count);
                const textSize = (count + ' v.').length * axisStep * .7;
                const textOutside = textSize > height;
                return (
                  <g key={tonnage}
                    data-for="styles-tooltip"
                    data-tip={translate('StylesNavigation', 'tonnage-bar-tooltip', lang, {count, tonnage})}
                    onMouseEnter={() => setHighlightedTonnage(tonnage)}
                    onMouseLeave={() => setHighlightedTonnage()}
                    opacity={highlightedTonnage && highlightedTonnage !== tonnage ? .3 : 1}
                  >
                    <rect
                      key={tonnage}
                      x={x + cellWidth / 2 - barsWidth / 2}
                      y={2}
                      width={barsWidth}
                      height={height}
                      fill={color}
                    />
                    {
                      count > 0 ?
                        <g
                          transform={`translate(${x + cellWidth / 2 + axisStep / 2}, ${textOutside ? height + axisStep : height - axisStep / 2})rotate(-90)`}
                        >
                          <text
                            fontSize={barsWidth / 2}
                            x={0}
                            y={0}
                            textAnchor={textOutside ? 'end' : 'start'}
                            fill={textOutside ? 'grey' : 'white'}
                          >
                            {count} v.
                          </text>
                        </g>
                        : null
                    }

                  </g>
                )
              })
          }
        </g>
        <g className="viz-objects">
          {
            data
              .sort((a, b) => {
                if (a.count > b.count) {
                  return -1;
                }
                return 1;
              })
              .map(({ tonnage, count, nb_steps }, index) => {
                const x = sideWidth + tonnageValues[tonnage] * cellWidth + cellWidth / 2;
                const y = (9 - nb_steps) * cellHeight + cellHeight / 2;
                const area = areaScale(count);
                const radius = Math.sqrt(area / Math.PI)
                let opacity = 1;
                if (highlightedTonnage && highlightedSteps) {
                  if (+highlightedTonnage === +tonnage && +highlightedSteps === +nb_steps) {
                    opacity = 1;
                  } else {
                    opacity = .3;
                  }
                } else if (highlightedTonnage) {
                  if (+highlightedTonnage === +tonnage) {
                    opacity = 1;
                  } else {
                    opacity = .3;
                  }
                } else if (+highlightedSteps) {
                  if (+highlightedSteps === +nb_steps) {
                    opacity = 1;
                  } else {
                    opacity = .3;
                  }
                }
                return (
                  <circle
                    key={index}
                    fill={color}
                    cx={x}
                    cy={y}
                    r={radius}
                    stroke="white"
                    data-for="styles-tooltip"
                    opacity={opacity}
                    data-tip={translate('StylesNavigation', 'intersection-tooltip', lang, {count, tonnage, nb_steps})}
                    onMouseEnter={() => {
                      setHighlightedTonnage(tonnage);
                      setHighlightedSteps(nb_steps);
                    }}
                    onMouseLeave={() => {
                      setHighlightedTonnage();
                      setHighlightedSteps();
                    }}
                  />
                )
              })
          }
        </g>
      </svg>
    </div>
  )
}