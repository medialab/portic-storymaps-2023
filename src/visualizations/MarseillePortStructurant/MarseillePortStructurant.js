import { geoPath } from "d3-geo";
import ReactTooltip from 'react-tooltip';

import { scaleLinear } from 'd3-scale';
import { useSpring, animated } from '@react-spring/web';

import GeographicMapChart from '../../components/GeographicMapChart';


import colorsPalettes from '../../utils/colorPalettes';

const { provinces: provincesPalette } = colorsPalettes;

import './MarseillePortStructurant.scss';
import { min, max } from 'd3-array';

const labelsCoordinates = {
  "Saint-Laurent-de-la-Salanque": [42.75, 3.3],
  "Narbonne": [43, 3.3],
  "Collioure": [42.5, 3.5],
  "Agde": [43.1, 3.6],
  "Sète": [42.7, 4.2],
  "Aigues-Mortes": [43.3, 4.183333],
  "Saintes-Maries-de-la-Mer": [43, 4.42832],
  "Arles": [42, 4.628813],
  "Martigues": [43, 4.9],
  "Cassis": [43, 5.3],
  "Bandol": [42.7, 5.4],
  "Sanary-sur-Mer": [42.8, 5.8],
  "La Seyne": [42.8, 6.1],
  "Toulon": [42.3, 6.8],
  "Gapeau": [43, 6.3],
  "Bormes": [43, 6.6],
  "Saint-Tropez": [42.9, 7.2],
  "Fréjus": [43.3, 7.3],
  "Antibes": [43.583333, 7.4],
  "Ajaccio": [41.918584, 8.4],
  "Calvi": [42.57, 8.5],
  "Bonifacio": [41.383333, 9],
  "Bastia": [43, 9],
}

const MARSEILLE_COLOR = "red";
const Provinces = ({
  data: inputData, projection, width, height
}) => {
  // const data = useMemo(() => {
  const data = inputData.features.filter(({ properties: { shortname } }) => ['Roussillon', 'Languedoc', 'Provence', 'Isles de Corse'].includes(shortname))
  // }, [inputData]);

  const project = geoPath().projection(projection);
  return (
    <g>
      {
        data.map((datum, index) => {
          const shortname = datum.properties.shortname;
          const id = shortname.split(' ').pop();
          let [centroidX, centroidY] = project.centroid(datum);
          if (id === 'Languedoc') {
            centroidY += 80;
            centroidX -= 20;
          }
          if (id === 'Roussillon') {
            centroidY += 8;
            centroidX += 7;
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
              >
                {id}
              </text>
              <pattern id={`diagonalHatch`} patternUnits="userSpaceOnUse" width="4" height="4">
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
            </g>
          )
        })
      }
    </g>
  )
}

const MapObjects = ({
  data, projection, width, height
}) => {
  // const CENTER_COORDS = [41.3, 5.8];
  const CENTER_COORDS = [41.3, 5.2158406];
  const MARSEILLE_COORDS = [43.34, 5.2158406];
  const [marseilleX, marseilleY] = projection(MARSEILLE_COORDS.reverse())
  const [centerX, centerY] = projection(CENTER_COORDS.reverse());
  // const frameRadius = width * .2;
  // const objectsY = height * .8;
  // const vizData = useMemo(() => {
    const vizStart = width * .2;
    const vizEnd = width * .7;
    // const vizBandWidth = vizEnd - vizStart;
    const scaleWidth = scaleLinear().domain([min(data.map(d => d.count_total)), max(data.map(d => d.count_total))]).range([10, width * .07]);
    const vizData = data
    // return data
      .map(({
        count_total,
        latitude,
        longitude,
        ...props
      }, index) => {
        const [portX, portY] = projection([longitude, latitude]);
        const objectWidth = scaleWidth(count_total);
        const objectCoordinates = labelsCoordinates[props.port] || [longitude, latitude];
        const [objectX, objectY] = projection([objectCoordinates[1], objectCoordinates[0]])
        // objectXOffset += objectWidth;
        // const [relX, relY] = polarToCartesian(frameRadius, Math.PI * (index / data.length))
        // let {distance, radians} = cartesian2Polar(centerX - portX, centerY - portY);
        // if (radiansOffset !== undefined) {
        //   radians = radiansOffset;
        // }
        // console.log(count_total);
        // const [relX, relY] = polarToCartesian(frameRadius, radians);
        return {
          portX,
          portY,
          objectWidth,
          count_total,
          // objectX: objectXOffset - objectWidth,
          // objectY: objectsY - objectWidth / 2,
          // objectX: centerX - relX,
          // objectY: centerY - relY,
          objectX,
          objectY,
          ...props
        }
      })
  // }, [data, width, height])
  return (
    <g className="objects-container">
      {
        vizData
          .map(({
            port,
            province,
            ratio_to_marseille,
            count_total,
            portX,
            portY,
            objectWidth,
            objectX,
            objectY
          }) => {
            const color = provincesPalette[province] || 'grey';
            const fontSize = objectWidth / 3;
            return (
              <g className="port-object" key={port}
                data-for="structurant-tooltip"
                data-tip={`En 1789, ${count_total} navires sont partis du port de ${port}, dont ${parseInt(count_total * ratio_to_marseille)} (${parseInt(ratio_to_marseille * 100)}%) vers Marseille.`}
              >
                <line
                  x1={portX}
                  y1={portY}
                  x2={objectX}
                  y2={objectY}
                  stroke={color}
                />
                <circle
                  cx={portX}
                  cy={portY}
                  r={objectWidth / 10}
                  fill={color}
                  stroke={'white'}
                />

                <rect
                  x={objectX - objectWidth / 2}
                  y={objectY - objectWidth / 2}
                  width={objectWidth}
                  height={objectWidth}
                  stroke="white"
                  fill={color}
                />
                <rect
                  x={objectX - objectWidth / 2 + 1}
                  y={objectY - objectWidth / 2 + 1}
                  width={objectWidth * ratio_to_marseille}
                  height={objectWidth - 2}
                  fill={MARSEILLE_COLOR}
                />

                <text
                  x={objectX}
                  y={objectY + objectWidth / 2 + fontSize}
                  textAnchor={'middle'}
                  fontSize={fontSize}
                >
                  {port}
                </text>

              </g>
            )
          })
      }
      <g className="marseille-group">
        <line
          stroke={MARSEILLE_COLOR}
          x1={marseilleX}
          y1={marseilleY}
          x2={centerX}
          y2={centerY}
        />
        <circle
          fill={MARSEILLE_COLOR}
          cx={marseilleX}
          cy={marseilleY}
          r={2}
          stroke="white"
        />
        <g transform={`translate(${centerX}, ${centerY})rotate(45)`}>
          <rect
            fill={MARSEILLE_COLOR}
            stroke="white"
            x={-10}
            y={-10}
            width={20}
            height={20}
          // transform={`rotate(45)`}
          />
        </g>

        <text
          x={centerX}
          y={centerY + 30}
          textAnchor={'middle'}
          fontSize={16}
        >
          Marseille
        </text>
      </g>
      {/* <circle
        cx={centerX}
        cy={centerY}
        r={frameRadius}
      /> */}
    </g>
  )
}

