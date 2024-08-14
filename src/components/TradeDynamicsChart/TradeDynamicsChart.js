import cx from "classnames";
import LongitudinalTradeChart from "./LongitudinalTradeChart";
//import ProductsDistributionChart from "./ProductsDistributionChart";

import "./TradeDynamicsChart.scss";
import { fixSvgDimension } from "../../utils/misc";
import translate from "../../utils/translate";
import { useEffect, useState } from "react";
import { omit } from "lodash";
import ReactTooltip from "react-tooltip";

const formatKind = (kind, lang) => {
  if (lang === 'fr') {
    if (kind === 'exports') {
      return 'exportations';
    } else return 'importations';
  }
  return kind;
}

/**
 * Configurable wrapper for main viz #1
 * @param {number} width
 * @param {number} height
 * @param {string} lang
 * @param {number} startYear
 * @param {number} endYear
 * @param {number} productTradePartThreshold
 * @param {array<string>} rows - list of visualization rows to display at a certain time
 * @param {string} kind - total, exports, imports
 * @param {datasets} object
 * @param {boolean} atlasMode
 * @returns {React.ReactElement} - React component
 */
const TradeDynamicsChart = (props) => {
  const {
    width: inputWidth,
    height: containerHeight,
    lang,
    startYear = 1740,
    endYear = 1790,
    productTradePartThreshold = 0.9,
    rows: originalRows,
    kind: originalKind,
    regression,
    datasets = {},
    atlasMode,
  } = props;


  const [rows, setRows] = useState(originalRows);
  const [kind, setKind] = useState(originalKind);


  useEffect(() => setRows(originalRows), [originalRows, setRows]);
  useEffect(() => {
    setKind(originalKind);
    ReactTooltip.rebuild();
  }, [originalKind, setKind]);

  let height = fixSvgDimension(containerHeight);
  const selectorsHeight = height * 0.1;
  if (atlasMode) height = height - selectorsHeight;
  const width = fixSvgDimension(inputWidth);

  let tooltipMessageKey = "barTooltipTotal";
  if (kind.includes('import')) {
    tooltipMessageKey = "barTooltipImports";
  } else if (kind.includes('export')) {
    tooltipMessageKey = "barTooltipExports";
  }

  const messages = {
    franceOverviewTitle: (start, end, kind, slope) =>
      translate("viz-1-A", "franceOverviewTitle", lang, {
        start: start,
        end: end,
        kind,
        slope,
      }),
    tradeEvolutionTitle: (cityName, start, end, kind, slope) =>
      translate("viz-1-A", "tradeEvolutionTitle", lang, {
        cityName,
        start,
        end,
        kind,
      }),
    // top90PctTitle: (cityName, start, end) =>
    //   translate("viz-1-A", "top90PctTitle", lang, {
    //     cityName: cityName,
    //     start: start,
    //     end: end,
    //   }),
    partInPct: (kind) => translate("viz-1-A", "partInPct", lang, { kind: formatKind(kind, lang) }),
    absoluteValue: (kind) =>
      translate("viz-1-A", "absoluteValue", lang, { kind: formatKind(kind, lang) }),
    regressionTitle: (slope) =>
      translate("viz-1-A", "regressionTitle", lang, { slope }),
    // herfindalLegendTitle: () =>
    //   translate("viz-1-A", "herfindalLegendTitle", lang),
    // herfindal0: () => translate("viz-1-A", "herfindal0", lang),
    // herfindal1: () => translate("viz-1-A", "herfindal1", lang),
    barTooltip: (year, pct, city, herfindal) =>
      translate("viz-1-A", tooltipMessageKey, lang, {
        year: year,
        pct: pct,
        city: city,
        herfindal: herfindal,
      }),
    productTooltip: (year, product, pct) =>
      translate("viz-1-A", "productTooltip", lang, {
        year: year,
        product: product,
        pct: pct,
      }),
    sevenYearsWar: (year, product, pct) =>
      translate("viz-1-A", "sevenYearsWar", lang, {
        year: year,
        product: product,
        pct: pct,
      }),
    austriaWar: () => translate("viz-1-A", "austriaWar", lang),
    usIndependance: () => translate("viz-1-A", "usIndependance", lang),
  };
  const margins = { top: 10, right: 50, bottom: 30, left: 50 };

  const annotations = [
    {
      type: "span",
      startYear: 1756,
      endYear: 1763,
      label: messages.sevenYearsWar(),
    },
    {
      type: "span",
      startYear: 1744,
      endYear: 1748,
      row: 0.5,
      label: messages.austriaWar(),
    },
    {
      type: "span",
      startYear: 1778,
      endYear: 1781,
      labelPosition: "left",
      row: 3,
      label: messages.usIndependance(),
    },
  ];

  const totalRows = Object.entries(rows).reduce(
    (sum, [id, flexNumber]) => sum + (+flexNumber),
    0
  );
  const renderRow = (row, rowFlex, rowIndex) => {
    switch (row) {
      case "France":
        const frenchData = datasets.get(
          "tradeDynamics_reference_france_trade.csv"
        );
        if (
          !frenchData ||
          frenchData.filter((d) => d.kind === kind).length === 0
        ) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={fixSvgDimension((height / (totalRows)) * rowFlex)}
            data={frenchData.filter((d) => d.kind === kind)}
            absoluteField="value"
            regressionField="reg"
            slopeField="slope"
            title={messages.franceOverviewTitle(startYear, endYear, formatKind(kind, lang))}
            axisLeftTitle={""}
            axisRightTitle={messages.absoluteValue(kind)}
            regressionTitle={messages.regressionTitle(
              frenchData.filter((d) => d.kind === kind)[0]["slope"]
            )}
            margins={margins}
            annotations={annotations}
            // fillGaps
            {...{
              startYear,
              endYear,
              lang,
            }}
          />
        );
      default:
        const data = datasets.get("tradeDynamics.csv");
        if (!data) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={fixSvgDimension((height / totalRows) * rowFlex)}
            data={data.filter((d) => d.direction_ferme === row)}
            absoluteField={`${kind}_value`}
            shareField={
              kind.includes("colonial") ? undefined : `${kind}_relative`
            }
            regressionField={`${kind}_${regression}`}
            slopeField={`${kind}_slope`}
            //herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.tradeEvolutionTitle(row, startYear, endYear, formatKind(kind, lang))}
            axisLeftTitle={
              kind.includes("colonial") ? undefined : messages.partInPct(kind)
            }
            axisRightTitle={messages.absoluteValue(kind)}
            regressionTitle={messages.regressionTitle(
              data.filter((d) => d.direction_ferme === row)[0][`${kind}_slope`]
            )}
            margins={margins}
            barTooltipFn={messages.barTooltip}
            cityName={row}
            highlightYears={
              rows.comparison > 0 ? [startYear, endYear] : undefined
            }
            annotations={annotations}
            // colorScaleMessages={{
            //   title: messages.herfindalLegendTitle(),
            //   minimum: messages.herfindal0(),
            //   maximum: messages.herfindal1(),
            // }}
            {...{
              startYear,
              endYear,
              lang
            }}
          />
        );

      // case 'comparison':
      //   if (!datasets[`decline_LR_products/decline_LR_products.csv`] || !datasets['decline_longitudinal_data/decline_longitudinal_data.csv']) {
      //     return null;
      //   }
      //   return (
      //     <ProductsDistributionChart
      //       data={datasets[`decline_LR_products/decline_LR_products.csv`]}
      //       tradeData={datasets['decline_longitudinal_data/decline_longitudinal_data.csv']}
      //       field="Exports"
      //       key={rowIndex}
      //       partTreshold={productTradePartThreshold}
      //       height={fixSvgDimension(height/totalRows * rowFlex)}
      //       barWidth={width * 0.02}
      //       years={[atlasMode ? 1750 : startYear, atlasMode ? 1789 : endYear]}
      //       margins={margins}
      //       lang={lang}
      //       herfindhalField="product_revolutionempire_exports_herfindahl"
      //       title={messages.top90PctTitle('La Rochelle', atlasMode ? 1750 : startYear, atlasMode ? 1789 : endYear)}
      //       productTooltipFn={messages.productTooltip}
      //       width={width}
      //     />
      //   )
    }
  };
  return (
    <div className={cx("TradeDynamicsChart", { "atlas-mode": atlasMode })}>
      {Object.entries(rows).map(([rowId, rowFlex], rowIndex) => {
        return (
          <div className={cx("row", { "is-visible": rows[rowId] })}>
            {renderRow(rowId, rowFlex, rowIndex)}
          </div>
        );
      })}

      {atlasMode && (
        <div className="selectors" style={{ height: `${selectorsHeight}px` }}>
          <div className="value-selector-container">
            <label htmlFor="variable">
              {translate("viz-1-A", "value", lang)}
            </label>
            <select
              id="variable"
              onChange={(e) => {
                if (e.target.value.includes("colonial"))
                  setRows(omit(rows, "France"));
                setKind(e.target.value);
              }}
              value={kind}
            >
              {[
                "total",
                "imports",
                "exports",
                "total_no_colonial_product",
                "total_no_colonial_trade",
                "imports_no_colonial_product",
                "exports_no_colonial_product",
                "imports_no_colonial_trade",
                "exports_no_colonial_trade",
              ].map((o) => (
                <option key={o} value={o}>
                  {translate("viz-1-A", o, lang)}
                </option>
              ))}
            </select>
          </div>
          {[
            "France",
            "Marseille",
            "Bordeaux",
            "Rouen",
            "Nantes",
            "La Rochelle",
            "Bayonne",
          ].map((r) => (
            <div key={r}>
              <label htmlFor={`checkbox-${r}`}>{r}</label>
              <input
                id={`checkbox-${r}`}
                type="checkbox"
                value={"France" in rows}
                checked={r in rows}
                disabled={r === "France" && kind.includes("colonial")}
                onChange={(e) => {
                  if (e.target.checked)
                    setRows({
                      ...(r === "France" ? [] : rows),
                      [r]: r === "France" ? 1 : 2,
                      ...(r === "France" ? rows : []),
                    });
                  else setRows(omit(rows, r));
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TradeDynamicsChart;
