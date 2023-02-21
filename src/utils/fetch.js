import { get } from 'axios';
import { csvParse } from 'd3-dsv';

/**
 * Fetch file content from /public/data
 * @param {String} fileName file name + file extention
 * @returns {Promise}
 * @exemple
 * ```
 * fetchDataCsv('file.csv')
 * ```
 */
export function fetchDataFile(fileName) {
  const ext = fileName.split('.').pop();
  switch(ext) {
    case 'csv':
      return fetchDataCsv(fileName);
    case 'svg':
    default:
      return fetchDataStr(fileName);
  }
}

/**
 * Fetch txt file content from /public/data
 * @param {String} fileName file name + file extention
 * @returns {Promise}
 * @exemple
 * ```
 * fetchDataCsv('file.csv')
 * ```
 */
 export function fetchDataStr (fileName) {
  return new Promise((success, failure) => {
      get('data/' + fileName, {
          // onDownloadProgress: e => console.log(e, e.loaded, e.total)
      })
      .then(({ data: str }) => {
          success(str)
      })
      .catch((error) => {
          failure(error);
      })
  })
}

/**
 * Fetch CSV file content from /public/data
 * @param {String} fileNameCsv file name + file extention
 * @returns {Promise}
 * @exemple
 * ```
 * fetchDataCsv('file.csv')
 * ```
 */
export function fetchDataCsv (fileNameCsv) {
    return new Promise((success, failure) => {
        get('data/' + fileNameCsv, {
            // onDownloadProgress: e => console.log(e, e.loaded, e.total)
        })
        .then(({ data: str }) => {
            try {
                const csv = csvParse(str);
                success(csv);
            } catch (error) {
                console.log(fileNameCsv);
                failure(error);
            }
        })
        .catch((error) => {
            failure(error);
        })
    })
}

/**
 * Fetch SVG file content from /public/assets
 * @param {String} fileNameCsv file name + file extention
 * @returns {Promise}
 * @exemple
 * ```
 * fetchDataSvg('file.svg')
 * ```
 */

export function fetchDataSvg (fileNameSvg) {
    return new Promise((success, failure) => {
        get('assets/' + fileNameSvg, {
            // onDownloadProgress: e => console.log(e, e.loaded, e.total)
        })
        .then(({ data: str }) => {
            success(str);
        })
        .catch((error) => {
            failure(error);
        })
    })
}

/**
 * Fetch data JSON file content from /public/data
 * @param {String} fileNameCsv file name + file extention
 * @returns {Promise}
 * @exemple
 * ```
 * fetchDataJson('file.json')
 * ```
 */

export function fetchDataJson (fileNameJson) {
    return new Promise((success, failure) => {
        get('data/' + fileNameJson, {
            // onDownloadProgress: e => console.log(e, e.loaded, e.total)
        })
        .then(({ data: str }) => {
            // const str_json = JSON.parse(str);
            success(str);
        })
        .catch((error) => {
            failure(error);
        })
    })
}