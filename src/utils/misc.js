/**
 * A series of miscellaneous helper functions
 */

/* import external library */
import { csvParse } from 'd3-dsv';
import get from 'axios';
import iwanthue from 'iwanthue';
/* import other assets */
import catalog from '../i18n/messages.yml';
import palettes from './colorPalettes';

const { generic } = palettes;


const DEFAULT_COLOR_SPACE = {
  cmin: 25.59,
  cmax: 55.59,
  lmin: 60.94,
  lmax: 90.94
};

const SINGLE_COLOR_PALETTE = ['#999'];


/**
 * Generates a head's title for the current page
 * @param {string} title
 * @param {string} lang='fr'
 * @returns {string}
 */
export function buildPageTitle(title, lang = 'fr') {
  const currentMetadata = catalog['site']['title'][lang];
  return `${title} | ${currentMetadata} | PORTIC`;
}

/**
 * Trims a text given a certain length limit/maximum
 * @param {string} str
 * @param {number} limit=30
 * @returns {string}
 */
export function trimText(str, limit = 30) {
  if (str.length > limit) {
    const words = str.split(' ');
    let output = [words[0]];
    let i = 1;
    while (output.join(' ') < limit - 3 && i < words.length) {
      output.push(words[i]);
      i++;
    }
    output = output.join(' ');
    return [output, words.slice(i).join(' ')];
  }
  return [str, undefined];
}

/**
 * Transform cartesian coordinates to polar coordinates
 * @param {number} x
 * @param {number} y
 * @returns {object} - distance and radians of the polar coordinates
 */
export function cartesian2Polar(x, y) {
  const distance = Math.sqrt(x * x + y * y);
  const radians = Math.atan2(y, x);
  return {
    distance, radians
  }
}
/**
 * Transform polar coordinates to cartesian coordinates
 * @param {number} r
 * @param {number} theta
 * @returns {array} - array of x and y positions
 */
export const polarToCartesian = (r, theta) => [
  r * Math.cos(theta),
  r * Math.sin(theta)
]

/**
 * Generate a color palette in a deterministic way for the app
 * @param {string} name
 * @param {number} count - number of colors to generate
 * @returns {any}
 */
export function generatePalette(name, count) {
  if (count === 1 || !count) return SINGLE_COLOR_PALETTE;
  else if (count === 2) {
    return [generic.accent1, generic.accent2]
  } else if (count === 3) {
    return [generic.dark, generic.accent1, generic.accent2]
  }

  return iwanthue(count, {
    colorSpace: DEFAULT_COLOR_SPACE,
    seed: name,
    clustering: 'force-vector'
  });
}

/**
 * Normalizes a dimension so that it is fitable for svg dimensions (not NaN, positive)
 * @param {number} num
 * @returns {number}
 */
export const fixSvgDimension = num => isNaN(num) ? 0 : Math.abs(+num);

/**
 * Format a number so that it is more legible
 * @param {number} n
 * @param {string} style='fr'
 * @returns {string}
 */
export const formatNumber = (n, style = 'fr') => {
  return ('' + n)
    .split('')
    .reverse()
    .reduce(({ count, result }, digit, index) => {
      const endOfLine = count === 3 || (count === 0 && index === ('' + n).length - 1);
      if (endOfLine) {
        return {
          count: 1,
          result: [...result, style === 'fr' ? ' ' : ',', digit]
        }
      } else return {
        count: count + 1,
        result: [...result, digit]
      }

    }, {
      count: 0,
      result: []
    })
    .result
    .reverse()
    .join('')
}


/**
 * ===============
 * DEPRECATED
 * Cécile's code for when we directly queryied data from source APIs
 * ==============
 */



/**
 * Filters data given certain parameters
 * @param {array} data
 * @param {object} params
 * @returns {array}
 */
