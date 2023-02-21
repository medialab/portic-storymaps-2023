/* DOCUMENTATION : API de ce GéoComponent

  Principe :
    Composants réutilisable pour toutes les cartes utilisés sur les sites PORTIC
    cartographie en SVG
    -> permet de faire des cartes choroplèthes, de représenter des ports, des flux de navires, ...

  Paramètres : 
    * width : largeur de la carte (par défaut à 1500 px)
    * height : hauteur de la carte (par défaut à 1500 px)

    * layers : différentes couches de la carte ('choropleth', 'points', 'flows', 'custom'), à chaque layer il faut donner un fichier de données (stocké dans public/data) pour construire le objets qui le constituent, les couleurs, tailles, labels de ces objets sont paramètrables 
        si layer 'custom' choisi, il faut passer au layer une fonction d'affichage des données :
        - renderObject : donner un objet de donnée en paramètre, la fonction s'occupe de construire sa représentation SVG et de la positionner individuellement sur la carte
        - renderObjects : donner un dataset, la fonction s'occupe de construire une représentation SVG de l'ensemble des objets, et de gérer leurs positionnement sur la carte (souvent adapté quand le positionnement n'est pas géographique, qu'on a besoin de gérer les espacements entre objets ...)

    * projectionTemplate : configuration de carte utilisée fréquemment ('France', 'coast from Nantes to Bordeaux', 'Poitou', 'rotated Poitou')
    * projectionConfig: configuration de carte customisée (ce paramètre prime sur projectionTemplate si les 2 sont données en même temps)

    * debug : permet d'ajuster manuellement la configuration de la carte quand true (les paramètres de zoom, les coordonnées du centre, la rotation et les translations sont ajustables)
    
  @TODO : documenter ce component de manière standardisée
  */


