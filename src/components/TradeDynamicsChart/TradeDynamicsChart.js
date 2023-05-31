import cx from "classnames";
import LongitudinalTradeChart from "./LongitudinalTradeChart";
//import ProductsDistributionChart from "./ProductsDistributionChart";

import "./TradeDynamicsChart.scss";
import { fixSvgDimension } from "../../utils/misc";
import translate from "../../utils/translate";

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
    lang = "fr",
    startYear = 1740,
    endYear = 1790,
    productTradePartThreshold = 0.9,
    rows,
    kind,
    regression,
    datasets = {},
    atlasMode,
  } = props;
  const height = fixSvgDimension(containerHeight);
  const width = fixSvgDimension(inputWidth);
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
    partInPct: (kind) => translate("viz-1-A", "partInPct", lang, { kind }),
    absoluteValue: (kind) =>
      translate("viz-1-A", "absoluteValue", lang, { kind }),
    regressionTitle: (slope) =>
      translate("viz-1-A", "regressionTitle", lang, { slope }),
    // herfindalLegendTitle: () =>
    //   translate("viz-1-A", "herfindalLegendTitle", lang),
    // herfindal0: () => translate("viz-1-A", "herfindal0", lang),
    // herfindal1: () => translate("viz-1-A", "herfindal1", lang),
    barTooltip: (year, pct, city, herfindal) =>
      translate("viz-1-A", "barTooltip", lang, {
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
    (sum, [id, count]) => sum + count,
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
            height={fixSvgDimension((height / totalRows) * rowFlex)}
            data={frenchData.filter((d) => d.kind === kind)}
            absoluteField="value"
            regressionField="reg"
            slopeField="slope"
            title={messages.franceOverviewTitle(startYear, endYear, kind)}
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
            shareField={`${kind}_relative`}
            regressionField={`${kind}_${regression}`}
            slopeField={`${kind}_slope`}
            //herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.tradeEvolutionTitle(row, startYear, endYear, kind)}
            axisLeftTitle={messages.partInPct(kind)}
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
    </div>
  );
};

export default TradeDynamicsChart;
