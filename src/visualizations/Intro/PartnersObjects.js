import { extent, max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { formatNumber } from "../../utils/misc";
import translate from "../../utils/translate";
import colorsPalettes from "../../utils/colorPalettes";

const {marseilleColor, genericObjectColor} = colorsPalettes;
const PartnersObjects = ({
  // data,
  projection,
  width,
  height,

  // mode = 'navigo_france',
  // mode = 'toflit18_world',
  dataScope = 'world',
  dataType = 'toflit18',
  // topPortsNumber = 10,
  data,
  // projectionTemplate,
  arrowSide,
  navigoWidthScale,
  navigoHeightScale,
  arrowsMargin,
  toflitAreaScale,
  lang,
}) => {
  // const arrowSide = 5;

  // const toflitAreaScale = useMemo(() => {
  //   const maxRadius = height * 0.03;
  //   const maxArea = Math.PI * maxRadius * maxRadius;
  //   return scaleLinear()
  //     .domain(extent(data.map(d => +d.toflit_value)))
  //     .range([1, maxArea])
  // }, [data, width, height]);

  // const navigoWidthScale = useMemo(() => {
  //   return scaleLinear()
  //     .domain(extent(data.map(d => +d.navigo_nb_ships)))
  //     .range([5, maxTriangleWidth])
  // }, [data, width, height]);
  // const navigoHeightScale = useMemo(() => {
  //   return scaleLinear()
  //     .domain(extent(data.map(d => +d.navigo_mean_tonnage)))
  //     .range([5, maxTriangleHeight])
  // }, [data, width, height]);

  // const arrowsMargin = width * height * 0.00005;


  return (
    <>{
      data.map((datum, index) => {
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

        if (['Naples'].includes(partner)) {
          labelPosition = 'right';
        }

        else if (dataType === 'navigo' && dataScope === 'france' && !['Rouen', 'Cap-Français'].includes(partner)) {
          labelPosition = 'left';
        }
        else if ([
          'Venise', 
          'Toulon',
      ].includes(partner)) {
          labelPosition = 'right';
        } else if ([
          // 'Flandre et autres états de l\'Empereur', 
          'Milanais, Toscane et Lucques',
          'Narbonne',
          'Montpellier',
          'Amiens',
        ].includes(partner)) {
          labelPosition = 'left';
        }

        const labelMargin = dataType === 'toflit18' ?
          radius + arrowsMargin / 10
          :
          max([triangleWidth, triangleHeight]) / 2 + arrowsMargin / 5;
        let tooltipText = '';
        if (dataType === 'toflit18') {
          if (dataScope === 'world') {
            // tooltipText = `La direction des fermes de Marseille a effectué un commerce total de ${formatNumber(parseInt(toflit_value, lang))} lt. avec le partenaire ${partner} en 1789.`
            tooltipText = translate('Intro', 'tooltip-trade-world', lang, {
              count: formatNumber(parseInt(toflit_value), lang),
              partner
            });
          } else {
            // tooltipText = `La direction des fermes de ${partner} a effectué un commerce total de ${formatNumber(parseInt(toflit_value, lang))} lt. en 1789.`
            tooltipText = translate('Intro', 'tooltip-trade-france', lang, {
              count: formatNumber(parseInt(toflit_value), lang),
              partner
            });
          }
        } else {
          if (dataScope === 'world') {
            // tooltipText = `${formatNumber(parseInt(navigo_nb_ships, lang))} voyages ont été effectués depuis les ports du partenaire ${partner} vers Marseille en 1789, pour un tonnage moyen de ${formatNumber(parseInt(navigo_mean_tonnage, lang))} tonneaux.`
            tooltipText = translate('Intro', 'tooltip-navigo-world', lang, {
              nb_ships: formatNumber(parseInt(navigo_nb_ships, lang)),
              tonnage: formatNumber(parseInt(navigo_mean_tonnage, lang)),
              partner
            });
          } else {
            // tooltipText = `${formatNumber(parseInt(navigo_nb_ships, lang))} voyages ont été effectués depuis le port de ${partner} en 1787, pour un tonnage moyen de ${formatNumber(parseInt(navigo_mean_tonnage, lang))} tonneaux.`
            tooltipText = translate('Intro', 'tooltip-navigo-france', lang, {
              nb_ships: formatNumber(parseInt(navigo_nb_ships, lang)),
              tonnage: formatNumber(parseInt(navigo_mean_tonnage, lang)),
              partner
            });
          }
        }
        if (partner === 'Marseille') {
          console.log('ok marseille', [latitude, longitude])
        }
        return (
          <g
            className="PartnersObject"
            transform={`translate(${x}, ${y})`}
            key={index}
            data-tip={tooltipText}
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
                    stroke={genericObjectColor}
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
              r={dataType === 'toflit18' ? radius : max([triangleWidth, triangleHeight]) / 2 + 5}
              fill={dataType === 'toflit18' ? partner === 'Marseille' ? marseilleColor : genericObjectColor : "rgba(0,0,0,0.07)"}
            />
            {
              dataType === 'navigo' &&
              <g
                transform={`translate(0,${triangleHeight / 5})`}
              >
                <path
                  d={`M ${-triangleWidth / 2} ${-triangleHeight / 2} L ${triangleWidth / 2} ${-triangleHeight / 2} L 0 ${triangleHeight / 2} Z`}
                  fill={partner === 'Marseille' ? marseilleColor : genericObjectColor}
                />
              </g>
            }
            <text
              x={labelPosition === 'right' ? labelMargin : -labelMargin}
              textAnchor={labelPosition === 'right' ? 'start' : 'end'}
              fontSize={width / 75}
              y={5}
              className="label"
              // fill="red"
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

          <path d={`M 0 0 L ${arrowSide} ${arrowSide / 2} L 0 ${arrowSide} z`} fill={genericObjectColor} />
        </marker>
      </defs>
    </>
  )
}

export default PartnersObjects;