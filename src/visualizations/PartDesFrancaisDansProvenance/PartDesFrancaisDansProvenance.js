

import './PartDesFrancaisDansProvenance.scss';

import BarChart from '../../components/BarChart';
import { formatNumber } from '../../utils/misc';
import translate from '../../utils/translate';

import colorsPalettes from '../../utils/colorPalettes';
import { useMemo } from 'react';
const {provenanceCountries} = colorsPalettes;


export default function PartDesFrancaisDansProvenance({
  data: inputData,
  width,
  height,
  lang,
}) {
  // const data = useMemo(() => inputData.get('compare_french_ships_to_marseille_accross_time.csv')
  const data = (inputData.get('compare_french_ships_to_marseille_accross_time.csv') || [])
    .map(d => {
      let translatedState;
      switch(d.state) {
        case 'Péninsule italienne':
          translatedState = translate('PartDesFrancaisDansProvenance', 'provenance-italy', lang)
          break;
        case 'Espagne':
          translatedState = translate('PartDesFrancaisDansProvenance', 'provenance-spain', lang)
          break;
        case 'Empire ottoman':
          translatedState = translate('PartDesFrancaisDansProvenance', 'provenance-ottoman', lang)
          break;
        case 'Provinces-Unies':
          translatedState = translate('PartDesFrancaisDansProvenance', 'provenance-dutch', lang)
          break;
        case 'Grande-Bretagne et colonies (Terre-Neuve)':
          translatedState = translate('PartDesFrancaisDansProvenance', 'provenance-uk', lang)
          break;
        case 'France':
          translatedState = translate('PartDesFrancaisDansProvenance', 'provenance-france', lang)
          break;
        case 'autre':
          translatedState = translate('PartDesFrancaisDansProvenance', 'provenance-other', lang)
        default:
          break;
      }
      return {
      ...d,
      state: translatedState,
      tonnage_french: +d.tonnage_french,
      share_of_french: +d.share_of_french * 100,
      order: -Object.keys(provenanceCountries).indexOf(d.state),
      year: +d.year
    }})
    .sort((a, b) => {
      if (a.year > b.year) {
        return 1;
      }
      return -1;
    })
    // , [inputData,  lang]);
  return (
    <div className="PartDesFrancaisDansProvenance">
      <BarChart
        {
        ...{
          width,
          height: height / 2,
          margins: {
            left: 120
          },
          data,
          title: translate('PartDesFrancaisDansProvenance', 'top-title', lang),
          layout: "groups",
          color: {
            field: 'state',
            title: translate('PartDesFrancaisDansProvenance', 'legend-title', lang),
            palette: provenanceCountries[lang]
          },
          x: {
            field: 'year'
          },
          y: {
            field: 'share_of_french',
            tickFormat: d => d + '%',
            domain: [0, 100],
            title: translate('PartDesFrancaisDansProvenance', 'top-y-axis', lang),
            sort: {
              type: 'number',
              field: 'order'
            }
          },
          tooltip: d => translate('PartDesFrancaisDansProvenance', 'top-tooltip', lang, {
            year: d.year,
            share: d.share_of_french.toFixed(2),
            state: d.state,
            tonnage: formatNumber(d.tonnage_french)
          })
            // `En ${d.year}, ${d.share_of_french.toFixed(2)}% des voyages partis de ports de ${d.state} et arrivés à Marseille étaient assurés par des navires français (${formatNumber(d.tonnage_french)} tx. cumulés)`
        }
        }
      />
      <BarChart
        {
        ...{
          width,
          height: height / 2 - 30,
          margins: {
            left: 120
          },
          data,
          title: translate('PartDesFrancaisDansProvenance', 'bottom-title', lang),
          layout: "groups",
          color: {
            field: 'state',
            palette: provenanceCountries[lang]
          },
          x: {
            field: 'year'
          },
          y: {
            field: 'tonnage_french',
            tickFormat: d => formatNumber(d) + ' tx',
            // domain: [0, 100],
            title: translate('PartDesFrancaisDansProvenance', 'bottom-y-axis', lang),
            sort: {
              type: 'number',
              field: 'order'
            }
          },
          hideLegend: true,
          tooltip: d => translate('PartDesFrancaisDansProvenance', 'bottom-tooltip', lang, {
            year: d.year,
            share: d.share_of_french.toFixed(2),
            state: d.state,
            tonnage: formatNumber(d.tonnage_french)
          })
            // `En ${d.year}, ${d.share_of_french.toFixed(2)}% des voyages partis de ports de ${d.state} et arrivés à Marseille étaient assurés par des navires français (${formatNumber(d.tonnage_french)} tx. cumulés)`
        }
        }
      />
    </div>

  )
}