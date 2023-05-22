import { csvParse, csvFormat } from "d3-dsv";
import { readFileSync, writeFileSync } from "fs";
import lodash from "lodash";
import graphology from "graphology";
import louvain from "graphology-communities-louvain";
import gexf from "graphology-gexf";
import forceAtlas2 from "graphology-layout-forceatlas2";

import {
  point,
  pointsWithinPolygon,
  featureCollection,
  simplify,
  bbox,
} from "@turf/turf";
import { scaleLinear } from "d3-scale";

// load locations
const locationsData = readFileSync("./module_1A/1-A--coordonnées.csv", {
  encoding: "utf8",
});
const locations = csvParse(locationsData);

/**
 *  affect bassin versant
 * */

const bassins = JSON.parse(
  readFileSync("./BassinHydrographique_FXX.json", {
    encoding: "utf8",
  })
);
const villePoints = featureCollection(
  locations.map((l) =>
    point([+l.longitude, +l.latitude], lodash.pick(l, "market"))
  )
);
console.log(`nombre de ville ${villePoints.length}`);

const villes = lodash.keyBy(locations, (l) => l.market);

bassins.features.forEach((bassin) => {
  const inBassin = pointsWithinPolygon(villePoints, bassin);
  console.log(
    `${inBassin.features?.length || 0} villes dans le bassin ${
      bassin.properties.LbBH
    }`
  );
  if (inBassin.features && inBassin.features.length > 0)
    inBassin.features?.forEach(
      (f) => (villes[f.properties.market].bassin = bassin.properties.LbBH)
    );
});

/***
 * build the network
 ***/

const graph = new graphology.UndirectedGraph();

// load correlations
const correlationData = readFileSync("./module_1A/1-A--Blé.csv", {
  encoding: "utf8",
});
const wheatCorrelations = csvParse(correlationData);

wheatCorrelations.forEach((row) => {
  const weight = Math.pow(+row.corr + 1, 2);
  if (row.A_market !== row.B_market && weight >= 3.5)
    graph.mergeEdge(row.A_market, row.B_market, { weight });
});
graph.forEachNode((n) => {
  const weightedDegree = graph.reduceEdges(
    n,
    (acc, _, { weight }) => acc + weight,
    0
  );
  graph.mergeNodeAttributes(n, {
    ...villes[n],
    x: villes[n].longitude,
    y: villes[n].latitude,
    //TODO: transform market to proper labels
    label: villes[n].market,
    weightedDegree,
    size: weightedDegree,
  });
});
// To directly assign communities as a node attribute
louvain.assign(graph, { resolution: 1.5 });

// spatialize
const settings = forceAtlas2.inferSettings(graph);
forceAtlas2.assign(graph, { iterations: 1000, settings });

const xyRange = graph.reduceNodes(
  (acc, _, atts) => ({ x: [...acc.x, atts.x], y: [...acc.y, atts.y] }),
  { x: [], y: [] }
);
xyRange.x = [lodash.min(xyRange.x), lodash.max(xyRange.x)];
xyRange.y = [lodash.min(xyRange.y), lodash.max(xyRange.y)];
/***
 * Output
 ***/

// prepare scaling network positions to the geographic bbox for animation
const bassinsBbox = bbox(bassins);
const latitudeScale = scaleLinear()
  .domain(xyRange.y)
  .range([bassinsBbox[1], bassinsBbox[3]]);
const longitudeScale = scaleLinear()
  .domain(xyRange.x)
  .range([bassinsBbox[0], bassinsBbox[2]]);

// Points
writeFileSync(
  "../public/data/wheat_correlations_cities.csv",
  csvFormat(
    graph.mapNodes((key, atts) => ({
      id: key,
      //normalize x/y as long/lat
      networkLatitude: latitudeScale(atts.y),
      networkLongitude: longitudeScale(atts.x),
      ...atts,
    }))
  )
);
// Liens
writeFileSync(
  "../public/data/wheat_correlations_links.csv",
  csvFormat(graph.mapEdges((key, atts) => ({ id: key, ...atts })))
);

// Bassins versants
writeFileSync(
  "../public/data/map_backgrounds/bassins_versants.json",
  JSON.stringify(simplify(bassins, { tolerance: 0.001, highQuality: true }))
);
// Network as GEXF top opne in Retina ?
writeFileSync("../public/data/wheat_correlations.gexf", gexf.write(graph));
