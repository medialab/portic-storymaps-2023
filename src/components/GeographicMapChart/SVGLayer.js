import { useEffect, useState, useMemo } from "react";
import { geoPath } from "d3-geo";
import { generatePalette } from '../../utils/misc';
import { uniq } from 'lodash';
import cx from 'classnames';
import { useSpring, animated } from 'react-spring'
import ReactTooltip from "react-tooltip";


export const G = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.g className={className} onClick={onClick} {...props}>
      {children}
    </animated.g>
  )
}


const SVGLayer = ({ 
  layer, 
  projection, 
  width, 
  height, 
}) => {

  /**
   * We will use directly the content of the svg
   */
   const svgContent = useMemo(() => {
    const extractSVGContentRegexp = /<svg[^>]+>([\s\S]*)<\/svg>/gm;
    if (layer.data) {
       const match = extractSVGContentRegexp.exec(layer.data);
       if (match) {
         return match[1].trim()
       }
     }
   }, [layer && layer.data]);

  const [cameraScale, cameraRotation/*, translationX, translationY*/] = useMemo(() => {
     const [nTranslationX, nTranslationY] = projection.translate();
    return [
      projection.scale(),
      projection.angle(),
      nTranslationX,
      nTranslationY
    ]
   }, [projection]);

   const projectionWithoutRotation = useMemo(() => {
    return projection.angle(0);
   }, [projection])

  if (!layer.data) {
    console.info('no data for layer:', layer);
    return null;
  }
   // scale as set in the svg generation step
   const INITIAL_SCALE = 100;
   const initialWidth = 960,
         initialHeight = 500;
   // position of the null island in the background svg
   // x, y in pixels
   const initialX = 480,
     initialY = 250,
     // latitude and longitude of the null island
     referenceLatitude = 0,
     referenceLongitude = 0;
 
   // uncomment if use of the reference points CSV !
   // It is commented as we actually need only one ref point, so its data is hard-coded above (initialX, ...)
   // const firstPointReference = referencePositions[0];
   // const {x: initialX, y: initialY, latitude: referenceLatitude, longitude: referenceLongitude} = firstPointReference;
   
   // 1. we compute new screen coordinates of the null island
   const [newX, newY] = projectionWithoutRotation([referenceLatitude, referenceLongitude]);

   const scaleFactor = cameraScale / INITIAL_SCALE;

   // we will add a translate transform to the svg to match the displacement between original and new position of the null island
   const svgTranslateX = newX - initialX;
   const svgTranslateY = newY - initialY;
  //  const xDisplace = (width - initialWidth) / 2;
  //  const yDisplace = (height - initialHeight) / 2;
 
   // we will add a scale equal to the ratio between initial svg projection scale and new scale
   // svg transform includes the camera rotation (in °) and the translation + scaling
   const svgTransform = `rotate(${-cameraRotation})translate(${svgTranslateX}, ${svgTranslateY})scale(${scaleFactor})`; 

  // const [xOrigin, yOrigin] = projection([0, 0]);
  // const [xParis, yParis] = projection([2.3522219, 48.856614]);
  
  return (
    <>
      <G
        transform={svgTransform}
        transform-origin={'center'}
        className="SVGLayer"
        dangerouslySetInnerHTML={{
          __html: svgContent
        }}
      />
      {/* <circle
        cx={xOrigin}
        cy={yOrigin}
        fill="red"
        r={2}
      />
      <circle
        cx={xParis}
        cy={yParis}
        fill="red"
        r={2}
      /> */}
    </>
  )

}

export default SVGLayer;