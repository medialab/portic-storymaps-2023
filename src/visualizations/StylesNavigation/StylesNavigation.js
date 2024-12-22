import { useEffect, useState } from 'react';
import { geoPath } from "d3-geo";
import ReactTooltip from 'react-tooltip';
import { uniq } from 'lodash';
import { max } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import { useSpring, animated } from '@react-spring/web';

import translate from '../../utils/translate';

import './StylesNavigation.scss';
import GeographicMapChart from '../../components/GeographicMapChart';

import StyleViz from './StyleViz';
import { formatNumber } from '../../utils/misc';

import colorsPalettes from '../../utils/colorPalettes';

const { stylesOfNavigation: colors, marseilleColor } = colorsPalettes;


const WIDTH_BREAKPOINT = 800;

const mapShortNameToCategory = {
  'Guyenne-Gascony': 'Ponant',
  'Aunis': 'Ponant',
  'Saintonge': 'Ponant',
  'Poitou': 'Ponant',
  'Bretagne': 'Ponant',
  'Normandie': 'Ponant',
  'Picardie': 'Ponant',
  'Artois': 'Ponant',
  'Flandre': 'Ponant',
  'Navarre-Béarn': 'Ponant',
  'Portugal': 'Ponant',
  'Grande-Bretagne': 'Ponant',
  'Irlande': 'Ponant',
  'Pays de Galles': 'Ponant',
  'Pays-Bas autrichiens': 'Ponant',
  'Hollande': 'Ponant',
  'Frise': 'Ponant',
  'Danemark': 'Ponant',
  'Suède': 'Ponant',
  'Norvège': 'Ponant',


  'Roussillon': 'méditerranée occidentale',
  'Languedoc': 'méditerranée occidentale',
  'Provence': 'méditerranée occidentale',
  'Isles de Corse': 'méditerranée occidentale',

  'République de Gènes': 'méditerranée occidentale',
  'Royaume de Piémont-Sardaigne': 'méditerranée occidentale',
  "Toscane": 'méditerranée occidentale',
  "Etats pontificaux": 'méditerranée occidentale',
  'Naples': 'méditerranée occidentale',
  'Sardaigne': 'méditerranée occidentale',
  'Sicile': 'méditerranée occidentale',
  'Espagne': 'méditerranée occidentale',


  'Empire ottoman': 'empire ottoman',
  'reste Asie, Moyen-Orient et Océanie': 'empire ottoman',
  "Régence d'Alger": 'empire ottoman',
  'Régence de Tripoli': 'empire ottoman',
  'Régence de Tunis': 'empire ottoman',

}

