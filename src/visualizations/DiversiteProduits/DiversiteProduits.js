import { extent, mean } from "d3-array";
import { scalePow } from "d3-scale";
import { groupBy, range, uniq } from "lodash";
import { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";


const MIN_YEAR = 1749;
const MAX_YEAR = 1790;
export default function DiversiteProduits({
  data: inputData,
  width,
  height,
  atlasMode,
  callerProps = {}
}) {
  const {
    annee
  } = callerProps;
  const [highlightedYear, setHighlightedYear] = useState(annee);

  useEffect(() => setHighlightedYear(annee !== undefined && !isNaN(+annee) ? +annee : undefined), [annee]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [highlightedYear])

  const data = (inputData.get('herfindal-exports-marseille.csv') || []).map(d => ({ ...d, indice: +d.indice }));
  // const data = useMemo(() => inputData.get('herfindal-exports-marseille.csv').map(d => ({ ...d, indice: +d.indice })), [inputData])
  const years = range(MIN_YEAR, MAX_YEAR + 1);
  const groups = groupBy(data, d => d.direction);
  const means = Object.entries(groups)
    .reduce((res, [direction, dati]) => {
      return {
        ...res,
        [direction]: mean(dati.map(d => +d.indice))
      };
    }, {});
  const directions = Object.values(groups);
  const topPartHeight = 50;
  const labelsWidth = width / 10 < 100 ? 100 : width / 10;
  const rowHeight = (height - topPartHeight) / directions.length;
  const yearWidth = (width - labelsWidth - 10) / years.length;
  const rectHeight = rowHeight / 2;
  const legendRectWidth = height / 4;
  const dataExtent = extent(data.map(d => +d.indice))
  const hueScale = scalePow().domain(dataExtent).range([10, 20]); // 10;
  const saturationScale = scalePow().domain(dataExtent).range([100, 0]);
  const luminanceScale = scalePow().domain(dataExtent).range([25, 75]);
  return (
    <>
      <svg className={`DiversiteProduits ${atlasMode ? 'is-atlas-mode' : ''}`}
        width={width}
        height={height}
      >
        {
          years.map((year, index) => {
            const x = labelsWidth + yearWidth * index;
            return (
              <g className="year-group" transform={`translate(${x}, ${0})`}>
                <g transform={`translate(0, ${topPartHeight + rowHeight / 2 - rectHeight / 2 - 20})rotate(-45)`}>
                  <text
                    x={0}
                    y={0}
                    fontSize={width / 70}
                    fontWeight={year % 5 === 0 ? 'bold' : undefined}
                  >
                    {year}
                  </text>
                </g>
                <line
                  x1={0}
                  x2={0}
                  stroke="lightgrey"
                  strokeDasharray={'2,2'}
                  y1={topPartHeight + rowHeight / 2 - rectHeight / 2 - 10}
                  y2={height}
                />
              </g>
            )
          })
        }
        <g className="legend">
          <rect
            width={legendRectWidth}
            height={topPartHeight / 4}
            x={labelsWidth + (width - labelsWidth) / 2 - legendRectWidth / 2}
            y={0}
            fill={`url(#legend-gradient)`}
          />
          <text
            x={labelsWidth + (width - labelsWidth) / 2 - legendRectWidth / 2 - 5}
            y={topPartHeight / 4 - 2}
            fontSize={topPartHeight / 4}
            fill={`black`}
            fontWeight="800"
            textAnchor="end"
            fontStyle={'italic'}
          >
            commerce concentré
          </text>
          <text
            x={labelsWidth + (width - labelsWidth) / 2 + legendRectWidth / 2 + 5}
            y={topPartHeight / 4 - 2}
            fontSize={topPartHeight / 4}
            fill={`black`}
            fontWeight="800"
            fontStyle={'italic'}
          >
            commerce diversifié
          </text>
          
          <linearGradient id="legend-gradient">
            <stop offset="0%" opacity={'.6'} stopColor={`hsl(${hueScale.range()[1]}, ${saturationScale.range()[1]}%, ${luminanceScale.range()[1]}%)`} />
            <stop offset="100%" stopColor={`hsl(${hueScale.range()[0]},  ${saturationScale.range()[0]}%, ${luminanceScale.range()[0]}%)`} />
          </linearGradient>
        </g>
        {
          Object.entries(groups)
            .sort((a, b) => {
              if (a[0] === 'Marseille') {
                return 1;
              } else if (a[1] === 'Marseille') {
                return -1;
              }
              else if (means[a[0]] > means[b[0]]) {
                return -1;
              }
              else return 1;
            })
            .reverse()
            .map(([direction, yearsData], index) => {
              const y = topPartHeight + index * rowHeight;
              const yearsMap = yearsData.reduce((res, year) => ({ ...res, [year.year]: year.indice }), {});
              return (
                <g key={direction} transform={`translate(${0}, ${y})`}>
                  <text x={labelsWidth - 10} textAnchor="end" y={rowHeight / 2}>
                    {direction}
                  </text>
                  {
                    years.slice(0, years.length - 1)
                      .map(year => {
                        const val = yearsMap[year] || 0;
                        const saturationPct =  saturationScale(+val); // (1 - +val) * 100;
                        const luminancePct = luminanceScale(+val); // 25 + (+val / 2) * 100;
                        const hueVal = hueScale(+val);
                        const x = labelsWidth + (+year - MIN_YEAR) * yearWidth;
                        return (
                          <rect
                            key={year}
                            height={rectHeight}
                            width={yearWidth - 2}
                            x={x + 1}
                            y={rowHeight / 2 - rectHeight / 2}
                            stroke="none"
                            opacity={highlightedYear && highlightedYear !== year ? .1 : 1}
                            fill={val === 0 ? 'transparent' : `hsl(${hueVal} ${saturationPct}% ${luminancePct}%)`}
                            data-for="concentration-tooltip"
                            data-tip={val === 0 ? undefined : `En ${year}, la concentration des exports de la direction des fermes de ${direction} était de ${parseInt(+val * 100)}%.`}
                            onMouseEnter={() => val === 0 ? undefined : setHighlightedYear(year)}
                            onMouseLeave={() => setHighlightedYear()}
                          />
                        )
                      })
                  }
                </g>
              )
            })
        }
      </svg>
      <ReactTooltip id="concentration-tooltip" />
    </>
  )
}