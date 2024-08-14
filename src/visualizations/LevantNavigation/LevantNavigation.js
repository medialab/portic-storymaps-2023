import { geoPath } from "d3-geo";

import GeographicMapChart from '../../components/GeographicMapChart';
import { scaleLinear } from 'd3-scale';
import { useSpring, animated } from '@react-spring/web';
import ReactTooltip from 'react-tooltip';
import colorsPalettes from '../../utils/colorPalettes';

const { provinces: provincesPalette, marseilleColor } = colorsPalettes;

import './LevantNavigation.scss';
import { extent } from 'd3-array';
import { formatNumber } from '../../utils/misc';
import translate from "../../utils/translate";

const Provinces = ({
  data: inputData, projection, width, height
}) => {
  // const data = useMemo(() => {
  const data = inputData.features.filter(({ properties: { dominant, shortname } }) => dominant === 'Empire ottoman' ||
    ['Empire ottoman', 'reste Asie, Moyen-Orient et Océanie'].includes(shortname))
  // }, [inputData]);

  const project = geoPath().projection(projection);
  return (
    <g>
      {
        data.map((datum) => {
          const shortname = datum.properties.shortname;
          const id = shortname.split(' ').pop();
          let [centroidX, centroidY] = project.centroid(datum);
          if (shortname === 'Régence de Tripoli') {
            centroidY = projection([17, 31])[1];
          }
          if (shortname === 'Régence d\'Alger') {
            centroidY = projection([34, 34.5])[1];
          }
          if (shortname === 'Régence de Tunis') {
            centroidY += 22;
          }
          if (shortname === 'Empire ottoman') {
            const custom = projection([35, 39]);
            centroidX = custom[0]
            centroidY = custom[1]
          }
          return (
            <g key={id}>
              <path
                title={shortname}
                d={project(datum)}
                className="geopart dashed"
                fill={`url(#diagonalHatch`}
              />
              <text
                x={centroidX}
                y={centroidY}
                textAnchor="middle"
                fill="black"
                opacity={.8}
                fontStyle="italic"
                // stroke="white"
                fontWeight="bold"
                fontSize={shortname === "Empire ottoman" ? 25 : undefined}
              >
                {shortname}
              </text>
              <pattern id={`diagonalHatch`} patternUnits="userSpaceOnUse" width="4" height="4">
                <path
                  d="M-1,1 l2,-2
                M0,4 l4,-4
                M3,5 l2,-2"
                  style={{
                    stroke: '#019d2f',// provincesPalette['shortname'],
                    strokeWidth: 1
                  }}
                />
              </pattern>
            </g>
          )
        })
      }
    </g>
  )
}