export default function MarseillePortStructurant({
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
  const data = (inputData.get('navigation_frlevant_to_marseille.csv') || [])
      .map(d => ({
        ...d,
        ...['count_to_marseille', 'count_total', 'latitude', 'longitude']
          .reduce((res, k) => ({ ...res, [k]: +d[k] }), {}),
        ratio_to_marseille: +d.ratio_to_marseille > 1 ? 1 : +d.ratio_to_marseille
      }))
      .filter(d => d.count_total && d.port !== 'Marseille')
      .sort((a, b) => {
        if (a.longitude > b.longitude) {
          return 1;
        }
        return -1;
      })
  // }, [inputData]);

  const gutter = 10;
  return (
    <>
      <GeographicMapChart
        {...{
          width,
          height,
          // title,
          projectionTemplate: 'French Levant',
          className: `MarseillePortStructurant ${atlasMode ? 'is-atlas-mode' : ''}`,
          layers: [
            {
              type: 'custom',
              data: [],
              renderObjects: ({ width, height, projection }) => {
                const MARSEILLE_COORDS = [43.34, 5.2158406];
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
              color: {
                palette: provincesPalette,
                field: 'shortname'
              }
            },
            {
              type: 'custom',
              data: mapBgData,
              renderObjects: (props) =>
                <Provinces {...props} />
            },
            {
              type: 'custom',
              data: data,
              renderObjects: (props) =>
                <MapObjects {...props} />
            },
            {
              type: 'custom',
              renderObjects: (props) => {
                const squareSize = width / 10;
                return (
                  <g className="legend" transform={`translate(${gutter}, ${height - squareSize - gutter * 8})`}>
                    <foreignObject
                      x={0}
                      y={-gutter * 5}
                      width={squareSize}
                      height={squareSize}
                    >
                      <h4
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="legend-title"
                      >
                        Légende
                      </h4>
                    </foreignObject>
                    <rect
                      x={0}
                      y={0}
                      width={squareSize}
                      height={squareSize}

                      stroke="grey"
                      fill="rgba(200,200,200,0.5)"
                    />
                    <rect
                      width={squareSize / 3 - 1}
                      height={squareSize - 2}
                      x={1}
                      y={1}
                      // stroke="lightgrey"
                      fill="url(#legendDiagonalHatch)"
                    />
                    <line
                      x1={0}
                      x2={squareSize}
                      y1={squareSize + gutter / 2}
                      y2={squareSize + gutter / 2}
                      stroke="grey"
                      markerStart={'url(#arrow-head-grey-start)'}
                      markerEnd={'url(#arrow-head-grey)'}
                    />
                    <line
                      x1={0}
                      x2={squareSize / 3}
                      y1={squareSize + gutter}
                      y2={squareSize + gutter}
                      stroke="grey"
                      markerStart={'url(#arrow-head-grey-start)'}
                      markerEnd={'url(#arrow-head-grey)'}
                    />
                    <foreignObject
                      x={0}
                      y={squareSize + gutter}
                      width={squareSize / 2}
                      height={squareSize}
                    >
                      <p
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="legend-label"
                        style={{ fontSize: gutter }}
                      >
                        part des départs pour Marseille
                      </p>
                    </foreignObject>
                    <foreignObject
                      x={squareSize / 3}
                      y={squareSize + gutter}
                      width={squareSize * 2 / 3}
                      height={squareSize}
                    >
                      <p
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="legend-label"
                        style={{ textAlign: 'right', fontSize: gutter }}
                      >
                        nombre de départs en 1789
                      </p>
                    </foreignObject>

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
      <ReactTooltip id="structurant-tooltip" />
    </>
  )
}