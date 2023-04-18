import GeographicMapChart from '../../components/GeographicMapChart'

import './Intro.scss';

const Intro = ({
  data,
  width,
  height,
  atlasMode,
  callerProps
}) => {
  return (
    <GeographicMapChart
      {...{
        width,
        height,
        projectionTemplate: 'Europe and North Africa centered on Marseille',
        className: "Intro",
        layers: [
          {
            type: 'choropleth',
            data: data.get('map_backgrounds/intro_map.geojson')

          }
        ]
      }}
    />
  )
}

export default Intro