const _filterData = (data, { startYear, endYear, year, params, ...rest }) => {
  console.group('filters');
  console.time('filters time');
  console.log('input', data);
  /* dans data on a un dict de type : 
  [   {year: "1789", customs_region: "La Rochelle", partner_simplification: "Iles", export_import: ”Import", product_revolutionempire: "...", ...},
      {year: "1782", customs_region: "Bordeaux", ...},
      {...},
      columns: ["year", "customs_region", ...]

  ]
  */
  let filteredData = data.filter(row => {
    let rowYear = row.year ? +row.year.split(".")[0] : undefined;
    if (startYear && endYear) {
      return rowYear >= +startYear && rowYear <= +endYear;
      // @todo : quand on aura rajouté startYear et endYear pour
      // la récupération de portic il s'agira de déduire ce year des données
    } else if (year && rowYear) {
      return year === +rowYear;
    } else return true;
  })
  // console.log('1', filteredData);

  filteredData = filteredData.filter(row => {
    // pour chaque filtre (sauf filtre timespan et filtrage des colomnes) :
    let isValid = true;
    // key --> 'year', filter_value --> 1789
    // kwargs obtenu sous forme de dict : --> { year: 1789, customs_region: 'La Rochelle' }

    // kwargs semble être indiçable mais pas sur qu'on doive pas le mettre dans un format spécial pas comme python
    // sinon suggestion : function.apply(obj, [args])

    // ligne originale : je ne sais pas pourquoi on ne veut prendre en compte les filtres que pour les colonnes qui ne sont pas à garder dans le résultats (colonne données dans l'argument 'params' sous forme de liste)
    // for (let key,filter_value in [param for param in kwargs.items() if param[0] not in ['params']]): 
    // console.log('rest', rest);
    Object.entries(rest)
      .some(([key, inputFilterValue]) => {
        const rowValue = row[key];
        let filterValue = inputFilterValue;
        // console.log('filter value 1', filterValue);
        // si la valeur est une liste : on caste en string ses membres
        if (Array.isArray(filterValue)) {
          filterValue = filterValue.map(x => x + ''); // caster en string
        }
        // sinon c'est un tableau à une valeur qu'on caste en string
        else {
          filterValue = [filterValue + ''];
        }
        // console.log('filter value final', filterValue);
        // à partir de là, filter_value est une liste de strings

        // si la ligne a un attribut qui fait partie des valeurs acceptées par le filtre => on examine les autres filtres 
        if (filterValue.length > 0 && !(rowValue.includes(filterValue))) {
          isValid = false;
          return true;
        }
        return false;
      })

    return isValid;
  })

  // console.log('2', filteredData);


  const transformedData = filteredData.map(row => {
    let rowFormated = {};

    // on ne garde que les colonnes qui nous intéressent dans le résultat => 
    // console.log("params : ", params);
    // console.log("typeof(params) !== 'undefined' : ", (typeof params !== 'undefined'));
    // console.log("row : ", row);
    // on ne passe jamais ni dans le if ni dans le else, je ne sais pas pourquoi 
    // if (typeof params !== 'undefined') {

    // if (params &&
    // ci-dessous : tester si objet vide
    if (!!params && Object.keys(params).length) {
      // console.log("we are selecting only those columns : ", params);
      for (let [column, value] of Object.entries(row)) {
        if (params.includes(column)) {
          rowFormated[column] = value;
        }
      }
    }
    // de base c'était else { ... } et on passait jamais dedans apparemment du coup là c'est bizarre
    // else if (typeof params !== 'undefined') {
    else {
      // rowFormated = {...row}; // différencier rowFormated et row (nouvelle ref en unpackant et copiant key / params de row) => en JS differencier input d'output
      // console.log("rowFormated = ", row);
    }
    // console.log("après le if / else");
    return rowFormated;
  })
  // console.log('3', transformedData);
  console.timeEnd('filters time');
  console.groupEnd('filters');
  return transformedData;
}

/**
 * Gets toflit18 flows (from local csv) according to certain  filter parameters
 * @param {object} params
 * @returns {promise}
 */
export const getToflitFlowsByCsv = ({
  startYear = null,
  endYear = null,
  year = null,
  params = null,
  ...rest // https://www.peterbe.com/plog/javascript-destructuring-like-python-kwargs-with-defaults ; 
  // "standard" JavaScript array : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
}) => {
  // méthode de gestion avec callback
  // let result;
  // trucAsynchrone
  // .then(data => {
  //     callback(null, data);
  // })
  // .catch(error => {
  //     callback(error);
  // })

  // méthode de gestion avec promesse
  // return new Promise((resolve, reject) => {
  //     trucAsynchrone
  //     .then(data => {
  //         // faire des trucs avec data
  //         resolve(data);
  //     })
  //     .catch(error => {
  //         // faire des choses avec l'erreur
  //         reject(error);
  //     })
  // })

  // méthode async/await
  // const result = await trucAsynchrone();
  // return result;

  /*
  Synopsis : récupère les flux toflit18
  --- 
  Paramètres :
  * startYear : <int> # année de début
  * endYear : <int> # année de fin
  * params : <arr> # propriétés à renvoyer
  * [tous les noms de colonne des flux] : <arr/string> valeurs à filtrer dans les flux (peut être une ou plusieurs valeurs)
  */

  return new Promise((resolve, reject) => {

    // let results = []; // ça sert à quelque chose ?? pour moi c'est pas utilisé, sinon je ne devrais pas avoir l'erreur "t.map is not a function" 
    // => voir https://www.pluralsight.com/guides/typeerror-handling-in-react.js-for-map-function

    let finalStartYear = startYear; // on ne modif pas params en JS
    let finalEndYear = endYear;



    // 1. Test de la validité des paramètres
    if (startYear !== null && endYear === null) {
      return reject("You must put an end year");
    } // pas sure pour les accolades
    else if (endYear !== null && startYear === null) {
      return reject("You must put a start year");
    }

    if ((startYear !== null || endYear !== null) && year !== null) {
      finalStartYear = null;
      finalEndYear = null;
    }

    /* en l'état ça ne fonctionne pas */
    const URL = `${process.env.PUBLIC_URL || 'localhost:3001'}/data/toflit18_flows_sprint.csv`;
    // console.log("URL '${process.env.PUBLIC_URL}/data/toflit18_flows_sprint.csv' : ", URL)
    get(URL) // get de axios
      .then(({ data: csvString }) => {
        // conversion en js (avec d3-dsv)
        const newData = csvParse(csvString);
        // faire des choses avec les résultats (filtres, ...)
        const finalData = _filterData(newData, { startYear: finalStartYear, endYear: finalEndYear, year, params, ...rest });
        resolve(finalData);
      })
      .catch((err) => {
        reject(err);
      })

  })

}

