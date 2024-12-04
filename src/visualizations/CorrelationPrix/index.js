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
import { useEffect, useState, useMemo } from "react";
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

const cleanCityNamesMap = {
  "Abbeville": "Abbeville",
  "Arras": "Arras",
  "Auzerre": "Auzerre",
  "BarleDuc": "Bar-le-Duc",
  "Bayeux": "Bayeux",
  "Beaumont": "Beaumont",
  "Bernay": "Bernay",
  "Blois": "Blois",
  "Cany": "Cany",
  "ChalonssurMarne": "Chalons-sur-Marne",
  "Charleville": "Charleville",
  "Chateaudun": "Chateaudun",
  "Chateauroux": "Chateauroux",
  "ChaumontenCaux": "Chaumont-en-Caux",
  "ChaumontenVexin": "Chaumont-en-Vexin",
  "Eu": "Eu",
  "Gonesse": "Gonesse",
  "LeHavre": "LeHavre",
  "Lille": "Lille",
  "MagnyenVexin": "Magny-en-Vexin",
  "Melun": "Melun",
  "Meulan": "Meulan",
  "Orléans": "Orléans",
  "Paris": "Paris",
  "Pontoise": "Pontoise",
  "Reims": "Reims",
  "Rouen": "Rouen",
  "RozayenBrie": "Rozay-en-Brie",
  "Soissons": "Soissons",
  "Aigueperse": "Aigueperse",
  "Billom": "Billom",
  "Brioude": "Brioude",
  "Issoire": "Issoire",
  "Maringues": "Maringues",
  "Riom": "Riom",
  "VicleComte": "Vic-le-Comte",
  "AixenProvence": "Aix-en-Provence",
  "Arles": "Arles",
  "Aubenas": "Aubenas",
  "Avignon": "Avignon",
  "BuislesBaronnies": "Buis-les-Baronnies",
  "Carcassonne": "Carcassonne",
  "Draguignan": "Draguignan",
  "Montpellier": "Montpellier",
  "PontSaintEsprit": "Pont-Saint-Esprit",
  "Toulouse": "Toulouse",
  "VilleneuvedeBerg": "Villeneuve-de-Berg",
  "Albi": "Albi",
  "Bordeaux": "Bordeaux",
  "Castelnaudary": "Castelnaudary",
  "Castres": "Castres",
  "Grenade": "Grenade",
  "Luneville": "Luneville",
  "Marmande": "Marmande",
  "Montauban": "Montauban",
  "Angers": "Angers",
  "Bourges": "Bourges",
  "ChateauGontier": "Château-Gontier",
  "Fontenay": "Fontenay",
  "LeMans": "Le Mans",
  "Nantes": "Nantes",
  "Poitiers": "Poitiers",
  "Rennes": "Rennes",
  "Angoulême": "Angoulême",
  "Annonay": "Annonay",
  "Grenoble": "Grenoble",
  "LePuyenVelay": "Le Puy-en-Velay",
  "Lyon": "Lyon",
  "Romans": "Romans",
  "SaintAffrique": "Saint-Affrique",
  "BoulognesurMer": "Boulogne-sur-Mer",
  "Colmar": "Colmar",
  "Dole": "Dole",
  "Douai": "Douai",
  "Guéret": "Guéret",
  "Limoges": "Limoges",
  "Mende": "Mende",
  "Mâcon": "Mâcon",
  "PontlAbbé": "Pont-l’Abbé",
  "SaintEtienne": "Saint-Etienne",
  "Strasbourg": "Strasbourg",
  "Tulle": "Tulle",
  "Vannes": "Vannes",
  "Bayonne": "Bayonne",
  "Digne": "Digne",
  "Marseille": "Marseille",
  "Pamiers": "Pamiers",
  "Ayen": "Ayen",
  "Narbonne": "Narbonne",
  "Puylaurens": "Puylaurens",
  "Treignac": "Treignac",
  "Pau": "Pau",
  "Verfeil": "Verfeil",
  "Mulhouse": "Mulhouse",
  "Lavaur": "Lavaur",
  "Revel": "Revel",
  "TarasconsurAriège": "Tarascon-sur-Ariège",
  "BrivelaGaillarde": "Brive-la-Gaillarde",
  "Cordes": "Cordes",
  "Foix": "Foix",
  "Chartres": "Chartres",
  "Langres": "Langres",
  "Réalmont": "Réalmont",
  "Peyrehorade": "Peyrehorade",
  "SaintBrieuc": "Saint-Brieuc",
}

const cleanCityName = originalName => {
  return cleanCityNamesMap[originalName];
}

const CorrelationPrix = ({
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
    setColorBy(callerProps?.colorby || DEFAULTS.colorBy);
  }, [callerProps?.layout, callerProps?.colorby]);

  const originalData = useMemo(() => data.get("wheat_correlations_cities.csv")
    .map(datum => {
      return {
        ...datum,
        label: datum.label || cleanCityName(datum.id)
      }
    }), [data]);
  console.log(originalData.map(d => d.label).join('\n'))

  // const dataPoints = useMemo(() => {
  let dataPoints;
  switch (layout) {
    case "network":
      dataPoints = originalData.map((datum) => ({
        ...datum,
        latitude: datum.networkLatitude,
        longitude: datum.networkLongitude,
      }));
      break;
    default:
      dataPoints = originalData;
      break;
  }
  // }, [originalData, layout]);

  return (
    <div className="CorrelationPrix">
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
              label: { field: "label" },
              size: { field: "size" },
              color: { field: colorBy, palette: colorsPalettes[colorBy] },
              radiusRange: [5, 5],
              labelSizeRange: [14, 14],
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
    </div>
  );
};

export default CorrelationPrix;
