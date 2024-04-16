

import WarTransferChart from '../../components/WarTransferChart';

import colorsPalettes from '../../utils/colorPalettes';
import translate from '../../utils/translate';

const {warStatus: palette} = colorsPalettes;

export default function GuerreEtLevant ({
  width,
  height,
  data: inputData,
  atlasMode,
  lang,
}) {
  // const data = useMemo(() => {
    const cleanData = (inputData.get('navigation_levant_guerre.csv') || [])
  .map(d => Object.entries(d).reduce((res, [key, val]) => ({...res, [key]: +val}), {}));
  const groups = cleanData.reduce((res, year, index) => {
    const operational = Object.entries(year)
    .reduce((res2, [key, value]) => {
      if (key !== 'annee') {
        return {
          ...res2,
          values: [
            ...res2.values,
            {
              key,
              value
            }
          ]
        }
      }
      return res2
    }, {year: year.annee, values: []})
    if (index%2 === 0) {
      return [...res, [operational]]
    }
    res[res.length - 1].push(operational);
    return res;
  }, []);
  const data = groups;
  // return groups;
  // }, [inputData]);
  return (
    <div className="GuerreEtLevant">
      <WarTransferChart
        {
          ...{
            title: atlasMode ? translate('GuerreEtNavigation', 'atlas-title', lang) : undefined,
            width,
            height,
            data,
            palette,
            lang,
          }
        }
      />
    </div>
  )
}