const Provinces = ({
  data: inputData,
  projection,
  portsData,
  highlightedCategory,
  setHighlightedCategory,
  width,
  height,
  lang
}) => {
  // const data = useMemo(() => {
  const data = inputData.features.filter(({ properties: { dominant, shortname } }) =>
    Object.keys(mapShortNameToCategory).includes(shortname))
  // }, [inputData]);

  const project = geoPath().projection(projection);

  const maxRadius = width / 50;
  const maxArea = Math.PI * maxRadius * maxRadius;
  const areaScale = scaleLinear().domain([0, max(portsData.map(d => +d.count))]).range([width / 100, maxArea]);

  const legendValues = [1000, 100];
  const areaMax = areaScale(legendValues[0]);
  const areaMin = areaScale(legendValues[1]);
  const rMax = Math.sqrt(areaMax / Math.PI);
  const rMin = Math.sqrt(areaMin / Math.PI);
  const cMin = rMax * 2 - rMin;
  const gutter = 10;

  return (
    <g>
      {
        /*
        data.map((datum) => {
          const shortname = datum.properties.shortname;
          const category = mapShortNameToCategory[shortname];
          const categoryId = category.split(' ')[0].toLowerCase();
          const color = colors[category];
          const id = shortname.split(' ').pop();
          // let [centroidX, centroidY] = project.centroid(datum);
          return (
            <g key={id}
              onMouseEnter={() => setHighlightedCategory(categoryId)}
              onMouseLeave={() => setHighlightedCategory()}
            >
              <path
                title={shortname}
                d={project(datum)}
                className={`geopart dashed ${highlightedCategory && highlightedCategory !== categoryId ? 'is-shadowed' : ''}`}
                fill={`url(#diagonalHatch-${categoryId}`}
              />
              <pattern id={`diagonalHatch-${categoryId}`} patternUnits="userSpaceOnUse" width="4" height="4">
                <path
                  d="M-1,1 l2,-2
                M0,4 l4,-4
                M3,5 l2,-2"
                  style={{
                    stroke: color,// provincesPalette['shortname'],
                    strokeWidth: 1.5
                  }}
                />
              </pattern>
            </g>
          )
        })
        */
      }
      {
        portsData.map(({ port, category, latitude, longitude, count }) => {
          const [x, y] = projection([longitude, latitude]);
          const area = areaScale(+count);
          const radius = Math.sqrt(area / Math.PI);
          const color = colors[category];
          const categoryId = category.split(' ')[0].toLowerCase();
          const id = `port-${latitude.trim()}-${longitude.trim()}`;
          const gradientId = `gradient-${id}`;
          return (
            <>
            <circle
              fill={`url(#${gradientId})`}
              stroke="none"
              cx={x}
              cy={y}
              r={radius * 3 + width / 20}
              opacity={highlightedCategory ? highlightedCategory !== categoryId ? 0 : .1 : 0.1}
              title={port}
              key={port + '1'}
            />
            <defs>
          <radialGradient id={gradientId} key={port + '3'}>
            <stop offset="10%" stop-color={color} stop-opacity={.3} />
            <stop offset="95%" stop-color={color} stop-opacity={0} />
          </radialGradient>
        </defs>
            </>
          )
        })
      }
      {
        portsData.map(({ port, category, latitude, longitude, count, ...rest }) => {
          const [x, y] = projection([longitude, latitude]);
          const area = areaScale(+count);
          const radius = Math.sqrt(area / Math.PI);
          const color = colors[category];
          const categoryId = category.split(' ')[0].toLowerCase();
          const id = `port-${latitude.trim()}-${longitude.trim()}`;
          const gradientId = `gradient-${id}`;
          return (
            <circle
              fill={color}
              stroke="white"
              cx={x}
              cy={y}
              r={radius}
              opacity={highlightedCategory && highlightedCategory !== categoryId ? .2 : 1}
              title={port}
              key={port + '2'}
              data-for={"styles-tooltip"}
              data-tip={`${rest[`port_${lang}`]} (${translate('StylesNavigation', 'travels-tick', lang, {count})})`}
              onMouseEnter={() => setHighlightedCategory(categoryId)}
              onMouseLeave={() => setHighlightedCategory()}
            />
          )
        })
      }
      <g className="map-legend" transform={`translate(${gutter}, ${height - rMax * 3})`}>
        <foreignObject
          x={0}
          y={-rMax * 3}
          width={width}
          height={height}
          style={{pointerEvents: 'none'}}
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
          fill="lightgrey"
          fillOpacity={.1}
          stroke="grey"
          strokeDasharray="1,1"
        />
        <foreignObject
          x={rMax * 2 + 3}
          y={-gutter/2}
          width={rMax * 8}
          height={rMax * 4}
        >
          <p
            xmlns="http://www.w3.org/1999/xhtml"
            className="legend-label"
          >
            {translate('StylesNavigation', 'travels-tick', lang, {count: formatNumber(legendValues[0], lang)})}
          </p>
        </foreignObject>

        <foreignObject
          x={rMax * 2 + 3}
          y={rMax}
          width={rMax * 8}
          height={rMax * 4}
        >
          <p
            xmlns="http://www.w3.org/1999/xhtml"
            className="legend-label"
          >
            {translate('StylesNavigation', 'travels-tick', lang, {count: formatNumber(legendValues[1], lang)})}
          </p>
        </foreignObject>

        <circle
          cx={rMax}
          cy={cMin}
          r={rMin}
          stroke="grey"
          strokeDasharray="1,1"
          fill="lightgrey"
          fillOpacity={.1}
        />

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
    </g>
  )
}

