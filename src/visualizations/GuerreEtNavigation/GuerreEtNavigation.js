import WarTransferChart from '../../components/WarTransferChart';

const palette = {
  'neutre': 'grey',
  'France du Levant': 'blue',
  'France du Ponant': 'green',
  'en guerre allié de la France': 'rgb(0, 196, 175)',
  'en guerre ennemi de la France': 'red',
}

export default function GuerreEtNavigation ({
  width,
  height,
  data: inputData
}) {
  // const data = useMemo(() => {
    const cleanData = inputData.get('navigation_guerre.csv')
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
  // return groups;
  // }, []);
  const data = groups;
  return (
    <div className="GuerreEtNavigation">
      <WarTransferChart
        {
          ...{
            title: 'Le personnel de navigation à destination de Marseille',
            width,
            height,
            data,
            palette,
          }
        }
      />
    </div>
  )
}