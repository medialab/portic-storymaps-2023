import { extent, max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";
import { formatNumber } from "../../utils/misc";

const PartnersObjects = ({
  data,
  projection,
  width,
  height,
  mode = 'navigo_world',
  // mode = 'toflit18_world',
  // projectionTemplate
}) => {
  const arrowSide = 5;

  const visibleData = useMemo(() => {
    if (mode === 'toflit18_world') {
      return data.filter(datum => +datum.toflit_value > 0)
    } else if (mode === 'navigo_world') {
      return data.filter(datum => +datum.navigo_nb_ships > 0)
    }
    return data;
  }, [data, mode]);

  const toflitAreaScale = useMemo(() => {
    const maxRadius = width * height * 0.00007;
    const maxArea = Math.PI * maxRadius * maxRadius;
    return scaleLinear()
      .domain(extent(visibleData.map(d => +d.toflit_value)))
      .range([1, maxArea])
  }, [visibleData, width, height]);

  const maxTriangleWidth = width * 0.05;
  const maxTriangleHeight = height * 0.05;

  const navigoWidthScale = useMemo(() => {
    return scaleLinear()
      .domain(extent(visibleData.map(d => +d.navigo_nb_ships)))
      .range([1, maxTriangleWidth])
  }, [visibleData, width, height]);
  const navigoHeightScale = useMemo(() => {
    return scaleLinear()
      .domain(extent(visibleData.map(d => +d.navigo_mean_tonnage)))
      .range([5, maxTriangleHeight])
  }, [visibleData, width, height]);

  const arrowsMargin = width * height * 0.00005;


  return (
    <>{
      visibleData.map((datum, index) => {
        const {
          partner,
          toflit_value,
          navigo_nb_ships,
          navigo_mean_tonnage,
          latitude,
          longitude
        } = datum;

        const [originalX, originalY] = projection([+latitude, +longitude]);
        const area = toflitAreaScale(toflit_value);
        const radius = Math.sqrt((area / Math.PI));
        const triangleWidth = navigoWidthScale(+navigo_nb_ships)
        const triangleHeight = navigoHeightScale(+navigo_mean_tonnage)

        let x = originalX;
        let y = originalY;
        let arrowAngle;
        if (x - radius / 2 < 0) {
          x = radius + arrowsMargin;
          arrowAngle = 0;
        } else if (x + radius / 2 > width) {
          x = width - radius - arrowsMargin;
          arrowAngle = 180;
        }
        if (y - radius < 0) {
          y = radius + arrowsMargin;
          arrowAngle = 90;
        } else if (y + radius / 2 > height) {
          y = height - radius - arrowsMargin;
          arrowAngle = 270;
        }
        let labelPosition = 'right';
        if (x > width * .6) {
          labelPosition = 'left';
        }
        // specifics
        if (partner === "Asie") {
          arrowAngle = 225;
        }
        if (partner === "Amériques") {
          arrowAngle = -45;
        }

        if (['Venise'].includes(partner)) {
          labelPosition = 'right';
        } else if (['Flandre et autres états de l\'Empereur', 'Milanais, Toscane et Lucques'].includes(partner)) {
          labelPosition = 'left';
        }

        const labelMargin = mode.includes('toflit') ?
          radius + arrowsMargin / 10
          :
          max([maxTriangleWidth, maxTriangleHeight]) / 2 + arrowsMargin / 10;
        return (
          <g
            className="PartnersObject"
            transform={`translate(${x}, ${y})`}
            key={index}
            data-tip={`${partner} : ${formatNumber(parseInt(toflit_value))} lt.`}
            data-for="geo-tooltip"
          >
            {
              arrowAngle !== undefined ?
                <g
                  transform={`rotate(${arrowAngle})`}
                >
                  <line
                    x1={-radius - arrowsMargin / 5}
                    x2={-radius - arrowsMargin + 5}
                    y1={0}
                    y2={0}
                    stroke="red"
                    markerEnd="url(#arrow-end)"
                  />
                </g>
                :
                null
            }
            <circle
              className="invariant-circle"
              cx={0}
              cy={0}
              r={mode.includes('toflit') ? radius : max([maxTriangleHeight, maxTriangleWidth]) / 2}
              fill={mode.includes('toflit') ? "red" : "rgba(0,0,0,0.07)"}
            />
            {
              mode.includes('navigo') &&
              <g
                transform={`translate(0,${triangleHeight / 5})`}
              >
                <path
                  d={`M ${-triangleWidth / 2} ${-triangleHeight / 2} L ${triangleWidth / 2} ${-triangleHeight / 2} L 0 ${triangleHeight / 2} Z`}
                  fill="red"
                />
              </g>
            }
            <text
              x={labelPosition === 'right' ? labelMargin : -labelMargin}
              textAnchor={labelPosition === 'right' ? 'start' : 'end'}
              y={5}
              fill="red"
            >
              {partner}
            </text>

          </g>
        )
      })
    }
      <defs>
        <marker
          id="arrow-end"
          viewBox={`0 0 ${arrowSide} ${arrowSide}`}
          refX="0"
          refY={arrowSide / 2}
          // markerUnits="strokeWidth"
          markerWidth={arrowSide}
          markerHeight={arrowSide}
          orient="auto">

          <path d={`M 0 0 L ${arrowSide} ${arrowSide / 2} L 0 ${arrowSide} z`} fill="red" />
        </marker>
      </defs>
    </>
  )
}

export default PartnersObjects;