export default function LevantNavigation({
  data: inputData,
  width,
  height,
  lang,
  callerProps = {},
  atlasMode,
}) {
  // const mapBgData = useMemo(() => inputData.get('map_backgrounds/intro_map.geojson'), [inputData]);
  const mapBgData = inputData.get('map_backgrounds/intro_map.geojson');
  // const data = useMemo(() => {
  const data = (inputData.get('navigation_depuis_levant.csv') || [])
      .map(d => ({
        ...d,
        ...['latitude', 'longitude', 'tonnage', 'count']
          .reduce((res, k) => ({ ...res, [k]: +d[k] }), {}),
      }))
      .sort((a, b) => {
        if (a.tonnage > b.tonnage) {
          return -1;
        }
        return 1;
      })
  // }, [inputData]);

  const maxCircleRadius = width / 50;
  const minCircleRadius = 2;
  const tonnageExtent = extent(data.map(d => d.tonnage));
  // const areaScale = useMemo(() =>
  const areaScale = scaleLinear()
      .domain(tonnageExtent)
      .range([Math.PI * minCircleRadius * minCircleRadius, Math.PI * maxCircleRadius * maxCircleRadius])
    // , [minCircleRadius, maxCircleRadius, data]);

  const gutter = 10;
  const MARSEILLE_COORDS = [43.34, 5.2158406];
  return (
    <>
      <GeographicMapChart
        {...{
          width,
          height,
          title: atlasMode ? translate('LevantNavigation', 'title', lang) : undefined,
          projectionTemplate: 'Levant',
          className: `LevantNavigation ${atlasMode ? 'is-atlas-mode' : ''}`,
          layers: [
            {
              type: 'custom',
              data: [],
              renderObjects: ({ width, height, projection }) => {
                const [x, y] = projection(MARSEILLE_COORDS.reverse());
                const bgColor = '#74ccf4';
                const { r } = useSpring({
                  from: {
                    r: width * .6
                    // r: width * .03
                  },
                  to: [{
                    r: width * .8
                  }, {
                    r: width * .6
                  }],
                  immediate: true,
                  loop: true,
                  config: {
                    duration: 2000
                  }
                });
                return (
                  <g className="background-halo">
                    <animated.circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill={'url("#background-halo")'}
                    />
                    <defs>
                      <radialGradient id="background-halo">
                        <stop offset="1%" opacity={'.6'} stopColor={bgColor} />
                        <stop offset="95%" stopColor="transparent" />
                      </radialGradient>
                    </defs>
                  </g>
                )
              }
            },
            {
              type: 'choropleth',
              data: mapBgData,
            },
            // {
            //   type: 'custom',
            //   data: mapBgData,
            //   renderObjects: (props) =>
            //     <Provinces {...props} />
            // },
            {
              type: 'custom',
              data: data,
              renderObjects: ({ projection }) => {
                const [marseilleX, marseilleY] = projection(MARSEILLE_COORDS);
                return (
                  <g>
                    {
                      data.map(({ port, latitude, longitude, tonnage, count }) => {
                        const [x, y] = projection([longitude, latitude]);
                        const area = areaScale(tonnage);
                        const radius = Math.sqrt(area / (Math.PI));
                        return (
                          <g
                            title={port}
                            className="port-object"
                            key={port}
                            transform={`translate(${x}, ${y})`}
                            data-for="levant-tooltip"
                            data-html="true"
                            data-tip={
                              translate('LevantNavigation', 'tooltip', lang, {
                                count,
                                port,
                                tonnage: formatNumber(tonnage)
                              })
                              // `Selon le registre des patentes de Marseille, <strong>${count}&nbsp;navires</strong> se sont rendus depuis le port de <strong>${port}</strong> vers port phocéen dans les sept années étudiées, pour un total estimé de <strong>${formatNumber(tonnage)} tonneaux</strong> cumulés.`
                            }
                          >
                            <circle
                              cx={0}
                              cy={0}
                              r={radius}
                              fill="#019d2f"
                              stroke="white"
                            />
                          </g>
                        );
                      })
                    }
                    {
                      data.map(({ port, latitude, longitude, tonnage, count }) => {
                        const [x, y] = projection([longitude, latitude]);
                        const area = areaScale(tonnage);
                        const radius = Math.sqrt(area / (Math.PI));
                        if (radius < 10) {
                          return;
                        }
                        return (
                          <g
                            title={port}
                            className="port-object-label"
                            key={port}
                            transform={`translate(${x}, ${y})`}

                          >

                            <text x={0} y={radius * 1.5} fontSize={radius * .8} textAnchor="middle">
                              {port}
                            </text>
                          </g>
                        );
                      })
                    }
                    <g transform={`translate(${marseilleX}, ${marseilleY})`}>
                      <rect
                        width={width / 50}
                        height={width / 50}
                        x={-width / 100}
                        y={-width / 100}
                        transform={'rotate(45)'}
                        fill={marseilleColor}
                        stroke="white"
                      />
                      <text fontSize={width / 100} fontStyle="italic" x={0} textAnchor="middle" y={height / 50 + 20}>
                        Marseille
                      </text>
                    </g>
                  </g>
                )
              }
            },
            {
              type: 'custom',
              renderObjects: (props) => {
                const squareSize = width / 10;
                const legendMaxTonnage = 40000;
                const legendMinTonnage = 20000;
                const areaMax = areaScale(legendMaxTonnage);
                const areaMin = areaScale(legendMinTonnage);
                const rMax = Math.sqrt(areaMax / Math.PI);
                const rMin = Math.sqrt(areaMin / Math.PI);
                const cMin = rMax * 2 - rMin;
                return (
                  <g className="legend" transform={`translate(${gutter}, ${height - rMax - gutter * 4})`}>
                    <foreignObject
                      x={0}
                      y={-gutter * 5}
                      width={rMax * 5}
                      height={rMax * 5}
                    >
                      <h4
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="legend-title"
                      >
                        {translate('LevantNavigation', 'legend-title', lang)}
                      </h4>
                    </foreignObject>
                    <circle
                      cx={rMax}
                      cy={rMax}
                      r={rMax}
                      fill="#019d2f"
                      fillOpacity={.1}
                      stroke="grey"
                      strokeDasharray="2,2"
                    />
                    <foreignObject
                      x={rMax * 2 + 3}
                      y={0}
                      width={rMax * 4}
                      height={rMax}
                    >
                      <p
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="legend-label"
                        style={{ fontSize: gutter }}
                      >
                        40 000 tx.
                      </p>
                    </foreignObject>

                    <foreignObject
                      x={rMax * 2 + 3}
                      y={rMax * 2 - rMin - gutter}
                      width={rMax * 4}
                      height={rMax}
                    >
                      <p
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="legend-label"
                        style={{ fontSize: gutter }}
                      >
                        20 000 tx.
                      </p>
                    </foreignObject>

                    <circle
                      cx={rMax}
                      cy={cMin}
                      r={rMin}
                      stroke="grey"
                      strokeDasharray="2,2"
                      fill="#019d2f"
                      fillOpacity={.1}
                    />

                    {/* <line
                      x1={rMax * 2 + gutter}
                      x2={rMax * 2 + gutter}
                      y1={cMin - rMin}
                      y2={rMax * 2}
                      stroke="grey"
                      markerStart={'url(#arrow-head-grey-start)'}
                      markerEnd={'url(#arrow-head-grey)'}
                    /> */}

                    <pattern id={`legendDiagonalHatch`} patternUnits="userSpaceOnUse" width="4" height="4">
                      <path
                        d="M-1,1 l2,-2
                M0,4 l4,-4
                M3,5 l2,-2"
                        style={{
                          stroke: 'grey',// provincesPalette['shortname'],
                          strokeWidth: 1
                        }}
                      />

                    </pattern>
                    <defs>
                      <marker id='arrow-head-grey' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
                        <path d='M0,0 V4 L2,2 Z' fill='grey' />
                      </marker>
                      <marker id='arrow-head-grey-start' orient='auto' markerWidth='10' markerHeight='6' refX='1' refY='2'>
                        <path d='M2,0 V4 L0,2 Z' fill='grey' />
                      </marker>
                    </defs>
                  </g>
                )
              }
            }

          ]
        }}
      />
      <ReactTooltip id="levant-tooltip" />
    </>
  )
}