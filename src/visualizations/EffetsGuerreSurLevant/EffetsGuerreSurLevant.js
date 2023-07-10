import LineChart from "../../components/LineChart";
import translate from "../../utils/translate";
import './EffetsGuerreSurLevant.scss';
import { formatNumber } from "../../utils/misc";
import BarChart from "../../components/BarChart";

import colorsPalettes from "../../utils/colorPalettes";

const {partnersGrouped: palette} = colorsPalettes;

const orderMap = Object.keys(palette).reduce((res, key, i) => ({
  ...res,
  [key]: i,
}), {})

export default function EffetsGuerreSurLevant({
  data: inputData,
  width,
  height,
  lang
}) {
  // const data = useMemo(() => 
  const data = (inputData.get('evolution-exports-levant.csv') || [])
    .map(d => ({
      ...d,
      year: +d.year,
      value: +d.value,
      order: orderMap[d.group],
      orderReversed: -orderMap[d.group]
    }))
    .sort((a, b) => {
      if (a.order > b.order) {
        return 1;
      }
      return -1;
    })
    // .filter(d => d.group !== 'total')
    // , []);

  const totalValuesMap = data.filter(d => d.group === 'total').reduce((res, { year, value }) => ({
    ...res,
    [year]: value
  }), {})

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

  const annotations = [

    {
      type: "span",
      start: 1744,
      end: 1748,
      row: 0.5,
      axis: 'x',
      label: messages.austriaWar(),
    },
    {
      type: "span",
      start: 1756,
      end: 1763,
      axis: 'x',
      labelPosition: height / 10,
      label: messages.sevenYearsWar(),
    },
    {
      type: "span",
      start: 1778,
      end: 1781,
      labelPosition: height / 5,
      row: 3,
      axis: 'x',
      label: messages.usIndependance(),
    },
  ];
  return (
    <div className="EffetsGuerreSurLevant">
      <LineChart
        {
        ...{
          width,
          height: height / 2,
          title: `Les partenaires d'importation de Marseille au fil du temps`,
          data,
          annotations,
          color: {
            field: 'group',
            palette
          },
          x: {
            field: 'year',
            title: 'année',
          },
          y: {
            field: 'value',
            title: 'valeur des imports',
            // tickSpan: 100000000,
            // domain: [0, 200000000],
            tickFormat: d => formatNumber(d) + ' lt.'
          },
          tooltip: d => `En ${d.year}, Marseille a exporté ${formatNumber(parseInt(d.value))} lt. vers les partenaires ${d.group === 'total' ? 'au' : 'de'} ${d.group}`
        }
        }
      />
      <BarChart
        {
        ...{
          width,
          height: height / 2,
          data: [
            ...data.filter(d => d.group !== 'total').map(d => ({ ...d, value: d.value / totalValuesMap[d.year] * 100 })),
            ...[1734, 1760, 1781, 1782, 1783, 1784, 1785, 1786, 1788, 1790]
              .map(year => ({ year, value: 0.0001, group: 'Levant & Barbarie' }))
          ].sort((a, b) => {
            if (a.year > b.year) {
              return 1;
            }
            return -1;
          }),
          margins: {
            right: 200,
          },
          // annotations,
          color: {
            field: 'group',
            palette
          },
          hideLegend: true,
          x: {
            field: 'year',
            title: 'année',
            tickFormat: d => d % 5 === 0 ? d : '',
            // domain: [1725, 1790]
          },
          y: {
            field: 'value',
            title: 'part des imports',
            tickFormat: d => d + '%',
            sort: {
              field: 'orderReversed',
              type: 'number'
            }
          },
          tooltip: d => `En ${d.year}, Marseille a exporté ${parseInt(d.value)} % de sa valeur vers les partenaires ${d.group}`
        }
        }
      />
    </div>
  )
}