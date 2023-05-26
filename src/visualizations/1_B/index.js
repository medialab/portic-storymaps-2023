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
import { useEffect, useMemo, useState } from "react";
import { WheatCorrelationsLegend } from "./legend";
import "./wheat-correlations.scss";
import { keyBy, mapValues, pick } from "lodash";
import colorsPalettes from "../../utils/colorPalettes";
import chroma from "chroma-js";
import translate from "../../utils/translate";

/**
 * TODO
 * - legend (handle colors in index)
 * - atlasmode
 * - sync hover point - FlowsLayer
 * - fleuves geojson ? https://umap.openstreetmap.fr/ja/map/cours-deau-de-france-en-construction_796957#7/46.389/3.571
 *
 **/

export const adjustColorForBassinChoropleth = (color) =>
  chroma(color).alpha(0.2);

const DEFAULTS = {
  layout: "network",
  colorBy: "community",
};

const WheatCorrelation = ({
  data,
  width,
  height,
  atlasMode,
  callerProps,
  lang,
}) => {
  const [layout, setLayout] = useState(DEFAULTS.layout);
  const [colorBy, setColorBy] = useState(DEFAULTS.colorBy);

  useEffect(() => {
    setLayout(callerProps?.layout || DEFAULTS.layout);
    setColorBy(callerProps?.colorBy || DEFAULTS.colorBy);
  }, [callerProps]);

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
    <>
      <GeographicMapChart
        {...{
          title:
            layout === "network"
              ? translate("viz-1-B", "networkTitle", lang)
              : translate("viz-1-B", "geographyTitle", lang),
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
              color: {
                field: "LbBH",
                // fading color code for choropleth
                palette: mapValues(
                  colorsPalettes.bassin,
                  adjustColorForBassinChoropleth
                ),
              },
            },
            {
              type: "flows",
              data: data.get("wheat_correlations_links.csv"),
              size: { field: "weight" },
              sizeRange: [0.1, (width * height) / 400000],
              hideArrows: true,
              color: {
                uniq: "#AAA",
              },
              disableHover: true,
              hide: layout !== "network",
            },

            {
              type: "points",
              data: dataPoints,
              label: { field: "market" },
              size: { field: "size" },
              color: { field: colorBy, palette: colorsPalettes[colorBy] },
              radiusRange: [7, 7],
              labelSizeRange: [0, 0],
              disableHover: true,
              tooltip: (datum) => `${datum.label} (${datum.bassin})`,
            },
          ],
        }}
      />
      <WheatCorrelationsLegend
        colorBy={colorBy}
        palettes={pick(colorsPalettes, ["bassin", "community"])}
        layout={layout}
        lang={lang}
      />
      {atlasMode && (
        <div className="wheat-correlations-atlas-controllers">
          <div>
            <label htmlFor="layout-select">
              {translate("viz-1-B", "layout", lang)}
            </label>
            <select
              id="layout-select"
              onChange={(e) => setLayout(e.target.value)}
              value={layout}
            >
              <option value="geography">
                {translate("viz-1-B", "geography", lang)}
              </option>
              <option value="network">
                {translate("viz-1-B", "network", lang)}
              </option>
            </select>
          </div>
          <div>
            <label htmlFor="colorBy-select">
              {translate("viz-1-B", "colorBy", lang)}
            </label>
            <select
              id="colorBy-select"
              onChange={(e) => setColorBy(e.target.value)}
              value={colorBy}
            >
              <option value="bassin">
                {translate("viz-1-B", "basin", lang)}
              </option>
              <option value="community">
                {translate("viz-1-B", "colorByCommunity", lang)}
              </option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default WheatCorrelation;