export default function StylesNavigation({
  data: inputData,
  width,
  height,
  atlasMode,
  callerProps = {},
  lang,
}) {
  const {
    tonnage,
    steps,
    categorie
  } = callerProps;
  const [highlightedTonnage, setHighlightedTonnage] = useState(tonnage);
  const [highlightedSteps, setHighlightedSteps] = useState(steps);
  const [highlightedCategory, setHighlightedCategory] = useState(categorie);
  // reset from caller props change
  useEffect(() => setHighlightedTonnage(tonnage ? +tonnage : undefined), [tonnage])
  useEffect(() => setHighlightedSteps(steps ? +steps : undefined), [steps])
  useEffect(() => setHighlightedCategory(categorie ? categorie : undefined), [categorie])

  // const data = useMemo(() => 
  const data = (inputData.get('styles_navigation_long_cours.csv') || [])
    .map(d => ({
      ...d,
      ...['nb_steps', 'tonnage', 'count']
        .reduce((res, k) => ({ ...res, [k]: +d[k] }), {})
    }))
  // , [inputData]);
  // const travelsSums = useMemo(() => {
  const travelsSums = data.reduce((res, item) => {
    if (!res[item.category]) {
      res[item.category] = +item.count;
    } else res[item.category] += +item.count;
    return res;
  }, {})
  // }, [data])
  // const portsData = useMemo(() => 
  const portsData = (inputData.get('styles_navigation_long_cours_ports.csv') || [])
  // , [inputData])
  // const mapBgData = useMemo(() => {
  const geojson = inputData.get('map_backgrounds/intro_map.geojson');
  const mapBgData = {
    ...geojson,
    features: geojson.features.map(object => {
      const { shortname } = object.properties;
      const category = mapShortNameToCategory[shortname] || undefined;
      return {
        ...object,
        properties: {
          ...object.properties,
          category
        }
      }
    })
  }
  // }, [inputData]);
  const layout = width < WIDTH_BREAKPOINT ? 'vertical' : 'horizontal';
  const cellWidth = layout === 'vertical' ? width : width / 2;
  const cellHeight = layout === 'vertical' ? height / 4 : height / 2;
  const MARSEILLE_COORDS = [43.34, 5.2158406];
  const tonnageValues = uniq(data.map(d => +d.tonnage))
    .sort((a, b) => {
      if (a > b) {
        return 1;
      }
      return -1;
    })
    .reduce((res, t, index) => ({
      ...res,
      [t]: index,
    }), {});
  return (
    <div className={`StylesNavigation is-layout-${layout}`} style={{ width, height }}>
      <div className="column">
        <div className="viz-container map-container" style={{ width: cellWidth, height: cellHeight }}>
          <GeographicMapChart
            {...{
              width: cellWidth,
              height: cellHeight,
              // title,
              projectionTemplate: 'mediterranean and Ponant',
              className: `MarseillePortStructurant ${atlasMode ? 'is-atlas-mode' : ''}`,
              layers: [
                {
                  type: 'custom',
                  data: [],
                  renderObjects: ({ width, height, projection }) => {
                    const [x, y] = projection(MARSEILLE_COORDS.reverse());
                    const bgColor = '#74ccf4';
                    const { r } = useSpring({
                      from: {
                        r: cellWidth * .3
                        // r: width * .03
                      },
                      to: [{
                        r: cellWidth * .5
                      }, {
                        r: cellWidth * .3
                      }],
                      immediate: true,
                      loop: true,
                      config: {
                        duration: 20000
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
                  tooltip: (d) => d.properties.shortname,
                  color: {
                    // palette: colors,
                    field: 'category'
                  }
                },
                {
                  type: 'custom',
                  data: mapBgData,
                  renderObjects: (props) =>
                    <Provinces
                      {...props}
                      portsData={portsData}
                      highlightedCategory={highlightedCategory}
                      setHighlightedCategory={setHighlightedCategory}
                      lang={lang}
                    />
                },
                {
                  type: 'custom',
                  data: [],
                  renderObjects: ({ projection }) => {
                    const [marseilleX, marseilleY] = projection(MARSEILLE_COORDS);
                    return (
                      <g
                        transform={`translate(${marseilleX}, ${marseilleY})`}>
                        <rect
                          width={cellWidth / 50}
                          height={cellWidth / 50}
                          x={-cellWidth / 100}
                          y={-cellWidth / 100}
                          transform={'rotate(45)'}
                          fill={marseilleColor}
                          stroke="white"
                        />
                        <text fontSize={cellWidth / 50} fontStyle="italic" x={0} textAnchor="middle" y={cellWidth / 50 + 5}>
                          Marseille
                        </text>
                      </g>
                    )
                  }
                }
              ]
            }
            }
          />
        </div>
        <div className="viz-container stat-container" style={{ width: cellWidth, height: cellHeight }}>
          <StyleViz
            {...{
              width: cellWidth,
              height: cellHeight,
              id: 'méditerranée',
              title: translate('StylesNavigation', 'title-mediterrannee', lang, { count: formatNumber(travelsSums['méditerranée occidentale'], lang) }),
              // title: `Europe méditerranéenne (${formatNumber(travelsSums['méditerranée occidentale'], lang)} voyages vers Marseille consignés en temps de paix)`,
              data: data.filter(({ category }) => category === 'méditerranée occidentale'),
              color: colors['méditerranée occidentale'],
              legendStep: 250,
              tonnageValues,
              highlightedTonnage,
              setHighlightedTonnage,
              highlightedCategory,
              setHighlightedCategory,
              highlightedSteps,
              setHighlightedSteps,
              lang,
            }}
          />
        </div>
      </div>
      <div className="column">
        <div className="viz-container stat-container" style={{ width: cellWidth, height: cellHeight }}>
          <StyleViz
            {...{
              width: cellWidth,
              height: cellHeight,
              id: 'ponant',
              title: translate('StylesNavigation', 'title-ponant', lang, { count: formatNumber(travelsSums['Ponant'], lang) }),
              // title: `Ponant et Terre-Neuve (${formatNumber(travelsSums['Ponant'], lang)} voyages vers Marseille consignés en temps de paix)`,
              data: data.filter(({ category }) => category === 'Ponant'),
              color: colors['Ponant'],
              legendStep: 40,
              tonnageValues,
              highlightedTonnage,
              setHighlightedTonnage,
              highlightedCategory,
              setHighlightedCategory,
              highlightedSteps,
              setHighlightedSteps,
              lang,
            }}
          />
        </div>
        <div className="viz-container stat-container" style={{ width: cellWidth, height: cellHeight }}>
          <StyleViz
            {...{
              width: cellWidth,
              height: cellHeight,
              id: 'empire',
              // title: `Empire ottoman et mer Noire (${formatNumber(travelsSums['empire ottoman'], lang)} voyages vers Marseille consignés en temps de paix)`,
              title: translate('StylesNavigation', 'title-ottoman', lang, { count: formatNumber(travelsSums['empire ottoman'], lang) }),
              data: data.filter(({ category }) => category === 'empire ottoman'),
              color: colors['empire ottoman'],
              tonnageValues,
              legendStep: 20,
              highlightedTonnage,
              setHighlightedTonnage,
              highlightedCategory,
              setHighlightedCategory,
              highlightedSteps,
              setHighlightedSteps,
              lang,
            }}
          />
        </div>
      </div>
      <ReactTooltip id="styles-tooltip" />
    </div>
  )
}