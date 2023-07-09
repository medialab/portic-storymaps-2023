import { toPairs } from "lodash";
import { adjustColorForBassinChoropleth } from ".";
import translate from "../../utils/translate";

export const WheatCorrelationsLegend = ({
  colorBy, // bassin community
  palettes,
  layout, // geography network
  lang,
}) => {
  return (
    <div className="wheat-correlations-legend">
      {/* COMMUNITY COLORS */}
      {colorBy === "community" && (
        <div className="color-group">
          <h4>{translate("viz-1-B", "colorByCommunity", lang)}</h4>
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

              <span>
                {translate("viz-1-B", "communityLabel", lang, {
                  community: variable,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* BASSIN COLORS */}
      {(layout === "geography" || colorBy === "bassin") && (
        <div className="color-group">
          <h4>
            {colorBy === "bassin"
              ? translate("viz-1-B", "colorByBassinLabel", lang)
              : translate("viz-1-B", "basin", lang)}
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
          <span>{translate("viz-1-B", "correlation", lang)}</span>
        </div>
      )}
    </div>
  );
};