/**
 * From https://github.com/derhuerst/svg-partial-circle
 * @param {Number} cx X of the circle middle
 * @param {Number} cy Y of the circle middle
 * @param {Number} r radius of the circle
 * @param {Number} start
 * @param {Number} end
 * @param {Boolean} [reverse=false]
 * @returns {String} 'd' attribute of a path
 * @see http://math2.org/math/geometry/circles.htm
 * @exemple
 * ```
 * const halfCircle = partialCirclePathD( 30, 30, 20, Math.PI / 2, Math.PI * 3 / 2 )
 * <path d={halfCircle} />
 * ```
 */

export function partialCirclePathD(cx, cy, r, start, end, reverse = false) {
  const length = end - start;
  if (length === 0) return [];

  const fromX = r * Math.cos(start) + cx;
  const fromY = r * Math.sin(start) + cy;
  const toX = r * Math.cos(end) + cx;
  const toY = r * Math.sin(end) + cy;
  const large = Math.abs(length) <= Math.PI ? '0' : '1';
  const sweep = length < 0 ? '0' : '1';

  // if (reverse) {
  //   return `M ${fromX} ${fromY} A ${r} ${r} ${0} ${large} ${sweep} ${toX} ${toY}`;
  // }

  return `M ${fromX} ${fromY} A ${r} ${r} ${0} ${large} ${sweep} ${toX} ${toY}`;
}

/**
 * 
 * @param {Object} state Last state
 * @param {Object} action 
 * @param {'start'|'progress'|'end'|'reset'} action.mode 
 * @param {'down'|'up'} action.mouseState
 * @param {String|Number} action.value
 * @returns {Object}
 * @exemple
 * ```
 * const [brush, setBrush] = useReducer(reducerBrush, { start: undefined, end: undefined, mouse: undefined });
 * 
 * const data = useMemo(function filterData() {
 *    const { start, end, mouse } = brush;
 *        if (mouse !== 'up') {
 *          return filterData;
 *        }
 *    return inputData.filter(({ year }) => +year >= start && +year <= end);
 * }, [inputData, brush]);
 * 
 * <Chart
 *    onMouseDown={(e) => {
 *      setBrush({
 *          mode: 'start',
 *          value,
 *          mouseState: 'down'
 *      })
 *    }}
 *    onMouseMove={(e) => {
 *      setBrush({
 *          mode: 'progress',
 *          value,
 *      })
 *    }}
 *    onMouseUp={(e) => {
 *      setBrush({
 *          mode: 'end',
 *          value,
 *          mouseState: 'up'
 *      })
 *    }}
 * />
 * <button onClick={(e) => { setBrush({ mode: 'reset' }) }}>reset</button>
 * ```
 */

export function reducerBrush(state, { mode, mouseState, value }) {
  const { start, end, mouse } = state;
  switch (mode) {
    case 'start':
      return {
        start: value,
        end,
        mouse: mouseState
      }
    case 'progress':
      if (mouse === 'down') {
        return {
          start,
          end: value,
          mouse
        }
      }
      return state;
    case 'end':
      return {
        start,
        end: value,
        mouse: mouseState
      }
    case 'reset':
    default:
      return {
        start: undefined,
        end: undefined,
        mouse: undefined
      }
  }
}