import { toPairs } from "lodash";
import { adjustColorForBassinChoropleth } from ".";

export const WheatCorrelationsLegend = ({
  colorBy, // bassin community
  palettes,
  layout, // geography network
}) => {
  return (
    <div className="wheat-correlations-legend">
      {/* COMMUNITY COLORS */}
      {colorBy === "community" && (
        <div className="color-group">
          <h4>Villes par corrélation</h4>
          {toPairs(palettes.community).map(([variable, color]) => (
            <div className="item" key={variable}>
              <div
                style={{
                  backgroundColor: color,
                  borderRadius: "50%",
                  width: "14px",
                  height: "14px",
                  marginRight: "0.5rem",
                }}
              />

              <span>{variable}</span>
            </div>
          ))}
        </div>
      )}
      {/* BASSIN COLORS */}
      {(layout === "geography" || colorBy === "bassin") && (
        <div className="color-group">
          <h4>
            {colorBy === "bassin"
              ? "Villes par bassins versants"
              : "Bassins versants"}
          </h4>
          {toPairs(palettes.bassin).map(([variable, color]) => (
            <div className="item" key={variable}>
              {layout === "geography" ? (
                <div
                  style={{
                    backgroundColor: adjustColorForBassinChoropleth(color),
                    border: "1px solid black",
                    width: "25px",
                    height: "25px",
                    marginRight: "0.2rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {colorBy === "bassin" && (
                    <div
                      style={{
                        backgroundColor: color,
                        borderRadius: "50%",
                        width: "14px",
                        height: "14px",
                      }}
                    />
                  )}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: color,
                    borderRadius: "50%",
                    width: "14px",
                    height: "14px",
                    marginRight: "0.5rem",
                  }}
                />
              )}
              <span>{variable}</span>
            </div>
          ))}
        </div>
      )}
      {/* EDGES */}
      {layout === "network" && (
        <div className="item edge">
          <div
            style={{
              width: "40px",
              height: "3px",
              backgroundColor: "#999",
              marginRight: "0.5rem",
            }}
          />{" "}
          <span>corrélation</span>
        </div>
      )}
    </div>
  );
};
