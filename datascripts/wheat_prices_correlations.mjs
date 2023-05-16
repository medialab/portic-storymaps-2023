import { csvParse, csvFormat } from "d3-dsv";
import { readFileSync, writeFileSync } from "fs";
import lodash from "lodash";
import graphology from "graphology";
import louvain from "graphology-communities-louvain";
import gexf from "graphology-gexf";
import forceAtlas2 from "graphology-layout-forceatlas2";

import {
  point,
  points,
  pointsWithinPolygon,
  featureCollection,
  polygon,
} from "@turf/turf";

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
  if (weight >= 3.5) graph.mergeEdge(row.A_market, row.B_market, { weight });
});
graph.forEachNode((n) => {
  const weightedDegree = graph.reduceEdges(
    n,
    (acc, _, { weight }) => acc + weight,
    0
  );
  graph.mergeNodeAttributes(n, {
    ...villes[n],
    x: villes[n].longitude * 10,
    y: villes[n].latitude * 10,
    weightedDegree,
    size: weightedDegree,
  });
});
// To directly assign communities as a node attribute
louvain.assign(graph);

// spatialize
const settings = forceAtlas2.inferSettings(graph);
forceAtlas2.assign(graph, { iterations: 1000, settings });
// output
writeFileSync("wheat_correlations.gexf", gexf.write(graph));
