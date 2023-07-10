

import './PartDesFrancaisDansProvenance.scss';

import BarChart from '../../components/BarChart';
import { formatNumber } from '../../utils/misc';


export default function PartDesFrancaisDansProvenance({
  data: inputData,
  width,
  height
}) {
  // const data = useMemo(() => inputData.get('compare_french_ships_to_marseille_accross_time.csv')
  const data = inputData.get('compare_french_ships_to_marseille_accross_time.csv')
    .map(d => ({
      ...d,
      tonnage_french: +d.tonnage_french,
      share_of_french: +d.share_of_french * 100,
      year: +d.year
    }))
    .sort((a, b) => {
      if (a.year > b.year) {
        return 1;
      }
      return -1;
    })
    // , [inputData]);
  return (
    <div className="PartDesFrancaisDansProvenance">
      <BarChart
        {
        ...{
          width,
          height: height / 2,
          data,
          title: 'Part des français dans les provenances de voyages arrivés à Marseille',
          layout: "groups",
          color: {
            field: 'state',
            title: 'Provenance du voyage'
          },
          x: {
            field: 'year'
          },
          y: {
            field: 'share_of_french',
            tickFormat: d => d + '%',
            domain: [0, 100],
            title: 'Part des français',
            sort: {
              type: 'string',
              field: 'state'
            }
          },
          tooltip: d => `En ${d.year}, ${d.share_of_french.toFixed(2)}% des voyages partis de ports de ${d.state} et arrivés à Marseille étaient assurés par des navires français (${formatNumber(d.tonnage_french)} tx. cumulés)`
        }
        }
      />
      <BarChart
        {
        ...{
          width,
          height: height / 2 - 20,
          data,
          title: 'Tonnage des français dans les provenances de voyages arrivés à Marseille',
          layout: "groups",
          color: {
            field: 'state'
          },
          x: {
            field: 'year'
          },
          y: {
            field: 'tonnage_french',
            tickFormat: d => formatNumber(d) + ' tx',
            // domain: [0, 100],
            title: 'Tonnage cum.',
            sort: {
              type: 'string',
              field: 'state'
            }
          },
          hideLegend: true,
          tooltip: d => `En ${d.year}, ${d.share_of_french.toFixed(2)}% des voyages partis de ports de ${d.state} et arrivés à Marseille étaient assurés par des navires français (${formatNumber(d.tonnage_french)} tx. cumulés)`
        }
        }
      />
    </div>

  )
}