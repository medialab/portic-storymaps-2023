import { useMemo } from "react";
import LineChart from "../../components/LineChart/LineChart";

const TradeDynamics = ({ data, width, height, atlasMode, callerProps }) => {
  console.log(callerProps);
  const { directions_ferme, kind } = callerProps || {};

  const selectedData = useMemo(
    () =>
      data
        .get("tradeDynamics.csv")
        .filter(
          (d) =>
            (directions_ferme || []).includes(d["direction_ferme"]) &&
            d["kind"].replace("_regression", "") === kind
        ),
    [data, directions_ferme, kind]
  );
  console.log(selectedData);

  return (
    <>
      {directions_ferme &&
        directions_ferme.map((direction_ferme) => {
          const directionData = selectedData.filter(
            (d) => d.direction_ferme === direction_ferme
          );

          return (
            <LineChart
              key={direction_ferme}
              {...{
                title: directionData[0].slope,
                data: directionData,
                width,
                height: height / directions_ferme.length,
                atlasMode,
                color: { field: "kind" },
                x: { field: "year", type: "quantitative" },
                y: { field: "value", type: "quantitative" },
              }}
            />
          );
        })}
    </>
  );
};

export default TradeDynamics;
