import GeographicMapChart from '../../components/GeographicMapChart'

import './Intro.scss';
import PartnersObjects from './PartnersObjects';

const Intro = ({
  data,
  width,
  height,
  atlasMode,
  callerProps = {}
}) => {
  const {
    mode = 'navigo_world'
    // mode = 'toflit18_world'
  } = callerProps;
  return (
    <GeographicMapChart
      {...{
        width,
        height,
        projectionTemplate: 'Europe and North Africa centered on Marseille',
        className: `Intro ${atlasMode ? 'is-atlas-mode': ''}`,
        layers: [
          {
            type: 'choropleth',
            data: data.get('map_backgrounds/intro_map.geojson')
          },
          {
            type: 'custom',
            data: data.get('intro_data_world.csv'),
            renderObjects: (props) => <PartnersObjects {...props} mode={mode} />
          }

        ]
      }}
    />
  )
}

export default Intro