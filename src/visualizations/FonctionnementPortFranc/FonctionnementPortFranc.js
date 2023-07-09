


import { useEffect, useMemo, useState } from 'react';
import './FonctionnementPortFranc.scss';
import Graph from "graphology";
import gexf from 'graphology-gexf/browser';

import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";



export const LoadGraph = ({data}) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = gexf.parse(Graph, data);
    graph.addNode("first", { x: 0, y: 0, size: 15, label: "My first node", color: "#FA4F40" });
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

export default function FonctionnementPortFranc({
  width,
  height,
  data: inputData,
  callerProps = {}
}) {
  const {
    mode = 'complete'
  } = callerProps;

  const [activeMode, setActiveMode] = useState(mode);
  useEffect(() => setActiveMode(mode), [mode]);

  const complete = useMemo(() => inputData.get('fonctionnement-port-franc-complete.gexf'), [inputData]);
  const simplified = useMemo(() => inputData.get('fonctionnement-port-franc-simplified.gexf'), [inputData]);
  return (
    <div className="FonctionnementPortFranc">
      Soon !
      {/* <SigmaContainer style={{ width, height }}>
        <LoadGraph data={mode === 'complete' ? complete : simplified} />
      </SigmaContainer> */}
    </div>
  )
}