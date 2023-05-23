/**
 * Wheat Correlation component - returns a set of <figures> containing a svg linechart/barchart
 *
 * @param {Object} props
 * @param {Object} props.layout geography OR network
 * @param {string} props.colorBy community OR bassin
 * @param {width} props.number
 * @param {height} props.number
 * @param {atlasMode} props.boolean
 *
 **/

import GeographicMapChart from "../../components/GeographicMapChart";
import { useMemo } from "react";
import FlowsLayer from "../../components/GeographicMapChart/FlowsLayer";

/**
 * TODO
 * - legend (handle colors in index)
 * - atlasmode
 * - sync hover point - FlowsLayer
 * - fleuves geojson ?
 *
 **/

const WheatCorrelation = ({ data, width, height, atlasMode, callerProps }) => {
  const layout = callerProps?.layout || "geography";
  const colorBy = callerProps?.colorBy || "bassin";
  const originalData = data.get("wheat_correlations_cities.csv");
  const dataPoints = useMemo(() => {
    switch (layout) {
      case "network":
        return originalData.map((datum) => ({
          ...datum,
          latitude: datum.networkLatitude,
          longitude: datum.networkLongitude,
        }));
      default:
        return originalData;
    }
  }, [originalData, layout]);

  return (
    <GeographicMapChart
      {...{
        title: "corrélations prix du blé",
        width,
        height,
        projectionTemplate: "France",
        className: `1-B ${atlasMode ? "is-atlas-mode" : ""}`,
        layers: [
          //TODO: remove choro when network
          {
            type: "choropleth",
            data: data.get("map_backgrounds/bassins_versants.json"),
            hide: layout !== "geography",
          },
          {
            type: "flows",
            data: data.get("wheat_correlations_links.csv"),
            size: { field: "weight" },
            sizeRange: [0.1, (width * height) / 400000],
            hideArrows: true,
            color: {
              uniq: "#777",
            },
            hide: layout !== "network",
          },

          {
            type: "points",
            data: dataPoints,
            label: { field: "market" },
            size: { field: "size" },
            color: { field: colorBy },
            radiusRange: [(width * height) / 80000, (width * height) / 80000],
            labelSizeRange: [0, 0],
            tooltip: (datum) => `${datum.label} (${datum.bassin})`,
          },

          //TODO: edge layer
        ],
      }}
    />
  );
};

export default WheatCorrelation;
