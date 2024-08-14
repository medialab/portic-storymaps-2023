import LineChart from "../../components/LineChart";
import translate from "../../utils/translate";
import './EffetsGuerreSurLevant.scss';
import { formatNumber } from "../../utils/misc";
import BarChart from "../../components/BarChart";

import colorsPalettes from "../../utils/colorPalettes";
import { useMemo } from "react";

const { partnersGrouped: palette } = colorsPalettes;


export default function EffetsGuerreSurLevant({
  data: inputData,
  width,
  height,
  lang
}) {
  const orderMap = Object.keys(palette[lang]).reduce((res, key, i) => ({
    ...res,
    [key]: i,
  }), {})
  // const data = useMemo(() => 
  const data = useMemo(() => (inputData.get('evolution-exports-levant.csv') || [])
    .map(d => {
      let translatedGroup;
      switch (d.group) {
        case 'Levant & Barbarie':
          translatedGroup = translate('EffetsGuerreSurLevant', 'group-levant-barbarie', lang)
          break;
        case 'Italie & Espagne':
          translatedGroup = translate('EffetsGuerreSurLevant', 'group-italie-espagne', lang)
          break;
        case 'Angleterre & Amérique du Nord':
          translatedGroup = translate('EffetsGuerreSurLevant', 'group-angleterre', lang)
          break;
        case 'Colonies françaises':
          translatedGroup = translate('EffetsGuerreSurLevant', 'group-colonies', lang)
          break;
        case 'Nord, Hollande & Flandres':
          translatedGroup = translate('EffetsGuerreSurLevant', 'group-nord', lang)
          break;
        case 'total':
        default:
          translatedGroup = translate('EffetsGuerreSurLevant', 'group-total', lang)
          break;
      }
      return {
        ...d,
        group: translatedGroup,
        year: +d.year,
        value: +d.value,
        order: orderMap[d.group],
        orderReversed: -orderMap[d.group]
      }
    })
    .sort((a, b) => {
      if (a.year > b.year) {
        return 1;
      }
      return -1;
    })
    .sort((a, b) => {
      if (a.order > b.order) {
        return 1;
      }
      return -1;
    }), [inputData, translate, lang]);

  const totalValuesMap = data.filter(d => d.group === 'total').reduce((res, { year, value }) => ({
    ...res,
    [year]: value
  }), {})

  const annotations = useMemo(() => [

    {
      type: "span",
      start: 1744,
      end: 1748,
      row: 0.5,
      axis: 'x',
      label: translate("viz-1-A", "austriaWar", lang),
    },
    {
      type: "span",
      start: 1756,
      end: 1763,
      axis: 'x',
      // labelPosition: 40,
      labelPosition: height / 8,
      label: translate("viz-1-A", "sevenYearsWar", lang),
    },
    {
      type: "span",
      start: 1778,
      end: 1781,
      labelPosition: height / 6,
      row: 3,
      axis: 'x',
      label: translate("viz-1-A", "usIndependance", lang),
    },
  ], [translate, lang, height]);
  return (
    <div className="EffetsGuerreSurLevant">
      <LineChart
        {
        ...{
          width,
          height: height / 2,
          title: translate('EffetsGuerreSurLevant', 'title', lang),
          data,
          annotations,
          color: {
            field: 'group',
            palette: palette[lang]
          },
          x: {
            field: 'year',
            title: translate('EffetsGuerreSurLevant', 'top-x-axis', lang),
          },
          y: {
            field: 'value',
            title: translate('EffetsGuerreSurLevant', 'top-y-axis', lang),
            // tickSpan: 100000000,
            // domain: [0, 200000000],
            tickFormat: d => formatNumber(d, lang) + ' lt.'
          },
          tooltip: d => translate('EffetsGuerreSurLevant', 'top-tooltip', lang, {
            year: d.year,
            value: formatNumber(parseInt(d.value), lang),
            particule: d.group === 'total' ? 'au' : 'de',
            group: d.group
          })
          // `En ${d.year}, Marseille a importé ${formatNumber(parseInt(d.value, lang))} lt. depuis les partenaires ${d.group === 'total' ? 'au' : 'de'} ${d.group}`
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
            palette: palette[lang]
          },
          hideLegend: true,
          x: {
            field: 'year',
            title: translate('EffetsGuerreSurLevant', 'bottom-x-axis', lang),
            tickFormat: d => d % 5 === 0 ? d : '',
            // domain: [1725, 1790]
          },
          y: {
            field: 'value',
            title: translate('EffetsGuerreSurLevant', 'bottom-y-axis', lang),
            tickFormat: d => d + '%',
            sort: {
              field: 'orderReversed',
              type: 'number'
            }
          },
          tooltip: d => translate('EffetsGuerreSurLevant', 'bottom-tooltip', lang, {
            year: d.year,
            share: parseInt(d.value),
            group: d.group
          })
          // `En ${d.year}, Marseille a importé ${parseInt(d.value)} % de sa valeur depuis les partenaires ${d.group}`
        }
        }
      />
    </div>
  )
}