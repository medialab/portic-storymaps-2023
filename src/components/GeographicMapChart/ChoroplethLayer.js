import { geoPath } from "d3-geo";
import { generatePalette } from "../../utils/misc";
import { uniq } from "lodash";
import cx from "classnames";
import { useSpring, useTransition, animated } from "@react-spring/web";
import { useEffect, useState, useMemo } from "react";
import ReactTooltip from "react-tooltip";

/**
 * Description
 * @param {string} d
 * @param {function} projection
 * @param {function} project
 * @param {object} palette
 * @param {object} layer
 * @param {number} width
 * @param {number} height
 * @returns {React.ReactElement} - React component
 */
const AnimatedGeoPart = ({
  d: initialD,
  projection,
  project,
  palette,
  layer,
  width,
  height
}) => {
  // // @todo do this cleanly (removing out of bound objects to improve performance)
  // const boundsAbs = geoPath().bounds(initialD);
  // const [[x1, y1], [x2, y2]] = [projection(boundsAbs[0]), projection(boundsAbs[1])];
  // const [xMin, xMax] = [x1, x2].sort((a, b) => {
  //   if (a > b) return 1;
  //   return -1;
  // });
  // const [yMin, yMax] = [y1, y2].sort((a, b) => {
  //   if (a > b) return 1;
  //   return -1;
  // });
  // const outOfBounds = (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) ? false : xMin > width || yMin > height || xMax < 0 || yMax < 0;

  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true);
    });
  }, []);

  const currentD = project(initialD);

  const animationProps = useSpring({
    to: {
      d: currentD,
    },
    immediate: !isInited,
  });

  useEffect(() => {
    ReactTooltip.rebuild();
  });
  // if (outOfBounds) {
  //   return null;
  // }
  return (
    <animated.path
      title={initialD.properties.shortname}
      d={animationProps.d}
      className="geopart"
      id={`geopart-${initialD.properties.shortname}`}
      data-tip={layer.tooltip ? layer.tooltip(initialD) : undefined}
      data-for="geo-tooltip"
      style={{
        fill:
          layer.color !== undefined && palette !== undefined
            ? palette[initialD.properties[layer.color.field]]
            : "transparent",
      }}
    />
  );
};

// @TODO : mettre en place une palette de couleurs quantitative

const ChoroplethLayer = ({
  layer,
  projection,
  width,
  height,
  reverseColors,
}) => {
  let palette;
  const project = geoPath().projection(projection);

  if (!layer.data) {
    console.info("no data for layer:", layer);
    return null;
  }

  if (layer.data.features && layer.color && layer.color.field) {
    // colors palette building
    const colorValues = uniq(
      layer.data.features.map((datum) => datum.properties[layer.color.field])
    );
    if (layer.color.palette) {
      // if palette given in parameters we use it, otherwise one palette is generated
      palette = layer.color.palette;
    } else if (layer.color.generatedPalette) {
      const colors = generatePalette("map", layer.data.features.length);
      palette = colorValues.reduce(
        (res, key, index) => ({
          ...res,
          [key]: colors[index],
        }),
        {}
      );
    }
  }
  // Paul: calculating partsData is costly for large geometries. 
  // Should be done at generation time if some geometries are known to never be needed.
  const partsData = useMemo(
    () =>
      layer.data.features
        .filter((d) => d.geometry)
        .filter((d) => {
          // @todo do this cleanly (removing out of bound objects to improve performance)
          const boundsAbs = geoPath().bounds(d);
          const [[x1, y1], [x2, y2]] = [
            projection(boundsAbs[0]),
            projection(boundsAbs[1]),
          ];
          const [xMin, xMax] = [x1, x2].sort((a, b) => {
            if (a > b) return 1;
            return -1;
          });
          const [yMin, yMax] = [y1, y2].sort((a, b) => {
            if (a > b) return 1;
            return -1;
          });
          const outOfBounds =
            isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)
              ? false
              : xMin > width || yMin > height || xMax < 0 || yMax < 0;
          return !outOfBounds;
        }),
    [projection, layer.data]
  );

  const animationStyle = useSpring({
    from: { opacity: layer.hide ? 1 : 0 },
    to: { opacity: layer.hide ? 0 : 1 },
  });
  return (
    <>
      <g
        className={cx("ChoroplethLayer", {
          "reverse-colors": reverseColors,
          visibility: layer.hide ? "hidden" : "visible",
        })}
      >
        <animated.g style={animationStyle}>
          {partsData.map((d, i) => {
            if(layer.animated) 
              return <AnimatedGeoPart
                key={
                  d.properties.id || d.properties.gid || d.properties.name || i
                }
                {...{
                  projection,
                  project,
                  palette,
                  layer,
                  d,
                  width,
                  height
                }}
              />
            else 
              return <path
                key={
                  d.properties.id || d.properties.gid || d.properties.name || i
                }
                title={d.properties.shortname}
                d={project(d)}
                className="geopart"
                data-tip={layer.tooltip ? layer.tooltip(d) : undefined}
                data-for="geo-tooltip"
                style={{
                  fill:
                    layer.color !== undefined && palette !== undefined
                      ? palette[d.properties[layer.color.field]]
                      : "transparent",
                }}
              />
            }
          )}
        </animated.g>
      </g>
    </>
  );
};

export default ChoroplethLayer;