import React, { useState, useMemo, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { geoEqualEarth, geoMercator } from "d3-geo";
import cx from 'classnames';
import ChoroplethLayer from './ChoroplethLayer';
import PointsLayer from './PointsLayer';
import FlowsLayer from './FlowsLayer';
import CustomObjectLayer from './CustomObjectLayer';
// import TriangleChart from '../TriangleChart/TriangleChart';
import Button from './Button';
import Input from './Input';
import Legend from './Legend';

import './GeographicMapChart.scss'
import { fixSvgDimension } from '../../utils/misc';
import SVGLayer from './SVGLayer';


/**
 * Displays a multi-layers map
 * @param {number} width
 * @param {number} height
 * @param {string} title
 * @param {array} layers
 * @param {string} projectionTemplate
 * @param {object} projectionConfig
 * @param {boolean} debug
 * @param {string} withLegend - can directly take legend position
 * @param {function} legendLayerFilter
 * @returns {React.ReactElement} - React component 
 */
const GeographicMapChart = ({
  width: inputWidth = 1500,
  height: inputHeight = 1500,
  title,
  layers = [],
  projectionTemplate: initialProjectionTemplate,
  projectionConfig: inputProjectionConfig, // custom config that will overwrite a template (optional argument) 
  debug = false, // @todo : à réparer
  withLegend,
  legendLayerFilter,
  className
}) => {
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
  // viz params variables
  const [scale, setScale] = useState(200)
  const [rotation, setRotation] = useState(0)
  const [translationX, setTranslationX] = useState(width / 2)
  const [translationY, setTranslationY] = useState(height / 2)
  // const [translationX, setTranslationX] = useState(0)
  // const [translationY, setTranslationY] = useState(0)
  const [centerX, setCenterX] = useState(-1.7475027) // -1.7475027 pour centrer sur région
  const [centerY, setCenterY] = useState(46.573642) // 46.573642

  const [projectionTemplate, setProjectionTemplate] = useState(initialProjectionTemplate)

  // trick for nice animations
  useEffect(() => {
    // setTimeout(() => {
    setProjectionTemplate(initialProjectionTemplate);
    // })
  }, [initialProjectionTemplate])

  // fix default translationX after size change during startup
  useEffect(() => {
    if (width !== 1) {
      setTranslationX(width / 2)
      setTranslationY(height / 2)
    }
  }, [width, height])


  // define a default map Config
  const defaultProjectionConfig = useMemo(() => {
    return {
      rotationDegree: 0,
      centerX: 2.4486203,
      centerY: 46.8576176,
      scale: height * 5
    };
  }, [height]) // repsonsive : se fait en fonction de la height de l'écran

  /**
   * d3 projection making
   */
  const projection = useMemo(() => { // def les bonnes valeurs pour la config de la projection // enregistrer dans le state // les appliquer dans la projection
    let projectionConfig = { ...defaultProjectionConfig } // casser la référence à defaultProj pour respecter principe react qu'on ne modifie pas un objet reçu en argument

    let projection = geoMercator();

    if (debug) {
      projectionConfig = {
        ...projectionConfig,
        centerX,
        centerY,
        translationX,
        translationY,
        rotationDegree: rotation,
        scale
      }
      // console.log('set projection config', projectionConfig);
      projection
        .scale(projectionConfig.scale)

      projection.center([projectionConfig.centerX, projectionConfig.centerY])

      if (projectionConfig.rotationDegree) {
        projection.angle(projectionConfig.rotationDegree)
      }

      projection.translate([projectionConfig.translationX, projectionConfig.translationY])

      return projection;
    }

    // console.log('will set a projection config : ', projectionTemplate);
    switch (projectionTemplate) {
      case 'World':
        projectionConfig = {
          ...projectionConfig,
          scale: height * .5,
          centerX: -1,
          centerY: 15,
          // translationX: width * 0.4,
          // translationY: height * 0.28
        }
        break;
      case 'coast from Bretagne to Flandres':
        projectionConfig = {
          ...projectionConfig,
          scale: 5000,
          // scale: 1000,
          centerX: .8,
          centerY: 50,
          translationX: width * 0.5,
          translationY: height * 0.5
        }
        break;
      case 'coast from Nantes to Bordeaux':
        projectionConfig = {
          ...projectionConfig,
          scale: height * 24,
          centerX: -1.7475027,
          centerY: 46.573642,
          translationX: width * 0.4,
          translationY: height * 0.28
        }
        break;
      // case 'Poitou':
      //   projectionConfig = {
      //     ...projectionConfig,
      //     scale: height * 30,
      //     centerX: -1.7475927,
      //     // centerY: 46.573872,
      //     centerY: 47.4,
      //     // translationX: width * 0.4,
      //     translationX: width * 0.45,
      //     translationY: 0
      //   }
      //   break;
      // case 'Poitou zoomed':
      //   projectionConfig = {
      //     ...projectionConfig,
      //     scale: height * 23,
      //     centerX: -1.7475927,
      //     // centerY: 46.573872,
      //     centerY: 47.4,
      //     // translationX: width * 0.4,
      //     translationX: width * 0.45,
      //     translationY: 0
      //   }
      //   break;
      // case 'rotated Poitou':
      //   projectionConfig = {
      //     ...projectionConfig,
      //     rotationDegree: 58,
      //     scale: height * 32,
      //     centerX: -1.7475027,
      //     centerY: 46.573642,
      //     translationX: width * 0.29,
      //     translationY: height * 0.25
      //   }
      //   break;
      case 'from France to England':
        projectionConfig = {
          ...projectionConfig,
          scale: height * 8,
          centerX: 0,
          centerY: 50,
          translationX: width * .5,
          translationY: height * .5,
          // translationX: width * 0.4,
          // translationY: height * 0.28
        }
        break;
      case 'England':
        projectionConfig = {
          ...projectionConfig,
          scale: height * 3,
          centerX: -3,
          centerY: 54,
          translationX: width * .5,
          translationY: height * .5,
          // translationX: width * 0.4,
          // translationY: height * 0.28
        }
        break;
      case 'around Dunkerque':
        projectionConfig = {
          ...projectionConfig,
          scale: height * 1000,
          centerX: 2.2730677,
          centerY: 51.026,
          translationX: width * .5,
          translationY: height * .5,
          // translationX: width * 0.4,
          // translationY: height * 0.28
        }
        break;
      case 'world north':
        projectionConfig = {
          ...projectionConfig,
          scale: 500,
          centerX: -30,
          centerY: 60,
          translationX: width * .5,
          translationY: height * .5,
          // translationX: width * 0.4,
          // translationY: height * 0.28
        }
        break;
      case 'France':
      default: // as France config 
        // console.log('projection config in dry version', projectionConfig);
        // console.log(`we are taking the config as specified in config parameters ===> if not specified, the view should correspond to France`);
        break;
    }

    if (inputProjectionConfig !== undefined) {
      projectionConfig = {
        ...projectionConfig,
        ...inputProjectionConfig
      }
    }

    // update the config
    setScale(projectionConfig.scale)

    setRotation(projectionConfig.rotationDegree)

    setCenterX(projectionConfig.centerX)
    setCenterY(projectionConfig.centerY)

    if (projectionConfig.translationX !== undefined) {
      setTranslationX(projectionConfig.translationX)
      setTranslationY(projectionConfig.translationY)
    }
    else {
      projectionConfig.translationX = width / 2;
      projectionConfig.translationY = height / 2;
      setTranslationX(width / 2)
      setTranslationY(height / 2)
    }

    projection
      .scale(projectionConfig.scale)

    projection.center([projectionConfig.centerX, projectionConfig.centerY])

    if (projectionConfig.rotationDegree) {
      projection.angle(projectionConfig.rotationDegree)
    }

    projection.translate([projectionConfig.translationX, projectionConfig.translationY])

    return projection;
  }, [width, height, defaultProjectionConfig, inputProjectionConfig, projectionTemplate, scale,
    centerX,
    centerY,
    translationX,
    translationY, rotation])



  // const [xCenterPoint, yCenterPoint] = projection([centerX, centerY]);
  return (
    <div className={cx("GeographicMapChartWrapper", className)}>

      {title ? <h5 className="visualization-title">{title}</h5> : null}

      {
        debug ?
          <div className="debug-container">
            <h4>scale: {scale}, rotation: {rotation}, translationX: {translationX}, translationY: {translationY}, centerX: {centerX}, centerY: {centerY}</h4>
            <div className="table">
              <ul id="horizontal-list">
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => setScale(scale * 1.6)}>scale+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setScale(scale / 1.6)}>scale-</Button>
                    </li>
                    <li>
                      <Input value={scale} placeHolder={"entrez une valeur pour la scale"} onBlur={(str) => {
                        const val = isNaN(+str) ? scale : +str;
                        setScale(val)
                      }} />
                    </li>
                  </ul>
                </li>
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => { setRotation(rotation + 2) }}>rotation+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setRotation(rotation - 2)}>rotation-</Button>
                    </li>
                  </ul>
                </li>
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => setTranslationX(translationX * 1.2)}>translationX+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setTranslationX(translationX * 0.8)}>translationX-</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setTranslationY(translationY * 1.2)}>translationY+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setTranslationY(translationY * 0.8)}>translationY-</Button>
                    </li>
                  </ul>
                </li>
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => setCenterX(centerX + 0.3)}>centerX+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setCenterX(centerX - 0.3)}>centerX-</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setCenterY(centerY + 0.3)}>centerY+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setCenterY(centerY - 0.3)}>centerY-</Button>
                    </li>
                    <li>
                      <Input value={centerX} placeHolder={"entrez une valeur pour la latitude"} onBlur={(str) => {
                        const val = isNaN(+str) ? centerX : +str
                        setCenterX(val)
                      }} />
                    </li>
                    <li>
                      <Input value={centerY} placeHolder={"entrez une valeur pour la longitude"} onBlur={(str) => {
                        const val = isNaN(+str) ? centerY : +str
                        setCenterY(val)
                      }} />
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          : null
      }

      <svg className="GeographicMapChart" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>

        {
          layers.map((layer, layerIndex) => {

            switch (layer.type) {
              case 'choropleth':
                return <ChoroplethLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  width={width}
                  height={height}
                  reverseColors={layer.reverseColors}
                />

              case 'points':
                return <PointsLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  width={width}
                  height={height}
                />

              case 'flows':
                return <FlowsLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  width={width}
                  height={height}
                  projectionTemplate={projectionTemplate}
                />

              case 'custom':
                return <CustomObjectLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  projectionTemplate={projectionTemplate}
                  width={width}
                  height={height}
                />
              case 'svg':
                return (
                  <SVGLayer
                    key={layerIndex}
                    layer={layer}
                    projection={projection}
                    projectionTemplate={projectionTemplate}
                    width={width}
                    height={height}
                  />
                )

              default:
                return <g key={layerIndex}><text>Unsupported layer type</text></g>
            }
          })
        }
        {/* <circle cx={xCenterPoint} cy={yCenterPoint} r={5} fill={'red'} />
        <rect x="58%" y="78%" width={width * 0.4} height={height * 0.2} rx="15" ry="15" fill={'white'} opacity={0.5} /> */}
      </svg>
      {
        withLegend ?
          <Legend layerFilter={legendLayerFilter} layers={layers} position={withLegend} />
          : null
      }
      <ReactTooltip id="geo-tooltip" />
    </div>
  )
}

export default GeographicMapChart;