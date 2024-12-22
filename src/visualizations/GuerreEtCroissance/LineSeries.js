import { range } from "lodash";

import './GuerreEtCroissance.scss';
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { formatNumber } from "../../utils/misc";
import translate from "../../utils/translate";

const MIN_YEAR = 1720;
const MAX_YEAR = 1790;

const LineSeries = ({
  width,
  height,
  data: inputData,
  xScale,
  yDomain: initialYDomain,
  seriesLabels,
  gutter,
  displayYTicks,
  activeYear,
  onSetActiveYear,
  tickFormat,
  lang,
  wars,
  circleRadius,
  id,
  unit = 'lt.'
}) => {
  if (!inputData || !inputData[0]) {
    return null;
  }
  const data = inputData.filter(d => d.value > 0)
  // .map(d => {
  //   let cleanSlope = 0;
  //   if (d.slope.length) {
  //     const part2 = d.slope.split(' ').pop();
  //     cleanSlope = +part2.split('%')[0]
  //   }
  //   return {
  //     ...d,
  //     cleanSlope,
  //   }
  // })
  let cleanSlope = 0;
  if (inputData[0].slope.length) {
    const part2 = inputData[0].slope.split(' ').pop();
    cleanSlope = +part2.split('%')[0]
  }
  const yDomain = initialYDomain || [0, max(inputData.map(d => max([d.value, +d.peace_reg_memory, +d.peace_reg])))];
  // const yDomain = initialYDomain || [0, max(data.map(d => d.value))];
  
  // console.log(yDomain, initialYDomain, max(data.map(d => max([d.value, +d.peace_reg_memory, +d.peace_reg]))), inputData)
  let yTickSpan = 50000000;
  if (yDomain[1] <= 10000) {
    yTickSpan = 500;
  } else if (yDomain[1] <= 1000000) {
    yTickSpan = 50000;
  } else if (yDomain[1] <= 5000000) {
    yTickSpan = 1000000;
  }
  const avgMem = data[0].avg_loss_mem.split(' ').pop().replace('memoire', '');
  let slope = data[0].slope.split(' ').pop();
  slope = lang === 'fr' ? slope : slope.replace('an', 'year')
  // const avgNoMem = data[0].avg_loss_no_mem.split(' ').pop().replace('memoire', '');

  const yAxisTickValues = range(yDomain[0], yDomain[1] + yTickSpan, yTickSpan);
  const yScale = scaleLinear().domain([yDomain[0], yAxisTickValues[yAxisTickValues.length - 1]]).range([height - gutter, gutter * 2]).nice();
  const endX = xScale(MAX_YEAR + gutter);
  let tickFontSize = width / 25;
  if (tickFontSize < 3) {
    tickFontSize = 3;
  }
  // const slopeExtent = extent(data.map(d => d.cleanSlope));
  // const slopeColorScale = scaleLinear().domain([-1.1, 3.5]).range(['red', 'green'])
  const slopeColorScale = scaleLinear().domain([-1.1, 3.5]).range(['lightgrey', '#336D7C']);
  const lossColorScale = scaleLinear().domain([-60, 60]).range(['#FEA43B', 'green']);

  if (id === "navigation") {
    console.log('in navigation', {slope, avgMem, data})
  }
  return (
    <g className="LineSeries">
      <rect x={0} y={gutter * 2} width={endX} height={height - gutter * 3} fill="rgba(0,0,0,0)" />
      {
        yAxisTickValues
          .map(value => {
            const y = yScale(value);
            return (
              <g key={value}
                className="axis-tick-group">
                <line
                  stroke="grey"
                  strokeDasharray={'2,2'}
                  x1={0}
                  x2={endX}
                  y1={y}
                  y2={y}
                />
                {
                  displayYTicks ?
                    <>
                      <line
                        x1={endX}
                        x2={endX + gutter / 4}
                        y1={y}
                        y2={y}
                        stroke="grey"
                      />

                      <text
                        x={endX + gutter / 2}
                        y={y + tickFontSize / 4}
                        fontSize={tickFontSize}
                      >
                        {tickFormat(value)}
                      </text>

                    </>
                    : null
                }

              </g>
            )
          })
      }
      <g className="wars">
        {
          wars.map(({ start, end, name }) => {
            const x1 = xScale(start);
            const x2 = xScale(end);
            return (
              <rect
                key={name}
                title={name}
                x={x1}
                y={gutter * 2}
                width={x2 - x1}
                height={height - gutter * 3}
                fill="url(#diagonalHatch)"
                opacity={.5}
                stroke="none"
              />
            )
          })
        }
      </g>
      {
        activeYear ?
          <line
            x1={xScale(activeYear)}
            x2={xScale(activeYear)}
            y1={gutter * 2}
            y2={height - gutter}
            stroke="black"
            strokeDasharray={'2,2'}
          />
          : null
      }
      {
        data
          .map(({ year: year1, value: value1 }, index) => {
            const next = data[index + 1];
            if (!next || next.year !== year1 + 1) {
              return null;
            }
            const { year: year2, value: value2 } = next;
            const x1 = xScale(year1);
            const y1 = yScale(value1);
            const x2 = xScale(year2);
            const y2 = yScale(value2);
            return (
              <line
                key={year1}
                stroke="grey"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            )
          })
      }
      {
        inputData
          .map(({ year: year1, peace_reg_memory: value1 }, index) => {
            const next = inputData[index + 1];
            if (!next) {
              return null;
            }
            const { year: year2, peace_reg_memory: value2 } = next;
            if (value1 === 0 || value2 === 0) {
              return null;
            }
            const x1 = xScale(year1);
            const y1 = yScale(value1);
            const x2 = xScale(year2);
            const y2 = yScale(value2);
            return (
              <line
                key={year1}
                stroke="red"
                strokeWidth={2}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            )
          })
      }

      {
        data
          .map(({ year, value }) => {
            const x = xScale(year);
            const y = yScale(value);
            const isActive = activeYear === year;
            return (
              <g key={year}>
                <circle
                  fill="transparent"
                  cx={x}
                  cy={y}
                  r={isActive ? width / data.length * 2 : width / data.length * 1}
                  onMouseEnter={() => onSetActiveYear(year)}
                  onMouseLeave={() => onSetActiveYear()}
                  data-for="guerre-tooltip"
                  data-tip={
                    translate('GuerreEtCroissance', 'tooltip', lang, {
                      year,
                      unit,
                      value: formatNumber(parseInt(value, lang)),
                      loss: formatNumber(parseInt(data.find(d => d.year === year, lang).peace_reg_memory))
                    })
                    // `En ${year}, valeur de ${formatNumber(parseInt(value, lang))} (perte de ${formatNumber(parseInt(data.find(d => d.year === year, lang).peace_reg_memory))})`
                  }
                />
                <circle
                  fill={isActive ? 'black' : "black"}
                  cx={x}
                  cy={y}
                  r={isActive ? circleRadius * 2 : circleRadius}
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            )
          })
      }
      {
        slope ?
          <foreignObject
            x={0}
            y={gutter * 2}
            height={height}
            width={xScale(1800)}
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="metrics-container"
              style={{
                fontSize: width / 15
              }}
            >
              <div 
                className="slope"
                style={{
                background: slopeColorScale(cleanSlope),
                color:'white'

                }}
              >
              {slope}
              </div>
              <div
                style={{
                  background: lossColorScale(+avgMem.split('%')[0]),
                  color:'white'
                }}
                // x={endX - gutter / 2}
                // y={0}
                // fontSize={tickFontSize * 1.5}
                // fontWeight="bold"
                // textAnchor="end"
                className="memory"
              >
                {(+avgMem.split('%')[0] > 0 ? '+' : '') + avgMem}
              </div>
            </div>
          </foreignObject>
          : null
      }
    </g>
  )
}
export default LineSeries;